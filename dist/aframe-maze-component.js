(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

// Browser distribution of the A-Frame component.
(function () {
  if (typeof AFRAME === 'undefined') {
    console.error('Component attempted to register before AFRAME was available.');
    return;
  }

  var maze = _dereq_('./modules/index');

  console.log(maze.Component.name() + ": " + maze.Component.version());

  // Register all components here.
  var components = {
    "maze": maze.Component
  };

  var primitives = {};

  Object.keys(components).forEach(function (name) {
    if (AFRAME.aframeCore) {
      AFRAME.aframeCore.registerComponent(name, components[name]);
    } else {
      AFRAME.registerComponent(name, components[name]);
    }
  });

  Object.keys(primitives).forEach(function (name) {
    if (AFRAME.aframeCore) {
      AFRAME.aframeCore.registerPrimitive(name, primitives[name]);
    } else {
      AFRAME.registerPrimitive(name, primitives[name]);
    }
  });
})();

},{"./modules/index":2}],2:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/aframe-maze-component
    Author: Mitch Allen
*/

/*jshint browser: true */
/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

// var registerComponent = require('../aframe-core/src/core/component').registerComponent;
// var THREE = require('./../aframe-core/lib/three');

var mazeFactory = _dereq_('@mitchallen/maze-generator-square');

var maze = null;

var packageName = _dereq_("../upcoming-info").name,
    packageVersion = _dereq_("../upcoming-info").upcoming.version;

