"use strict";

module.exports.create = (spec) => {
    spec = spec || {};
    var id = spec.id || "";

    return {
        setAttribute: function(a) {},
        getAttribute: function(name) {
            return {};
        },
        cloneNode: function(flag) {
            return Object.create(this,{});
        },
    }
};