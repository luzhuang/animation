;(function(window,document){
	function init(e) {
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
 			this.x = this.originX = x;
 			this.y = this.originY = y;
 			this.width = this.originWidth = width;	
 			this.height = this.originHeight = height;
 			this.size = Math.sqrt(width*width+height*height);
 			this.img = img;
 			this.action = action;
 			this.isTurn = false;
 			this.stage = {};
 			this.canvas = document.createElement('canvas');
 			this.canvas.width = this.size;
 			this.canvas.height= this.size;
			this.ctx = this.canvas.getContext('2d');
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
 				if (this.action.name != 'stay') {
	 				ctx.translate(this.size/2,this.size/2);
					ctx.drawImage(img,-width/2,-height/2,width,height);
				}else{
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
				if (/down/i.test(actionName)){
					this.y += action.vy;
				}
				if (/up/i.test(actionName)){
					this.y -= action.vy;
				}
				if (/left/i.test(actionName)){
					this.x -= action.vx;
				}
				if (/right/i.test(actionName)){
					this.x += action.vx;
				}
				if (/wave/i.test(actionName)){
					this.x += action.swing*Math.sin(this.y*action.f/10);
				}
				if (/rotate/i.test(actionName)){
					ctx.clearRect(-size/2,-size/2,size,size);
					ctx.rotate(action.angle*Math.PI/180);
					ctx.drawImage(this.img,-width/2,-height/2,width,height);
				}
				if (/bezier/i.test(actionName)){
					var x = this.x,
						y = this.y;
					this.action.t += 1/60;
					this.x = Math.pow((1-action.t),3)*x+3*action.t*Math.pow((1-action.t),2)*(x+action.p1.x)+3*Math.pow(action.t,2)*(1-action.t)*(x+action.p2.x)+(x+action.p3.x)*Math.pow(action.t,3);
					this.y = Math.pow((1-action.t),3)*y+3*action.t*Math.pow((1-action.t),2)*(y+action.p1.y)+3*Math.pow(action.t,2)*(1-action.t)*(y+action.p2.y)+(y+action.p3.y)*Math.pow(action.t,3);
					if (this.action.t > 1) {
						// console.log(this.action.t,this.stage.height);
						this.action.t = 0.2;
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
 			getStage : function(){
 				return this.stage;
 			},
 			convertToCanvasPoint : function(){
 				return {x:x+this.size-this.width/2,y:y+this.size-this.height/2};
 			}
 		};
		var animation = {
			resource : {
				_length : 0,
				push : function(id,res){
					this[id] = res;
					this._length++;
				}
			},
			config : {},
			sprites : [],
			pathList : [],
			init : function(x,y,width,height,callback){
				var $canvas = document.getElementById('myCanvas');
				var $ctx = $canvas.getContext('2d');
				$canvas.style.left = x || 0;
				$canvas.style.top = y || 0;
				$canvas.width = width || window.innerWidth;
				$canvas.height = height || window.innerHeight;
				this.config = {x:x,y:y,width:width,height:height};
				this.canvas = $canvas;
				this.ctx = $ctx;
				this.width = $canvas.width;
				this.height = $canvas.height;
				this.resourceList = {};
				this.canvas.addEventListener('complete',callback,false);
				this.state = "init";
			},
			load : function(){
				var resourceList = {};
				var loaded = 0;
				for (var id in this.resource) {
					if (typeof this.resource[id] == 'function' || /^_/i.test(id)){
						continue;
					}
					var img = new Image();
					img.src = this.resource[id];
					that = this;
					(function(id){
						img.onload = function(){
							loaded++;
							that.resourceList[id]={img:this,width:this.width/2,height:this.height/2};
							if (loaded >= that.resource._length) {
								var event = new Event('complete');
								that.canvas.dispatchEvent(event);
							}
						}
					})(id);
				}
			},
			setSprite : function(img,x,y,width,height,action){
				var x = x || 0;
				var y = y || 0;
				var width  = width || this.width;
				var height = height || this.height;
				var action = action || {name:'stay'};
				var sprite = new Sprite(img,x,y,width,height,action);
				this.sprites.push(sprite);
				return sprite;
			},
			addSpritesToStage : function(){
				var ctx = this.ctx;
				for (var i=0,l=this.sprites.length;i<l;i++){
					var sprite = this.sprites[i];
					that = this;
					(function(sprite){
						ctx.drawImage(sprite.canvas,sprite.x,sprite.y);
						sprite.stage = that; 
					})(sprite);
				}
			},
			start : function(){
				var ctx = this.ctx;
				this.state = "start";
				that = this;
				function _onFrame(t){
					ctx.clearRect(0,0,that.width,that.height);
					for (var i=0,l=that.sprites.length;i<l;++i) {
						that.sprites[i].move();
					}
					that.autoClear(that.sprites);
					that.addSpritesToStage();
					if (that.state == "start") {
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
			},
			autoClear : function(sprites){
				for (var i=0,l=this.sprites.length;i<l;++i) {
					var width = this.width;
					var height = this.height;
					var sprite = this.sprites[i];
					var action = this.sprites[i].action;
					if (sprite.y < -sprite.height || sprite.y > height){
						if (action.autoRefresh) {
							var indexP = Math.random()*this.pathList.length>>0;
							sprite.x = this.pathList[indexP].x,
							sprite.y = this.pathList[indexP].y;
						}else{
							// sprites.splice(i,1);
						}
					}
				}
			},
			addPathPoint : function(p){
				this.pathList.push(p);
			}
		};

		animation.init();
		window.animation = animation;
	}
	window.addEventListener('load',init,false);
})(window,document);
