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
 			this.a = 0;
 			this.g = 0;
 			this.img = img;
 			this.action = action || {name:'stay'};
 			this.parent = {};
 			this._index = 0;
 			this.init();
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
				this.size = Math.sqrt(width*width+height*height);
	 			this.v = {x:0,y:this.size};	
	 			this.canvas.width = this.size;
	 			this.canvas.height= this.size;
 				if (this.action.name != 'stay') {
	 				ctx.translate(this.size/2,this.size/2);
					ctx.drawImage(img,-width/2,-height/2,width,height);
				}else{
					ctx.drawImage(img,0,0,width,height);
				}
 			},
 			move : function() {
 				var action = this.action;
 				this._runAction(action.name);
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
 				return this.parent;
 			},
 			_runAction : function(){
				var action = this.action,
				actionName = action.name,
				size = this.size,
				width = this.width,
				height = this.height,
				v = this.v;
				var a = this.a = this.parent.a,
					g = this.g = this.parent.g,
					ctx = this.ctx;
 				if (/down/i.test(actionName)){
 					v.y += g/this.width;
 					this.y += v.y/40;
 					v.x += a/this.width;
 					this.x += v.x/40;
 				}
				if (/rotate/i.test(actionName)){
					ctx.clearRect(-size/2,-size/2,size,size);;
					ctx.rotate(20/this.v.y*Math.PI/180);
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
						dest = this.parent.height - opacityStart;
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
					if (Math.random()*100>>0 == 99){
						var layers = this.parent.parent.layers;
						var index = this.parent.index;
						this.parent.removeSpirte(this._index);
						while(!layers[index%(layers.length-1)+1]) {
							index++;
						}
						index = index%(layers.length-1)+1;
						console.log(index);
						layers[index].addSprite(this);
					}
				}
 			}
 		};

 		function Layer(index,x,y,width,height){
 			this.canvas = document.createElement('canvas');
			this.ctx = this.canvas.getContext('2d');
 			this.sprites  = [];
 			this.pointList = [];
 			this.index = index;
 			this.x = x || 0;
 			this.y = y || 0;
 			this.width = this.canvas.width = width || window.innerWidth;
 			this.height = this.canvas.height= height || window.innerHeight;
 			this.parent = {};
 			this.a = 0;
 			this.g = 0;
 		}

 		Layer.prototype = {
 			addSprite : function(sprite){
 				sprite.parent = this;
 				sprite._index=this.sprites.length;
 				sprite.size *= this.index/2;
 				this.sprites.push(sprite);
 			},
 			removeSpirte : function(index){
 				this.sprites.splice(index,1);
 			},
 			addPoint : function(p){
				this.pointList.push(p);
			},
			_addSpritesToLayer : function(){
				var ctx = this.ctx;
				for (var i=0,l=this.sprites.length;i<l;i++){
					var sprite = this.sprites[i];
					var that = this;
					(function(sprite){
						ctx.drawImage(sprite.canvas,sprite.x,sprite.y,sprite.size,sprite.size);
					})(sprite);
				}
			},
			_autoClear : function(sprites){
				for (var i=0,l=this.sprites.length;i<l;++i) {
					var width = this.width,
						x = this.x,
						y = this.y,
						height = this.height,
						sprite = this.sprites[i],
						action = this.sprites[i].action;
		
					if (sprite.y < -sprite.size || sprite.y > height){
						if (action.autoRefresh) {
							sprite.x = sprite.originX;
							sprite.y = sprite.originY;
							sprite.v = {x:0,y:sprite.size};
						}else{
							sprites.splice(i,0);
							i--;
							l--;
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
			this.a = 0;
			this.g = 0;
			this.layers = [];
			this.state = "init";
 		}

		Scene.prototype = {
			addLayer : function(layer){
				layer.parent = this;
				if (!this.layers[layer.index]){
					this.layers[layer.index] = layer;
				}else{
					this.layers.splice(layer.index+1,0,layer);
				}
			},
			start : function(){
				var ctx = this.ctx;
				var that = this;
				var lastTime = 0;
				this.state = "start";
				function _changeEnvironment(t){
					if (that.state == "start") {
						if (t - lastTime > 1000) {
							that.a = Math.random()*10-5;
							that.g = Math.random()*3-1;
							for (var i=0;i<that.layers.length;++i){
								if (that.layers[i]) {
									that.layers[i].a = that.a*that.layers[i].index;
									that.layers[i].g = that.g*that.layers[i].index;
								}
							}
							lastTime = t;
						}
					}
					requestAnimationFrame(_changeEnvironment);
				}
				function _onFrame(){				
					if (that.state == "start") {
						ctx.clearRect(0,0,that.width,that.height);
						for (var index in that.layers){
							var layer = that.layers[index]
							layer._onFrame();
							ctx.drawImage(layer.canvas,layer.x,layer.y,layer.width,layer.height);
						}
						requestAnimationFrame(_onFrame);
					}
				}
				requestAnimationFrame(_onFrame);
				requestAnimationFrame(_changeEnvironment);
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
