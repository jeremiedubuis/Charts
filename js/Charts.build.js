var Charts = (function() {

    var Charts = {};

var clone = function(_array) {

    var _clone = [];
    var _obj;
    for (var i=0, j = _array.length; i<j; ++i) {

        if (typeof _array[i] === "object") {
            _obj = {};
            for (var key in _array[i]) {
              if (_array[i].hasOwnProperty(key)) {
                _obj[key] = _array[i][key];
              }
            }
            _clone.push(_obj);
        } else {
            _clone.push(_array[i])
        }

    }

    return _clone;

};

function extend(){
    for(var i=1; i<arguments.length; i++)
        for(var key in arguments[i])
            if(arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];
}

/**
  * @desc An equivalent to jquery's proxy function that allows function creation with specified context and arguments
  * @param  function, [scope, [arguments]]
*/

var proxy = function(fn, context) {
    var args = [].slice.call(arguments, 2);

    return function() {
        return fn.apply(context || this, args.concat([].slice.call(arguments)));
    };
};

var GraphCurve = function(canvas, values, options) {

    this.canvas = canvas;
    this.c2d = canvas.getContext('2d');
    this.setSize(values, options);

};

GraphCurve.prototype = {

    setSize: function(values, options) {

        this.values = values;
        var defaults = {
            marginLeft: 20,
            bezierCurve: true, // use bezierCurves instead of lines
            strokeStyle: "#FFFFFF",
            curveBackground: undefined, // uses a background if set
            graphBaseLine: this.canvas.height
        };

        extend(this,extend(defaults, options));
    },

    /**
      * @param _max(int) : max array length for curve rendering (used in animation to progressively draw curve)
    */
    render: function(_max) {
        if (this.curveBackground) this.drawBackground(_max);
        this.draw(_max);
    },

    draw: function(_max) {

        this.c2d.strokeStyle = this.strokeStyle;
        this.c2d.beginPath();
        var _point1;
        var _point2;


        this.c2d.moveTo(this.values[0].x, this.values[0].y);

        for (var i=1, j=_max || this.values.length; i<j; i++) {

            _point1= this.values[i-1];
            _point2= this.values[i];

            if (!this.bezierCurve) {
                this.c2d.moveTo(_point1.x, _point1.y);
                this.c2d.lineTo(_point2.x, _point2.y);
            } else {
                _offset = ( _point2.x-_point1.x ) / 2;
                this.c2d.bezierCurveTo(
                    _point1.x+_offset, // CP1 offset
                    _point1.y,
                    _point2.x-_offset, // CP2 offset
                    _point2.y,
                    _point2.x,
                    _point2.y
                );
            }

        }

        this.c2d.stroke();
    },

    drawBackground: function(_max) {
        this.c2d.fillStyle = this.curveBackground;
        this.draw(_max);
        this.c2d.lineTo(this.values[(_max || this.values.length)-1].x, this.graphBaseLine); // CLOSE THE CURVE BACK TO FIRST COORDINATE
        this.c2d.lineTo(this.marginLeft, this.graphBaseLine);
        this.c2d.lineTo(this.marginLeft, this.values[0].y)
        this.c2d.closePath();
        this.c2d.fill();
    }


};

var GraphFrame = function(canvas, options) {

    this.canvas = canvas;
    this.c2d = canvas.getContext('2d');

    this.init(options);

    return this;
};


GraphFrame.prototype = {

    init: function(options) {

        this.guides = {
            x:[],
            y: []
        };

        this.setSize(options);
    },

    setSize: function(options) {
        var defaults = {
            marginLeft: 20,
            spaceWidth: this.canvas.width,
            marginTop: 0,
            hasFrame: true, // has the regular frame on x and y
            topFrame: false,
            bottomFrame: true,
            leftFrame: true,
            rightFrame: false,
            frameStrokeStyle: "#000000",
            leftFrame: true,

            graphBaseLine: this.canvas.height
        };

        extend(this, extend(defaults, options));
    },

    render: function() {
        this.drawFrame();
    },

    drawFrame: function() {

        var _c = this.c2d;
        _c.lineWidth = 1;
        _c.strokeStyle = this.frameStrokeStyle;
        _c.beginPath();

        if (this.leftFrame) {
            _c.moveTo(this.marginLeft,this.marginTop);
            _c.lineTo(this.marginLeft,this.graphBaseLine);
        }

        if (this.bottomFrame) {
            _c.moveTo(this.marginLeft,this.graphBaseLine);
            _c.lineTo(this.spaceWidth, this.graphBaseLine);
        }

        if (this.rightFrame) {
            _c.moveTo(this.spaceWidth, this.graphBaseLine);
            _c.lineTo(this.spaceWidth, this.marginTop);
        }

        if (this.topFrame) {
            _c.moveTo(this.spaceWidth, this.marginTop);
            _c.lineTo(this.marginLeft, this.marginTop);
        }

        _c.stroke();
    },

    reset: function(options) {
        this.setSize(options);
    }

};

var Labels = function(canvasId, options) {

    var _defaults = {
        labelMaxWidth: 200,
        labelLineHeight: 20,
        fillStyle: "#000000"
    };

    this.list = [];

    this.canvas = document.getElementById(canvasId);
    this.c2d = this.canvas.getContext('2d');

    extend(this, extend(_defaults,options));

};

Labels.prototype = {
    addLabel: function(label, x,y, options) {

        var _defaults = {
            offsetX: 0,
            offsetY: 0,
            lineHeight: this.labelLineHeight,
            align: "center",
            fillStyle: this.fillStyle,
            fontSize: "10px",
            fontWeight: "regular",
            fontFamily: "arial"
        };

        extend(_defaults, options);

        this.c2d.textAlign = _defaults.align;
        this.c2d.font = _defaults.fontWeight +" "+_defaults.fontSize+" "+_defaults.fontFamily;
        this.c2d.fillStyle = _defaults.fillStyle;

        this.wrapText(label,
            x + _defaults.offsetX,
            y + _defaults.offsetY,
            _defaults.lineHeight
        );
        this.list.push(arguments);
    },

    wrapText: function(text, x, y, lineHeight) {

        var _characters = text.split("\n");
        for (var i = 0, j= _characters.length; i < j; i++) {

            var _line = "";
            var _words = _characters[i].split(" ");

            for (var k = 0, l = _words.length; k < l; k++) {
                var _testLine = _line + _words[k] + " ";
                var _width = this.c2d.measureText(_testLine).width;

                if (_width > this.labelMaxWidth) {
                    this.c2d.fillText(_line, x , y - lineHeight);
                    _line = _words[k] + " ";
                    y += lineHeight;
                } else {
                    _line = _testLine;
                }
            }

            this.c2d.fillText(_line, x, y);
            y += lineHeight;
        }


    },

    render: function() {
        var _list = this.list.slice();
        this.list = [];
        for (var i =0, j = _list.length; i<j; ++i) {
            this.addLabel.apply(this, _list[i]);
        }
    }

};

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

/**
  * @desc Creates a graph instance attached to a canvas
  *       Can then instantiants GraphCurves
  *       And add Markers lines, circles images
  *       And add labels
  *
  * @author Jérémie Dubuis jeremie.dubuis@gmail.com
  *
  * @required (components) GraphCurve.js,
  *                        GraphFrame.js
  *                        Markers.js
  *                        Tooltip.js
  *                        Labels.js
  *
  *           (helpers)    proxy.js, extend.js
  *
  * @param canvasId (DOM id) : graph's canvas element
  * @param options (object) {
  *           marginLeft        (float: 20),
  *           marginRight:      (float),
  *           marginBottom:     (float: 20),
  *           marginTop:        (float),
  *           paddingTop:       (float)          : offset withing frame borders,
  *           hasFrame          (bool: true)     : defines wether the graph has a frame around it
  *           leftFrame         (bool: true)    : defines wether the graph has a frame on side
  *           bottomFrame       (bool: true)
  *           rightFrame        (bool: false)
  *           topFrame          (bool: false)
  *           frameStrokeStyle  (style: #000000) : canvas strokeStyle for graph frame,
  *           animated          (bool: true),
  *           animationSpeed    (int: 300)       : Abstract value evaluated against number of animation frames interpolated from maxX
  * }
*/
var Graph = function(canvasId,options) {

    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.c2d = this.canvas.getContext('2d');
    this.init(options);

};


Graph.prototype = {

    init: function(options) {

        var _default = {

            marginLeft: 20,
            marginRight: 0,
            marginBottom: 20,
            marginTop: 0,
            paddingTop: 20,
            hasFrame: true,
            topFrame: false,
            bottomFrame: true,
            leftFrame: true,
            rightFrame: false,
            frameStrokeStyle: "#000000",
            animated: true,
            animationSpeed: 300,
        };

        this.initial = extend(_default, options);
        extend( this, this.initial );

        this.curves = [];
        this.tooltips = [];

        this.memory = {
            curves: [],
            markers: [],
            lines: [],
            labels: [],
            tooltips: []
        };

        this.setSize();
        this.addFrame();

        window.addEventListener('resize', proxy(this.reset, this, true));
    },

    /**
      * @desc Sets the size of the canvas element to its parent's and defines necessary space constraints
    */
    setSize: function() {

        this.canvas.setAttribute('width', this.canvas.parentNode.offsetWidth );
        this.canvas.setAttribute('height', this.canvas.parentNode.offsetHeight );
        this.maxX = this.initial.maxX  || 0; // use initial object for reset
        this.maxY = this.initial.maxY  || 1;
        this.maxAnimationIndex = 0;
        this.width = this.findHalfPixel(this.canvas.width);
        this.spaceWidth = this.width - this.marginRight;
        this.height = this.findHalfPixel(this.canvas.height);
        this.spaceHeight = this.height - this.marginTop;
        this.marginLeft = this.findHalfPixel(this.marginLeft);
        this.marginTop = this.findHalfPixel(this.marginTop);
        this.graphBaseLine = this.findHalfPixel(this.height-this.marginBottom);
        this.frameOptions = {
                graphBaseLine: this.graphBaseLine,
                marginLeft: this.marginLeft,
                spaceWidth: this.spaceWidth,
                marginTop: this.marginTop,
                topFrame: this.topFrame,
                bottomFrame: this.bottomFrame,
                leftFrame: this.leftFrame,
                rightFrame: this.rightFrame,
                frameStrokeStyle: this.frameStrokeStyle
        };
    },

    render: function(noAnimation) {

        if (!this.animated || noAnimation) {

            for (var i = 0, j= this.curves.length; i<j; ++i) {
                this.curves[i].render();
            }

            if (this.markers) {
                this.renderMarkers();
                this.renderLines();
            }
            if (this.labels) this.renderLabels();

            this.Frame.render();

        } else {
            this.renderAnimation(0);
        }
    },

    renderMarkers: function() {
        var _markers = this.memory.markers.slice();
        this.memory.markers = [];
        for (i = 0, j = _markers.length; i<j; ++i) {
            this.addMarker.apply(this,_markers[i]);
        }
    },

    renderLines: function() {
        var _lines = this.memory.lines.slice();
        this.memory.lines = [];
        for (i = 0, j = _lines.length; i<j; ++i) {
            this.addLine.apply(this,_lines[i]);
        }
    },

    renderLabels: function() {
        var _labels = this.memory.labels.slice();
        this.memory.labels= [];
        for (i = 0, j = _labels.length; i<j; ++i) {
            this.addLabel.apply(this,_labels[i]);
        }
    },
    /**
      * @desc Instantiates a frame around the graph using the graph sizes variables
    */
    addFrame: function() {
        this.Frame = new GraphFrame(this.canvas, this.frameOptions);

    },


    /**
      * @desc Adds a curve from an [{x,y}] array
      * @param values (array) [{x (float),y (float)}]
      * @param options (object) {
              bezierCurve      (bool: true)       : use bezierCurves instead of lines,
              curveStrokeStyle (style: "#FFFFFF"),
              curveBackground: (style: undefined) : uses a background if set
      * }
    */
    addCurve: function(values, options) {

        var _this = this;

        if (values.length<2) {
            values.push({x:1,y:0})
        }

        var _coords = [];


        for (var i=0, _length = values.length; i<_length; i++) {
            // Make a referenceless copy of array
            _coords.push({x: values[i].x,y: values[i].y });

            this.maxX = _coords[i].x > this.maxX ? values[i].x : this.maxX;

            this.maxAnimationIndex = !this.maxAnimationIndex || i > this.maxAnimationIndex  ? i : this.maxAnimationIndex;
            this.maxY = values[i].y > this.maxY ? values[i].y : this.maxY;
        }

        this.animationSpeed = this.animationSpeed / this.maxX;

        this.pixelValueX = (this.width-this.marginLeft -this.marginRight) / this.maxX;
        this.pixelValueY = (this.spaceHeight-this.paddingTop-this.marginBottom) / this.maxY;

        values = values.map(function(val) {
            return _this.valuesToCoordinates(val.x, val.y || 0);
        });


        var graphOptions= {
            graphBaseLine: this.graphBaseLine,
            marginLeft: this.marginLeft
        };

        if (options) extend(graphOptions, options);

        this.curves.push( new GraphCurve(this.canvas, values, graphOptions) );
        this.memory.curves.push( [_coords, options] );

    },

    /**
      * @desc Adds a Marker (circle || image) to the graph
      * @param x (float)     : will be converted to graph's space
      * @param y (float)     : will be converted to graph's space
      * @param img (url)     : image to be painted at coordinates
      * @param scale (float) : scale modifier for image markers (1=100%)
    */
    addMarker: function(x, y, options) {
        if (!this.markers) this.markers = new Markers(this.canvasId);
        this.markers.addMarker( this.valueToCoordinate('x',x), this.valueToCoordinate('y',y), options );
        this.memory.markers.push(arguments);
    },

    /**
      * @desc Adds a Marker ( straight line) to the graph
      * @param axis ("x"||"y")
      * @param startX (float) : will be converted to graph's space
      * @param startY (float) : will be converted to graph's space
      * @param length (float) : line's length apply in direction according to axis and stat coordinates
      * @param curveStrokeStyle (style: "#FFFFFF"),
    */
    addLine: function(axis, startX, startY, length, options) {
        if (!this.markers) this.markers = new Markers(this.canvasId);
        if (axis === "x") length = length * -1;
        this.markers.drawLine(axis, this.valueToCoordinate("x", startX), this.valueToCoordinate("y", startY), length,  options);
        this.memory.lines.push(arguments);
    },

    /**
      * @desc Binds a callback to the hovering of controlPoints with a reference to a DOM element
      * @param tooltipEl (DOM el)
      * @param controlPoints (array) [{x (float),y (float)}] : this points will be mapped to graph space constraints
      * @param options (object) {
      *    onMousemove: function(tooltip, closestBullet) {},
      *    onMouseleave: function(tooltip) {},
      *    hoverTreshold: 5
      * }
    */
    addTooltip: function( tooltipEl, controlPoints, options) {

        var _this = this;
        var _coords = this.mapToXY( clone(controlPoints) );
        this.tooltips.push(new Tooltip(this.canvasId, tooltipEl, _coords, options))
        this.memory.tooltips.push(controlPoints);
    },

    mapToXY: function(array) {
        var _this = this;
        return array.map(function(val) {
            val.valueX = val.x;
            val.valueY = val.y;
            val.x = _this.valueToCoordinate("x", val.x);
            val.y = _this.valueToCoordinate("y", val.y);
            return val;
        })
    },

    /**
      * @desc Binds a callback to the hovering of controlPoints with a reference to a DOM element
      * @param label (string)
      * @param x (float): this points will be mapped to graph space constraints (except if options.realSpace === true)
      * @param y (float): this points will be mapped to graph space constraints (except if options.realSpace === true)
      * @param options (object) {
      *     realSpace(bool : false) : defines wether x and y should be mapped to graph constraints
      *     offsetX (float: 0),
      *     offsetY: (float: 0),
      *     align (default: "center"),
      *     fillStyle: (style)
      * }
    */
    addLabel: function(label, x, y, options) {

        if (!this.labels)  this.labels = new Labels(this.canvasId);
        var _x = x;
        var _y = y;

        if (!options || !options.realSpace) {
            _x = this.valueToCoordinate("x", _x);
            _y = this.valueToCoordinate("y", _y);
        }
        this.labels.addLabel(label,_x,_y,options);

        this.memory.labels.push(arguments);

    },

    /**
      * @desc Calls a function for each coordinate in array
      * @param points(array) [{x (float),y (float)}]
      * @param callback (function) : callback called for each point with points[i].x and  points[i].y as arguments
      * }
    */
    forEachPoint: function(points, callback) {
        for (var i = 0, j = points.length; i<j; ++i) {
            callback(points[i].x,points[i].y);
        }
    },

    valuesToCoordinates: function(x, y) {
        var _coords = {
            x: this.valueToCoordinate("x", x),
            y: this.valueToCoordinate("y", y)
        };
        return _coords;
    },

    valueToCoordinate: function(_axis, _value) {
        return this.findHalfPixel( _axis === "x" ? Math.floor( this.marginLeft+_value*this.pixelValueX ) : Math.floor(this.graphBaseLine - _value*this.pixelValueY) );
    },

    /**
      * @desc Finds half a pixel for canvas precision
    */
    findHalfPixel: function(val) {
        var _val = val % 1 ? val : val-0.5;
        return _val > 0 ? _val : 0.5;
    },

    animate: function(_max) {

        if (typeof _max === "undefined") {
            _max = 0;
            this.renderAnimation(_max);
        } else {
            if (_max <= this.maxAnimationIndex ){

                var _timeElapsed = new Date().getTime() - this.animationStartTimestamp;
                if (_timeElapsed < this.animationSpeed) {
                    requestAnimationFrame(proxy(this.animate, this, _max));
                } else {
                    this.renderAnimation(_max);
                }

            } else {
                this.onAnimationEnd();
            }
        }
    },

    renderAnimation: function(_max) {
        this.clear();
        _max++;
        this.animationStartTimestamp =  new Date().getTime();

        for (var i = 0, j= this.curves.length; i<j; ++i) {
            this.curves[i].render(_max);
        }

        if (this.markers) {
            this.renderMarkers();
            this.renderLines();
        }

        if (this.labels) this.renderLabels();
        this.Frame.render();

        requestAnimationFrame(proxy(this.animate, this, _max));
    },

    onAnimationEnd: function() {
    },


    removeMarker: function(what, which) {
        this.markers.remove(what, which)
    },

    clear: function() {
        this.c2d.clearRect(0,0, this.width, this.height);
        return this;
    },

    reset: function(noAnimation) {
        this.clear();
        this.setSize();
        if (this.Frame) this.Frame.reset(this.frameOptions);


        this.curves = [];
        var _curves = this.memory.curves.slice();
        this.memory.curves = [];
        for (i=0, j = _curves.length; i<j; ++i) {
            this.addCurve.apply(this, _curves[i]);
        }
        var _this = this;

        var _tooltips;
        for (var i =0, j = this.tooltips.length; i<j; ++i) {
            _tooltips = clone(this.memory.tooltips[i]);
            _tooltips = this.mapToXY(_tooltips);
            this.tooltips[i].setCoordinates(_tooltips);
        }
        this.render(noAnimation);
    }

};

Charts.Graph = Graph;

var Timeline = function(canvasId, options) {

    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.c2d = this.canvas.getContext('2d');
    this.init(options);
    window.addEventListener('resize', proxy(this.reset, this, true));

};

Timeline.prototype = {

    init: function(options) {

        this.memory = {
            markers: [],
            labels: []
        };
        this.baseStyle = options && options.baseStyle ? options.baseStyle : "#000000";
        this.setSize();

    },

    setSize: function() {
        this.width = this.canvas.parentNode.offsetWidth;
        this.height = this.canvas.parentNode.offsetHeight;
        this.marginBottom = 10;
        this.baseLine = this.height - this.marginBottom -0.5;
        this.canvas.setAttribute('width', this.width );
        this.canvas.setAttribute('height', this.height );
    },

    render: function() {
        this.drawBase();
        if (this.grid) this.drawGrid();

        if (this.markers) {
            var _markers = this.memory.markers.slice();
            this.memory.markers = [];
            for (var i=0, j = _markers.length; i<j; ++i) {
                this.addMarker.apply(this,_markers[i]);
            }
        }

        if (this.labels) {
            var _labels = this.memory.labels.slice();
            this.memory.labels = [];
            for (i = 0, j = _labels.length; i<j; ++i) {
                this.addLabel.apply(this,_labels[i]);
            }
        }
    },

    /**
      * @desc Calls a function for each coordinate in array
      * @param points(array) [{x (float),y (float)}]
      * @param callback (function) : callback called for each point with points[i].x and  points[i].y as arguments
      * }
    */
    forEachPoint: function(points, callback) {
        for (var i = 0, j = points.length; i<j; ++i) {
            callback(points[i].x,points[i].y);
        }
    },

    drawBase: function() {

        this.c2d.beginPath();
        this.c2d.strokeStyle = this.baseStyle;
        this.c2d.moveTo( 0,          this.baseLine );
        this.c2d.lineTo( this.width, this.baseLine );
        this.c2d.stroke();

    },

    drawGrid: function() {

        this.c2d.beginPath();
        this.c2d.strokeStyle = this.gridStyle;

        for (var i = 0, j = this.grid.length; i<j; i++) {
            this.c2d.moveTo( this.convertX(this.grid[i]), this.baseLine+this.gridOffset);
            this.c2d.lineTo(this.convertX(this.grid[i]), this.baseLine+this.gridOffset - this.gridHeight);
        }

        this.c2d.stroke();
    },

    addGrid: function(_array, options) {

        var _defaults = {
            gridStyle: '#000000',
            gridOffset: 0,
            gridHeight: 20,
            gridMax: undefined
        };

        extend(this, extend(_defaults, options));

        if (!this.gridMax) {
            this.gridMax = 0;
            for (var i=0, j =_array.length; i<j; i++) {
                this.gridMax = _array[i]> this.gridMax ? _array[i] : this.gridMax;
            }
        }

        this.grid = _array;
    },

    addMarker: function(x, options) {

        if (!this.markers) this.markers = new Markers(this.canvasId);
        this.markers.addMarker( this.convertX(x), this.baseLine , options );
        this.memory.markers.push(arguments);
    },

    addLabel: function(label,x,y, options) {
        if (!this.labels) this.labels = new Labels(this.canvasId);
        this.labels.addLabel(label,this.convertX(x), y,options);
        this.memory.labels.push(arguments);
    },

    /**
      * @desc Binds a callback to the hovering of controlPoints with a reference to a DOM element
      * @param tooltipEl (DOM el)
      * @param controlPoints (array) [{x (float),y (float)}] : this points will be mapped to graph space constraints
      * @param options (object) {
      *    onMousemove: function(tooltip, closestBullet) {},
      *    onMouseleave: function(tooltip) {},
      *    hoverTreshold: 5
      * }
    */
    addTooltip: function( tooltipEl, controlPoints, options) {

        var _this = this;

        if (!this.tooltips) this.tooltips = [];
        var _controlPoints = [];
        for (var i = 0, j = controlPoints.length; i<j; ++i) {
            var _val = {};
            _val.valueX = controlPoints[i];
            _val.valueY = 0;
            _val.x = _this.convertX(controlPoints[i]);
            _val.y = 0;
            _controlPoints.push(_val);
        };

        this.tooltips.push(new Tooltip(this.canvasId, tooltipEl, _controlPoints, options))

    },

    convertX: function(x) {
        return this.findHalfPixel(x *this.width / this.gridMax);
    },

    findHalfPixel: function(val) {
        val = Math.round(val);
        val += 0.5;
        if (val>this.width) val = this.width-0.5;
        return val;
    },

    clear: function() {
        this.c2d.clearRect(0,0, this.width, this.height);
        return this;
    },
    reset: function() {
        this.clear();
        this.setSize();
        this.render();
    }

};

Charts.Timeline = Timeline;

return Charts;
})();