module.exports.Component = {

    version: function version() {
        return packageVersion;
    },
    name: function name() {
        return packageName;
    },

    dependencies: ['position', 'rotation'],

    schema: {
        enabled: { default: true },
        size: {
            type: 'vec2',
            default: { x: 5, y: 6 }
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
    init: function init() {

        this.mazeData = {};

        var wallId = this.data.wall;

        wallId = wallId[0] == '#' ? wallId.substring(1) : wallId;

        var p = document.getElementById(wallId);
        if (p) {
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

    buildCapInfo: function buildCapInfo() {

        // set cap info
        var capInfo = this.data.cap.split(' ');
        var capId = "";
        var capAdjust = 0;
        if (capInfo.length > 0) {
            capId = capInfo[0];
            capId = capId[0] == '#' ? capId.substring(1) : capId;
            if (capInfo[1]) {
                capAdjust = parseFloat(capInfo[1]);
            }
        }

        this.mazeData.capId = capId;

        this.mazeData.capHeight = capAdjust;
    },

    buildOpenSpec: function buildOpenSpec() {
        // build open border list
        var openList = {
            "N": [],
            "E": [],
            "W": [],
            "S": []
        };
        var tokens = this.data.open.split(' ');
        var border = null;
        for (var key in tokens) {
            var token = tokens[key];
            if (["N", "E", "W", "S"].indexOf(token) >= 0) {
                border = token;
            } else {
                if (border) {
                    openList[border].push(parseInt(token, 10));
                }
            }
        }
        this.mazeData.openSpec = [];
        for (var b in openList) {
            var lst = openList[b];
            this.mazeData.openSpec.push({ border: b, list: lst });
        }
    },

    drawMazeWall: function drawMazeWall(spec) {

        spec = spec || {};
        var position = spec.position || { x: 0, y: 0, z: 0 },
            rotation = spec.rotation || { x: 0, y: 0, z: 0 },
            cap = spec.cap || false,
            wallId = cap ? this.mazeData.capId : this.data.wall;

        wallId = wallId[0] == '#' ? wallId.substring(1) : wallId;

        var w = null;
        var p = document.getElementById(wallId);
        if (!p) {
            if (cap) {
                return true;
            }
            w = document.createElement('a-box');
            this.el.appendChild(w);
            w.setAttribute('color', 'tomato');
            w.setAttribute('width', this.mazeData.wallWidth);
            w.setAttribute('depth', this.mazeData.wallDepth);
            w.setAttribute('height', this.mazeData.wallHeight);
            w.setAttribute('static-body', '');
        } else {
            w = p.cloneNode(true);
            this.el.appendChild(w);
        }
        w.setAttribute('rotation', rotation);
        w.setAttribute('position', position);
    },

    update: function update() {
        if (!this.data.enabled) {
            return;
        }
        if (this.data.size) {
            var xSize = this.data.size.x,
                ySize = this.data.size.y;
            maze = mazeFactory.create({ x: xSize, y: ySize });
            var options = {};
            if (this.mazeData.openSpec) {
                options.open = this.mazeData.openSpec;
            }
            maze.generate(options);
            maze.printBoard();
            var WALL_WIDTH = this.mazeData.wallWidth,
                WALL_DEPTH = this.mazeData.wallDepth,
                WALL_HEIGHT = this.mazeData.wallHeight,
                CELL_SIZE = WALL_WIDTH,
                yPos = 0;

            var xOffset = (xSize + 1) * WALL_WIDTH / 2.0;
            var yOffset = (ySize + 1) * WALL_WIDTH / 2.0;

            for (var y = -1; y < ySize; y++) {
                for (var x = -1; x < xSize; x++) {

                    var xPos = xOffset + (x - xSize) * WALL_WIDTH,
                        zPos = yOffset + (y - ySize) * WALL_WIDTH;

                    // draw end cap
                    this.drawMazeWall({

                        position: {
                            x: xPos + CELL_SIZE / 2.0,
                            // y: this.mazeData.capHeight / 2.0,
                            y: this.mazeData.capHeight,
                            z: zPos + CELL_SIZE / 2.0
                        },
                        cap: true
                    });

                    if (!maze.connects(x, y, "S") && x >= 0 && !(y === -1 && maze.connects(x, 0, "N"))) {
                        // draw south wall

                        this.drawMazeWall({
                            position: {
                                x: xPos,
                                y: yPos,
                                z: zPos + CELL_SIZE / 2
                            }
                        });
                    }

                    if (!maze.connects(x, y, "E") && y >= 0 && !(x === -1 && maze.connects(0, y, "W"))) {
                        // draw east wall
                        this.drawMazeWall({
                            position: {
                                x: xPos + CELL_SIZE / 2,
                                y: yPos,
                                z: zPos
                            },
                            rotation: { x: 0, y: 90, z: 0 }
                        });
                    }
                }
            }
        }
    },

    remove: function remove() {}
};

},{"../upcoming-info":4,"@mitchallen/maze-generator-square":3}],3:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.MitchAllen || (g.MitchAllen = {})).MazeGeneratorSquare = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/maze-generator-square/modules/index
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var cgFactory = _dereq_("@mitchallen/connection-grid-square"),
    baseGrid = _dereq_("@mitchallen/maze-generator-core");

/**
 * Maze Generator Core {@link https://www.npmjs.com/package/@mitchallen/maze-generator-core|npm documentation}
 * @module maze-generator-core
 */

/**
 * Square Maze Generator
 * @module maze-generator-square
 * @augments module:maze-generator-core
 */

/**
 * 
 * A module for generating square mazes
 * @module maze-generator-square-factory
 */

/** 
* Factory method that returns a square maze generator object.
* It takes one spec parameter that must be an object with x and y values specifying the size of the maze.
* If x and y size values are less than one (0) they will be normalized to 0.
* You can call create multiple times to create multiple mazes.
* @param {Object} options Named parameters for generating a square maze
* @param {number} options.x Width of the maze
* @param {number} options.y Height of the maze
* @returns {module:maze-generator-square}
* @example <caption>Creating a maze-generator-square</caption>
* var mazeFactory = require("@mitchallen/maze-generator-square");
* let xSize = 5;
* let ySize = 6;
* var maze = mazeFactory.create({ x: xSize, y: ySize });
* @example <caption>Calling create mulitple times</caption>
* var mazeFactory = require("@mitchallen/maze-generator-square");
* var maze1 = mazeFactory.create( { x: 5, y: 10 } );
* var maze2 = mazeFactory.create( { x: 7, y: 20 } );
* maze1.generate();
* maze2.generate();
*/
module.exports.create = function (spec) {

    spec = spec || {};

    var _x = spec.x || 0;
    var _y = spec.y || 0;

    var _gridSpec = {
        x: _x,
        y: _y
    };

    var connections = cgFactory.create(_gridSpec);

    var obj = baseGrid.create({
        grid: connections
    });

    return Object.assign(obj, {

        /**
          * Called by base class after generate generates the maze.
          * Not meant to be called directly. The generate method will pass the spec on to this method.
          * @param {Object} spec Object containing named parameters passed through generate method.
          * @param {Array} spec.open Array of objects specifying what borders to open
          * @param {Object} spec.open[i]. Item containing info on how to open border
          * @param {string} spec.open[i].border String representing border ("N","E","W","S")
          * @param {number} spec.open[i].list[j]. Zero-based id along border designating which cell to open
          * @function
          * @instance
          * @memberof module:maze-generator-square
          * @example <caption>open north border</caption>
          * // calls generate to pass spec on to afterGenerate
          * var xSize = 5, ySize = 6;
          * var mazeGenerator = factory.create({ x: xSize, y: ySize });
          * let spec = {
          *     open: [
          *         { border: "N", list: [0,2,xSize-1] }
          *     ]
          * };
          * mazeGenerator.generate(spec);
          * mazeGenerator.printBoard();
          * // example output
          *    __  __  
          * | |  _  | |
          * |___| |_  |
          * |  _|   | |
          * | |  _| | |
          * | |_  |___|
          * |_________|
          * @example <caption>open all border</caption>
          * // calls generate to pass spec on to afterGenerate
          * var xSize = 5, ySize = 6;
          * var mazeGenerator = factory.create({ x: xSize, y: ySize });
          * let spec = {
          *     open: [
          *         { border: "N", list: [0,2,xSize-1] },
          *         { border: "S", list: [0,2,xSize-1] },
          *         { border: "E", list: [0,2,ySize-1] },
          *         { border: "W", list: [0,2,ySize-1] }
          *     ]
          * };
          * mazeGenerator.generate(spec);
          * mazeGenerator.printBoard();
          * // example output
          *   __  __  
          *  _  |   |  
          * | | | |_  |
          *   |___| |  
          * |  _  |  _|
          * |   |_|_  |
          *   |_   _   
          */
        afterGenerate: function afterGenerate(spec) {

            spec = spec || {};
            var aOpen = spec.open || [];

            if (aOpen.length === 0) {
                return;
            }

            var borders = ["N", "E", "W", "S"];

            for (var oKey in aOpen) {
                var open = aOpen[oKey];
                if (borders.indexOf(open.border) >= 0) {

                    var list = open.list;

                    if (!list) {
                        console.error("ERROR: open border requires list parameter.");
                        continue;
                    }

                    for (var key in list) {
                        var id = list[key];
                        if (open.border === "N") {
                            if (id >= 0 && id < _x) {
                                this.open(id, 0, "N");
                            }
                        }
                        if (open.border === "S") {
                            if (id >= 0 && id < _x) {
                                this.open(id, _y - 1, "S");
                            }
                        }
                        if (open.border === "W") {
                            if (id >= 0 && id < _y) {
                                this.open(0, id, "W");
                            }
                        }
                        if (open.border === "E") {
                            if (id >= 0 && id < _y) {
                                this.open(_x - 1, id, "E");
                            }
                        }
                    }
                } else {
                    console.error("ERROR: open.border ('%s') not found", open.border);
                }
            }
        },

        /** Print board to console. Review this method to discover how to draw a maze.
          * Drawing a square maze work like this:
          * <ul>
          * <li>Draw the top border</li>
          * <li>For each cell:</li>
                <ul>
          *     <li>if this is the first cell in the row, draw the western wall</li>
          *     <li>if the cell is NOT connected to it's eastern neighbor, draw the east wall</li>
          *     <li>if the cell is NOT connected to it's southern neighbor, draw the south wall</li>
          *     </ul>
          * </ul>
          * @function
          * @instance
          * @memberof module:maze-generator-square
          * @example <caption>console output</caption>
          * MAZE: 20, 20
        _______________________________________
        |_  |    ___  |___   _   _|  ___   _  | |
        | | | |___  | |   |_  |_____| |  _|  _| |
        |  _| |_  | |___| | |  _____  |_  | |_  |
        |_  |  ___|_  | | |  _|  _  |___| | |   |
        | | |_|  _____| | |_|  _| | |  ___|___| |
        | |_____|    ___|_  | |  _|___|     |  _|
        |_____   _|_|  _  | | |    _|  _| |_|_  |
        |  _____|  ___| |___| |_| |  _|  _|  ___|
        | |   |  _|_   _______|  _| | |_  | |   |
        |  _| | |   | |  ___    |  _| |  _| |_| |
        |_  |___| |___|  _|  _| | |_  |_  |_  | |
        | | |  ___  | | |   |___|_  |_  |_  |_  |
        | | |___  | | | | | |  _____|  ___|_____|
        |  _|   | | | | | | |_  | |  _  |  _   _|
        |_  | |___| | | | |_|  _| | |  _| | |_  |
        |  _|___  | |  _|_____|_  | |_____|  _| |
        |_  |  ___| |_  |   |   |___   ___  |  _|
        |  _|_|  ___| | | |___| |   |_|   | |_  |
        | |  ___| |   | | |  _| | |_  | | |___| |
        |___|_______|_____|_______|_____|_______|
          */
        printBoard: function printBoard() {
            console.log("MAZE: %d, %d", _x, _y);
            // print top north walls
            var border = "";
            // var lim = _x  * 2;
            // for( var i = 0; i < lim; i++ ) {
            //     border += i === 0 ? " " : this.connects(i,0,"N") ? " " : "_";
            // }
            for (var i = 0; i < _x; i++) {
                border += i === 0 ? " " : "";
                border += this.connects(i, 0, "N") ? "  " : "__";
            }
            console.log(border);
            // print maze east and south walls
            var dirMap = this.dirMap;
            for (var y = 0; y < _y; y++) {
                var row = this.connects(0, y, "W") ? " " : "|";
                for (var x = 0; x < _x; x++) {
                    row += this.connects(x, y, "S") ? " " : "_";
                    if (this.connects(x, y, "E")) {
                        row += ((this.get(x, y) | this.get(x + 1, y)) & dirMap.S) !== 0 ? " " : "_";
                    } else {
                        row += "|";
                    }
                }
                console.log(row);
            }
        }
    });
};

},{"@mitchallen/connection-grid-square":2,"@mitchallen/maze-generator-core":3}],2:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.MitchAllen || (g.MitchAllen = {})).ConnectionGridSquare = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/connection-grid-square/modules/index.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var gridFactory = _dereq_("@mitchallen/grid-square"),
    baseGrid = _dereq_("@mitchallen/connection-grid-core").create;

