/**
    Module: @mitchallen/aframe-maze-component
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

// var registerComponent = require('../aframe-core/src/core/component').registerComponent;
// var THREE = require('./../aframe-core/lib/three');

var mazeFactory = require('@mitchallen/maze-generator');

var maze = null;

module.exports.component = {
    
    dependencies: ['position', 'rotation'],

    schema: {
        enabled: { default: true },
        size: { default: "5, 6" },
    },

    /**
        * Called once when component is attached. Generally for initial setup.
     */
    init: function () {
        console.log("INIT DATA: \n", this.data);
    },

    update: function () {
        console.log("DATA: \n", this.data);
        if (!this.data.enabled) { return; }
                if( this.data.size ) {
            var size = this.data.size.split(','),
                x = parseInt(size[0],10) || 3,
                y = parseInt(size[1],10) || 3
            maze = mazeFactory.Square( { x: x, y: y } );
            maze.generate();
            maze.printBoard();
            console.log("MAZE: \n", maze);
        }
    },

    remove: function () { }
};
