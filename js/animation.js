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

 		function Sprite(img,x,y,width,height,scale,action){
 			this.canvas = document.createElement('canvas');
			this.ctx = this.canvas.getContext('2d');
 			this.x = this.originX = x;
 			this.y = this.originY = y;
 			this.width = this.originWidth = width;	
 			this.height = this.originHeight = height;
 			this.a = 0;
 			this.g = 0;
 			this.img = img;
 			this.action = action || null;
 			this.parent = {};
 			this._index = 0;
 			this.v = {x:0,y:0};
 			this.state = null;
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
					img = this.img;
				this.size = this.originSize = Math.sqrt(width*width+height*height);
		 		this.canvas.width = this.size;
	 			this.canvas.height= this.size;	
	 			ctx.translate(this.size/2,this.size/2);
	 			this.v = {x:0,y:this.size};
	 			var that = this;
	 			var defer = this.action ? Math.random()*5000 : 0;
	 			setTimeout(function(){
	 				that._draw();
	 				that.state = "run";
	 			},defer);
 			},
 			move : function() {
 				if (this.state != 'run' || !this.action)
 					return
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
 					v.y += g/this.size;
 					this.y += v.y/40;
 					v.x += a/this.size;
 					this.x += v.x/40;
 					this.originX += v.x/40;
 				}
 				if (/wave/i.test(actionName)){
 						if (action.wave > 0)
 							this.x = this.originX + action.swing*Math.sin((this.y-this.originY)/action.swing);
 						else
 							this.x = this.originX - action.swing*Math.sin((this.y-this.originY)/action.swing);
 				}
				if (/rotate/i.test(actionName)){
					ctx.rotate(20/this.size*Math.PI/180);
					this._draw();	
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
						dest = this.parent.parent.height - opacityStart;
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
					this.size += action.transform;
					if (this.size < this.originSize/2 || this.size > this.originSize*1.50)
						action.transform = -action.transform;
				}
 			},
 			changeState : function(state){
 				this.state = state;
 			},
 			clear : function(){
 				var ctx = this.ctx,
 				size = this.size;
 				ctx.clearRect(-size,-size,size*2,size*2);
 			},
 			changeLayer : function(index){
				this.parent.removeSpirte(this);
				this.parent.parent.layers[index].addSprite(this);
 			},
 			_draw : function(){
 				var ctx = this.ctx,
 					width = this.width,
 					height = this.height,
 					size = this.size,
					img = this.img;
				this.clear();
 				if (this.action) {
					ctx.drawImage(img,-width/2,-height/2,width,height);
				}else{
					ctx.drawImage(img,-size/2,-size/2,width,height);
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
	 				this.clear();
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
	 				this.clear();
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
 			}
 		};

 		function Layer(index){
 			this.sprites  = [];
 			this.rectList = [];
 			this.index = index;
 			this.a = 0;
 			this.g = 0;
 		}

 		Layer.prototype = {
 			addSprite : function(sprite){
 				var joined = false;
 				for (var i=0,l=this.sprites.length;i<l;++i){
 					if (!this.sprites[i]){
		 				sprite._index=i;
 						this.sprites[i] = sprite;
		 				joined = true;
		 				break;
 					}
 				}
 				if (!joined){
					sprite._index=this.sprites.length;
 				 	this.sprites.push(sprite);
 				}
				sprite.parent = this;
 			},
 			removeSpirte : function(sprite){
 				this.sprites[sprite._index] = null;
 			},
 			addDrawRect : function(p){
				this.rectList.push(p);
			},
			_addSpritesToLayer : function(ctx){
				for (var i=0,l=this.sprites.length;i<l;i++){
					var sprite = this.sprites[i];
					if (sprite) {
						var that = this;
						(function(sprite){
							ctx.drawImage(sprite.canvas,sprite.x,sprite.y,sprite.size,sprite.size);
						})(sprite);
					}
				}
			},
			_autoClear : function(sprites){
				for (var i=0,l=this.sprites.length;i<l;++i) {
					var x = this.x,
						y = this.y,
						sprite = this.sprites[i],
						action = sprite ? sprite.action : null;
					if (sprite){
						if (sprite.y < -sprite.size || sprite.y > this.parent.height){
							if (action.autoRefresh) {
								var pi=(Math.random()*this.rectList.length)>>0;
								var drawRect = this.rectList[pi];
								var randomY = Math.random()*(drawRect.bottom-drawRect.top)+drawRect.top;
								var randomX = Math.random()*(drawRect.right-drawRect.left)+drawRect.left;
								sprite.changeState('stop');
								sprite.x = sprite.originX = randomX;
								sprite.y = sprite.originY = randomY;
								sprite.v = {x:0,y:sprite.size};
								var defer = Math.random()*1000;
								(function(sprite){
									setTimeout(function(){	
										sprite.changeState('run');
									},defer);
								})(sprite);
								
							}else{
								sprites.splice(i,0);
								i--;
								l--;
							}
						}
					}
				}
			},
			_onFrame : function(ctx){
				for (var i=0,l=this.sprites.length;i<l;++i) {
					if (this.sprites[i]){
						this.sprites[i].move();
					}
				}
				this._autoClear(this.sprites);
				this._addSpritesToLayer(ctx);
			}
 		};
 		var guid = 0xFFFFFF;
 		function Scene(x,y,width,height){
			var canvas = this.canvas = document.createElement('canvas');
			canvas.id = "Canvas-"+guid--;
			canvas.setAttribute('style','position:fixed;top:0;left:0;right:0;bottom:0');
			document.body.appendChild(canvas);
			this.ctx = this.canvas.getContext('2d');
			this.x = x;
			this.y = y;
			this.width = this.canvas.width = width;
			this.height = this.canvas.height =height;
			this.a = 0;
			this.g = 0;
			this._environment = null;
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
				var environment = this._environment;
				this.state = "start";
				function _changeEnvironment(t){
					if (that.state == "start") {
						if (t - lastTime > environment.interval) {
							that.a = Math.random()*(environment.xMax-environment.xMin)+environment.xMin;
							that.g = Math.random()*(environment.yMax-environment.yMin)+environment.yMin;
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
							layer._onFrame(ctx);
						}
						requestAnimationFrame(_onFrame);
					}
				}
				requestAnimationFrame(_onFrame);
				if (this._environment)
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
			},
			setEnvironment : function(xMax,xMin,yMax,yMin,interval){
				this._environment = {};
				this._environment.xMax = xMax || 0;
				this._environment.xMin = xMin || 0;
				this._environment.yMax = yMax || 0;
				this._environment.yMin = yMin || 0;
				this._environment.interval = interval || 0;
			}
		};
		
		function TextureAtlas(atlasData){
			this._frames = this._parseTextureFrames(atlasData);
			this._sprites = this._parseTextureSprites(atlasData,this._frames);
		}

		TextureAtlas.prototype = {
			_parseTextureFrames : function(atlasData){

			},
			_parseTextureSprites : function(atlasData,frames){

			}
		}

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
