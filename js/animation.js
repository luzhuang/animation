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
 			this.img = img;
 			this.x = x;
 			this.y = y;
 			this.width = width;	
 			this.height = height;
 			this.action = action;
 			this.inStage = false;
 			this.stage = {};
 			this.canvas = document.createElement('canvas');
 			this.canvas.width = this.width;
 			this.canvas.height= this.height;
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
 					height = this.height;
 				var img = new Image();
 				img.src = this.img;
				img.onload = function(e){
					ctx.fillStyle = '#000';
					ctx.fillRect(0,0,width,height)
					ctx.drawImage(img,0,0,width,height);
				}
 			},
 			move : function() {
 				var action = this.action;
 				var actionName = action.name;
 				switch(actionName){
 					case 'down':
 						this.x += action.vx;
 						this.y += action.vy;
 						this.ctx.rotate((this.x%360)*Math.PI/180);
 						console.log(this.x%360);
 					break;
 					case 'wave':
 						this.y += action.vy;
 						this.x += action.swing*Math.sin(this.y*action.f/10);
 					break;
 				}
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
						}else{
							sprites.splice(i,1);
						}
					}
					if (sprite.y > height){
						if (action.autoRefresh) {
							sprite.y = -sprite.height;
						}else{
							sprites.splice(i,1);
						}
					}
					if (sprite.x < -sprite.width){
						if (action.autoRefresh) {
							sprite.x = width;
						}else{
							sprites.splice(i,1);
						}
					}
					if (sprite.x > width){
						if (action.autoRefresh) {
							sprite.x = -sprite.width;
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
