"use strict";

var elementFactory = require("./mock-element");

module.exports.create = (spec) => {
    spec = spec || {};

    return {
        querySelector: function () { return null; },
        getElementById: function (id) { 
            return id === "found" ? elementFactory.create() : null; 
        },
        createElement: function(id) {
            return elementFactory.create()
        }
    }
};