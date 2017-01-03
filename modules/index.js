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
        size: { 
            type: 'vec2',
            default: "5, 6" 
        },
        entrance: { default: true },
        exit: { default: true },
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
        if(p) {
            this.wallWidth = p.getAttribute("width");
            this.wallDepth = p.getAttribute("depth");
            this.wallHeight = p.getAttribute("height");
        } else {
            this.wallWidth = 4;
            this.wallDepth = 1;
            this.wallHeight = 1;
        }
        var c = document.getElementById(this.data.cap);
        this.capHeight = c ? c.getAttribute('height') : 1;
    },

    drawMazeWall: function(spec) {

        spec = spec || {};
        var position = spec.position,
            rotation = spec.rotation || { x: 0, y: 0, z: 0 },
            cap = spec.cap || false,
            wallId = cap ? this.data.cap : this.data.wall;

        wallId = wallId[0] == '#' ? wallId.substring(1) : wallId;

        if(!position || !parent) {
            console.error("drawMazeWall requires position and parent");
            return false;
        }

        var w = null;
        var p = document.getElementById(wallId);
        if(!p) {
           w = document.createElement('a-box'); 
           this.el.appendChild(w);
           w.setAttribute('color', 'tomato' );
           w.setAttribute('width',  cap ? 1 : this.wallWidth );
           w.setAttribute('depth',  cap ? this.capHeight : this.wallDepth );
           w.setAttribute('height', cap ? 1 : this.wallHeight );
           w.setAttribute('static-body', '');
        } else {
           w = p.cloneNode(true);
           this.el.appendChild(w);
        }
        w.setAttribute('rotation', rotation);
        w.setAttribute('position', position);

        return true;
    },

    update: function () {
        console.log("DATA: \n", this.data);
        if (!this.data.enabled) { return; }
        if( this.data.size ) {
            var xSize = this.data.size.x,
                ySize = this.data.size.y;
            maze = mazeFactory.create( { x: xSize, y: ySize } );
            maze.generate();
            maze.printBoard();
;
            var WALL_WIDTH = this.wallWidth,
                WALL_DEPTH = this.wallDepth,
                WALL_HEIGHT = this.wallHeight,
                CELL_SIZE = WALL_WIDTH,
                yPos = WALL_HEIGHT / 2.0;

            for(var y = -1; y < ySize; y++) {
                for(var x = -1; x < xSize; x++) {
   
                    var xPos = (x-xSize)*WALL_WIDTH,
                        zPos = (y-ySize)*WALL_WIDTH;

                    // draw end cap
                    // TODO - get yPos for end cap height
                    if(!this.drawMazeWall({
                        position: {
                            x: xPos + CELL_SIZE / 2.0,
                            y: this.capHeight / 2.0,
                            z: zPos + CELL_SIZE / 2.0
                        },
                        cap: true
                    })) {
                        return;
                    }
            
                    var isEntrance = (y === ySize - 1 && x === xSize - 1);
                    var isExit = (y === -1 && x === 0);

                    if(! ((this.data.entrance && isEntrance) || (this.data.exit && isExit)) ) {
                        // If not last cell (entrance), see if south wall needs to be drawn
                        if(!maze.connects( x, y, "S" ) && x >= 0) {
                            // draw south wall
                            if(!this.drawMazeWall({
                                position: {
                                    x: xPos,
                                    y: yPos,
                                    z: zPos + CELL_SIZE / 2
                                },
                            })) {
                                return;
                            }
                        }
                    }

                    if(!maze.connects( x, y, "E" ) && y >= 0) {
                        // draw east wall
                        if(!this.drawMazeWall({
                            position: {
                                x: xPos + CELL_SIZE / 2,
                                y: yPos,
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
