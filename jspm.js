var $pattern_match = (function (undefined) {
    // Exceptions
    function MatchingExprException(message) {
        this.message = message;
        this.name = 'MatchingExprException';
    }

    var assertType = function (obj, type) {
        return obj.constructor.name === type.name
    }

    var is_array = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]'; 
    };

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

    var on = function () {
        var args = arguments,
            len = args.length;

        return function (val) {
            // Type and exhaustiveness checking
            /*var type = val.constructor.name;
            
            for (var i = 0; i < len; i++) {
                var matching = args[i];

                if (!is_array(matching) || matching.length !== 2 || !assertType(matching[0],type))
                    throw new MatchingExprException('Matching expression not well defined');
            }*/
            
            // Pattern matching on list (array) (check also arguments)
            if (is_array(val)) {
                var arr_len = val.length;
                
                for (var i = 0; i < len; i++) {
                    var fn = args[i],
                        params = fn.length;
                    
                    if (arr_len === 0 && params === 0) {
                        return fn.apply(this, []);
                    }
                    else if (arr_len >= params && params !== 0) {
                        var inst = [], j;
                        
                        for (j = 0; j < params - 1; j++)
                            inst.push(val[j]);
                        
                        // Push tail
                        inst.push(val.slice(j));
                        console.log(inst);
                        // Apply
                        return fn.apply(this, inst);
                    }
                    /*else {
                        // throw exception   
                    }*/
                }
            }
            // Pattern matching on numbers and string
            else {
                for (var i = 0; i < len; i++) {
                    var matching = args[i];

                    // Numbers and strings
                    if (val === matching[0] || matching[0] === $wc) {
                        if (matching[1].length === 0)
                            return matching[1].call(this);
                        else if (matching[1].length === 1)
                            return matching[1].call(this, val);
                        else {}
                    }
                }
            }
        };
    };
    
    return {
        on: on
    }
    /*var sum = $pattern_match.on(
        function () { return 0 },
        function (x, xs) {
            return x + sum (xs)
        }
    );*/

    /*var fact = fun(
        [0, function ()  1],
        [wc, function (n) n * fact(n - 1)]
    );*/
})();