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
- Usage of **bindings**, **parameters** and **wild cards**

Pattern match on atoms
----------------------
### Examples

**Factorial definition**
``` javascript
var fact = $p.fun({
    '0': function ()  { return 1 },
    'n': function (n) { return n * fact(n - 1) }
});
```

**Application**
``` javascript
fact(3);
<< 6
```

Pattern match on arrays
-----------------------
Supported patterns:
- Head, tail constructor: `x::xs` or `x1::x2::xs`
- Array literal: `[]` or `[4, 3, 1, 7]`

``` javascript
var sum = $p.fun({
    '[]': function () { return 0 },
    'x::xs': function () { return x + sum(xs) }
});

sum([1, 4, 3]);

<< 8
```

Bindings
--------
Bindings are a useful way to pass more information to the function matching the pattern. Below usage example:

``` javascript
var add = $p.fun({
    '0': function () { return this.val },
    'n': function (n) { return n + this.val }
});

add(4, {'val': 3});

<< 7
```

Parameters and wildcard
-----------------------
### Parameters
Parameters allow to bind values to variable names in the matching function.
Usage of parameters - $p.$ : see factorial example above

### Wildcard
Wildcards (_) are useful for grouping everything that is not being matched by the other patterns.
Usage example (not so useful example...):

``` javascript
var hello = $p.fun({
    '0': function () { return 'Ooopss..' },
    '_': function () { return 'Hello World!' }
})

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

### Redundancy

Next release
------------
In the next release jspm will support **guards** as well as more syntactic sugar for both pattern matching and
sum type definition. In addition there will be support for ADTs.