/**
 * Connection Grid Core
 * @external @mitchallen/connection-grid-core
 * @see {@link https://www.npmjs.com/package/@mitchallen/connection-grid-core|@mitchallen/connection-grid-core}
 */

/**
* Connection Grid Square generated by {@link module:connection-grid-square-factory|create}
* @module connection-grid-square
* @extends external:@mitchallen/connection-grid-core
*/

/**
* 
* A factory for generating connection grid square objects
* @module connection-grid-square-factory
*/

/** 
* Factory method that returns a connection grid square object.
* It takes one spec parameter that must be an object with named parameters.
* @param {Object} options Named parameters for generating a connection grid square
* @param {number} options.x The size along the x axis
* @param {number} options.y The size along the y axis
* @returns {module:connection-grid-square}
* @example <caption>Creating a connection-grid-square</caption>
* "use strict";
* var gridFactory = require("@mitchallen/connection-grid-square");
* let xSize = 5;
* let ySize = 6;
* var grid = gridFactory.create({ x: xSize, y: ySize });
*/
module.exports.create = function (spec) {

    spec = spec || {};
    var _x = spec.x || 0;
    var _y = spec.y || 0;

    var _grid = gridFactory.create({
        x: _x,
        y: _y
    });

    _grid.fill(0);

    var _dirMap = {
        "N": 0x010,
        "S": 0x020,
        "E": 0x040,
        "W": 0x080 };

    var _oppositeMap = { "E": "W", "W": "E", "N": "S", "S": "N" };

    var obj = baseGrid({
        grid: _grid,
        dirMap: _dirMap,
        oppositeMap: _oppositeMap
    });

    Object.assign(obj, {
        /** Returns neighbor for direction
          * @param {string} dir A string representing a direction
          * @function
          * @instance
          * @memberof module:connection-grid-square
          * @returns {string}
          * @example <caption>usage</caption>
          * var cell = grid.getNeighbor(1,1,"S"); 
         */
        getNeighbor: function getNeighbor(x, y, dir) {
            if (!this.isCell(x, y)) {
                return null;
            }
            // dir must be string and in dirmap
            if (!this.isDir(dir)) {
                return null;
            }
            var _DX = { "E": 1, "W": -1, "N": 0, "S": 0 };
            var _DY = { "E": 0, "W": 0, "N": -1, "S": 1 };
            var nx = x + _DX[dir];
            var ny = y + _DY[dir];
            if (!this.isCell(nx, ny)) {
                return null;
            }
            return { x: nx, y: ny };
        },
        /** Returns an array of neighbors for the cell at x,y
          * @param {number} x X coordinate of cell
          * @param {number} y Y coordinate of cell
          * @function
          * @instance
          * @memberof module:connection-grid-square
          * @returns {array} 
          * @example <caption>usage</caption>
          * var list = grid.getNeighborDirs(1,1); 
         */
        getNeighborDirs: function getNeighborDirs(x, y) {
            // Classic ignores x and y, but other derived classes may not
            return ["N", "S", "E", "W"];
        }
    });

    return obj;
};

},{"@mitchallen/connection-grid-core":2,"@mitchallen/grid-square":3}],2:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.MitchAllen || (g.MitchAllen = {})).ConnectionGridCore = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/connection-grid-core/modules/index.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var shuffleFactory = _dereq_("@mitchallen/shuffle");

