var Markers = function(canvasId) {

    this.canvas = document.getElementById(canvasId);
    this.c2d = this.canvas.getContext('2d');

};

Markers.prototype = {

    addMarker: function(x, y, options) {

        var _defaults = {
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            radius: 5,
            onLoad: function() {}
        };
        extend(_defaults, options);
        if (options && options.scale) var scale = options.scale;


        if (!_defaults.img) {
            this.drawCircle( x, y, _defaults.offsetX, _defaults.offsetY, _defaults.radius , _defaults.fillStyle );
        } else {
            this.drawImage(_defaults.img,  x+_defaults.offsetX, y+_defaults.offsetY, 0,0, _defaults.scale, _defaults.onLoad);
        }
    },

    drawCircle: function(x, y, offsetX, offsetY, radius, fillStyle) {

        radius = radius || 5;
        x = x+(offsetX || 0);
        y = y+(offsetY|| 0) ;

        this.c2d.beginPath();
        this.c2d.arc( x, y, radius, 0, 2 * Math.PI, false );
        this.c2d.fillStyle = fillStyle || "#000000";
        this.c2d.fill();


    },

    drawLine: function(axis, startX, startY, length, options) {

        var _defaults ={
            strokeStyle: "#000000",
            offsetX:0,
            offsetY:0
        };

        extend(_defaults,options);
        var destX;
        var destY;

        if (axis === "x") {
            destX = startX-_defaults.offsetX;
            destY = startY+length+_defaults.offsetY;
        } else {
            destX = startX+length-_defaults.offsetX;
            destY = startY+_defaults.offsetY;
        }

        this.c2d.beginPath();
        this.c2d.strokeStyle = _defaults.strokeStyle ;
        this.c2d.moveTo(startX+_defaults.offsetX, startY+_defaults.offsetY);
        this.c2d.lineTo(destX,destY);
        this.c2d.stroke();

    },

    drawImage: function(src, x, y, offsetX, offsetY, scale, onLoad) {


        x = x+(offsetX || 0);
        y = y+(offsetY|| 0) ;

        var _img = new Image();
        scale = scale || 1;
        var _this = this;


        _img.onload= function() {
            _this.c2d.drawImage(_img,0,0,_img.width, _img.height,x, y, _img.width*scale,_img.height*scale);
            if (typeof onLoad === "function") onLoad();
        };

        _img.src = src;

    }

};

Charts.Markers = Markers;
