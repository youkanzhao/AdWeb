var winWidth = document.documentElement.clientWidth;
var winHeight = document.documentElement.clientHeight;
init(50, "legend", winWidth, winHeight, main);

var imgData = [ {
	name : "back",
	path : "./images/back.jpg"
}, {
	name : "player",
	path : "./images/player.png"
}, {
	name : "item0",
	path : "./images/item0.png"
}, {
	name : "item1",
	path : "./images/item1.png"
}, {
	name : "item2",
	path : "./images/item2.png"
}, {
	name : "item3",
	path : "./images/item3.png"
}, {
	name : "item4",
	path : "./images/item4.png"
}, {
	name : "item5",
	path : "./images/item5.png"
}, {
	name : "item6",
	path : "./images/item6.png"
}, {
	name : "item7",
	path : "./images/item7.png"
} ];

var imglist;
var backLayer, playerLayer, itemLayer, overLayer;
var hero;
var step = 50, stepindex = 0;
var point = 0, pointTxt;
var hp = 1, hpTxt;

function main() {
	LLoadManage.load(imgData, null, gameInit);
}

function gameInit(result) {
	imglist = result;
	backLayer = new LSprite();
	addChild(backLayer);
	addBackGround();
	addPlayer();

	itemLayer = new LSprite();
	backLayer.addChild(itemLayer);

	addText();

	overLayer = new LSprite();
	backLayer.addChild(overLayer);

	addEvent();
}

function addText() {
	hpTxt = new LTextField();
	hpTxt.color = "#ff0000";
	hpTxt.size = 30;
	hpTxt.x = 10;
	hpTxt.y = 10;
	backLayer.addChild(hpTxt);

	pointTxt = new LTextField();
	pointTxt.color = "#ffffff";
	pointTxt.size = 30;
	pointTxt.x = 10;
	pointTxt.y = 50;
	backLayer.addChild(pointTxt);
	showText();
}

function showText() {
	hpTxt.text = hp;
	pointTxt.text = point;
}

function addEvent() {
	backLayer.addEventListener(LEvent.ENTER_FRAME, onframe);
	backLayer.addEventListener(LMouseEvent.MOUSE_DOWN, onDown);
	backLayer.addEventListener(LMouseEvent.MOUSE_UP, onUp);
}

function onframe() {
	hero.run();

	for ( var key in itemLayer.childList) {
		itemLayer.childList[key].run();
		if (itemLayer.childList[key].mode == "die") {
			itemLayer.removeChild(itemLayer.childList[key]);
		}
	}
	if (stepindex++ > step) {
		stepindex = 0;
		addItem();
	}
	showText();
	if (hp <= 0) {
		gameOver();
		return;
	}
}

function gameOver() {
	backLayer.die();
	itemLayer.removeAllChild();
	var txt = new LTextField();
	txt.color = "#ff0000";
	txt.size = 50;
	txt.text = "GAME OVER";
	txt.x = (LGlobal.width - txt.getWidth()) * 0.5;
	txt.y = 100;
	overLayer.addChild(txt);
	backLayer.addEventListener(LMouseEvent.MOUSE_DOWN, function(event) {
		backLayer.die();
		overLayer.removeAllChild();
		hp = 10;
		point = 0;
		addEvent();
	});
}

function addItem() {
	var item = new Item();
	item.x = 20 + Math.floor(Math.random() * (LGlobal.width - 50));
	itemLayer.addChild(item);
}

function onDown(event) {
	if (event.selfX < LGlobal.width * 0.5) {
		hero.mode = "left";
		hero.anime.setAction(1);
	} else {
		hero.mode = "right";
		hero.anime.setAction(2);
	}
}

function onUp(event) {
	hero.mode = "";
	hero.anime.setAction(0);
}

function addPlayer() {
	playerLayer = new LSprite();
	backLayer.addChild(playerLayer);
	hero = new Player();
	hero.x = winWidth / 2;
	hero.y = winHeight * 0.8;
	playerLayer.addChild(hero);
}

function addBackGround() {
	var bitmap = new LBitmap(new LBitmapData(imglist["back"]));
	bitmap.scaleX = winWidth / 800;
	bitmap.scaleY = winHeight / 600;
	backLayer.addChild(bitmap);
}

function Player() {
	base(this, LSprite, []);
	var self = this;
	self.mode = "";
	var list = LGlobal.divideCoordinate(256, 256, 4, 4);
	var data = new LBitmapData(imglist["player"], 0, 0, 64, 64);
	self.anime = new LAnimation(self, data, list);
	self.step = 2, self.stepindex = 0;
}

Player.prototype.run = function() {
	var self = this;
	if (self.stepindex++ > self.step) {
		self.stepindex = 0;
		self.anime.onframe();
	}
	if (self.mode == "left") {
		if (self.x > 10)
			self.x -= 10;
	} else if (self.mode == "right") {
		if (self.x < LGlobal.width - self.getWidth())
			self.x += 10;
	}
}

function Item() {
	base(this, LSprite, []);
	var self = this;
	self.mode = "";
	var index = Math.floor(Math.random() * 8);
	self.value = index < 4 ? 1 : -1;
	var bitmap = new LBitmap(new LBitmapData(imglist["item" + index]));
	self.addChild(bitmap);
}

Item.prototype.run = function() {
	var self = this;
	self.y += 5;
	var hit = self.checkHit();
	if (hit || self.y > LGlobal.height) {
		self.mode = "die";
	}
}

Item.prototype.checkHit = function() {
	var self = this;
	if (LGlobal.hitTestArc(self, hero)) {
		if (self.value > 0) {
			point += 1;
		} else {
			hp -= 1;
		}
		return true;
	}
	return false;
}