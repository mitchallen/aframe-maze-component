/**
    Module: @mitchallen/aframe-maze-component
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

// var registerComponent = require('../aframe-core/src/core/component').registerComponent;
// var THREE = require('./../aframe-core/lib/three');

var mazeFactory = require('@mitchallen/maze-generator-square');

var maze = null;

module.exports.Component = {
    
    dependencies: ['position', 'rotation'],

    schema: {
        enabled: { default: true },
        size: { default: "5, 6" },
        entrance: { default: true },
        wall: { default: "" },
        cap: { default: "" },
        // wall: {
        //     type: 'vec3',
        //     // x: width, y: depth, z: height
        //     default: { x: 5, y: 3, z: 1 }
        // }
    },

    /**
        * Called once when component is attached. Generally for initial setup.
     */
    init: function () {
        console.log("INIT DATA: \n", this.data);
        console.log("THIS.EL: \n", this.el); 
        var p = document.getElementById(this.data.wall);
        this.wallWidth = p.getAttribute("width");
        this.wallDepth = p.getAttribute("depth");
        this.wallHeight = p.getAttribute("height");
    },

    drawMazeWall: function(spec) {

        spec = spec || {};
        var position = spec.position,
            rotation = spec.rotation || { x: 0, y: 0, z: 0 },
            wallId = spec.wall || this.data.wall;

        console.log("DRAW DATA:", this.data);

        if(!position || !parent) {
            console.error("drawMazeWall requires position and parent");
            return false;
        }

        // var wall = document.createElement('a-box');
        var p = document.getElementById(wallId);
        var w = p.cloneNode(true);
        this.el.appendChild(w);
        w.setAttribute('rotation', rotation);
        w.setAttribute('position', position);

        return true;
    },

    update: function () {
        console.log("DATA: \n", this.data);
        if (!this.data.enabled) { return; }
                if( this.data.size ) {
            var size = this.data.size.split(' '),
                xSize = parseInt(size[0],10) || 3,
                ySize = parseInt(size[1],10) || 3
            maze = mazeFactory.create( { x: xSize, y: ySize } );
            maze.generate();
            maze.printBoard();
            console.log("MAZE: \n", maze);

            var WALL_WIDTH = this.wallWidth,
                WALL_DEPTH = this.wallDepth,
                WALL_HEIGHT = this.wallHeight,
                CELL_SIZE = this.wallWidth;

            for(var y = -1; y < ySize; y++) {
                for(var x = -1; x < xSize; x++) {
   
                    var height = 1.0,
                        xPos = (x-xSize)*WALL_WIDTH,
                        yPos = height / 2.0,
                        zPos = (y-ySize)*WALL_WIDTH;

                    // draw end cap
                    height = 2.0;
                    yPos = height / 2.0;
                      if(!this.drawMazeWall({
                        position: {
                            x: xPos + CELL_SIZE / 2.0,
                            y: yPos,
                            z: zPos + CELL_SIZE / 2.0
                        },
                        wall: this.data.cap
                    })) {
                        return;
                    }
            
                    if(!(this.data.entrance && y === ySize - 1 && x === xSize - 1)) {
                        // If not last cell (entrance)
                        if(!maze.connects( x, y, "S" ) && x >= 0) {
                            // draw south wall
                            height = 1.0;
                            if(!this.drawMazeWall({
                                position: {
                                    x: xPos,
                                    y: height / 2.0,
                                    z: zPos + CELL_SIZE / 2
                                },
                            })) {
                                return;
                            }
                        }
                    }

                    if(!maze.connects( x, y, "E" ) && y >= 0) {
                        // draw east wall
                        height = 0.75;
                        if(!this.drawMazeWall({
                            position: {
                                x: xPos + CELL_SIZE / 2,
                                y: yPos = height / 2.0,
                                z: zPos
                            },
                            rotation: { x: 0, y: 90, z: 0 }
                        })) {
                            return;
                        }
                    }
         
                }
            }
        }
    },

    remove: function () { }
};
