//--------------------------------------
// Game initialization
//--------------------------------------

var game = null;

window.onload = function() {
  var element = document.getElementById('surface');
  var image_list = ['grass', 'cannon', 'paintball', 'sprinkle0', 'sprinkle1', 'sprinkle2'];
  var sound_list = ['pew'];
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
  this.createType("any entity");
  this.createLayer(2);
  this.createLayer(1);
  this.movingEntity = new MovingEntity(this);
  this.staticEntity = new StaticEntity(this);
  this.addEntity(this.movingEntity, "any entity", 2);
  this.addEntity(this.staticEntity, "any entity", 2);
  Engine.prototype.start.call(this);
}

BlackSheep.prototype.update = function() {
  Engine.prototype.update.call(this);
}

BlackSheep.prototype.draw = function() {
  Engine.prototype.draw.call(this);
}

//-----------------------------------------------------
// MovingEntity
//-----------------------------------------------------

function MovingEntity(game) {
  Entity.call(this, game);
  this.speed = 10;
  this.sprite = this.rotateAndCache(game.images['paintball'], Math.random());
  this.x = 10; // Math.random()*game.canvas_width;
  this.y = 10; // Math.random()*game.canvas_height;
  this.width = 100;
  this.height = 100;
}

MovingEntity.prototype = new Entity();
MovingEntity.prototype.constructor = MovingEntity;

MovingEntity.prototype.update = function() {
  console.log("MovingEntity update");
  var rand = Math.random()*this.speed;
  this.x += rand;
  this.y += Math.sqrt(this.speed*this.speed - rand*rand);
  Entity.prototype.update.call(this);
}

MovingEntity.prototype.draw = function(ctx) {
  console.log("MovingEntity draw");
  this.drawSpriteCentered(ctx);
  Entity.prototype.draw.call(this, ctx);
}

//-----------------------------------------------------
// StaticEntity
//-----------------------------------------------------

function StaticEntity(game) {
  Entity.call(this, game);
  this.sprite = this.rotateAndCache(game.images['cannon'], Math.random());
  this.x = 300;
  this.y = 200;
  this.width = 100;
  this.height = 100;  
}

StaticEntity.prototype = new Entity();
StaticEntity.prototype.constructor = StaticEntity;

StaticEntity.prototype.update = function() {
  console.log("StaticEntity update");
  Entity.prototype.update.call(this);
}

StaticEntity.prototype.draw = function(ctx) {
  console.log("StaticEntity draw");
  this.drawSpriteCentered(ctx);
  Entity.prototype.draw.call(this, ctx);
}
