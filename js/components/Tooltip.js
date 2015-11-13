var Tooltip = function(canvasId, tooltipEl, controlPoints, options) {
    this.canvas = document.getElementById(canvasId);
    this.tooltip = tooltipEl;
    this.controlPoints = controlPoints;

    var _defaults = {
        onMousemove: function( tooltip, closestBullet, key ) {},
        onMouseleave: function(tooltip) {},
        hoverTreshold: 5
    };

    extend( this, extend(_defaults, options) );
    this.init();
};

Tooltip.prototype = {


    init: function() {
        this.fn = {
            onMousemove: proxy(this.mousemove,this),
            onMouseleave: proxy(this.mouseleave, this)
        };
        this.setCoordinates(this.controlPoints);
    },


    setCoordinates: function(curves) {
        this.bullets = [];
        if (this.hasListeners) this.removeListeners();
        for (var i = 0, j = curves.length; i<j ; i++) {

            this.bullets.push( {
                valX: curves[i].valueX,
                valY: curves[i].valueY,
                x: curves[i].x,
                y: curves[i].y
            });

        }

        this.bullets.sort(function(a,b) {
            return a.x-b.x;
        });

        this.addListeners();

        return this;
    },

    addListeners: function() {
        this.hasListeners = true;
        this.canvas.addEventListener('mousemove',this.fn.onMousemove);
        this.canvas.addEventListener('mouseleave',this.fn.onMouseleave);

    },

    mousemove: function(e) {

        var _closest;
        var _shortestDistance;
        var _distance;
        var _offsetDelta = -1;

        if (this.previousOffset)
            _offsetDelta = Math.abs(this.previousOffset.x - e.offsetX);

        if (_offsetDelta>this.hoverTreshold || _offsetDelta===-1) {
            this.previousOffset = { x:e.offsetX, y:e.offsetY };

            for (var i = 0, j = this.bullets.length; i<j; i++) {
                _distance = Math.abs(this.bullets[i].x - e.offsetX)+Math.abs(this.bullets[i].y - e.offsetY)

                if(typeof _shortestDistance=== "undefined" || _distance<_shortestDistance) {
                    _shortestDistance = _distance;
                    _closest=i;
                }
            }
            _shortestDistance = undefined;
            this.bullets[_closest].key = _closest;
            this.bullets[_closest].keyNumber = this.bullets.length;
            this.onMousemove(this.tooltip, this.bullets[_closest], _closest);
        }
    },

    mouseleave: function() {
         this.onMouseleave(this.tooltip);
    },

    removeListeners: function() {
        this.canvas.removeEventListener('mousemove',this.fn.onMousemove);
        this.canvas.removeEventListener('mouseleave',this.fn.onMouseleave);
    }

};

Charts.Tooltip = Tooltip;
