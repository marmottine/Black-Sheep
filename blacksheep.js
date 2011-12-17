//--------------------------------------
// Game initialization
//--------------------------------------

var game = null;

window.onload = function() {
  var element = document.getElementById('surface');
  var image_list = ['grass', 'cannon', 'paintball', 'sprinkle0', 'sprinkle1', 'sprinkle2', 'sheep1', 'fence3'];
  var sound_list = ['pew'];
  game = new BlackSheep();
  game.init(element, 640, 480, image_list, sound_list,
            function() { game.start(); });
  //game.show_outlines = true; // debug
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
  this.sprite = this.rotateAndCache(game.images['sheep1'], Math.PI/2);
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
  this.drawSpriteCentered(ctx);
  Entity.prototype.draw.call(this, ctx);
}

//-----------------------------------------------------
// Fence
//-----------------------------------------------------

function Fence(game, lane) {
  Entity.call(this, game);
  this.sprite = this.rotateAndCache(game.images['fence3'], Math.PI/2);
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

