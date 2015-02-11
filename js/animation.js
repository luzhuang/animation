// ;(function(window,document){
	// function init() {
		var requestAnimationFrame = (function(){
		   return  window.requestAnimationFrame       || 
		           window.webkitRequestAnimationFrame || 
		           window.mozRequestAnimationFrame    || 
		           window.oRequestAnimationFrame      || 
		           window.msRequestAnimationFrame     || 
		           function(/* function */ callback, /* DOMElement */ element){
		             window.setTimeout(callback, 1000 / 60);
		           };
 		})();

 		function Sprite(img,x,y,width,height,action){
 			this.canvas = document.createElement('canvas');
			this.ctx = this.canvas.getContext('2d');
 			this.x = this.originX = x;
 			this.y = this.originY = y;
 			this.width = this.originWidth = width;	
 			this.height = this.originHeight = height;
 			this.size = Math.sqrt(width*width+height*height);
 			this.canvas.width = this.size;
 			this.canvas.height= this.size;
 			this.img = img;
 			this.action = action || {name:'stay'};
 			this.layer = {};
 			this.init();
 			this.isTurn = false;
 		}

 		Sprite.prototype = {
 			init : function(){
 				var canvas = this.canvas,
 					ctx = this.ctx,
 					x = this.x,
 					y = this.y,
 					width = this.width,
 					height = this.height,
 					size = this.size;
					img = this.img;
 				if (this.action.name != 'stay') {
	 				ctx.translate(this.size/2,this.size/2);
					ctx.drawImage(img,-width/2,-height/2,width,height);
				}else{
					// console.log(width);
					ctx.drawImage(img,0,0,width,height);
				}
 			},
 			move : function() {
 				var action = this.action,
 					actionName = action.name,
 					size = this.size,
 					width = this.width,
 					height = this.height,
 					ctx = this.ctx;
				
				if (/func/i.test(actionName)){
					this.y += action.vy;
					this.x = action.func(this.y);
				}
				if (/rotate/i.test(actionName)){
					ctx.clearRect(-size/2,-size/2,size,size);
					ctx.rotate(action.angle*Math.PI/180);
					ctx.drawImage(this.img,-width/2,-height/2,width,height);
				}
				if (/bezier/i.test(actionName)){
					var action = this.action,
						p0 = this.action.p0,
						p1 = this.action.p1,
						p2 = this.action.p2,
						p3 = this.action.p3;
					var scale = Math.random()+0.2;
					this.action.t += 1/200;
					if (this.action.t >= 1) {
						this.action.p0 = {x:this.x,y:this.y};
						this.action.p1 = {x:-scale*300,y:50+100*scale};
						this.action.p2 = {x:scale*300,y:150+100*scale};
						this.action.t -= 1;
					}else{ 
						this.x = Math.pow((1-action.t),3)*p0.x+3*action.t*Math.pow((1-action.t),2)*(p0.x+p1.x)+
								3*Math.pow(action.t,2)*(1-action.t)*(p0.x+p2.x)+(p0.x+p3.x)*Math.pow(action.t,3);
						this.y = Math.pow((1-action.t),3)*p0.y+3*action.t*Math.pow((1-action.t),2)*(p0.y+p1.y)+
								3*Math.pow(action.t,2)*(1-action.t)*(p0.y+p2.y)+(p0.y+p3.y)*Math.pow(action.t,3);
					}
				}
				if (/transparent/i.test(actionName)){
					var opacityStart = this.action.opacityStart,
						allLength = opacityStart,
						dest = this.layer.height - opacityStart;
					if (this.y > dest) {
						var moveLength = this.y - dest;
						var delta = moveLength/allLength;
						this.ctx.globalAlpha = 1 - delta-0.1;
					}else{
						this.ctx.globalAlpha = 1;
					}
				}
				if (/turnY/i.test(actionName)){
					if (!this.isTurn) {
						this.turn = this._turnY();
						this.isTurn = true;
					}
					this.turn();
				}
				if (/turnX/i.test(actionName)){
					if (!this.isTurn) {
						this.turn = this._turnX();
						this.isTurn = true;
					}
					this.turn();
				}
				if (/transform/i.test(actionName)){
					// this.canvas.width = 200;
					// this.canvas.height = 200;
					// this.ctx.scale(1.1,1.1);
				}
 			},
 			_turnY : function(){
				var action = this.action,
	 				width = this.width,
	 				height = this.height,
	 				size = this.size,
	 				ctx = this.ctx,
	 				img = this.img;
	 			var scale = 1;
 				return (function(){
 					scale *= action.turn;
	 				ctx.clearRect(-size/2,-size/2,size,size);
 					if (Math.abs(scale)<0.1){
 						action.turn = 1/action.turn;
 						ctx.scale(-1,1);
 					}
 					if (Math.abs(scale)>1){
 						action.turn = 1/action.turn;
 					}
					ctx.scale(action.turn, 1);
					ctx.drawImage(img,-width/2,-height/2,width,height);
				});
 			},
 			_turnX : function(){
				var action = this.action,
	 				width = this.width,
	 				height = this.height,
	 				size = this.size,
	 				ctx = this.ctx,
	 				img = this.img;
	 			var scale = 1;
 				return (function(){
 					scale *= action.turn;
	 				ctx.clearRect(-size/2,-size/2,size,size);
 					if (Math.abs(scale)<0.1){
 						action.turn = 1/action.turn;
 						ctx.scale(1,-1);
 					}
 					if (Math.abs(scale)>1){
 						action.turn = 1/action.turn;
 					}
					ctx.scale(1, action.turn);
					ctx.drawImage(img,-width/2,-height/2,width,height);
				});
 			},
 			getLayer : function(){
 				return this.layer;
 			},
 			convertToCanvasPoint : function(){
 				return {x:x+this.size-this.width/2,y:y+this.size-this.height/2};
 			}
 		};

 		function Layer(index){
 			this.canvas = document.createElement('canvas');
			this.ctx = this.canvas.getContext('2d');
 			this.sprites  = [];
 			this.pathList = [];
 			this.index = index;
 			this.x = 0;
 			this.y = 0;
 			this.width = this.canvas.width = window.innerWidth;
 			this.height = this.canvas.height= window.innerHeight;
 		}

 		Layer.prototype = {
 			addSprite : function(sprite){
 				sprite.layer = this;
 				this.sprites.push(sprite);
 			},
 			addPathPoint : function(p){
				this.pathList.push(p);
			},
			_addSpritesToLayer : function(){
				var ctx = this.ctx;
				for (var i=0,l=this.sprites.length;i<l;i++){
					var sprite = this.sprites[i];
					var that = this;
					(function(sprite){
						ctx.drawImage(sprite.canvas,sprite.x,sprite.y);
					})(sprite);
				}
			},
			_autoClear : function(sprites){
				for (var i=0,l=this.sprites.length;i<l;++i) {
					var width = this.width;
					var height = this.height;
					var sprite = this.sprites[i];
					var action = this.sprites[i].action;
					if (sprite.y < -sprite.height || sprite.y > height){
						if (action.autoRefresh) {
							sprite.x = this.sprites[i].originX;
							sprite.y = this.sprites[i].originY;
						}else{
							// sprites.splice(i,1);
						}
					}
				}
			},
			_onFrame : function(){
				this.ctx.clearRect(0,0,this.width,this.height);
				for (var i=0,l=this.sprites.length;i<l;++i) {
					this.sprites[i].move();
				}
				this._autoClear(this.sprites);
				this._addSpritesToLayer();
			}
 		};

 		function Scene(x,y,width,height){
			this.canvas = document.getElementById('myCanvas');
			this.ctx = this.canvas.getContext('2d');
			this.x = x;
			this.y = y;
			this.width = this.canvas.width = width;
			this.height = this.canvas.height =height;
			this.layers = [];
			this.state = "init";
 		}

		Scene.prototype = {
			addLayer : function(layer){
				layer.width = layer.canvas.width = this.width;
				this.layers[layer.index] = layer;
			},
			start : function(){
				var ctx = this.ctx;
				this.state = "start";
				var that = this;
				function _onFrame(){				
					if (that.state == "start") {
						ctx.clearRect(0,0,that.width,that.height);
						for (var index in that.layers){
							var layer = that.layers[index]
							layer._onFrame();
							ctx.drawImage(layer.canvas,0,0);
						}
						requestAnimationFrame(_onFrame);
					}
				}
				requestAnimationFrame(_onFrame);
			},
			stop : function(){
				this.state = "stop";
			},
			clear : function(){
				this.state = "over"
				this.ctx.clearRect(0,0,this.width,this.height);
			},
			getState : function(){
				return this.state;
			}
		};
		
		function LoadQueue(){
			this.resourceNum = 0;
			this.resourceList = {};
		}

		LoadQueue.prototype = {
			addResource : function(id,res){
				this.resourceList[id] = res;
				this.resourceNum++;
			},
			load : function(callback){
				var loaded = 0;
				var res = {};
				for (var id in this.resourceList) {
					var img = new Image();
					img.src = this.resourceList[id];
					res[id] = img;
					var that = this;
					(function(id){
						img.onload = function(){
							loaded++;
							if (loaded == that.resourceNum) {
								callback(res);
							}
						}
					})(id);
				}
			}
		}
	// }
	// window.addEventListener('load',init,false);
// })(window,document);
