/**
 * jspm - Pattern matching in Javascript
 * Author: Ossama Edbali
 */

(function () {

    var _ = {}, // Private namespace
        root = this;

    // Safe reference
    var $p = function (obj) {
        if (obj instanceof $p) return obj;
        if (!(this instanceof $p)) return new $p(obj);
        this._wrapped = obj;
    };

    // Export jspm
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = $p;
        }
        exports.$p = $p;
    }
    else {
        root.$p = $p;
    }

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

            var O = Object(this);

            var len = O.length >>> 0;

            if (typeof callback !== "function") {
                throw new TypeError(callback + ' is not a function');
            }

            if (arguments.length > 1) {
                T = thisArg;
            }

            k = 0;

            while (k < len) {
                var kValue;

                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
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

            var O = Object(this);
            var len = O.length >>> 0;

            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }

            if (arguments.length > 1) {
                T = thisArg;
            }

            A = new Array(len);
            k = 0;

            while (k < len) {
                var kValue, mappedValue;

                if (k in O) {
                    kValue = O[k];
                    mappedValue = callback.call(T, kValue, k, O);
                    A[k] = mappedValue;
                }
                k++;
            }

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
    _.ARRAY_REGEX = {
        'CONS1': /^\[.*\]_/g,
        'CONS2': /^(\w+::\w+)+_/g,
        'CONS3': /^\w+\.\.\w+_/g
    };
    _.PAR_REGEX = /^[a-zA-Z]+_/g;
    _.ADT_REGEX = /^\w+:\w+_/g;

    _.assertType = function (obj, type) {
        return obj === null && type === null || obj.constructor.name === type || obj instanceof root[type];
    };

    _.inherits = function(childCtor, parentCtor) {
        /** @constructor */
        function tempCtor() {};
        tempCtor.prototype = parentCtor.prototype;
        childCtor.superClass_ = parentCtor.prototype;
        childCtor.prototype = new tempCtor();
        childCtor.prototype.constructor = childCtor;
    };

    _.isEmpty = function (obj) {
        return (Object.getOwnPropertyNames(obj).length === 0);
    };

    _.isZero = function (v) {
        return v === 0;
    };

    _.all = function (p, arr) {
        arr.forEach(function (v) {
            if (!p(v)) return false;
        });

        return true;
    };

    _.range = function (low, high) {
        var arr = [];

        for (var i = low; i <= high; i++)
            arr.push(i);

        return arr;
    };

    _.cmp = function (a, b) {
        return a - b;
    };

    _.hasPattern = function (arr, reg) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if (arr[i].match(reg))
                return arr[i];
        }

        return null;
    };

    _.equalArr = function (a1, a2, cmp) {
        cmp = cmp || _.cmp;

        if (a1.length !== a2.length) return false;

        for (var i = 0, len = a1.length; i < len; i++) {
            if (cmp(a1[i], a2[i]) !== 0)
                return false;
        }

        return true;
    };

    _.isNum = function (str) {
        return !isNaN(str);
    };

    // compare: x::xs and x1::x2::xs (latter to be checked first)
    _.compareArrayPtrFn = function (a, b) {
        if (a === '_' || a.match(_.PAR_REGEX)) return 1;
        if ((a.match(_.ARRAY_REGEX.CONS1) && b.match(_.ARRAY_REGEX.CONS1)) ||
            (a.match(_.ARRAY_REGEX.CONS2) && b.match(_.ARRAY_REGEX.CONS2)) ||
            (a.match(_.ARRAY_REGEX.CONS3) && b.match(_.ARRAY_REGEX.CONS3))) return 0;
        if (a.match(_.ARRAY_REGEX.CONS2)) return 1;

        return -1;
    };

    _.isArr = function (str) {
        return _.ARRAY_REGEX.CONS1.test(str) ||
            _.ARRAY_REGEX.CONS2.test(str) ||
            _.ARRAY_REGEX.CONS3.test(str);
    };

    _.checkOtherZero = function (type, keys, obj) {
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
    _.match = function (o, val, bindings, type) {
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

                if ((res = _.hasPattern(keys, _.PAR_REGEX)) !== null) {
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
            keys.sort(_.compareArrayPtrFn);

            // Loop through patterns
            for (var i = 0, len = keys.length; i < len; i++) {
                var ptr = keys[i].replace(/\s+/g, '');

                // CONS 1 --> []
                if ((res = ptr.match(_.ARRAY_REGEX.CONS1))) {
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
                else if ((res = ptr.match(_.ARRAY_REGEX.CONS2))) {
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
                else if ((res = ptr.match(_.ARRAY_REGEX.CONS3))) {
                    parts = res[0].split('..');
                    var low   = parseFloat(parts[0]),
                        high  = parseFloat(parts[1]);

                    arr = _.range(low, high);

                    if (_.equalArr(val, arr)) {
                        fn = o[res];
                        return fn(val); // check this
                    }
                }
                // WILD CARD / PARAMETER
                else {
                    if ((res = _.hasPattern(keys, _.PAR_REGEX)) !== null) {
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

                if ((res = _.hasPattern(keys, re)) !== null) {
                    var depth = _.flattenRecursiveStructure(res).length - 1,
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
    
    _.flattenRecursiveStructure = function (str) {
        // Cons(Cons(Cons(x))) --> Cons, Cons, Cons, x
        var arr = [];

    };
    
    /**
     * Type inference, exhaustiveness and redundancies check
     * @param ks Pattern keys
     * @returns {string} Type name
     */
    $p.inferType = function (ks) {
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
            else if (_.isNum(v))                                      // Number
                tmap.Number++;
            else if (v === null || v === undefined)                   // Falsy values
                tmap.FVC++;
            else if (_.isArr(v))                                      // Array
                tmap.Array++;
            else if (_.PAR_REGEX.test(v))                             // Parameter
                tmap.PAR++;
            else if (v === '_')                                       // Wildcard
                tmap.WC++;
            else {                                                   // ADTs
                var re = /^(\w+)\(.*\)$/,
                    _match = v.match(re),
                    cons = _match ? _match[1] : (root[v] && root[v].getVariantName) ? v : null; // Get constructor

                if (cons) {
                    tmap[root[root[cons].getVariantName()]]++;
                }
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

        if (!_.checkOtherZero(maxRet, tmKeys, tmap))
            throw new PatternMatchingException('Patterns are not consistent (not the same type)');

        // Check for redundancies and exhaustiveness (refuse to work with just WC or just PAR)

        return maxRet;
    };

    /**
     * Pattern matching higher-order function
     * @param o The object with the patterns and their mappings
     * @returns {Function}
     */
    $p.fun = function (o) {
        var ks = Object.keys(o), // Get keys
            t = _.inferType(ks); // Infer type, redundancy and exhaustiveness check

        return function (val, bindings) {
            // Check input consistency (e.g. expected input of type...)
            if (!_.assertType(val, t)) throw new PatternMatchingException('Expected input of type ' + t);
            return _.match(o, val, bindings, t);
        };
    };

    $p.variant = function(name, obj) {
        root[name] = function (value) { this.value = value; };
        root[name].prototype.toString = function () { return this.value; };
        root[name].prototype.getVariantName = function () { return name; };

        var constructors = Object.keys(obj);
        constructors.forEach(function (cons) {
            var val = obj[cons];

            if (_.isEmpty(val)) {
                root[cons] = new root[name](cons);
            }
            else {
                root[cons] = function (value) {
                    if (!(this instanceof root[cons]))
                        return new root[cons](value);

                    if (value.constructor.name !== val.value &&
                        value.getVariantName &&
                        value.getVariantName() !== name &&
                        val.value != '*') {
                        throw Error('Type not correct');
                    }

                    this.value = value;
                };
                //_.inherits(root[cons], root[name]); // Does not guarantee type checking
                root[cons].prototype = Object.create(root[name].prototype);
                root[cons].prototype.toString = function () {
                    return cons + '(' + this.value + ')';
                };
            }
        });
    };

})();