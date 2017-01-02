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
        wall: {
            type: 'vec3',
            // x: width, y: depth, z: height
            default: { x: 5, y: 3, z: 1 }
        }
    },

    /**
        * Called once when component is attached. Generally for initial setup.
     */
    init: function () {
        console.log("INIT DATA: \n", this.data);
        console.log("THIS.EL: \n", this.el); 
    },

    drawMazeWall: function(spec) {

        spec = spec || {};
        var position = spec.position,

            width = spec.width || this.data.wall.x,
            depth = spec.depth || this.data.wall.y,
            height = spec.height || this.data.wall.z,
            rotation = spec.rotation || { x: 0, y: 0, z: 0 },
            color = spec.color || '#fff',
            texture = spec.texture || '#texture-wall'; 

        if(!position || !parent) {
            console.error("drawMazeWall requires position and parent");
            return false;
        }

        var wall = document.createElement('a-box');
        this.el.appendChild(wall);
        // wall.setAttribute('color', color);
        wall.setAttribute('rotation', rotation);
        wall.setAttribute('material', { src: texture } );
        wall.setAttribute('width', width);
        wall.setAttribute('height', height);
        wall.setAttribute('depth', depth);
        wall.setAttribute('position', position);
        wall.setAttribute('static-body','');

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

            var WALL_WIDTH = 5,
                WALL_DEPTH = 1,
                WALL_HEIGHT = 3,
                CELL_SIZE = 5;

            for(var y = 0; y < ySize; y++) {
                for(var x = 0; x < xSize; x++) {
   
                    var height = 1.0,
                        xPos = (x-xSize)*WALL_WIDTH,
                        yPos = height / 2.0,
                        zPos = (y-ySize)*WALL_WIDTH;
            
                    if( x === 0 && y === 0) {
                        // draw cell center
                        height = 16.0;
                        yPos = height / 2.0;
                        if(!this.drawMazeWall({
                            position: { 
                                x: xPos,
                                y: yPos,
                                z: zPos
                            },
                            parent: this.el,
                            width: 0.5,
                            height: height,
                            depth: 0.5
                        })) {
                            return;
                        }
                    }

                    // draw end cap
                    height = 2.0;
                    yPos = height / 2.0;
                      if(!this.drawMazeWall({
                        position: {
                            x: xPos + CELL_SIZE / 2.0,
                            y: yPos,
                            z: zPos + CELL_SIZE / 2.0
                        },
                        parent: this.el,
                        width: WALL_DEPTH + 0.1,
                        height: 2.1,
                        depth: WALL_DEPTH + 0.1
                    })) {
                        return;
                    }

                    if(y === 0) {
                        // draw north wall
                        height = 1.0;
                        if(!this.drawMazeWall({
                            position: {
                                x: xPos,
                                y: height / 2.0,
                                z: zPos - CELL_SIZE / 2
                            },
                        })) {
                            return;
                        }
                    }
                    if(!(this.data.entrance && y === ySize - 1 && x === xSize - 1)) {
                        // If not last cell (entrance)
                        if(!maze.connects( x, y, "S" )) {
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

                    if(x === 0) {
                        // draw west wall
                        height = 0.75;
                        if(!this.drawMazeWall({
                            position: {
                                x: xPos - CELL_SIZE / 2,
                                y: height / 2.0,
                                z: zPos
                            },
                            rotation: { x: 0, y: 90, z: 0 }
                        })) {
                            return;
                        }
                    }
                    if(!maze.connects( x, y, "E" )) {
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
