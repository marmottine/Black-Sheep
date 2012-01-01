//--------------------------------------
// Game initialization
//--------------------------------------

var game = null;

window.onload = function() {
  var element = document.getElementById('surface');

  var image_list = ['grass', 'cannon', 'paintball',
                    'sprinkle0', 'sprinkle1', 'sprinkle2',
                    'sheep1-1', 'sheep1-2', 'sheep1-3', 'sheep1-4',
                    'sheep2-1', 'sheep2-2', 'sheep2-3', 'sheep2-4',
                    'sheep3-1', 'sheep3-2', 'sheep3-3', 'sheep3-4',
                    'sheep4-1', 'sheep4-2', 'sheep4-3', 'sheep4-4',
                    'fence3', 'puddle2', 'tin',
                    'tin-anim-knocked-over-1', 'tin-anim-knocked-over-2'];
  var sound_list = ['baa0', 'baa1', 'baa2'];
  game = new BlackSheep();
  game.init(element, 640, 480, image_list, sound_list,
            function() { game.start(); });
}

//-----------------------------------------------------
// BlackSheep
//-----------------------------------------------------

function BlackSheep() {
  Engine.call(this);
}

BlackSheep.prototype = new Engine();
BlackSheep.prototype.constructor = BlackSheep;

BlackSheep.prototype.start = function() {
  this.createType("sheep");
  this.createType("fence");
  this.createType("cannon");
  this.createType("paintball");
  this.createType("puddle");
  this.createType("tin");
  this.createType("tinKnockedOver");
  // used for update. update weapons first so that sheeps know they are hit asap.
  this.world.type_ordering = new Array("puddle", "paintball", "cannon", "tin", "tinKnockedOver", "fence", "sheep");

  var fence;
  for (var i = 0 ; i < 8 ; i++) {
    fence = new Fence(this, i);
    this.addEntity(fence, "fence", 10*(i+1));
  }

  var sheep = new Sheep(this, 2, 540);
  this.addEntity(sheep, "sheep", 37);
  sheep = new Sheep(this, 2, 600);
  this.addEntity(sheep, "sheep", 37);
  sheep = new Sheep(this, 2, 620);
  this.addEntity(sheep, "sheep", 37);
  sheep = new Sheep(this, 2, 650);
  this.addEntity(sheep, "sheep", 37);
  sheep = new Sheep(this, 4, 650);
  this.addEntity(sheep, "sheep", 57);
  sheep = new Sheep(this, 5, 650);
  this.addEntity(sheep, "sheep", 67);

  var cannon = new Cannon(this, 3, 180);
  this.addEntity(cannon, "cannon", 45);
  cannon = new Cannon(this, 1, 300);
  this.addEntity(cannon, "cannon", 25);
  cannon = new Cannon(this, 4, 330);
  this.addEntity(cannon, "cannon", 55);

  var tin = new Tin(this, 5, 200);
  this.addEntity(tin, "tin", 64);

  var puddle = new Puddle(this, 2, 400);
  this.addEntity(puddle, "puddle", 32);

  Engine.prototype.start.call(this);
}

BlackSheep.prototype.update = function() {
  Engine.prototype.update.call(this);
}

BlackSheep.prototype.draw = function() {
  Engine.prototype.draw.call(this);
}

//-----------------------------------------------------
// Sheep
//-----------------------------------------------------

function Sheep(game, lane, x) {
  Entity.call(this, game, false, false);
  this.speed = 60;
  this.animation = new Animation(game, [this.game.images['sheep1-1'],
                                        this.game.images['sheep1-2'],
                                        this.game.images['sheep1-3'],
                                        this.game.images['sheep1-4'] ], 0.1, true);
  this.lane = lane;
  this.x = x;
  this.y = lane*60 + 30;
  this.width = 30;
  this.height = 60;
  this.radius = 40;
  this.hits = 0;
  this.maxHits = 3
}

Sheep.prototype = new Entity();
Sheep.prototype.constructor = Sheep;

