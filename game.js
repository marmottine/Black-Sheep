//-----------------------------------------------------
// Portability hacks
//-----------------------------------------------------

window.requestAnimFrame = (function(){
  return (window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function(callback, element) {
            window.setTimeout(callback, 1000 / 60);
          });
})();

//--------------------------------------
// Engine
//--------------------------------------

function Engine() {

  this.images = {};
  this.sounds = {};

  this.element = null;
  this.context = null;

  this.width = 0;
  this.height = 0;

  this.running = false;
  this.focused = false;

  this.time = 0;
  this.delta = 0;
  this.max_step = 0.05;
  this.last_timestamp = 0;

  this.show_fps = true;
  this.fps = 0;
  this.fps_stats = new Array(60);

  this.world = {
    types: {},
    layers: []
  }
  
  this.canvas_width = null;
  this.canvas_height = null;

  this.inputEvents = [];
  this.draggedEntity = null;
  this.draggableEntities = [];
  this.mouse = {x: -3, y: -3};
  this.exclusivePlaceEntities = [];
}

Engine.prototype.init = function(element, width, height, image_list, sound_list, callback) {
  console.log('engine init');
  this.element = element;
  this.context = element.getContext("2d");
  this.width = width;
  this.height = height;

  var loaded = 0;
  var total = image_list.length + sound_list.length;
  this.load_progress(loaded, total);

  // asynchronously load images
  for each (var path in image_list) {
    var img = new Image();
    var that = this;
    img.addEventListener("load", function() {
      console.log('finished loading image ' + this.src);
      loaded++;
      that.load_progress(loaded, total, callback);
    });
    img.addEventListener("error", function() {
      console.log('error loading ' + this.src);
      // TODO: handle error
    });
    img.src = 'img/' + path + '.png';
    this.images[path] = img;
  }

  // asynchronously load sounds
  for each (var path in sound_list) {
    var snd = new Audio();
    var that = this;
    snd.addEventListener("loadeddata", function() {
      console.log('finished loading sound ' + this.src);
      loaded++;
      that.load_progress(loaded, total, callback);
    });
    snd.addEventListener("error", function() {
      console.log('error loading ' + this.src);
      // TODO: handle error
    });

    snd.play = function() {
      var channel = this.cloneNode(true);
      channel.play();
    }

    // check for browser support of Ogg Vorbis sound format
    if(snd.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, '')) {
      snd.src = 'snd/' + path + '.ogg';
    } else {
      snd.src = 'snd/' + path + '.mp3';
    }
    this.sounds[path] = snd;
  }

  // listen to input events
  this.context.canvas.addEventListener('mousedown', this.mouseDown.bind(this));
  this.context.canvas.addEventListener('mouseup', this.mouseUp.bind(this));
  this.context.canvas.addEventListener('mouseout', this.mouseOut.bind(this));
  this.context.canvas.addEventListener('mousemove', this.mouseMove.bind(this));
}

Engine.prototype.mouseDown = function(e) {
  // 'this' is the game because of bind
  console.log("mouseDown ");
  if (e.pageX > this.context.canvas.offsetLeft &&
      e.pageX < this.context.canvas.offsetLeft + this.context.canvas.width &&
      e.pageY > this.context.canvas.offsetTop &&
      e.pageY < this.context.canvas.offsetTop + this.context.canvas.height) {
      console.log("add event");
    this.inputEvents.push({event:"mdown",
                       x: (e.pageX - this.context.canvas.offsetLeft) / this.scale - this.offset.x,
                       y: (e.pageY - this.context.canvas.offsetTop) / this.scale - this.offset.y});
  }
}

Engine.prototype.mouseUp = function(e) {
  if (e.pageX > this.context.canvas.offsetLeft &&
      e.pageX < this.context.canvas.offsetLeft + this.width &&
      e.pageY > this.context.canvas.offsetTop &&
      e.pageY < this.context.canvas.offsetTop + this.height) {
    this.inputEvents.push({event:"mup",
                       x: (e.pageX - this.context.canvas.offsetLeft) / this.scale - this.offset.x,
                       y: (e.pageY - this.context.canvas.offsetTop) / this.scale - this.offset.y});
  }
  else {
    console.log("mouse up outside canvas");
    this.inputEvents.push({event:"mup",
                       x: -1,
                       y: -1});
  }
}

