define("static/js/_rollupPluginBabelHelpers-8ce54c82.js", ["exports"], (function(exports) {
    "use strict";

    // Function to merge objects
    function assign() {
        // Use built-in Object.assign if available
        return assign = Object.assign ? Object.assign.bind() : function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) {
                    // Only copy own properties
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        }, assign.apply(this, arguments);
    }

    // Export the functions
    exports._ = assign;

    // Define a property on an object
    exports.a = function(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }
        return obj;
    };
}));

// Set global variable in browser context
if (typeof window !== "undefined") {
    window.global = window;
}