/**
 * Grid Core
 * @external @mitchallen/grid-core
 * @see {@link https://www.npmjs.com/package/@mitchallen/grid-core|@mitchallen/grid-core}
 */

/**
 * Connection Grid Core generated by {@link module:connection-grid-core-factory|create}
 * @module connection-grid-core
 * @extends external:@mitchallen/grid-core
 */

/**
 * 
 * A factory for generating connection grid core objects
 * @module connection-grid-core-factory
 */

/** 
* Factory method that returns a connection grid core object.
* It takes one spec parameter that must be an object with named parameters.
* @param {Object} options Named parameters for generating a connection grid core
* @param {grid} options.grid Grid based on {@link external:@mitchallen/grid-core|@mitchallen/grid-core}
* @param {dirMap} options.dirMap Direction map containing bit map flags for directions
* @param {oppositeMap} options.oppositeMap Opposite direction map
* @returns {module:connection-grid-core}
* @example <caption>Creating a connection-grid-core</caption>
* "use strict";
* var gridFactory = require("@mitchallen/connection-grid-core"),
*     gridSquare = require('@mitchallen/grid-square')
* var sourceGrid = gridSquare.create({ x: 5, y: 6 });
* var _dirMap = { 
*     "N": 0x010, 
*     "S": 0x020, 
*     "E": 0x040, 
*     "W": 0x080 };
* let _oppositeMap = { "E": "W", "W": "E", "N": "S", "S": "N" };
* var cg = gridFactory.create({  
*     grid: sourceGrid,     
*     dirMap: _dirMap,
*     oppositeMap: _oppositeMap 
* });
*/
module.exports.create = function (spec) {

    spec = spec || {};
    var _grid = spec.grid;
    var _DIR_MAP = spec.dirMap || {};
    var _OPPOSITE = spec.oppositeMap || {};

    if (!_grid) {
        return null;
    }

    // bit masks
    var VISITED = 0x01;
    var MASKED = 0x02;

    Object.defineProperties(_grid, {
        "dirMap": {
            writeable: false,
            value: _DIR_MAP,
            enumerable: true,
            configurable: true
        }
    });

    return Object.assign(_grid, {

        /** Returns true if string is found in DIR_MAP array.
          * @param {string} dir A string representing a direction
          * @function
          * @instance
          * @memberof module:connection-grid-core
          * @returns {boolean}
          * @example <caption>usage</caption>
          * if(core.isDir("N")) ...
         */
        isDir: function isDir(dir) {
            if (typeof dir === 'string') {
                return _DIR_MAP[dir] !== undefined;
            }
            return false;
        },
        /** Returns opposite direction based on OPPOSITE array.
          * @param {string} dir A string representing a direction
          * @function
          * @instance
          * @memberof module:connection-grid-core
          * @returns {string}
          * @example <caption>usage</caption>
          * core.getOppositeDir("N").should.eql("S");
         */
        getOppositeDir: function getOppositeDir(dir) {
            if (!this.isDir(dir)) {
                return null;
            }
            return _OPPOSITE[dir];
        },
        /** Returns the neighbor in a particular direction for a cell at x,y.
          * <b>This should be overriden by derived class</b>
          * @param {number} x The x coordinate
          * @param {number} y The y coordinate
          * @param {string} dir A string representing a direction
          * @function
          * @instance
          * @memberof module:connection-grid-core
          * @returns {string}
          * @example <caption>usage</caption>
          * var neighbor = core.getNeighbor(1,2,"N");
         */
        getNeighbor: function getNeighbor(x, y, dir) {
            // derived should override
            console.log("getNeighbor should be overriden by derived class");
            return null;
        },
        /** Returns the neighbor directions for a cell at x,y.
          * <b>This should be overriden by derived class</b>.
          * Classic square grids ignore x and y, but other derived classes, like hexagon, may not.
          * @param {number} x The x coordinate
          * @param {number} y The y coordinate
          * @function
          * @instance
          * @memberof module:connection-grid-core
          * @example <caption>usage</caption>
          * var neighbors = core.getNeighborDirs(1,2);
         */
        getNeighborDirs: function getNeighborDirs(x, y) {
            // derived should override
            // Classic ignores x and y, but other derived classes may not
            console.log("getNeighborDirs should be overriden by derived class");
            return [];
        },
        /** Returns a shuffled list of neighbors for a cell at x,y.
          * Useful for generating random mazes.
          * @param {number} x The x coordinate
          * @param {number} y The y coordinate
          * @function
          * @instance
          * @memberof module:connection-grid-core
          * @example <caption>usage</caption>
          * var neighbors = core.getShuffledNeighborDirs(1,2);
         */
        getShuffledNeighborDirs: function getShuffledNeighborDirs(x, y) {
            var shuffler = shuffleFactory.create({ array: this.getNeighborDirs(x, y) });
            return shuffler.shuffle();
        },
        /** Marks a cell at x,y as visited.
          * @param {number} x The x coordinate
          * @param {number} y The y coordinate
          * @function
          * @instance
          * @returns {boolean}
          * @memberof module:connection-grid-core
          * @example <caption>usage</caption>
          * core.markVisited(1,2);
         */
        markVisited: function markVisited(x, y) {
            return this.set(x, y, this.get(x, y) | VISITED);
        },
        /** Returns true if a cell at x,y exists and it has been marked as visited.
          * @param {number} x The x coordinate
          * @param {number} y The y coordinate
          * @function
          * @instance
          * @returns {boolean}
          * @memberof module:connection-grid-core
          * @example <caption>usage</caption>
          * if(core.visited(x)) ...
         */
        visited: function visited(x, y) {
            if (!this.isCell(x, y)) {
                return false;
            }
            return (this.get(x, y) & VISITED) !== 0;
        },
        /** Marks a cell at x,y as masked.
          * Useful for maze generators to mark cells to skip
          * @param {number} x The x coordinate
          * @param {number} y The y coordinate
          * @function
          * @instance
          * @returns {boolean}
          * @memberof module:connection-grid-core
          * @example <caption>usage</caption>
          * core.mask(1,2)
         */
        mask: function mask(x, y) {
            return this.set(x, y, this.get(x, y) | MASKED);
        },
        /** Returns true if a cell at x,y has been marked using [mask]{@link module:connection-grid-core#mask}.
          * @param {number} x The x coordinate
          * @param {number} y The y coordinate
          * @function
          * @instance
          * @returns {boolean}
          * @memberof module:connection-grid-core
          * @example <caption>usage</caption>
          * if(core.isMasked(1,2)) ...
         */
        isMasked: function isMasked(x, y) {
            if (!this.isCell(x, y)) {
                return false;
            }
            return (this.get(x, y) & MASKED) !== 0;
        },
        /** Returns true if a cell at x,y has connections.
          * @param {number} x The x coordinate
          * @param {number} y The y coordinate
          * @function
          * @instance
          * @returns {boolean}
          * @memberof module:connection-grid-core
          * @example <caption>usage</caption>
          * if(core.hasConnections(1,2)) ...
         */
        hasConnections: function hasConnections(x, y) {
            // Need to discount visited flag, etc
            var cell = this.get(x, y);
            if (cell === null) {
                return false;
            }
            if (cell === 0) {
                return false;
            }
            var list = this.getNeighborDirs(x, y);
            for (var key in list) {
                var sDir = list[key];
                if (!this.isDir(sDir)) {
                    console.error("hasConnections unknown direction: ", sDir);
                    return false;
                }
                var iDir = _DIR_MAP[sDir];
                if ((cell & iDir) !== 0) {
                    return true;
                }
            }
            return false;
        },
        /** Maps a connection for a cell at x,y in a particular direction.
          * Unlike [connect]{@link module:connection-grid-core#connect} a cell in the direction does not have to exist.
          * Useful for mazes that need to open up border walls.
          * @param {number} x The x coordinate
          * @param {number} y The y coordinate
          * @param {string} dir A string representing a direction
          * @function
          * @instance
          * @memberof module:connection-grid-core
          * @example <caption>usage</caption>
          * core.open(0,0,"N");
         */
        open: function open(x, y, dir) {
            // dir must be string
            if (!this.isDir(dir)) {
                return false;
            }
            return this.set(x, y, this.get(x, y) | _DIR_MAP[dir]);
        },
        /** Maps a connection for a cell at x,y in a particular direction.
          * Returns false if the cell in the target direction does not exist.
          * @param {number} x The x coordinate
          * @param {number} y The y coordinate
          * @param {string} dir A string representing a direction
          * @function
          * @instance
          * @returns {boolean}
          * @memberof module:connection-grid-core
          * @example <caption>usage</caption>
          * if(core.connect(1,2,"N")) ...
         */
        connect: function connect(x, y, dir) {
            // dir must be string
            // Connect cell to neighbor (one way)}
            if (!this.getNeighbor(x, y, dir)) return false;
            return this.open(x, y, dir);
        },
        /** Maps a connection for a cell at x,y in a particular direction.
          * Also maps a connection from the target cell back to the source cell.
          * Returns false if the cell in the target direction does not exist.
          * @param {number} x The x coordinate
          * @param {number} y The y coordinate
          * @param {string} dir A string representing a direction
          * @function
          * @instance
          * @returns {boolean}
          * @memberof module:connection-grid-core
          * @example <caption>usage</caption>
          * if(core.connectUndirected(1,2,"N")) ...
         */
        connectUndirected: function connectUndirected(x, y, sDir) {
            // dir must be a string
            if (!this.connect(x, y, sDir)) {
                return false;
            }
            var n = this.getNeighbor(x, y, sDir);
            if (!this.connect(n.x, n.y, _OPPOSITE[sDir])) {
                return false;
            }
            return true;
        },
        /** Returns true if a cell connects to a neighbor cell in a particular direction.
          * It does not matter if a the target cell exists such as when [open]{@link module:connection-grid-core#open} maps a connection to a non-existant cell.
          * @param {number} x The x coordinate
          * @param {number} y The y coordinate
          * @param {string} dir A string representing a direction
          * @returns {boolean}
          * @function
          * @instance
          * @memberof module:connection-grid-core
          * @example <caption>usage</caption>
          * if(core.connects(1,2,"N")) ...
         */
        connects: function connects(x, y, sDir) {
            if (!this.isDir(sDir)) {
                console.error("connects unknown direction: ", sDir);
                return false;
            }
            var cell = this.get(x, y);
            if (cell === null) {
                return false;
            }
            var iDir = _DIR_MAP[sDir];
            return (cell & iDir) !== 0;
        },
        /** Returns true if a cell connects to a neighbor cell in any direction in the list.
          * @param {number} x The x coordinate
          * @param {number} y The y coordinate
          * @param {array} list An array of strings that each represent a direction
          * @function
          * @instance
          * @returns {boolean}
          * @memberof module:connection-grid-core
          * @example <caption>usage</caption>
          * if(core.connectsAny(1,2,["N","W"]) ...
         */
        connectsAny: function connectsAny(x, y, list) {
            var _this = this;

            var connects = false;
            list.forEach(function (el) {
                if (_this.connects(x, y, el)) {
                    connects = true;
                }
            });
            return connects;
        }
    });
};

},{"@mitchallen/shuffle":2}],2:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.MitchAllen || (g.MitchAllen = {})).Shuffle = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/shuffle
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

