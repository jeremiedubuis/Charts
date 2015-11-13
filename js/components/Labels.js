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
