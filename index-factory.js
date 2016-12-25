/**
    Module: @mitchallen/aframe-maze-component
    Author: Mitch Allen
*/

/*jshint esversion: 6 */

"use strict";

module.exports.create = (spec) => {
    if(!spec) {
        return null;
    }
    // private 
    let _package = "@mitchallen/aframe-maze-component";
    return {
        // public 
        package: () => _package,
        health: () => "OK"
    };
};
