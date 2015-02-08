;(function(window,document){
	function init() {
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

 		function Spirte(img,x,y,width,height){
 			this.img = img;
 			this.x = x;
 			this.y = y;
 			this.width = width;	
 			this.height = height;
 		}

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
				this.state = "init"
			},
			load : function(){
				for (var i=0,l=this.resource.length;i<l;++i) {
					var img = new Image();
					img.src = this.resource[i];
				}
			},
			setSprite : function(img,x,y,width,height){
				var x = x || 0;
				var y = y || 0;
				var width  = width || this.width;
				var height = height || this.height
				var sprite = new Spirte(img,x,y,width,height);
				this.sprites.push(sprite);
				this.resource.push(img);
			},
			addSpritesToStage : function(){
				var ctx = this.ctx;
				for (var i=0,l=this.sprites.length;i<l;i++){
					var sprite = this.sprites[i];
					var img = new Image();
					img.src= sprite.img;
					(function(sprite){
						img.onload = function(){
							ctx.drawImage(this,sprite.x,sprite.y,sprite.width,sprite.height);
						}
					})(sprite);
				}
			},
			start : function(){
				var ctx = this.ctx;
				if (this.state != 'load')
					this.load();
				this.state = "start";
				this.addSpritesToStage();
			},
			getState : function(){
				return this.state;
			}
		};

		animation.init();
		window.animation = animation;
	}

	window.addEventListener('load',init,false);
})(window,document);
