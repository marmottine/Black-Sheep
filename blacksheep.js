//--------------------------------------
// Game initialization
//--------------------------------------

var game = null;

window.onload = function() {
  var element = document.getElementById('surface');

  var image_list = ['grass', 'cannon', 'paintball',
                    'sprinkle0', 'sprinkle1', 'sprinkle2',
                    'sheep1-1', 'sheep1-2', 'sheep1-3', 'sheep1-4',
                    'fence3', 'puddle2'];
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
  this.createType("puddle");

  var fence;
  for (var i = 0 ; i < 8 ; i++) {
    fence = new Fence(this, i);
    this.addEntity(fence, "fence", 10*(i+1));
  }

  var sheep = new Sheep(this, 2);
  this.addEntity(sheep, "sheep",35);

  var cannon = new Cannon(this, 3, 180);
  // 42 == 10*(cannon.lane+1) + aLittleSomething // cf fences
  this.addEntity(cannon, "cannon", 42);
  cannon = new Cannon(this, 1, 300);
  this.addEntity(cannon, "cannon", 22);
  cannon = new Cannon(this, 4, 330);
  this.addEntity(cannon, "cannon", 52);

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

function Sheep(game, lane) {
  Entity.call(this, game, false, false);
  this.speed = 2;
  this.animation = new Animation(game, [this.game.images['sheep1-1'],
                                        this.game.images['sheep1-2'],
                                        this.game.images['sheep1-3'],
                                        this.game.images['sheep1-4'] ], 0.1, true);
  this.lane = lane;
  this.x = game.width*0.9;
  this.y = lane*60 + 30;
  this.width = 80;
  this.height = 60;
  this.radius = 40;
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
  Entity.call(this, game, false, true);
  this.sprite = game.images['fence3'];
  this.lane = lane;
  this.x = 100;
  this.y = lane*60 + 30;
  this.width = 80;
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
}

Cannon.prototype = new Entity();
Cannon.prototype.constructor = Cannon;

Cannon.prototype.update = function() {
  Entity.prototype.update.call(this);
}

Cannon.prototype.draw = function(ctx) {
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
  this.height = 60;
  this.radius = 40;
}

Puddle.prototype = new Entity();
Puddle.prototype.constructor = Puddle;

Puddle.prototype.update = function() {
  Entity.prototype.update.call(this);
}

Puddle.prototype.draw = function(ctx) {
  this.drawSpriteCentered(ctx);
  Entity.prototype.draw.call(this, ctx);
}
