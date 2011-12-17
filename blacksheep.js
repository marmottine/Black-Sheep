//--------------------------------------
// Game initialization
//--------------------------------------

var game = null;

window.onload = function() {
  var element = document.getElementById('surface');
  var image_list = ['grass', 'cannon', 'paintball', 'sprinkle0', 'sprinkle1', 'sprinkle2', 'sheep1'];
  var sound_list = ['pew'];
  game = new BlackSheep();
  game.init(element, 640, 480, image_list, sound_list,
            function() { game.start(); });
  game.showOutlines = true;
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
  console.log("Sheep x,y: " + this.x + "," + this.y);
}

Sheep.prototype = new Entity();
Sheep.prototype.constructor = Sheep;

Sheep.prototype.update = function() {
  console.log("Sheep update");
  this.x -= this.speed;
  Entity.prototype.update.call(this);
}

Sheep.prototype.draw = function(ctx) {
  console.log("Sheep draw at " + this.x + ' ' + this.y);
  this.drawSpriteCentered(ctx);
  Entity.prototype.draw.call(this, ctx);
}

