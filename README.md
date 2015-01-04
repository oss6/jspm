jspm - Pattern matching in JS
=============================

**N.B.: This is an experiment. It is under development. Do not use in production. Contributors are welcome!**

jspm allows to use the expressivenes and power of pattern matching using Javascript. Just **plain Javascript**; no macros or other syntactic sugar constructs.

Introduction
------------
Pattern matching is used to recognise the form of a given value and let the computation be guided accordingly, associating with each pattern an expression to compute.

Features of jspm
----------------
- Pattern matching on **atoms** (object literals, numbers, strings, null, undefined)
- Pattern matching on **arrays** (like lists)
- **Exhaustiveness** and **redundancy** checking
- Usage of **bindings**

Pattern match on atoms
----------------------
### Examples

**Factorial definition**
``` javascript
var fact = $p.function(
    [0, function () { return 1 }],
    [$p.$, function (n) { return n * fact(n - 1) }]
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

Bindings
--------
Bindings are a useful way to pass more information to the function matching the pattern. Below usage example:

``` javascript
var add = $p.function(
    [0, function () { return this.val }],
    [$p.$, function (n) { return n + this.val }]
);

add(4, { 'val': 3 });

<< 7
```

Parameters and wildcard
-----------------------
### Parameters
Parameters allow to bind values to variable names in the matching function.
Usage of parameters - $p.$ : see factorial example above

### Wildcard
Wildcards ($p._) are useful for grouping everything that is not being matched by the other patterns.
Usage example (not so useful example...):

``` javascript
var hello = $p.function(
    [0, function () { return 'Ooopss..' }],
    [$p._, function () { return 'Hello World!' }]
);

hello(0);
<< 'Ooopss...'

hello(347);
<< 'Hello World!'
```

Exhaustiveness and redundancy checking
--------------------------------------
In pattern matching we must ensure exhaustiveness (all patterns are covered) and that there are no redundancies (repeating
same patterns).

### Exhaustiveness
``` javascript
var fact = $p.function(
    [0, function () { return 1 }],
);

<< PatternMatchingException: 'The pattern is not exhaustive'
```

### Redundancy
``` javascript
var fact = $p.function(
    [0, function () { return 1 }],
    [0, function () { return 2 }],
    [$p.$, function (n) { return n * fact(n - 1) }],
);

<< PatternMatchingException: 'Redundant pattern'
```

Next release
------------
In the next release jspm will support **guards** as well as more syntactic sugar for both pattern matching and
sum type definition. In addition there will be support for ADTs.
