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
