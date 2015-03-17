;(function(window,document){
		try { 
			document.createElement("canvas").getContext("2d"); 
		} catch (e) { 
			console.log('不支持canvas');
			return;
		} 
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

 		function Sprite(spriteData){
 			this.canvas = document.createElement('canvas');
			this.ctx = this.canvas.getContext('2d');
			this.frames = spriteData.frames || [];
 			this.x = this.originX = spriteData.x || 0;
 			this.y = this.originY = spriteData.y || 0;
 			this.width = this.originWidth = spriteData.width || 0;	
 			this.height = this.originHeight = spriteData.height || 0;
 			this.v = spriteData.v || {x:0,y:0};
 			this.originV = JSON.parse(JSON.stringify(this.v));
 			this.defer = spriteData.defer || 0;
 			this.interval = spriteData.interval || 16;
 			this.loop = spriteData.loop || false;
 			this.action = spriteData.action || null;
 			this.parent = {};
 			this.a = 0;
 			this.g = 0;
 			this._index = 0;
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
 					height = this.height;
				this.size = this.originSize = Math.sqrt(width*width+height*height);
		 		this.canvas.width = this.size;
	 			this.canvas.height= this.size;	
	 			ctx.translate(this.size/2,this.size/2);
	 			if(this.defer){
	 				var self = this;
		 			setTimeout(function(){
		 				self._draw();
		 				self.state = "run";
		 			},defer);
		 		}else{
		 			this._draw();
		 			this.state = "run";
		 		}
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

				if (typeof action === 'function'){
					action.call(this);
				}else{
	 				if (/down/i.test(actionName)){
	 					v.y += g/this.size;
	 					this.y += v.y;
	 					v.x += a/this.size;
	 					this.x += v.x;
	 				}
	 				if (/wave/i.test(actionName)){
	 						if (action.wave > 0){
	 							this.x = this.originX + action.swing*Math.sin((this.y-this.originY)/action.swing);
	 						}
	 						else{
	 							this.x = this.originX - action.swing*Math.sin((this.y-this.originY)/action.swing);
	 						}
	 				}
					if (/rotate/i.test(actionName)){
						ctx.rotate(action.rotate/this.size*Math.PI/180);
						this._draw();	
					}

					if (/transparent/i.test(actionName)){
						var opacityStart = this.action.opacityStart,
							allLength = opacityStart,
							dest = this.parent.parent.height - opacityStart;
						if (this.y > dest) {
							var moveLength = this.y - dest;
							var delta = moveLength/allLength;
							this.ctx.globalAlpha = 1-delta-0.1;
						}else{
							this.ctx.globalAlpha = 1;
						}
					}
					if (/transform/i.test(actionName)){
						this.size += action.transform;
						if (this.size < this.originSize/2 || this.size > this.originSize*1.50)
							action.transform = -action.transform;
					}
				}
 			},
 			changeState : function(state){
 				this.state = state;
 				return this;
 			},
 			clear : function(){
 				var ctx = this.ctx,
 				size = this.size;
 				ctx.clearRect(-size,-size,size*2,size*2);
 				return this;
 			},
 			changeLayer : function(index){
				this.parent.removeSpirte(this);
				this.parent.parent.layers[index].addSprite(this);
				return this;
 			},
 			_draw : function(){
 				var ctx = this.ctx,
 					width = this.width,
 					height = this.height,
 					size = this.size,
					frames = this.frames;
				var self = this;
				if(frames instanceof Array){
					var frameIndex = 1;
					var lastTime = 0;
					function freshFrame(t){
						if (t - lastTime >= self.interval) {
							lastTime = t;
							var frames = self.frames[frameIndex++];
							self.clear();
			 				if (self.action) {
								ctx.drawImage(frames.image,frames.rect.x,frames.rect.y,frames.rect.width,frames.rect.height,-width/2,-height/2,width,height);
							}else{
								ctx.drawImage(frames.image,frames.rect.x,frames.rect.y,frames.rect.width,frames.rect.height,-size/2,-size/2,width,height);
							}
							if (frameIndex >= self.frames.length) {
								if (self.loop) {
									frameIndex = 1;
								}else{
									return;
								}
							}
						}
						requestAnimationFrame(freshFrame);
					}
					requestAnimationFrame(freshFrame);
				}else{
					self.clear();
					if (self.action) {
						ctx.drawImage(frames,-width/2,-height/2,width,height);
					}else{
						ctx.drawImage(frames,-size/2,-size/2,width,height);
					}
				}
 			},
 			getLayer : function(){
 				return this.parent;
 			},
 			addTo : function(layer){
 				layer.addSprite(this);
 				return this;
 			}
 		};

 		function Layer(index){
 			this.sprites  = [];
 			this.rectList = [];
 			this.index = index || 0;
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
				return this;
 			},
 			removeSpirte : function(sprite){
 				this.sprites[sprite._index] = null;
 				return this;
 			},
 			addDrawRect : function(p){
				this.rectList.push(p);
				return this;
			},
			addTo : function(scene){
				scene.addLayer(this);
				return this;
			},
			_addSpritesToLayer : function(ctx){
				for (var i=0,l=this.sprites.length;i<l;i++){
					var sprite = this.sprites[i];
					if (sprite) {
						var self = this;
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
								sprite.v = JSON.parse(JSON.stringify(sprite.originV));
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
				var self = this;
				var lastTime = 0;
				var environment = this._environment;
				this.state = "start";
				function _changeEnvironment(t){
					if (self.state == "start") {
						if (t - lastTime > environment.interval) {
							self.a = Math.random()*(environment.xMax-environment.xMin)+environment.xMin;
							self.g = Math.random()*(environment.yMax-environment.yMin)+environment.yMin;
							for (var i=0;i<self.layers.length;++i){
								if (self.layers[i]) {
									self.layers[i].a = self.a*self.layers[i].index;
									self.layers[i].g = self.g*self.layers[i].index;
								}
							}
							lastTime = t;
						}
					}
					requestAnimationFrame(_changeEnvironment);
				}
				function _onFrame(){				
					if (self.state == "start") {
						ctx.clearRect(0,0,self.width,self.height);
						for (var index in self.layers){
							var layer = self.layers[index]
							layer._onFrame(ctx);
						}
						requestAnimationFrame(_onFrame);
					}
				}
				requestAnimationFrame(_onFrame);
				if (this._environment) {
					requestAnimationFrame(_changeEnvironment);
				}
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
				var frameData = atlasData.frames;
				if(!frameData) return null;

				var frames = [], obj;

				var frameWidth = frameData.frameWidth;
				var frameHeight = frameData.frameHeight;
				var cols = atlasData.width / frameWidth | 0;
				var rows = atlasData.height / frameHeight | 0;
				var numFrames  = frameData.numFrames || cols*rows;
				for(var i = 0;i < numFrames; i++){
					frames[i] = {
						image: atlasData.image,
						rect: {x:i%cols*frameWidth,y:(i/cols|0)*frameHeight,width:frameWidth,height:frameHeight}
					}
				}
				return frames;
			},
			_parseTextureSprites : function(atlasData,frames){
				var spriteData = atlasData.sprites;
				if(!spriteData) return null;

				var sprites = {}, sprite, spriteFrames;
				for (var s in spriteData){
					sprite = spriteData[s];
					if(typeof sprite === 'number'){
						spriteFrames = this._translateSpriteFrame(frames[sprite]);
					}else{
						spriteFrames = [];
						for (var i = sprite.from;i <= sprite.to; i++){
							spriteFrames[i - sprite.from] = this._translateSpriteFrame(frames[i],sprite[i]);
						}
					}
					sprites[s] = spriteFrames;
				}
				return sprites;
			},
			_translateSpriteFrame : function(frameObj,spriteObj){
				var spriteFrame = {
			        image: frameObj.image,
			        rect: frameObj.rect
			    };

			    if(spriteObj){
			        spriteFrame.name = spriteObj.name || null;
			        spriteFrame.duration = spriteObj.duration || 0;
			        spriteFrame.stop = !!spriteObj.stop;
			        spriteFrame.next = spriteObj.next || null;
			    }
			    return spriteFrame;
			},
			getSprite : function(id){
				var sprites = this._sprites;
       			return sprites && sprites[id];
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
					var self = this;
					(function(id){
						img.onload = function(){
							loaded++;
							if (loaded == self.resourceNum) {
								callback(res);
							}
						}
					})(id);
				}
			}
		}
	window.Anim = {
		Scene : Scene,
		Layer : Layer,
		Sprite : Sprite,
		TextureAtlas : TextureAtlas,
		LoadQueue : LoadQueue
	};
})(window,document);
