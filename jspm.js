/**
 * @file Pattern matching implementation using JS
 * @author Ossama Edbali
 * @version 0.1.1
 */

;(function () {
    // Global variable reference
    var root = this;
    var prev = root.$p;
    
    /**
     * Main namespace for jspm library. It is the entry-point of the jspm API.
     * @namespace $p
     */
    var $p = function(obj) {
        if (obj instanceof $p) return obj;
        if (!(this instanceof $p)) return new $p(obj);
        this._wrapped = obj;
    };
    
    // Expose $p object (NodeJS and window)
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = $p;
        }
        exports.$p = $p;
    } else {
        root.$p = $p;
    }
    
    /**
     * @constant
     * @type {string}
     * @memberof $p
     */
    $p.VERSION = '0.1.1';
    
    // Exceptions
    function PatternMatchingException(message) {
        this.message = message;
        this.name = 'PatternMatchingException';
    }
    
    var assertType = function (obj, type) {
        return obj === null && type === null || obj.constructor.name === type || obj === $p.$;
    };
    
    var assertDefType = function (obj, type, of) {
        return (of ? obj.of : obj.type) === type;
    };
    
    var is_obj = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';   
    };
    
    var is_number = function (value) {
        return (typeof value === 'number' || value instanceof Number) && !isNaN(value);
    };

    var is_string = function (value) {
        return typeof value === 'string' || value instanceof String;
    };

    var is_boolean = function (value) {
        return value !== null && 
            (typeof value === 'boolean' || value instanceof Boolean);
    };
    
    var is_atom = function (val) {
        return ((typeof val !== 'object' || val === null) &&
                typeof val !== 'function') || 
                is_boolean(val) || is_number(val) || is_string(val);  
    };
    
    var is_array = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]'; 
    };
    
    var is_cons = function (val) {
        return val.type !== undefined;
    };
    
    var infer_type = function (args) {
        var len = args.length,
            patt = [],
            track_type,
            i;
        
        // Check for atom matching
        for (i = 0; i < len; i++) {
            var pattern = args[i];
            if (is_array(pattern))
                patt.push(pattern);
        }
        
        if (patt.length >= len)
            args = get_patterns(args);
        
        console.log(args);
        
        for (i = 0; i < len; i++) {
            var pattern = args[i],
                current_type;
            
            if (pattern !== $p._ && pattern !== $p.$) {
                current_type = (pattern.type !== undefined ? pattern.type : pattern.constructor.name);
                if (i === 0) track_type = current_type;
                
                if (current_type !== track_type)
                    throw new PatternMatchingException('Patterns are not consistent (not the same type');
                track_type = current_type;
            }
        }
        
        return track_type;
    };
    
    var redundancy_check = function (arr, type) {
        var i, len = arr.length, track = [];
        
        if (type === 'Array') {
            /*arr = arr.map(function (fn) {
                return fn === $p._ ? -1 : fn.length; // Also parameter!!!
            });*/
            
            for (i = 0; i < len; i++) {
                if (track.indexOf(arr[i]) !== -1) return false;
                track.push(arr[i]);
            }
        }
        /*else if (type === 'Number' || type === 'String' || type === 'Boolean') {
            arr = get_patterns(arr);
            
            for (i = 0; i < len; i++) {
                if (track.indexOf(arr[i]) !== -1) return false;
                track.push(arr[i]);
            }
        }*/
        else {
            arr = get_patterns(arr, 'cons_name');
            
            for (i = 0; i < len; i++) {
                if (track.indexOf(arr[i]) !== -1) return false;
                track.push(arr[i]);
            }
        }
        
        return true;
    };
    
    var count_keys = function (obj) {
        var count = 0;
        
        for (var k in obj)
            if (obj.hasOwnProperty(k))
                count++;
        
        return count;
    };
    
    var equal_arr = function (arr1, arr2) {
        var l1 = arr1.length,
            l2 = arr2.length;
        
        if (l1 !== l2) return false;
        
        for (var i = 0; i < l1; i++)
            if (arr1[i] !== arr2[i])
                return false;
        
        return true;
    };
            
    var exhaustiveness_check = function (arr, type) {
        // Assumes that all patterns have the same type and there are no redundancies
        var i, len = arr.length;
        
        if (len === 0) return false;
        
        if (type === 'Array') {
            return true;
        }
        else if (type === 'Number' || type === 'String' || type === 'Boolean') {
            arr = get_patterns(arr);
            
            for (i = 0; i < len; i++)
                if (arr[i] === $p._ || arr[i] === $p.$)
                    return true;
        }
        else {
            arr = get_patterns(arr, 'cons_name');
            var checked = [],
                pivot = arr[0];
                
            for (i = 0; i < len; i++) {
                if (arr[i] === $p._)
                    return true;
                
                checked.push(arr[i]);
            }
            
            return equal_arr(checked.sort(), Object.keys(type).sort());
        }
        
        return false;
    };
    
    var get_patterns = function (args, prop) {
        return args.map(function (e) {
            return prop !== undefined ? e[0][prop] : e[0];
        });
    };
    
    var match_array = function (args, val, bindings) {
        var arr_len = val.length,
            len = args.length,
            type = val.constructor;
        
        // Binding
        args = args.map(function (fn) {
            return fn.bind(bindings);
        });
        
        for (var i = 0; i < len; i++) {
            var fn = args[i];
            
            //if (fn === $p._) return fn.apply(this, val); // Wild card matching (also par)
            
            var params = fn.length;    
            
            // Empty list
            if (arr_len === 0 && params === 0) {
                return fn.apply(this, []);
            }
            // One element
            else if (arr_len === 1 && params === 1) {
                return fn.apply(this, val[0]);
            }
            // More than one element
            else if ((arr_len >= params && params >= 2) || (arr_len === 1 && params === 2)) {
                var inst = [], j;

                for (j = 0; j < params - 1; j++)
                    inst.push(val[j]);

                // Push tail
                inst.push(val.slice(j));

                // Apply
                return fn.apply(this, inst);
            }
        }
    };
    
    var match_atom = function (args, val, bindings) {
        var patterns = get_patterns(args),
            len = args.length,
            type = val.constructor;
        
        // Binding
        args = args.map(function (pattern) {
            return [pattern[0], pattern[1].bind(bindings)];
        });
        
        for (var i = 0; i < len; i++) {
            var matching = args[i],
                pattern = matching[0],
                fn = matching[1];
            
            // Numbers, strings, booleans and OBJECTS!
            if (val === pattern || pattern === $p._ || pattern === $p.$) {
                return (fn.length === 1 && pattern === $p.$) ?
                        fn.call(null, $p.$(val).name)        : // Parameter
                        fn.call(null);
            }
        }
    };
    
    var match_deft = function (args, val, bindings) {
        var len = args.length, i;
        
        // Binding
        args = args.map(function (pattern) {
            return [pattern[0], pattern[1].bind(bindings)]; 
        });
        
        for (i = 0; i < len; i++) {
            var matching = args[i],
                pattern = matching[0],
                fn = matching[1];
            
            if (pattern === $p._ || pattern.cons_name === val.cons_name || pattern.value === $p.$) {
                return (fn.length === 1 && pattern.value === $p.$) ?
                        fn.call(null, $p.$(val).name)              : // Parameter
                        fn.call(null);
            }
        }
    };
    
    var create_cons_fun = function (obj, cons) {
        return function () {
            var of = obj[cons];
        };
    };
    
    // ****************
    // *  Public API  *
    // ****************
    
    /**
     * Defines a new type called 'name' with the constructors
     * provided in the object 'obj'.
     * @param {String} name The name of the new type
     * @param {Object} obj A hash containing the constructors
     * @memberof $p
     */
    $p.data = function (name, obj) {
        if (!is_obj(obj)) return PatternMatchingException('Expected object as input');
        
        // Create function for each constructor with these values: value, 
        var type = window[name] = function (o, cons) {
            
        };
        
        for (var cons in obj) {
            window[cons] = create_cons_fun(obj, cons);
        }
    };
    
    /*
        var BinaryTree = Data(function(binarytree) ({
            Void : {},
            Bt: {
                v: Number, L: binarytree, R: binarytree
            }
        }));
        
        var btree = $p.data({
            'Void': {},
            'Bt': {
                v: Number, L: btree, R: btree
            }
        });
        
        var a = nat.Succ(10); // like new nat.Succ
        a instanceof nat === true
        
        
        var patt = $p.function(
            [nat.Zero, function () { return 0 }],
            [nat.Succ(10), function () { return 10 }],
        );
    */
    
    /**
     * Implements the pattern matching for arrays, atom types and defined types
     * @param {(...Function|...Array)} args The defined patterns
     * @memberof $p
     */
    $p.function = function () {
        // Prevents optimizations in JavaScript engines (V8)
        var args = Array.prototype.slice.call(arguments);
        
        // Infer type, check for redundancies and exhaustiveness
        var type = infer_type(args);
        type = (type === 'Function' ? 'Array' : type);
        
        if (!redundancy_check(args, type)) throw new PatternMatchingException('Redundant pattern matching');
        if (!exhaustiveness_check(args, type)) throw new PatternMatchingException('Pattern matching not exhaustive');
        
        // val --> value to pattern match on
        // obj --> additional values to bind in function
        return function (val, obj) {
            console.log(type);
            
            // Check input consistency
            if (val.type !== undefined && val.type !== type) throw new PatternMatchingException('Expected input of type ' + type);
            if (!assertType(val, type)) throw new PatternMatchingException('Expected input of type ' + type);
            
            // Pattern matching on list (array)
            if (is_array(val))
                return match_array(args, val, obj);
            // Pattern matching on numbers, strings, booleans and (objects)
            else if (is_atom(val))
                return match_atom(args, val, obj);
            // Pattern matching on defined types
            else if (is_cons(val))
                return match_deft(args, val, obj);
        };
    };
    
    // Wild card (throw result)
    $p._ = (function () {
        function Wildcard() {}
        return new Wildcard();
    })();
    
    /**
     * Represents a generic parameter to bind a variable to it in the
     * matching function
     * @param {String} name The parameter name
     * @returns The parameter object with the property name set to 'name'
     * @memberof $p
     */
    $p.$ = function (name) {
        function Parameter(n) { 
            this.name = n;
        }
        return new Parameter(name);
    };
    
    // AMD registration
    if (typeof define === "function" && define.amd) {
        define("pm", [], function() {
            return $p;
        });
    }
    else return $p;
}.call(this));