Engine.prototype.mouseOut = function(e) {
  this.inputEvents.push({event:"mout",
                         x: -2,
                         y: -2});
}

Engine.prototype.mouseMove = function(e) {
  this.mouse = {x: (e.pageX - this.context.canvas.offsetLeft) / this.scale - this.offset.x,
                y: (e.pageY - this.context.canvas.offsetTop) / this.scale - this.offset.y};
}

Engine.prototype.load_progress = function(loaded, total, callback) {
  // console.log("resource load progress: " + loaded + ' of ' + total);
  if(loaded === total) {
    if(callback) {
      callback();
    }
  }
}

Engine.prototype.getXY = function(e) {
  // return coordinates relative to game
  var x = (e.clientX - this.context.canvas.getBoundingClientRect().left) / this.scale - this.offset.x;
  var y = (e.clientY - this.context.canvas.getBoundingClientRect().top) / this.scale - this.offset.y;
  return {x: x, y: y};
}

Engine.prototype.start = function() {
  // this.sounds['music'].play();
  console.log("engine start");
  this.running = true;

  // manage focus
  var that = this;
  this.context.canvas.onfocus = function() {
    that.focused = true;
  }

  this.context.canvas.onblur = function() {
    that.focused = false;
  }

  this.context.canvas.focus();

/*  var that = this;
  this.context.canvas.addEventListener("click", function(e) {
    that.click = getXandY(e);
    // stop event from propagating to DOM parents
    e.stopPropagation();
    // prevents action from the browser (eg. tick a checkbox)
    e.preventDefault();
  });
    
  this.context.canvas.addEventListener("mousemove", function(e) {
    that.mouse = getXandY(e);
  });*/

  var that = this;
  (function gameLoop() {
    if (that.running) {
      window.requestAnimFrame(gameLoop);
      that.tick();
      that.update();
      that.draw();
    }
  })();
}

Engine.prototype.stop = function() {
  console.log("engine stop");
  this.running = false;
}

Engine.prototype.tick = function() {
  var timestamp = Date.now();
  var walldelta = timestamp - this.last_timestamp;
  this.last_timestamp = timestamp;
  this.delta = Math.min(walldelta / 1000, this.max_step);
  this.time += this.delta;
  if (this.show_fps) {
    this.fps = 0;
    var i;
    for (i = 1; i < this.fps_stats.length; i++) {
      this.fps += this.fps_stats[i-1];
      this.fps_stats[i-1] = this.fps_stats[i];
    }
    this.fps_stats[i-1] = 1000 / walldelta;
    this.fps = this.fps + this.fps_stats[i-1];
    this.fps /= this.fps_stats.length;
    this.fps = Math.round(this.fps*100)/100;
  }
}

Engine.prototype.update = function() {
  // loop through all entities, call update();
  for (var i = 0 ; i < this.world.layers.length ; i++) {
    if (! this.world.layers[i]) {
      continue;
    }
    node = this.world.layers[i].head;
    if (node == null) {
      continue;
    }
    node.entity.update();
    while (node.Lnext !== null) {
      node = node.Lnext;
      node.entity.update();
    }
  }
  this.inputEvents = [];

  // loop again, remove those marked for removal
  node = null;
  for each (var l in this.world.layers) {
    node = l.head;
    if (node == null) {
      continue;
    }
    if (node.entity.toberemoved) {
        this.removeEntity(node);
      }
    while (node.Lnext !== null) {
      node = node.Lnext;
      if (node.entity.toberemoved) {
        this.removeEntity(node);
      }
    }
  }

  // cursor shape
  var cursor = "auto"; // "default"
  if (this.draggedEntity) {
    cursor = "move";
  }
  else {
    for each (entity in this.draggableEntities) {
      if (entity.onMe(this.mouse)) {
        cursor = "pointer";
        break;
      }
    }
  }
  document.body.style.cursor = cursor;
}

