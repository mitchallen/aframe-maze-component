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
        open: { 
            default: "" 
        },
        wall: { default: "" },
        cap: { default: "" }
    },

    /**
        * Called once when component is attached. Generally for initial setup.
     */
    init: function () {
   
        this.mazeData = {};

        var p = document.getElementById(this.data.wall);
        if(p) {
            this.mazeData.wallWidth = p.getAttribute("width");
            this.mazeData.wallDepth = p.getAttribute("depth");
            this.mazeData.wallHeight = p.getAttribute("height");
        } else {
            this.mazeData.wallWidth = 4;
            this.mazeData.wallDepth = 1;
            this.mazeData.wallHeight = 1;
        }

        this.buildCapInfo();

        this.buildOpenSpec();
    },

    buildCapInfo: function() {

        // set cap info
        var capInfo = this.data.cap.split(' ');
        var capId = "";
        var capAdjust = 0;
        if(capInfo.length > 0) {
            capId = capInfo[0];
            capId = capId[0] == '#' ? capId.substring(1) : capId
            if(capInfo[1]) {
                capAdjust = parseFloat(capInfo[1]);
            }
        }

        this.mazeData.capId = capId;

        var c = document.getElementById(capId);
        this.mazeData.capHeight = (c ? parseFloat(c.getAttribute('height')) : 1.0) + capAdjust;
    },

    buildOpenSpec: function() {
        // build open border list
        var openList = {
            "N": [],
            "E": [],
            "W": [], 
            "S": []
        };
        var tokens = this.data.open.split(' ');
        var border = null;
        for( var key in tokens ) {
            var token = tokens[key];
            if(["N","E","W","S"].indexOf(token) >= 0 ) {
                border = token;
            } else {
                if(border) {
                    openList[border].push(parseInt(token,10));
                }
            }
        }
        this.mazeData.openSpec = [];
        for( var b in openList ) {
            var lst = openList[b];
            this.mazeData.openSpec.push( { border: b, list: lst } );
        }
    },

    drawMazeWall: function(spec) {

        spec = spec || {};
        var position = spec.position,
            rotation = spec.rotation || { x: 0, y: 0, z: 0 },
            cap = spec.cap || false,
            wallId = cap ? this.mazeData.capId : this.data.wall;

        wallId = wallId[0] == '#' ? wallId.substring(1) : wallId;

        if(!position) {
            console.error("drawMazeWall requires position");
            return false;
        }

        var w = null;
        var p = document.getElementById(wallId);
        if(!p) {
           w = document.createElement('a-box'); 
           this.el.appendChild(w);
           w.setAttribute('color', 'tomato' );
           w.setAttribute('width',  cap ? 1 : this.mazeData.wallWidth );
           w.setAttribute('depth',  cap ? this.mazeData.capHeight : this.mazeData.wallDepth );
           w.setAttribute('height', cap ? 1 : this.mazeData.wallHeight );
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
        if (!this.data.enabled) { return; }
        if( this.data.size ) {
            var xSize = this.data.size.x,
                ySize = this.data.size.y;
            maze = mazeFactory.create( { x: xSize, y: ySize } );
            var options = {};
            if( this.mazeData.openSpec ) {
                options.open = this.mazeData.openSpec;
            }
            maze.generate(options);
            maze.printBoard();
            var WALL_WIDTH = this.mazeData.wallWidth,
                WALL_DEPTH = this.mazeData.wallDepth,
                WALL_HEIGHT = this.mazeData.wallHeight,
                CELL_SIZE = WALL_WIDTH,
                yPos = WALL_HEIGHT / 2.0;
            for(var y = -1; y < ySize; y++) {
                for(var x = -1; x < xSize; x++) {
                    var xPos = (x-xSize)*WALL_WIDTH,
                        zPos = (y-ySize)*WALL_WIDTH;

                    // draw end cap
                    if(!this.drawMazeWall({
                        
                        position: {
                            x: xPos + CELL_SIZE / 2.0,
                            y: this.mazeData.capHeight / 2.0,
                            z: zPos + CELL_SIZE / 2.0
                        },
                        cap: true
                    })) {
                        return;
                    }

                    if(
                        !maze.connects( x, y, "S" ) && x >= 0 
                        && !(y === -1 && maze.connects(x,0,"N")) 
                    ) {
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

                    if(
                        !maze.connects( x, y, "E" ) && y >= 0 
                        && !(x === -1 && maze.connects(0,y,"W"))
                    ){
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
