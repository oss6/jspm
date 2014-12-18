;(function () {
    var root = this;
    var prev = root.$pm;
    
    var $pm = function(obj) {
        if (obj instanceof $pm) return obj;
        if (!(this instanceof $pm)) return new $pm(obj);
        this._wrapped = obj;
    };
    
    // Expose $pm object (NodeJS and window)
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = $pm;
        }
        exports.$pm = $pm;
    } else {
        root.$pm = $pm;
    }
    
    $pm.VERSION = '0.1.1';
    
    // Exceptions
    function PatternMatchingException(message) {
        this.message = message;
        this.name = 'PatternMatchingException';
    }
    
    var assertType = function (obj, type) {
        return obj.constructor.name === type.name;
    };
    
    var assertDefType = function(obj, type) {
        return obj._type === type.name;
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
        return ((typeof value !== 'object' || value === null) &&
                typeof value !== 'function') || 
                is_boolean(value) || is_number(value) || type.is_string(value);  
    };
    
    var is_array = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]'; 
    };
    
    var is_deft = function (val) {
          
    };
    
    var equal_arr = function (arr1, arr2) {
        if (arr1.length !== arr2.length) return false;

        for (var i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) // Also check objects
                return false;
        }
    };

    // Deal with objects, arrays (head, tail, deep comparison)
    var $wc = {}; // Fix this

    var type_check = function (arr, type) {
        var i, len = arr.length;
        
        for (i = 0; i < len; i++)
            if (!assertType(arr[i], type))
                return false;
        return true;
    };
    
    var exhaustiveness_check = function (arr) {
        // Assumes that all patterns have the same type
        var i, len = arr.length;
        
        for (i = 0; i < len; i++) {
            
        }
        
        return true;
    };
    
    var get_patterns = function (args) {
        return args.map(function (e) {
            return e[0];
        });
    };
    
    $pm.type = function (name) {
        $pm[name] = function Prova () {}; // Fix this
        return $pm;
    };
    
    // type nat = Zero | Suc of nat;;
    $pm.def = function(obj) {
        if (!is_obj(obj)) return PatternMatchingException('Expected object as input');
        
        for (k in obj) {
            
            $pm[k] = function () {
                var arg_len = arguments.length;
                
                
                
                if (!(arguments.length === 0 && obj[k] === undefined) || !(assertDefType(arguments[0], obj[k])))
                    throw new
                    PatternMatchingException('This expression has type string but an expression was expected of type int');
                
                if (arguments.length === 1) this.value = arguments[0];
            };
            
            $pm[k]._type = "type"; // Fix this
            
            if (obj[k] !== undefined) {
                $pm[k]._of = obj[k].name;
                $pm[k]._offun = obj[k];
            }
        }
        
    };
    
    // use bindings
    var match_array = function (args, bindings) {
        var val = bindings[0],
            arr_len = val.length,
            len = args.length,
            type = val.constructor;
        
        // Type and exhaustiveness checking
        if (!type_check(args, Function.constructor)) throw new PatternMatchingException('Not compatible types');
        if (!exhaustiveness_check(args)) throw PatternMatchingException('Pattern matching not exhaustive');

        for (var i = 0; i < len; i++) {
            var fn = args[i],
                params = fn.length;
            
            // Empty list
            if (arr_len === 0 && params === 0) {
                return fn.apply(this, []);
            }
            // One element
            else if (arr_len === 1 && params === 1) {
                return fn.apply(this, val[0]);
            }
            // More elements
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
    
    var match_atom = function (args, bindings) {
        var val = bindings[0],
            patterns = get_patterns(args),
            len = args.length,
            type = val.constructor;
        
        if (!type_check(patterns, type))
            throw new PatternMatchingException('Not compatible types');
        
        if (!exhaustiveness_check(patterns))
            throw PatternMatchingException('Pattern matching not exhaustive');
        
        for (var i = 0; i < len; i++) {
            var matching = args[i],
                pattern = matching[0],
                fn = matching[1];
            
            // Numbers, strings, booleans and OBJECTS!
            if (val === pattern) { // wildcard
                return fn.apply(null, bindings);
            }
        }
    };
    
    var match_deft = function (args, val, o) {
        
    };
    
    // Implement guards
    $pm.function = function () {
        // prevents optimizations in JavaScript engines (V8)
        var args = Array.prototype.slice.call(arguments);
        // var len = args.length;
        
        return function () { // Multiple arguments
            var bindings = Array.prototype.slice.call(arguments);
            
            if (bindings.length < 1) throw new PatternMatchingException('Error!');
            var val = bindings[0];
            
            // Pattern matching on list (array) (check also arguments)
            if (is_array(bindings[0]))
                return match_array(args, bindings);
            // Pattern matching on defined types
            /*else if (is_deft(bindings[0]))
                return match_deft(args, val, rest);*/
            // Pattern matching on numbers, strings, booleans and objects
            else if (is_atom(bindings[0]))
                return match_atom(args, bindings);
        };
    };
    
    // AMD registration
    if (typeof define === "function" && define.amd) {
        define("pm", [], function() {
            return $pm;
        });
    }
    else return $pm
}.call(this));