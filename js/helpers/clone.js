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
