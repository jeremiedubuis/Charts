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
