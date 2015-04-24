/**
 * jspm - Pattern matching in Javascript
 * Author: Ossama Edbali
 */

var $p = (function () {

    var $ = {}, // Public namespace
        _ = {}, // Private namespace
        global = window;

    // Polyfills
    // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    if (!Object.keys) {
        Object.keys = (function() {
            'use strict';
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
                dontEnums = [
                    'toString',
                    'toLocaleString',
                    'valueOf',
                    'hasOwnProperty',
                    'isPrototypeOf',
                    'propertyIsEnumerable',
                    'constructor'
                ],
                dontEnumsLength = dontEnums.length;

            return function(obj) {
                if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                    throw new TypeError('Object.keys called on non-object');
                }

                var result = [], prop, i;

                for (prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) {
                        result.push(prop);
                    }
                }

                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }
                return result;
            };
        }());
    }

    // Production steps of ECMA-262, Edition 5, 15.4.4.18
    // Reference: http://es5.github.io/#x15.4.4.18
    if (!Array.prototype.forEach) {

        Array.prototype.forEach = function(callback, thisArg) {

            var T, k;

            if (this == null) {
                throw new TypeError(' this is null or not defined');
            }

            // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If IsCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== "function") {
                throw new TypeError(callback + ' is not a function');
            }

            // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (arguments.length > 1) {
                T = thisArg;
            }

            // 6. Let k be 0
            k = 0;

            // 7. Repeat, while k < len
            while (k < len) {

                var kValue;

                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {

                    // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                    kValue = O[k];

                    // ii. Call the Call internal method of callback with T as the this value and
                    // argument list containing kValue, k, and O.
                    callback.call(T, kValue, k, O);
                }
                // d. Increase k by 1.
                k++;
            }
            // 8. return undefined
        };
    }

    // Production steps of ECMA-262, Edition 5, 15.4.4.19
    // Reference: http://es5.github.io/#x15.4.4.19
    if (!Array.prototype.map) {

        Array.prototype.map = function(callback, thisArg) {

            var T, A, k;

            if (this == null) {
                throw new TypeError(' this is null or not defined');
            }

            // 1. Let O be the result of calling ToObject passing the |this|
            //    value as the argument.
            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get internal
            //    method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If IsCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }

            // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (arguments.length > 1) {
                T = thisArg;
            }

            // 6. Let A be a new array created as if by the expression new Array(len)
            //    where Array is the standard built-in constructor with that name and
            //    len is the value of len.
            A = new Array(len);

            // 7. Let k be 0
            k = 0;

            // 8. Repeat, while k < len
            while (k < len) {

                var kValue, mappedValue;

                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty internal
                //    method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {

                    // i. Let kValue be the result of calling the Get internal
                    //    method of O with argument Pk.
                    kValue = O[k];

                    // ii. Let mappedValue be the result of calling the Call internal
                    //     method of callback with T as the this value and argument
                    //     list containing kValue, k, and O.
                    mappedValue = callback.call(T, kValue, k, O);

                    // iii. Call the DefineOwnProperty internal method of A with arguments
                    // Pk, Property Descriptor
                    // { Value: mappedValue,
                    //   Writable: true,
                    //   Enumerable: true,
                    //   Configurable: true },
                    // and false.

                    // In browsers that support Object.defineProperty, use the following:
                    // Object.defineProperty(A, k, {
                    //   value: mappedValue,
                    //   writable: true,
                    //   enumerable: true,
                    //   configurable: true
                    // });

                    // For best browser support, use the following:
                    A[k] = mappedValue;
                }
                // d. Increase k by 1.
                k++;
            }

            // 9. return A
            return A;
        };
    }

    if (!Array.isArray) {
        Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }

    // Exceptions
    function PatternMatchingException(message) {
        this.message = message;
    }

    // Private members
    $.ARRAY_REGEX = {
        'CONS1': /^\[.*\]$/g,
        'CONS2': /^(\w+::\w+)+$/g,
        'CONS3': /^\w+\.\.\w+$/g
    };
    $.PAR_REGEX = /^[a-zA-Z]+$/g;
    $.ADT_REGEX = /^\w+:\w+$/g;

    $.assertType = function (obj, type) {
        return obj === null && type === null || obj.constructor.name === type || obj instanceof global[type];
    };

    $.inherits = function(childCtor, parentCtor) {
        /** @constructor */
        function tempCtor() {};
        tempCtor.prototype = parentCtor.prototype;
        childCtor.superClass_ = parentCtor.prototype;
        childCtor.prototype = new tempCtor();
        childCtor.prototype.constructor = childCtor;
    };

    $.isEmpty = function (obj) {
        return (Object.getOwnPropertyNames(obj).length === 0);
    };

    $.isZero = function (v) {
        return v === 0;
    };

    $.all = function (p, arr) {
        arr.forEach(function (v) {
            if (!p(v)) return false;
        });

        return true;
    };

    $.range = function (low, high) {
        var arr = [];

        for (var i = low; i <= high; i++)
            arr.push(i);

        return arr;
    };

    $.cmp = function (a, b) {
        return a - b;
    };

    $.hasPattern = function (arr, reg) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if (arr[i].match(reg))
                return arr[i];
        }

        return null;
    };

    $.equalArr = function (a1, a2, cmp) {
        cmp = cmp || $.cmp;

        if (a1.length !== a2.length) return false;

        for (var i = 0, len = a1.length; i < len; i++) {
            if (cmp(a1[i], a2[i]) !== 0)
                return false;
        }

        return true;
    };

    $.isNum = function (str) {
        return !isNaN(str);
    };

    // compare: x::xs and x1::x2::xs (latter to be checked first)
    $.compareArrayPtrFn = function (a, b) {
        if (a === '_' || a.match($.PAR_REGEX)) return 1;
        if ((a.match($.ARRAY_REGEX.CONS1) && b.match($.ARRAY_REGEX.CONS1)) ||
            (a.match($.ARRAY_REGEX.CONS2) && b.match($.ARRAY_REGEX.CONS2)) ||
            (a.match($.ARRAY_REGEX.CONS3) && b.match($.ARRAY_REGEX.CONS3))) return 0;
        if (a.match($.ARRAY_REGEX.CONS2)) return 1;

        return -1;
    };

    $.isArr = function (str) {
        return $.ARRAY_REGEX.CONS1.test(str) ||
            $.ARRAY_REGEX.CONS2.test(str) ||
            $.ARRAY_REGEX.CONS3.test(str);
    };

    $.checkOtherZero = function (type, keys, obj) {
        keys.forEach(function (t) {
            if (t !== type && (t !== 'WC' && obj[t] > 0))
                return false;
        });

        return true;
    };

    /**
     *
     * @param o Object map
     * @param val Value to match against
     * @param bindings Bindings to attach
     * @param type Type of the patterns
     * @returns {Function}
     */
    $.match = function (o, val, bindings, type) {
        var fn, parts, arr;

        // Apply bindings
        if (bindings) {
            var oTmp = {}; // Temporary object

            Object.keys(o).forEach(function (v) {
                oTmp[v] = o[v].bind(bindings);
            });

            o = oTmp;
        }

        var keys = Object.keys(o);

        // NUMBER AND BOOLEAN
        if (type === 'Number' || type === 'Boolean') {
            fn = o[val + ''];

            if (fn !== undefined) {
                return fn();
            }
            else {

                if ((res = $.hasPattern(keys, $.PAR_REGEX)) !== null) {
                    fn = o[res];
                    return fn(val);
                }
                else {
                    fn = o['_'];
                    return fn();
                }
            }
        }
        // ARRAY
        else if (type === 'Array') {
            var res;

            // Order keys
            keys.sort($.compareArrayPtrFn);

            // Loop through patterns
            for (var i = 0, len = keys.length; i < len; i++) {
                var ptr = keys[i].replace(/\s+/g, '');

                // CONS 1 --> []
                if ((res = ptr.match($.ARRAY_REGEX.CONS1))) {
                    var carr = ptr.slice(1, -1);
                    fn = o[ptr];

                    if (carr === '' && val.length === 0)
                        return fn();
                    else {
                        arr = carr.split(',');

                        // Check equality between arr and val
                    }
                }
                // CONS 2 --> x :: xs
                else if ((res = ptr.match($.ARRAY_REGEX.CONS2))) {
                    var hds = [],  // heads (individual elements)
                        tail;      // tail
                    parts = res[0].split('::');

                    parts.forEach(function (v, i) {
                        if (v !== '_') {
                            if (i !== parts.length - 1) {
                                hds.push(val[i]);
                            }
                            else {
                                tail = val.slice(i);
                            }
                        }
                    });

                    fn = o[ptr];
                    if (tail) {
                        hds.push(tail);
                    }
                    return fn.apply(null, hds);
                }
                // CONS 3
                else if ((res = ptr.match($.ARRAY_REGEX.CONS3))) {
                    parts = res[0].split('..');
                    var low   = parseFloat(parts[0]),
                        high  = parseFloat(parts[1]);

                    arr = $.range(low, high);

                    if ($.equalArr(val, arr)) {
                        fn = o[res];
                        return fn(val); // check this
                    }
                }
                // WILD CARD / PARAMETER
                else {
                    if ((res = $.hasPattern(keys, $.PAR_REGEX)) !== null) {
                        fn = o[res];
                        return fn(val);
                    }

                    fn = o['_'];
                    return fn();
                }
            }
        }
        // ADT PATTERN MATCHING
        else {
            fn = o[val.toString()];

            if (fn !== undefined) {
                var args = val.value;
                return Array.isArray(args) ? fn.apply(null, args) : fn(val.value);
            }
            else {
                fn = o['_'];
                if (fn !== undefined) {
                    return fn();
                }

                // Patterns like: Cons(x) or Cons(Cons(x))
                var re = /Cons\((\w+)\)/;
                // Cons(Cons(Nil))
                // Cons(x) --> Cons(Nil)

                if ((res = $.hasPattern(keys, re)) !== null) {
                    var depth = $.flattenRecursiveStructure(res).length - 1,
                        retValue = val.value;
                    fn = o[res];

                    for (i = 1; i < depth; i++) {
                        retValue = retValue.value;
                    }

                    return fn(retValue);
                }

                // Throw exception or return null or something else...
            }
        }
    };
    
    $.flattenRecursiveStructure = function (str) {
        // Cons(Cons(Cons(x))) --> Cons, Cons, Cons, x
        var arr = [];

    };
    
    /**
     * Type inference, exhaustiveness and redundancies check
     * @param ks Pattern keys
     * @returns {string} Type name
     */
    _.inferType = function (ks) {
        var tmap = {
                'PAR'      : 0,
                'WC'       : 0,
                'Number'   : 0,
                'Boolean'  : 0,
                'Array'    : 0,
                'Function' : 0, // TODO
                'FVC'      : 0
            },
            m; // For matching purposes

        ks.forEach(function (v) {
            if (v === 'true' || v === 'false')                        // Boolean
                tmap.Boolean++;
            else if ($.isNum(v))                                      // Number
                tmap.Number++;
            else if (v === null || v === undefined)                   // Falsy values
                tmap.FVC++;
            else if ($.isArr(v))                                      // Array
                tmap.Array++;
            else if ($.PAR_REGEX.test(v))                             // Parameter
                tmap.PAR++;
            else if (v === '_')                                       // Wildcard
                tmap.WC++;
            else {                                                   // ADTs
                var cons = ''; // Get constructor
                if (global[cons].superClass_) {
                    tmap[global[cons.superClass_.constructor.name]]++;
                }
                else {

                }

                //if (global[cons] instanceof ... or global[cons].superClass_.constructor.name === ...)
            }
        });

        // Get max of counts
        // for all types except string:
        //  if the number of values is bigger than 0 and wc or par is 1 then type is valid
        // string:
        //
        var maxTmp = -1,
            maxRet = '',
            tmKeys = Object.keys(tmap);

        tmKeys.forEach(function (t) {
            if (tmap[t] >= maxTmp) {
                maxRet = t;
                maxTmp = tmap[t];
            }
        });

        if (!$.checkOtherZero(maxRet, tmKeys, tmap))
            throw new PatternMatchingException('Patterns are not consistent (not the same type)');

        // Check for redundancies and exhaustiveness (refuse to work with just WC or just PAR)

        return maxRet;
    };

    /**
     * Pattern matching higher-order function
     * @param o The object with the patterns and their mappings
     * @returns {Function}
     */
    _.fun = function (o) {
        var ks = Object.keys(o), // Get keys
            t = _.inferType(ks); // Infer type, redundancy and exhaustiveness check

        return function (val, bindings) {
            // Check input consistency (e.g. expected input of type...)
            if (!$.assertType(val, t)) throw new PatternMatchingException('Expected input of type ' + t);
            return $.match(o, val, bindings, t);
        };
    };

    _.variant = function(name, obj) {
        global[name] = function (value) { this.value = value; };
        global[name].prototype.toString = function () {
            return this.value;
        };

        var constructors = Object.keys(obj);
        constructors.forEach(function (cons) {
            var val = obj[cons];

            if ($.isEmpty(val)) {
                global[cons] = new global[name](cons);
            }
            else {
                global[cons] = function (value) {
                    if (!(this instanceof global[cons]))
                        return new global[cons](value);

                    console.log(val.value);

                    if (value.constructor.name !== val.value && name !== val.value && val.value != '*') {
                        throw Error('Type not correct');
                    }

                    console.log('ciaaao');

                    this.value = value;
                };
                $.inherits(global[cons], global[name]); // Does not guarantee type checking
                //global[cons].prototype = Object.create(global[name].prototype);
                global[cons].prototype.toString = function () {
                    return cons + '(' + this.value + ')';
                };
            }
        });
    };

    _.Any = {};

    return _;
})();