/**
 * jspm - Pattern matching in Javascript
 * Author: Ossama Edbali
 */

var $p = (function () {

    var $ = {}, // Public namespace
        _ = {}; // Private namespace

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
    $.PAR_REGEX = /^__\w+__$/g;
    $.ADT_REGEX = /^\w+:\w+$/g;

    $.assertType = function (obj, type) {
        return obj === null && type === null || obj.constructor.name === type || obj.__variant__ === type;
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

    $.map = function (arr, fn) {
        var out = [],
            len = arr.length,
            i;

        arr.forEach(function (val) {
            out.push(fn(val));
        });

        return out;
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

    $.checkCons = function (arg, type) {
        var bexpr = !(type === $p.Any) &&
                    !(arg === null && type === null) &&
                    (arg.__variant__ === undefined ?
                    (arg.constructor !== type)    :
                    (arg.__variant__ !== type.__name__));

        if (bexpr)
            throw new PatternMatchingException('Provided wrong type of argument: ' + arg.constructor.name);
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
     * Type inference, exhaustiveness and redundancies check
     * @param ks Pattern keys
     * @returns {string} Type name
     */
    $.inferType = function (ks) {
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
            else if ((m = v.match($.ADT_REGEX))) {                    // ADTs
                var variant = m[0].split(':')[0];
                if (tmap[variant] === undefined)
                    tmap[variant] = 1;
                else
                    tmap[variant]++;
            }
            else if ($.PAR_REGEX.test(v))                             // Parameter
                tmap.PAR++;
            else if (v === '_')                                       // Wildcard
                tmap.WC++;
        });

        // Get max of counts
        // for all types except string:
        //  if the number of values is bigger than 0 and wc or par is 1 then type is valid
        // string:
        //
        var maxc = -1,
            maxr = '',
            tmKeys = Object.keys(tmap);

        tmKeys.forEach(function (t) {
            if (tmap[t] >= maxc) {
                maxr = t;
                maxc = tmap[t];
            }
        });

        if (!$.checkOtherZero(maxr, tmKeys, tmap))
            throw new PatternMatchingException('Patterns are not consistent (not the same type)');

        // Check for redundancies and exhaustiveness (refuse to work with just WC or just PAR)

        return maxr;
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
        var fn, parts;

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

            if (fn !== undefined) return fn();
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

                // CONS 1
                if ((res = ptr.match($.ARRAY_REGEX.CONS1))) {
                    var carr = ptr.slice(1, -1);
                    fn = o[ptr];

                    if (carr === '' && val.length === 0)
                        return fn();
                    else {
                        var arr = carr.split(',');

                        // Check equality between arr and val
                    }
                }
                // CONS 2
                else if ((res = ptr.match($.ARRAY_REGEX.CONS2))) { // Check x::[] !!!
                    var hds = [],  // heads (individual elements)
                        tail;      // tail
                    parts = res[0].split('::');

                    parts.forEach(function (v, i) {
                        if (i !== parts.length - 1) {
                            hds.push(val[i]);
                        }
                        else {
                            tail = val.slice(i);
                        }
                    });

                    fn = o[ptr];
                    hds.push(tail);
                    return fn.apply(null, hds);
                }
                // CONS 3
                else if ((res = ptr.match($.ARRAY_REGEX.CONS3))) {
                    parts = res[0].split('..');
                    var low   = parseFloat(parts[0]),
                        high  = parseFloat(parts[1]),
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
            fn = o[val.__variant__ + ':' + val.__name__];

            if (fn !== undefined) {
                var args = val.value;
                return Array.isArray(args) ? fn.apply(null, args) : fn(val.value);
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
    };

    /**
     * Pattern matching higher-order function
     * @param o The object with the patterns and their mappings
     * @returns {Function}
     */
    _.fun = function (o) {
        var ks = Object.keys(o), // Get keys
            t = $.inferType(ks); // Infer type, redundancy and exhaustiveness check

        return function (val, bindings) {
            // Check input consistency (e.g. expected input of type...)
            if (!$.assertType(val, t)) throw new PatternMatchingException('Expected input of type ' + t);
            return $.match(o, val, bindings, t);
        };
    };

    _.variant = function (name, global) {
        global = (global === undefined ? false : global);
        var cons = global ? window : _;

        cons[name] = {
            '__name__': name,
            'make': function (o) {
                var keys = Object.keys(o);

                keys.forEach(function (k) {
                    var type = o[k];

                    cons[k] = function () {
                        var v = (arguments.length === 1 ? arguments[0] : Array.prototype.slice.call(arguments));

                        if (!(this instanceof cons[k]))
                            return new cons[k](v);

                        var tstring = function _tstring (o) {
                            // console.log(o);

                            if (o !== null && o.__variant__ !== undefined) {
                                if (Array.isArray(o)) {
                                    return o.map(function (el) {
                                        return _tstring(el);
                                    }).join(',');
                                }
                                else {
                                    return o.__name__ + '(' + _tstring(o.value) + ')';
                                }
                            }
                            else {
                                return o + '';
                            }
                        };

                        this.__variant__ = name;
                        this.__name__ = k;
                        this.value = v;
                        this.toString = function () {
                            return tstring(this);
                        };
                        
                        if (Array.isArray(v) && Array.isArray(type)) {          // More args
                            for (var i = 0, len = v.length; i < len; i++)
                                $.checkCons(v[i], type[i]);
                        }
                        else if (!Array.isArray(v) && !Array.isArray(type)) {   // One arg
                            $.checkCons(v, type);
                        }
                        else {
                            throw new PatternMatchingException('Types not compatible');
                        }
                    };
                });
            }
        };

        return cons[name];
    };

    _.Any = {};

    return _;
})();