Engine.prototype.draw = function() {

  var new_canvas_width = parseInt(this.element.style.width) ||
                          parseInt(this.element.width);
  var new_canvas_height = parseInt(this.element.style.height) ||
                          parseInt(this.element.height);
                          
  if (new_canvas_width != this.canvas_width || new_canvas_height != this.canvas_height) {
   this.canvas_width = new_canvas_width;
   this.canvas_height = new_canvas_height;
   this.element.style.width = this.canvas_width + 'px';
   this.element.style.height = this.canvas_height + 'px';

    var base_ratio = this.width / this.height;
    var canvas_ratio = this.canvas_width / this.canvas_height;

    this.offset = {x: 0, y:0};
    if(canvas_ratio > base_ratio) {
      // too wide
      this.element.width = this.height * canvas_ratio;
      this.element.height = this.height;
      this.offset.x = (this.element.width - this.width)/2;
      this.scale = this.canvas_height / this.height;
    } else {
      // too tall
      this.element.width = this.width;
      this.element.height = this.width / canvas_ratio;
      this.offset.y = (this.element.height - this.height)/2;
      this.scale = this.canvas_width / this.width;
    }
  }
  this.context.save();
  this.context.translate(this.offset.x, this.offset.y);
  this.context.beginPath();
  this.context.moveTo(0, 0);
  this.context.lineTo(this.width, 0);
  this.context.lineTo(this.width, this.height);
  this.context.lineTo(0, this.height);
  this.context.closePath();
  this.context.clip();
  this.context.clearRect(0, 0, this.width, this.height);

  // TODO: replace with quad scaling later
  for(var x = 0; x < 8; ++x) {
    for(var y = 0; y < 8; ++y) {
      this.context.drawImage(this.images['grass'], x*80, y*60, 80, 60);
    }
  }

  this.context.drawImage(this.images['paintball'], 80*4, 60, 80, 60);
  var v = Math.floor(this.time*10 % 3);
  this.context.drawImage(this.images['sprinkle'+v], 80*4, 60*3, 80, 60);

  // loop here through all entities, call draw()
  var node = null;
  for (var i = 0 ; i < this.world.layers.length ; i++) {
    if (! this.world.layers[i]) {
      continue;
    }
    node = this.world.layers[i].head;
    if (node == null) {
      continue;
    }
    node.entity.draw(this.context);
    while (node.Lnext !== null) {
      node = node.Lnext;
      node.entity.draw(this.context);
    }
  }

  if(this.focused === false) {
    this.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.context.fillRect(0, 0, this.width, this.height);
  }

  if(this.show_fps) {
    this.context.font = "22px Arial";
    this.context.textBaseline = "top";
    this.context.fillStyle = "red";
    this.context.fillText(this.fps, 0, 0);
  }
  this.context.restore();
}

Engine.prototype.createType = function (type) {
  var v = this.world.types;
  if (type in this.world.types) {
    console.log("warning: type already exists " + type);
  }
  else {
    this.world.types[type] = {head: null, tail: null};
  }
};

Engine.prototype.createLayer = function (layer) {
  if (layer in this.world.layers) {
    console.log("warning: layer already exists " + layer);
  }
  else {
    this.world.layers[layer] = {head: null, tail: null};
    //console.log("before sort: "); for (l in this.world.layers) {console.log(l);}
    //this.world.layers.sort();
    //console.log("after sort: "); for (l in this.world.layers) {console.log(l);}
  }
};

Engine.prototype.addEntity = function(entity, type, layer) {
  var node = {
    entity: entity,
    Tnext: null,
    Tprev: null,
    Lnext: null,
    Lprec: null
  };

  // "push front" into the right type list
  if (type in this.world.types) {
    var Tlist = this.world.types[type];
    if (Tlist.head === null) {
      Tlist.head = node;
      Tlist.tail = node;
    }
    else {
      node.Tnext = Tlist.head;
      Tlist.head.Tprev = node;
      Tlist.head = node;
    }
  }
  else {
    console.log("warning: type does not exist " + type);
  }

  // "push front" into the right layer list
  if (! (layer in this.world.layers)) {
    this.createLayer(layer);
  }
  var Llist = this.world.layers[layer];
  if (Llist.head === null) {
    Llist.head = node;
    Llist.tail = node;
  }
  else {
    node.Lnext = Llist.head;
    Llist.head.Lprev = node;
    Llist.head = node;
  }
};

