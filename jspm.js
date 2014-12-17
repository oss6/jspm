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
    }
    
    var is_obj = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';   
    }
    
    var is_array = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]'; 
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
    }
    
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
            
            //$pm[k] = {};
            $pm[k]._type = "type"; // Fix this
            
            if (obj[k] !== undefined) {
                $pm[k]._of = obj[k].name;
                $pm[k]._offun = obj[k];
            }
        }
        
    };
    
    $pm.function = function () {
        var args = Array.prototype.slice.call(arguments), // prevents optimizations in JavaScript engines (V8)
            len = args.length;

        return function (val) { // Multiple arguments
            if (val === undefined) throw new PatternMatchingException('Error!');
            
            // Check if we are dealing with arrays or other data
            
            var type = val.constructor;
            
            // Pattern matching on list (array) (check also arguments)
            if (is_array(val)) {
                var arr_len = val.length;
                
                // Type and exhaustiveness checking
                if (!type_check(args, Function.constructor)) throw new PatternMatchingException('Not compatible types');
                if (!exhaustiveness_check(args)) throw PatternMatchingException('Pattern matching not exhaustive');
                
                for (var i = 0; i < len; i++) {
                    var fn = args[i],
                        params = fn.length;
                    
                    if (arr_len === 0 && params === 0) {
                        return fn.apply(this, []);
                    }
                    else if ((arr_len >= params && params !== 0) || (arr_len === 1 && params === 2)) {
                        var inst = [], j;
                        
                        for (j = 0; j < params - 1; j++)
                            inst.push(val[j]);
                        
                        // Push tail
                        inst.push(val.slice(j));
                        
                        // Apply
                        return fn.apply(this, inst);
                    }
                    /*else {
                        // throw exception   
                    }*/
                }
            }
            // Pattern matching on numbers, strings, booleans and objects
            else {
                var patterns = get_patterns(args);
                
                if (!type_check(patterns, type))
                    throw new PatternMatchingException('Not compatible types');
                if (!exhaustiveness_check(patterns))
                    throw PatternMatchingException('Pattern matching not exhaustive');
                
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
    
    // AMD registration
    if (typeof define === "function" && define.amd) {
        define("pm", [], function() {
            return $pm;
        });
    }
    else return $pm
}.call(this));