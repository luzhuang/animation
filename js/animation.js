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

 		function Sprite(src,x,y,width,height,action){
 			this.x = x;
 			this.y = y;
 			this.width = width;	
 			this.height = height;
 			this.size = Math.sqrt(width*width+height*height);
 			this.src = src;
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
 				ctx.translate(this.size/2,this.size/2);
 				var img = new Image();
 				img.src = this.src;
 				this.img = img;
				img.onload = function(){
					ctx.drawImage(img,-width/2,-height/2,width,height);
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
				if (/turnY/i.test(actionName)){
					if (!this.isTurn) {
						this.turn = this._turnY();
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
 			getStage : function(){
 				return this.stage;
 			}
 		};
		var animation = {
			resource : [],
			config : {},
			sprites : [],
			init : function(x,y,width,height){
				var $canvas = document.getElementById('myCanvas');
				var $ctx = $canvas.getContext('2d');
				$canvas.style.left = x || 0;
				$canvas.style.top = y || 0;
				$canvas.width = width || window.innerWidth;
				$canvas.height = height || window.innerHeight;
				this.config = {x:x,y:y,width:width,height:height};
				this.ctx = $ctx;
				this.width = $canvas.width;
				this.height = $canvas.height;
				this.state = "init";
			},
			load : function(){
				for (var i=0,l=this.resource.length;i<l;++i) {
					var img = new Image();
					img.src = this.resource[i];
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
				this.resource.push(img);
				return sprite;
			},
			addSpritesToStage : function(){
				var ctx = this.ctx;
				for (var i=0,l=this.sprites.length;i<l;i++){
					var sprite = this.sprites[i];
					(function(sprite){
						ctx.drawImage(sprite.canvas,sprite.x,sprite.y);
					})(sprite);
				}
			},
			start : function(){
				var ctx = this.ctx;
				if (this.state != 'load')
					this.load();
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
				for (var i=0,l=that.sprites.length;i<l;++i) {
					var width = this.width;
					var height = this.height;
					var sprite = that.sprites[i];
					var action = that.sprites[i].action;
					if (sprite.y < -sprite.height){
						if (action.autoRefresh) {
							sprite.y = height;
							sprite.x = Math.random()*width;
						}else{
							sprites.splice(i,1);
						}
					}
					if (sprite.y > height){
						if (action.autoRefresh) {
							sprite.y = -sprite.height;
							sprite.x = Math.random()*width;
						}else{
							sprites.splice(i,1);
						}
					}
					if (sprite.x < -sprite.width){
						if (action.autoRefresh) {
							sprite.x = width;
							sprite.y = Math.random()*height;
						}else{
							sprites.splice(i,1);
						}
					}
					if (sprite.x > width){
						if (action.autoRefresh) {
							sprite.x = -sprite.width;
							sprite.x = Math.random()*height;
						}else{
							sprites.splice(i,1);
						}
					}
				}
			}	
		};

		animation.init();
		window.animation = animation;
	}
	window.addEventListener('load',init,false);
})(window,document);
