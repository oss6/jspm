jspm - Pattern matching in JS
=============================

**N.B.: This is an experiment. Do not use in production. Contributors welcome!**

jspm allows to use the expressivenes and power of pattern matching using Javascript. To use it you will
need just plain Javascript; no macros or other syntactic sugar constructs.

Introduction
------------
Pattern matching is

Features of jspm
----------------

Pattern match on atoms
----------------------
**Examples**
``` javascript
var fact = $p.function(
    [0, function () { return 1 }],
    [$p.$, function (n) { return n * (n - 1) }]
);
```

Pattern match on arrays
-----------------------

Defined types
-------------

Pattern match on defined types
------------------------------

Next release
------------
In the next release jspm will support **guards** as well as more syntactic sugar for both pattern matching and
sum type definition.