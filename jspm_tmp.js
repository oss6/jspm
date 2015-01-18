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

    // Exceptions
    function PatternMatchingException(message) {
        this.message = message;
    }

    // Private members
    $.assertType = function (obj, type) {
        return obj === null && type === null || obj.constructor.name === type;
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

    $.isNum = function (str) {
        return !isNaN(str);
    };

    /**
        Boolean
        Number
        Array
        String
        WC -> Wildcard
        FV -> falsy value
    */
    $.inferType = function (ks) {
        var tps   = [],
            boolc = 0,
            numc  = 0,
            wcc   = 0,
            fvc   = 0,
            arrc  = 0,
            strc  = 0;

        ks.forEach(function (v) {
            if (v.constructor.name === 'Boolean')                     // Boolean
                boolc++;
            else if (isNum(v))                                        // Number
                numc++;
            else if (v === '_')                                       // Wildcard
                wcc++;
            else if (v === null || v === undefined || v === NaN)      // Falsy values
                fvc++;
            else if (/^\w+::\w+$/g.test(v) || /^\[.*\]$/g.test(v))    // Array
                arrc++;
            else                                                      // Strings
                strc++;
        });

        if (wc > 1) throw new PatternMatchingException('Patterns are not consistent (not the same type)')

        if (((boolc === 2) || (boolc === 1 && wcc === 1) || (boolc === 1 && strc === 1)) && $.all($.isZero, [arrc, numc]))
            return 'Boolean';
        else if (((numc > 0 && wcc === 1) || (numc > 0 && strc === 1)) && $.all($.isZero, [boolc, arrc]))
            return 'Number';
        else if (((arrc > 0 && strc === 1) || (arrc > 0)) && $.all($.isZero, [boolc, numc]))
            return 'Array';
        else
            return 'String';
    };

    $.exhaustive = function (ks) {

    };

    $.redundant = function (ks) {

    };

    $.match = function (o, val, bindings, type) {

        // Apply bindings
        if (bindings) {
            var oTmp = {}; // Temporary object

            Object.keys(o).forEach(function (v) {
                oTmp[v] = o[v].bind(bindings);
            });

            o = oTmp;
        }

        var keys = Object.keys(o); // SORT KEYS (WC AT THE END!!)

        if (type === 'Number') {
            var fn = o[val + ''];

            if (fn !== undefined) return fn();
            else {
                fn = o[keys.length - 1] || o['_'];
                return fn();
            }
        }
        else if (type === 'Array') {
            
        }
        else {

        }
    };

    /**
        Usage:

        var sum = $p.fun({
            '[]': function () { return 0 },
            'x::xs': function (x, xs) { return x + sum(xs) }
        });
    */
    _.fun = function (o) {
        // Get keys
        var ks = Object.keys(o);

        // Infer and check type
        var t = $.inferType(ks);

        // Exhaustiveness and redundancy check
        if (!$.exhaustive(ks)) return null; // throw exception
        if ($.redundant(ks)) return null; // throw exception

        return function (val, bindings) {
            // Check input consistency (e.g. expected input of type...)
            if (!assertType(val, t)) throw new PatternMatchingException('Expected input of type ' + t);
            return $.match(o, val, bindings, t);
        };
    };

    return $;
})();
