//--------------------------------------
// Game initialization
//--------------------------------------

var game = null;

window.onload = function() {
  var element = document.getElementById('surface');

  var image_list = ['grass', 'cannon', 'paintball',
                    'sprinkle0', 'sprinkle1', 'sprinkle2',
                    'sheep1', 'sheep2', 'sheep3', 'sheep4',
                    'fence3'];
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
  this.createLayer(2);
  this.createLayer(1);
  this.sheep = new Sheep(this, 2);
  var fence;
  this.fences = [];
  for (var i = 0 ; i < 8 ; i++) {
    fence = new Fence(this, i);
    this.fences.push(fence);
    this.addEntity(fence, "fence", 1);
  }
  this.addEntity(this.sheep, "sheep", 2);
  Engine.prototype.start.call(this);

  var that = this;
  this.context.canvas.addEventListener('mousedown', function(e) {
    var coord = that.getXY(e);
    console.log("mousedown " + coord.x + " " + coord.y);
  });

  this.context.canvas.onmouseup = function() {
    console.log("mouseup");
  }
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

function Sheep(game, lane) {
  Entity.call(this, game);
  this.speed = 2;
  this.animation = new Animation(game, [this.game.images['sheep1'],
                                        this.game.images['sheep2'],
                                        this.game.images['sheep3'],
                                        this.game.images['sheep4'] ], 1, true);
  this.lane = lane;
  this.x = game.width*0.9;
  this.y = lane*60 + 30;
  this.width = 100;
  this.height = 100;
  this.radius = 50;
}

Sheep.prototype = new Entity();
Sheep.prototype.constructor = Sheep;

Sheep.prototype.update = function() {
  this.x -= this.speed;
  Entity.prototype.update.call(this);
}

Sheep.prototype.draw = function(ctx) {
  this.sprite = this.animation.getFrame(this.game.delta);
  this.drawSpriteCentered(ctx);
  Entity.prototype.draw.call(this, ctx);
}

//-----------------------------------------------------
// Fence
//-----------------------------------------------------

function Fence(game, lane) {
  Entity.call(this, game);
  this.sprite = game.images['fence3'];
  this.lane = lane;
  this.x = 100;
  this.y = lane*60 + 30;
  this.width = 100;
  this.height = 100;
  this.radius = 50;
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