Sheep.prototype.update = function() {
  this.x -= this.speed * this.game.delta;
  Entity.prototype.update.call(this);
}

Sheep.prototype.draw = function(ctx) {
  this.sprite = this.animation.getFrame(this.game.delta);
  this.drawSpriteCentered(ctx);
  Entity.prototype.draw.call(this, ctx);
}

Sheep.prototype.hit = function() {
  if (this.hits < this.maxHits) {
    this.hits++;
    this.animation = new Animation(game, [this.game.images['sheep' + (this.hits+1) + '-1'],
                                          this.game.images['sheep' + (this.hits+1) + '-2'],
                                          this.game.images['sheep' + (this.hits+1) + '-3'],
                                          this.game.images['sheep' + (this.hits+1) + '-4'] ], 0.1, true);
  }
  else {
    console.log('hit while already black');
  }
}

//-----------------------------------------------------
// Fence
//-----------------------------------------------------

function Fence(game, lane) {
  Entity.call(this, game, false, true);
  this.sprite = game.images['fence3'];
  this.lane = lane;
  this.x = 30;
  this.y = lane*60 + 30;
  this.width = 30;
  this.height = 60;
  this.radius = 40;
}

Fence.prototype = new Entity();
Fence.prototype.constructor = Fence;

Fence.prototype.update = function() {
  Entity.prototype.update.call(this);
}

Fence.prototype.draw = function(ctx) {
  this.drawSpriteCentered(ctx);
  Entity.prototype.draw.call(this, ctx);
}

//-----------------------------------------------------
// Cannon
//-----------------------------------------------------

function Cannon(game, lane, x) {
  Entity.call(this, game, true, true, true);
  this.sprite = game.images['cannon'];
  this.lane = lane;
  this.x = x;
  this.y = lane*60 + 30;
  this.width = 80;
  // Hack: so long the fixme in Entity.prototype.mouseUp is not fixed,
  // it may be necessary to reduce the height of sticksToLanes entities
  this.height = 50; //60;
  this.radius = 40;
  this.firingSpeed = 1.2;
  this.resetFiring = 1/this.firingSpeed;
  this.firingTimeout = this.resetFiring;
}

Cannon.prototype = new Entity();
Cannon.prototype.constructor = Cannon;

Cannon.prototype.update = function() {
  if (this.firingTimeout <= 0) {
    var ball = new Paintball(this.game, this.lane, this.x + 40);
    this.game.addEntity(ball, "paintball", 10*(this.lane+1) + 8);
    this.firingTimeout = this.resetFiring;
  }
  else {
    this.firingTimeout -= 1 * this.game.delta;
  }
  Entity.prototype.update.call(this);
}

Cannon.prototype.draw = function(ctx) {
  this.drawSpriteCentered(ctx);
  Entity.prototype.draw.call(this, ctx);
}

Cannon.prototype.getLayer = function() {
  return 10 * (this.lane + 1) + 5;
}

//-----------------------------------------------------
// Paintball
//-----------------------------------------------------

function Paintball(game, lane, x) {
  Entity.call(this, game, false, false, false);
  this.sprite = game.images['paintball'];
  this.lane = lane;
  this.x = x;
  this.y = lane*60 + 30;
  this.width = 30;
  this.height = 58;
  this.radius = 40;
  this.speed = 150;
}

Paintball.prototype = new Entity();
Paintball.prototype.constructor = Paintball;

Paintball.prototype.update = function() {
  this.x += this.speed * this.game.delta;
  // hit a sheep if overlap
  var node = this.game.world.types['sheep'].head;
  while (node !== null) {
    var e = node.entity;
    if (this.overlap(e) && e.hits < e.maxHits) {
      break;
    }
    node = node.Tnext;
  }
  if (node !== null) {
    node.entity.hit();
    this.toberemoved = true;
  }

  Entity.prototype.update.call(this);
}

Paintball.prototype.draw = function(ctx) {
  this.drawSpriteCentered(ctx);
  Entity.prototype.draw.call(this, ctx);
}