module.exports.create = function (spec) {
    if (!spec) {
        return null;
    }
    if (!spec.array) {
        return null;
    }
    var _array = spec.array.slice(0);
    return {
        shuffle: function shuffle() {
            var i = 0,
                j = 0,
                temp = null;
            for (i = _array.length - 1; i > 0; i -= 1) {
                j = Math.floor(Math.random() * (i + 1));
                temp = _array[i];
                _array[i] = _array[j];
                _array[j] = temp;
            }
            return _array;
        }
    };
};

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.MitchAllen || (g.MitchAllen = {})).GridSquare = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/grid-square/modules/index.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var coreGrid = _dereq_('@mitchallen/grid-core');

module.exports.create = function (spec) {

    spec = spec || {};

    var _x = spec.x || 0;
    var _y = spec.y || 0;

    _x = Math.max(_x, 0);
    _y = Math.max(_y, 0);

    var obj = coreGrid.create({ rows: _x });

    for (var row = 0; row < _x; row++) {
        for (var col = 0; col < _y; col++) {
            obj.set(row, col, 0);
        }
    }

    Object.defineProperties(obj, {
        "xSize": {
            writeable: false,
            value: _x,
            enumerable: true
        },
        "ySize": {
            writeable: false,
            value: _y,
            enumerable: true
        }
    });

    return obj;
};

},{"@mitchallen/grid-core":2}],2:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.MitchAllen || (g.MitchAllen = {})).GridCore = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/grid-core/modules/index.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

