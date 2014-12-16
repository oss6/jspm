function assertType(obj, type) {
    return obj.constructor.name === type.name
}

/*function curry(func,args,space) {
    var n  = func.length - args.length; //arguments still to come
    var sa = Array.prototype.slice.apply(args); // saved accumulator array
    function accumulator(moreArgs,sa,n) {
        var saPrev = sa.slice(0); // to reset
        var nPrev  = n; // to reset
        for(var i=0;i<moreArgs.length;i++,n--) {
            sa[sa.length] = moreArgs[i];
        }
        if ((n-moreArgs.length)<=0) {
            var res = func.apply(space,sa);
            // reset vars, so curried function can be applied to new params.
            sa = saPrev;
            n  = nPrev;
            return res;
        } else {
            return function (){
                // arguments are params, so closure bussiness is avoided.
                return accumulator(arguments,sa.slice(0),n);
            }
        }
    }
    return accumulator([],sa,n);
}*/

var equal_arr = function (arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) // Also check objects
            return false;
    }
}

// Deal with objects, arrays (head, tail, deep comparison)
var $wc = {}; // Fix this

var rec_case = function () {
    
};

var $match_with = function () {
    var args = arguments,
        len = args.length;
    
    return function (val) {
        // Check for type
        
        for (var i = 0; i < len; i++) {
            var matching = args[i];
            
            if (val === matching[0] || matching[0] === $wc) {
                if (matching[1].length === 0)
                    return matching[1].call(this);
                else if (matching[1].length === 1)
                    return matching[1].call(this, val);
                else {}
            }
        }
    };
};

var sum = $match_with(
    [[],                  function () { return 0 }],
    [rec_case('x', 'xs'), function () { return x + sum (xs) }]
);

/*var fact = fun(
    [0, function ()  1],
    [wc, function (n) n * fact(n - 1)]
);*/
