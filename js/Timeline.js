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
