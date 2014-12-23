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
            
            if (pattern !== $p._ && pattern !== $p.$) {
                current_type = (pattern.type === undefined ? pattern.constructor.name : pattern.type);
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
        else if (type === 'Number' || type === 'String' || type === 'Boolean') {
            arr = get_patterns(arr);
            
            for (i = 0; i < len; i++) {
                if (track.indexOf(arr[i]) !== -1) return false;
                track.push(arr[i]);
            }
        }
        else {
            arr = arr.map(function (p) {
                return p[0].cons_name; 
            });
            
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
    
    var exhaustiveness_check = function (arr, type) {
        // Assumes that all patterns have the same type and there are no redundancies
        var i, len = arr.length;
        
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
            var cons = $p[type].cons,
                checked = [];
            
            for (i = 0; i < len; i++) {
                if (arr[i] === $p._)
                    return true;
                
                checked.push(arr[i]);
            }
            
            return count_keys(cons) === checked.length;
        }
        
        return false;
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
        
        $p[name] = {
            'name': name,
            'cons': {}
        };
        
        for (k in obj) {
            $p[k] = create_cons_fun(obj, k, name);
            $p[k].type = name;
            
            if (obj[k] !== undefined) {
                $p[k].of = obj[k].name;
                $p[k].offun = obj[k];
            }
        }
        
        $p[name].cons = obj; // Set constructors
    };
    
    /**
     * Removes a previously created type given its name
     * @param {String} name The name of the type
     * @memberof $p
     */
    $p.remove_type = function (name) {
        // Delete all constructors
        var tobj = $p[name],
            cons = tobj.cons;
        
        for (k in cons)
            delete $p[k];
        
        // Delete type
        delete $p[name];
    };
    
    /**
     * Returns all defined types
     * @returns The defined types in the current module
     * @memberof $p
     */
    $p.defined_types = function () {
        var def_types = [];
        
        for (var k in $p)
            if ($p.hasOwnProperty(k) && is_obj($p[k]) && $p[k].cons !== undefined)
                def_types.push($p[k]);
        
        return def_types;
    };
    
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
            // Check input consistency
            if (val.type !== undefined) {
                if (!assertDefType(val, type, false)) throw new PatternMatchingException('Expected input of type ' + type);
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