module.exports.create = function (spec) {

    spec = spec || {};

    var _rows = spec.rows || 0;

    _rows = Math.max(_rows, 0);

    var _array = [];
    while (_array.push([]) < _rows) {}

    var obj = Object.create({}, {
        "rows": {
            writeable: false,
            value: _rows,
            enumerable: true
        }
    });

    return Object.assign(obj, {

        log: function log() {
            console.log("size: %d: ", _rows);
            console.log(_array);
        },
        rowSize: function rowSize(row) {
            if (row < 0 || row >= _rows) {
                return 0;
            }
            return _array[row].length;
        },
        isCell: function isCell(a, b) {
            var rs = this.rowSize(a);
            return a >= 0 && a < _rows && b >= 0 && b < rs;
        },
        set: function set(a, b, value) {
            // problem for sparse arrays
            // if(!this.isCell(a,b)) { return false; }
            if (a < 0 || b < 0) return false;
            _array[a][b] = value;
            return true;
        },
        get: function get(a, b) {
            if (!this.isCell(a, b)) {
                return null;
            }
            return _array[a][b];
        },
        fill: function fill(value) {
            for (var row = 0; row < _rows; row++) {
                var rs = this.rowSize(row);
                for (var pos = 0; pos < rs; pos++) {
                    _array[row][pos] = value;
                }
            }
        },
        cloneArray: function cloneArray() {
            var _clone = [];
            while (_clone.push([]) < _rows) {}
            for (var row = 0; row < _rows; row++) {
                var rs = this.rowSize(row);
                for (var pos = 0; pos < rs; pos++) {
                    _clone[row][pos] = _array[row][pos];
                }
            }
            return _clone;
        }
    });
};

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.MitchAllen || (g.MitchAllen = {})).MazeGeneratorCore = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/maze-generator-core/modules/index
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

