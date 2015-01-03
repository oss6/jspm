jspm - Pattern matching in JS
=============================

**N.B.: This is an experiment. It is under development. Do not use in production. Contributors are welcome!**

jspm allows to use the expressivenes and power of pattern matching using Javascript. Just plain Javascript; no macros or other syntactic sugar constructs.

Introduction
------------
Pattern matching is used to recognise the form of a given value and let the computation be guided accordingly, associating with each pattern an expression to compute.

Features of jspm
----------------
- Pattern matching on atoms (object literals, numbers, strings, null, undefined)
- Pattern matching on arrays (like lists)
- Pattern matching on algebraic data structures (ADT)
- Exhaustiveness and redundancy checking
- Defining new types (ADT)
- Usage of bindings

Pattern match on atoms
----------------------
### Examples

**Factorial definition**
``` javascript
var fact = $p.function(
    [0, function () { return 1 }],
    [$p.$, function (n) { return n * (n - 1) }]
);
```

**Application**
``` javascript
fact(3);
<< 6
```

Pattern match on arrays
-----------------------
Pattern matching on arrays is simple: just pass to $p.function functions. These number of arguments of these functions
determine the pattern. For example zero arguments matches the empty array []. x, xs matches an array with one or more
elements: x is the head and xs is the tail (you can choose different names).

``` javascript
var sum = $p.function(
    function () { return 0 },
    function (x, xs) { return x + sum(xs) }
);

sum([1, 4, 3]);

<< 8
```

Defined types
-------------
In development phase...

Pattern match on defined types
------------------------------
In development phase...

Next release
------------
In the next release jspm will support **guards** as well as more syntactic sugar for both pattern matching and
sum type definition. In addition there will be support for ADTs.