Engine.prototype.removeEntity = function (node) {
  console.log("removeEntity " + node.entity);
  var w = this.world;

  // remove from the type list
  if (node.Tprev == null) {
    // find the list where node is
    for each (var t in w.types) {
      if (t.head === node) {
        t.head = node.Tnext;
          break;
      }
    }
  }
  else {
    node.Tprev.Tnext = node.Tnext;
  }
  if (node.Tnext == null) {
    // find the list where node is
    for each (var t in w.types) {
      if (t.tail === node) {
        t.tail = node.Tprev;
        break;
      }
    }
  }
  else {
    node.Tnext.Tprev = node.Tprev;
  }
    
  // remove from the layer list
  if (node.Lprev == null) {
    // find the list where node is
    for each (var l in w.layers) {
      if (l.head === node) {
        l.head = node.Lnext;
        break;
      }
    }
  }
  else {
    node.Lprev.Lnext = node.Lnext;
  }
  if (node.Lnext == null) {
    // find the list where node is
    for each (var l in w.layers) {
      if (l.tail === node) {
        l.tail = node.Lprev;
        break;
      }
    }
  }
  else {
    node.Lnext.Lprev = node.Lprev;
  }
}

Engine.prototype.setEntityLayer = function(node, layer) {
  var w = this.world;

  // remove node from its layer list
  if (node.Lprev == null) {
    // find the list where node is
    for each (var l in w.layers) {
      if (l.head === node) {
        l.head = node.Lnext;
        break;
      }
    }
  }
  else {
    node.Lprev.Lnext = node.Lnext;
  }
  if (node.Lnext == null) {
    // find the list where node is
    for each (var l in w.layers) {
      if (l.tail === node) {
        l.tail = node.Lprev;
        break;
      }
    }
  }
  else {
    node.Lnext.Lprev = node.Lprev;
  }

  // "push front" into the new layer list
  if (! (layer in this.world.layers)) {
    this.createLayer(layer);
  }
  var Llist = w.layers[layer];
  if (Llist.head === null) {
    Llist.head = node;
    Llist.tail = node;
  }
  else {
    node.Lnext = Llist.head;
    Llist.head.Lprev = node;
    Llist.head = node;
  }
}

//-----------------------------------------------------
// Entity
//-----------------------------------------------------

function Entity(game, draggable, hasExclusivePlace, sticksToLanes) {
  this.game = game;
  this.toberemoved = false;
  this.dragged = false;
  this.draggable = draggable || false;
  if (this.draggable) {
    this.registerAsMouseMoveListener.call(this);
    this.game.draggableEntities.push(this);
  }
  this.hasExclusivePlace = hasExclusivePlace || false;
  if (this.hasExclusivePlace) {
    this.game.exclusivePlaceEntities.push(this);
  }
  this.sticksToLanes = sticksToLanes || false;
}

Entity.prototype.update = function() {
  if (this.draggable) {
    this.checkMouseInputs.call(this);
  }
  if (this.outsideScreen()) {
    this.toberemoved = true;
  }
}

Entity.prototype.draw = function() {
  if (this.game.show_outlines && this.width) {
    this.game.context.beginPath();
    this.game.context.strokeStyle = "red";
    this.game.context.arc(this.x, this.y, this.width/2, 0, Math.PI*2, false);
    this.game.context.stroke();
    this.game.context.closePath();
  }
}

Entity.prototype.drawSpriteCentered = function(ctx) {
  if (this.sprite && this.x && this.y) {
    var x = this.x - this.sprite.width/2;
    var y = this.y - this.sprite.height/2;
    ctx.drawImage(this.sprite, x, y);
  }
}

Entity.prototype.outsideScreen = function() {
  return (this.x - this.width/2 > this.game.width ||
          this.x + this.width/2 < 0 ||
          this.y - this.height/2 > this.game.height ||
          this.y + this.height/2 < 0 );
}

Entity.prototype.onMe = function(coord) {
  return (coord.x >= this.x - this.width/2 &&
          coord.x <= this.x + this.width/2 &&
          coord.y >= this.y - this.height/2 &&
          coord.y <= this.y + this.height/2);
}