/**
 * Connection Grid Core
 * @external @mitchallen/connection-grid-core
 * @see {@link https://www.npmjs.com/package/@mitchallen/connection-grid-core|@mitchallen/connection-grid-core}
 */

/**
 * Maze Generator Core generated by {@link module:maze-generator-core-factory|create}
 * @module maze-generator-core
 * @extends external:@mitchallen/connection-grid-core
 */

/**
 * 
 * A factory for generating maze generator core objects
 * @module maze-generator-core-factory
 */

/** 
* Factory method that returns a maze generator core object.
* It takes one spec parameter that must be an object with named parameters.
* @param {Object} options Named parameters for generating a maze generator core
* @param {grid} options.grid Grid based on {@link external:@mitchallen/connection-grid-core|@mitchallen/connection-grid-core}
* @returns {module:maze-generator-core}
* @example <caption>Creating a maze-generator-core</caption>
* var cgFactory = require("@mitchallen/connection-grid-square"),
*     mazeCore = require("@mitchallen/maze-generator-core"),
*     connectionGrid = cgFactory.create( { x: 5, y: 6 } );
*     maze = mazeCore.create( {
*          grid: connectionGrid,
*     });
*/

module.exports.create = function (spec) {

    spec = spec || {};
    var _grid = spec.grid;

    if (!_grid) {
        return null;
    }

    return Object.assign(_grid, {

        // leave undocumented for now
        carveMaze: function carveMaze(x, y, depth, maxDepth) {

            if (depth >= maxDepth) {
                console.warn("MAXIMUM DEPTH REACHED: %d", maxDepth);
                return;
            }

            if (!this.isCell(x, y)) {
                return;
            }
            var dirs = this.getShuffledNeighborDirs(x, y);
            for (var key in dirs) {
                var sDir = dirs[key];
                var n = this.getNeighbor(x, y, sDir);
                if (n === null) {
                    continue;
                }

                if (this.isMasked(n.x, n.y)) {
                    continue;
                }

                if (this.isCell(n.x, n.y) && !this.hasConnections(n.x, n.y)) {
                    // Connect cell to neighbor
                    this.connectUndirected(x, y, sDir);
                    this.carveMaze(n.x, n.y, depth + 1, maxDepth);
                }
            }
        },

        /**
          * Method called after [generate]{@link module:maze-generator-core#generate} generates a maze.
          * <b>This should be overriden by derived class</b>.
          * The spec parameter will be passed on to this method after the maze has been generated.
          * The derived method should parse spec for needed values.
          * @param {Object} spec Named parameters for method
          * @function
          * @instance
          * @memberof module:maze-generator-core
          * @example <caption>possible usage</caption>
          * // A derived object would have an afterGenerate method that parses spec.open
          * let spec = {
          *    open: [
          *      { border: "N", list: [ 0, 2 ] },
          *      { border: "S", list: [ 3 ] }
          *    ]
          * };
          * mazeGenerator.generate(spec);
          */
        afterGenerate: function afterGenerate(spec) {
            // derived class should override
        },

        /** Generators a maze
          * @param {Object} options Named parameters for generating a maze
          * @param {Array} options.mask An array of cells to mask off from maze generation
          * @param {Array} options.open An array of objects designation what borders to open after generation
          * @param {Object} opions.start An object containing the x and y parameter of a cell to start maze generation from.
          * @function
          * @instance
          * @memberof module:maze-generator-core
          * @returns {boolean}
          * @example <caption>generate</caption>
          * maze.generate();
          * @example <caption>mask</caption>
          * let spec = {
          *    mask: [
          *      { c: 2, r: 3 },
          *      { c: 2, r: 4 }
          *    ]
          * };
          * mazeGenerator.generate(spec);
          * @example <caption>start and mask</caption>
          * let spec = {
          *    start: { c: 3, r: 3 },
          *    mask: [
          *      { c: 0, r: 0 },
          *      { c: 0, r: 1 },
          *      { c: 1, r: 0 },
          *      { c: 1, r: 1 }
          *    ]
          * };
          * mazeGenerator.generate(spec);
          */
        generate: function generate(spec) {

            spec = spec || {};

            var aMask = spec.mask || [],
                start = spec.start || {},
                x = start.c || 0,
                y = start.r || 0;

            this.fill(0);

            for (var mKey in aMask) {
                var mask = aMask[mKey];
                this.mask(mask.c, mask.r);
            }

            var maxDepth = this.xSize * this.ySize;

            this.carveMaze(x, y, 0, maxDepth);

            // derived class can parse extra spec parameters

            this.afterGenerate(spec);
        }
    });
};

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(_dereq_,module,exports){
module.exports={"name":"aframe-maze-component","version":"0.1.24","upcoming":{"release":"patch","version":"0.1.25"}}
},{}]},{},[1]);
