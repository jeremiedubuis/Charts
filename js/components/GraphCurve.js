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
