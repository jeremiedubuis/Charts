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