//-----------------------------------------------------
// Puddle
//-----------------------------------------------------

function Puddle(game, lane, x) {
  Entity.call(this, game, false, true, false);
  this.sprite = game.images['puddle2'];
  this.lane = lane;
  this.x = x;
  this.y = lane*60 + 30;
  this.width = 80;
  this.height = 50;
  this.radius = 40;
  this.firingSpeed = 1.3;
  this.resetFiring = 1/this.firingSpeed;
  this.firingTimeout = this.resetFiring;
}

Puddle.prototype = new Entity();
Puddle.prototype.constructor = Puddle;

Puddle.prototype.update = function() {
  if (this.firingTimeout <= 0) {
    // hit a sheep if possible (the most on the left)
    var mostLeft = null;
    var node = this.game.world.types['sheep'].head;
    while (node !== null) {
      var e = node.entity;
      if (this.overlap(e) &&
          e.hits < e.maxHits &&
          (mostLeft == null || e.x < mostLeft.x)) {
        mostLeft = e;
      }
      node = node.Tnext;
    }
    if (mostLeft !== null) {
      this.firingTimeout = this.resetFiring;
      mostLeft.hit();
    }
  }
  else {
    this.firingTimeout -= 1 * this.game.delta;
  }
  Entity.prototype.update.call(this);
}

Puddle.prototype.draw = function(ctx) {
  this.drawSpriteCentered(ctx);
  Entity.prototype.draw.call(this, ctx);
}

//-----------------------------------------------------
// Tin
//-----------------------------------------------------

function Tin(game, lane, x) {
  Entity.call(this, game, true, true, true);
  this.sprite = game.images['tin'];
  this.lane = lane;
  this.x = x;
  this.y = lane*60 + 30;
  this.width = 34;
  this.height = 58;
  this.radius = 40;
}

Tin.prototype = new Entity();
Tin.prototype.constructor = Tin;

Tin.prototype.update = function() {
  // spills if a sheep touch it
  var node = this.game.world.types['sheep'].head;
  while (node !== null) {
    var e = node.entity;
    if (this.overlap(e)) {
      break;
    }
    node = node.Tnext;
  }
  if (node !== null) {
    var tin = new TinKnockedOver(this.game, this.lane, this.x - 30);
    this.game.addEntity(tin, "tinKnockedOver", 10*(this.lane + 1) + 2);
    this.toberemoved = true;
  }

  Entity.prototype.update.call(this);
}

Tin.prototype.draw = function(ctx) {
  this.drawSpriteCentered(ctx);
  Entity.prototype.draw.call(this, ctx);
}

Tin.prototype.getLayer = function() {
  return 10 * (this.lane + 1) + 4;
}

//-----------------------------------------------------
// TinKnockedOver
//-----------------------------------------------------

function TinKnockedOver(game, lane, x) {
  Entity.call(this, game, false, true, false);
  this.duration = 1.6;
  this.animImages = [this.game.images['tin-anim-knocked-over-1'],
                     this.game.images['tin-anim-knocked-over-2'] ];
  this.animation = new Animation(game, this.animImages, this.duration / this.animImages.length, false);
  this.lane = lane;
  this.x = x;
  this.y = lane*60 + 30;
  this.width = 100;
  this.height = 58;
  this.radius = 50;
  this.timeout = this.duration;
}

TinKnockedOver.prototype = new Entity();
TinKnockedOver.prototype.constructor = TinKnockedOver;

TinKnockedOver.prototype.update = function() {
  if (this.timeout <= 0) {
    var puddle = new Puddle(this.game, this.lane, this.x - 50);
    this.game.addEntity(puddle, "puddle", 10*(this.lane + 1) + 2);
    this.toberemoved = true;
  }
  else {
    this.timeout -= this.game.delta;
  }

  Entity.prototype.update.call(this);
}

TinKnockedOver.prototype.draw = function(ctx) {
  this.sprite = this.animation.getFrame(this.game.delta);
  this.drawSpriteCentered(ctx);
  Entity.prototype.draw.call(this, ctx);
}
