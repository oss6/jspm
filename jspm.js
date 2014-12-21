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
        return  obj.constructor.name === type;
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
            atom_m = [],
            track_type,
            i;
        
        // Check for atom matching
        for (i = 0; i < len; i++) {
            var pattern = args[i];
            if (is_array(pattern))
                atom_m.push(pattern);
        }
        
        if (atom_m.length >= len)
            args = get_patterns(args);
        
        for (i = 0; i < len; i++) {
            var pattern = args[i],
                current_type;
            
            if (pattern !== $pm._ && pattern !== $pm.$) {
                current_type = (pattern.type === undefined ? pattern.constructor.name : pattern.type);
                if (i === 0) track_type = current_type;
                
                if (current_type !== track_type) throw new PatternMatchingException('Not the same type'); // Fix
                track_type = current_type;
            }
        }
        
        return track_type;
    };
    
    var redundancy_check = function (arr, type) {
        var i, len = arr.length, track = [], type_name = type.name;
        
        if (type_name === 'Array') {
            arr = arr.map(function (fn) {
                return fn === $pm._ ? -1 : fn.length; // Also parameter!!!
            });
            
            for (i = 0; i < len; i++) {
                if (track.indexOf(arr[i])) return false;
                track.push(arr[i]);
            }
        }
        else if (type === 'Number' || type_name === 'String' || type_name === 'Boolean') {
            arr = get_patterns(arr);
            
            for (i = 0; i < len; i++) {
                if (track.indexOf(arr[i]) !== -1) return false;
                track.push(arr[i]);
            }
        }
        else {
               
        }
        
        return true;
    }
    
    var exhaustiveness_check = function (arr, type) {
        // Assumes that all patterns have the same type and there are no redundancies
        var i, len = arr.length;
        
        /*if (type === 'Array') {
            
        }
        else if (type === 'Number' || type === 'String' || type === 'Boolean') {
        
        }
        else {
               
        }*/
        
        /*for (i = 0; i < len; i++) {
            if (arr[i] === $pm._) // Also parameter
                return true;
        }
        
        
        return false;*/
        
        return true;
    };
    
    var get_patterns = function (args) {
        return args.map(function (e) {
            return e[0];
        });
    };
    
    var create_cons_fun = function (obj, key, type) {
        return function () {
            var arg_len = arguments.length;
            
            // Type checking
            if (
                (arg_len !== 0 && obj[key] === undefined)   ||
                (!(arg_len === 0 && obj[key] === undefined) &&
                !(assertType(arguments[0], obj[key].name)))
            ) throw new PatternMatchingException('Expected and actual types do not match');

            return {
                'value': arguments[0],
                'type': type,
                'cons_name': key
            };
        };
    };
    
    $pm.data = function (name, obj) {
        if (!is_obj(obj)) return PatternMatchingException('Expected object as input');
        
        $pm[name] = {
            'name': name,
            'cons': {}
        };
        
        for (k in obj) {
            $pm[k] = create_cons_fun(obj, k, name);
            $pm[k].type = name;
            
            if (obj[k] !== undefined) {
                $pm[k].of = obj[k].name;
                $pm[k].offun = obj[k];
            }
        }
        
        $pm[name].cons = obj; // Set constructors
    };
    
    $pm.remove_type = function (name) {
        // Delete all constructors
        var tobj = $pm[name],
            cons = tobj.cons;
        
        for (k in cons)
            delete $pm[k];
        
        delete $pm[name];
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
            
            //if (fn === $pm._) return fn.apply(this, val); // Wild card matching (also par)
            
            var params = fn.length;    
            
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
            if (val === pattern || pattern === $pm._ || pattern === $pm.$) {
                return (fn.length === 1 && pattern === $pm.$) ?
                        fn.call(null, $pm.$(val).name)        : // Parameter
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
            
            if (pattern === $pm._ || pattern.cons_name === val.cons_name || pattern.value === $pm.$) {
                return (fn.length === 1 && pattern.value === $pm.$) ?
                        fn.call(null, $pm.$(val).name)              : // Parameter
                        fn.call(null);
            }
        }
    };
    
    // 1. Implement exhaustiveness check
    // 2. Implement guards
    $pm.function = function () {
        // prevents optimizations in JavaScript engines (V8)
        var args = Array.prototype.slice.call(arguments);
        
        // Infer type and check for redundancies and exhaustiveness
        var type = infer_type(args);
        if (!redundancy_check(args, type)) throw new PatternMatchingException('Redundant pattern matching');
        if (!exhaustiveness_check(args, type)) throw PatternMatchingException('Pattern matching not exhaustive');
        
        return function (val, obj) {
            if (val.type !== undefined) {
                if (!assertDefType(val, type, false)) throw new PatternMatchingException('Expected input of type ' + type);
            }
            else if (type === 'Function') {
                if (!assertType(val, 'Array')) throw new PatternMatchingException('Expected input of type Array');
            }
            else if (!assertType(val, type)) throw new PatternMatchingException('Expected input of type ' + type);
            
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
    $pm._ = (function () {
        function Wildcard() {}
        return new Wildcard();
    })();
    
    // Parameter
    $pm.$ = function (name) {
        function Parameter(n) { 
            this.name = n;
        }
        return new Parameter(name);
    };
    
    // AMD registration
    if (typeof define === "function" && define.amd) {
        define("pm", [], function() {
            return $pm;
        });
    }
    else return $pm;
}.call(this));