Entity.prototype.overlap = function(box) {
  var bleft = box.x - box.width/2;
  var bright = box.x + box.width/2;
  var btop = box.y - box.height/2;
  var bbottom = box.y + box.height/2;
  return (this.onMe({x:bleft ,y:btop}) ||
          this.onMe({x:bleft ,y:bbottom}) ||
          this.onMe({x:bright ,y:btop}) ||
          this.onMe({x:bright ,y:bbottom}));
}

Entity.prototype.registerAsMouseMoveListener = function() {
  var that = this;
  var mouseMove = function(e) {
    if (that.dragged) {
      that.x = (e.pageX - that.game.context.canvas.offsetLeft) / that.game.scale - that.game.offset.x;
      that.y = (e.pageY - that.game.context.canvas.offsetTop) / that.game.scale - that.game.offset.y;
    }
  }
  this.game.context.canvas.addEventListener('mousemove', mouseMove);
}

Entity.prototype.checkMouseInputs = function() {
  var eventsToBeRemoved = [];
  var remove;
  for (var i = 0 ; i < this.game.inputEvents.length ; i++) {
    var event = this.game.inputEvents[i];
    remove = false;
    if (event.event == "mdown") {
      remove = this.mouseDown(event);
    }
    else if (event.event == "mup") {
      remove = this.mouseUp(event);
    }
    else if (event.event == "mout") {
      remove = this.mouseOut(event);
    }
    if (remove) {
      eventsToBeRemoved.push(i);
    }
  }
  for (var i = 0 ; i < eventsToBeRemoved.length ; i++) {
    this.game.inputEvents.splice(i);
  }
}

Entity.prototype.saveState = function() {
  this.lastX = this.x;
  this.lastY = this.y;
}

Entity.prototype.restoreState = function() {
  this.x = this.lastX;
  this.y = this.lastY;
}

Entity.prototype.mouseDown = function(event) {
  if (this.dragged == false && this.onMe(event)) {
    this.saveState();
    this.dragged = true;
    this.game.draggedEntity = this;
    return true;
  }
}

Entity.prototype.mouseUp = function(event) {
  if (this.dragged) {
    if (this.hasExclusivePlace) {
      // this entity cannot overlap some other entities
      var that = this;
      var overlap = this.game.exclusivePlaceEntities.some(function(elem) {
        return that !== elem && that.overlap(elem);
      });
      if (overlap) {
        // cancel move
        this.restoreState();
        this.dragged = false;
        this.game.draggedEntity = null;
        return false;
      }
    }
    this.x = event.x;
    this.y = event.y;
    if (this.sticksToLanes) {
      // this entity sticks to either lane
      this.lane = Math.floor(event.y / 60);
      this.y = this.lane*60 + 30;
    }
    this.dragged = false;
    this.game.draggedEntity = null;
    this.saveState();
  }
  return false;
}

Entity.prototype.mouseOut = function(event) {
  if (this.dragged) {
    this.restoreState();
    this.dragged = false;
    this.game.draggedEntity = null;
  }
  return false;
}

/*
Entity.prototype.rotateAndCache = function(image, angle) {
  var offscreenCanvas = document.createElement('canvas');
  var size = Math.max(image.width, image.height);
  offscreenCanvas.width = size;
  offscreenCanvas.height = size;
  var offscreenCtx = offscreenCanvas.getContext('2d');
  offscreenCtx.save();
  offscreenCtx.translate(size/2, size/2);
  offscreenCtx.rotate(angle - Math.PI/2);
  offscreenCtx.drawImage(image, -(image.width/2), -(image.height/2));
  offscreenCtx.restore();
  return offscreenCanvas;
}*/

//-----------------------------------------------------
// Animation
//-----------------------------------------------------

function Animation(game, sprite_list, frame_duration, loop) {
  this.game = game;
  this.sprite_list = sprite_list;
  this.frame_duration = frame_duration;
  this.total_time = sprite_list.length * frame_duration;
  this.elapsed_time = 0;
  this.loop = loop;
}

Animation.prototype.getFrame = function(delta) {
  this.elapsed_time += delta;
  if(this.elapsed_time > this.total_time) {
    if(this.loop) {
      this.elapsed_time %= this.total_time;
    }
    else {
      this.elapsed_time = this.total_time+1;
      return;
    }
  }

  var index = Math.floor(this.elapsed_time / this.frame_duration);
  return this.sprite_list[index];
}
