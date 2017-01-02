(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

// Browser distribution of the A-Frame component.
(function () {
  if (typeof AFRAME === 'undefined') {
    console.error('Component attempted to register before AFRAME was available.');
    return;
  }

  var maze = _dereq_('./modules/index');

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

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

// var registerComponent = require('../aframe-core/src/core/component').registerComponent;
// var THREE = require('./../aframe-core/lib/three');

var mazeFactory = _dereq_('@mitchallen/maze-generator-square');

var maze = null;

module.exports.Component = {

    dependencies: ['position', 'rotation'],

    schema: {
        enabled: { default: true },
        size: { default: "5, 6" },
        entrance: { default: true }
    },

    /**
        * Called once when component is attached. Generally for initial setup.
     */
    init: function init() {
        console.log("INIT DATA: \n", this.data);
    },

    update: function update() {
        console.log("DATA: \n", this.data);
        if (!this.data.enabled) {
            return;
        }
        if (this.data.size) {
            var drawMazeWall = function drawMazeWall(spec) {

                spec = spec || {};
                var position = spec.position,
                    parent = spec.parent,
                    width = spec.width || WALL_WIDTH,
                    depth = spec.depth || WALL_DEPTH,
                    height = spec.height || WALL_HEIGHT,
                    color = spec.color || '#fff',
                    texture = spec.texture || '#texture-wall';

                if (!position || !parent) {
                    console.error("drawMazeWall requires position and parent");
                    return false;
                }

                var wall = document.createElement('a-box');
                parent.appendChild(wall);
                wall.setAttribute('color', color);
                wall.setAttribute('material', { src: texture });
                wall.setAttribute('width', width);
                wall.setAttribute('height', height);
                wall.setAttribute('depth', depth);
                wall.setAttribute('position', position);
                wall.setAttribute('static-body', '');

                return true;
            };

            var size = this.data.size.split(' '),
                xSize = parseInt(size[0], 10) || 3,
                ySize = parseInt(size[1], 10) || 3;
            maze = mazeFactory.create({ x: xSize, y: ySize });
            maze.generate();
            maze.printBoard();
            console.log("MAZE: \n", maze);

            var WALL_WIDTH = 5,
                WALL_DEPTH = 1,
                WALL_HEIGHT = 3,
                CELL_SIZE = 5;

            for (var y = 0; y < ySize; y++) {
                for (var x = 0; x < xSize; x++) {

                    var height = 1.0,
                        xPos = (x - xSize) * WALL_WIDTH,
                        yPos = height / 2.0,
                        zPos = (y - ySize) * WALL_WIDTH;

                    if (x === 0 && y === 0) {
                        // draw cell center
                        height = 16.0;
                        yPos = height / 2.0;
                        if (!drawMazeWall({
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
                    if (!drawMazeWall({
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

                    if (y === 0) {
                        // draw north wall
                        height = 1.0;
                        if (!drawMazeWall({
                            position: {
                                x: xPos,
                                y: height / 2.0,
                                z: zPos - CELL_SIZE / 2
                            },
                            parent: this.el,
                            height: height
                        })) {
                            return;
                        }
                    }
                    if (!(this.data.entrance && y === ySize - 1 && x === xSize - 1)) {
                        // If not last cell (entrance)
                        if (!maze.connects(x, y, "S")) {
                            // draw south wall
                            height = 1.0;
                            if (!drawMazeWall({
                                position: {
                                    x: xPos,
                                    y: height / 2.0,
                                    z: zPos + CELL_SIZE / 2
                                },
                                parent: this.el,
                                height: height
                            })) {
                                return;
                            }
                        }
                    }

                    if (x === 0) {
                        // draw west wall
                        height = 0.75;
                        if (!drawMazeWall({
                            position: {
                                x: xPos - CELL_SIZE / 2,
                                y: height / 2.0,
                                z: zPos
                            },
                            parent: this.el,
                            height: height,
                            width: WALL_DEPTH,
                            depth: WALL_WIDTH
                        })) {
                            return;
                        }
                    }
                    if (!maze.connects(x, y, "E")) {
                        // draw east wall
                        height = 0.75;
                        if (!drawMazeWall({
                            position: {
                                x: xPos + CELL_SIZE / 2,
                                y: yPos = height / 2.0,
                                z: zPos
                            },
                            parent: this.el,
                            height: height,
                            width: WALL_DEPTH,
                            depth: WALL_WIDTH
                        })) {
                            return;
                        }
                    }
                }
            }
        }
    },

    remove: function remove() {}
};

},{"@mitchallen/maze-generator-square":3}],3:[function(_dereq_,module,exports){
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

module.exports.create = function (spec) {

    spec = spec || {};

    var _x = spec.x || 0;
    var _y = spec.y || 0;

    var _gridSpec = {
        x: _x,
        y: _y
    };

    var connections = cgFactory.create(_gridSpec);
    if (!connections) {
        return null;
    }

    var obj = baseGrid.create({
        grid: connections
    });

    return Object.assign(connections, {
        printBorder: function printBorder() {
            var row = "";
            var lim = _x * 2;
            for (var i = 0; i < lim; i++) {
                row += i === 0 ? " " : "_";
            }
            console.log(row);
        },
        printBoard: function printBoard() {
            console.log("MAZE: %d, %d", _x, _y);
            this.printBorder();
            var dirMap = this.dirMap;
            for (var y = 0; y < _y; y++) {
                var row = "|";
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

module.exports.create = function (spec) {

    spec = spec || {};
    var _x = spec.x || 0;
    var _y = spec.y || 0;

    var _grid = gridFactory.create({
        x: _x,
        y: _y
    });

    if (!_grid) {
        return null;
    }

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

        isDir: function isDir(dir) {
            if (typeof dir === 'string') {
                return _DIR_MAP[dir] !== undefined;
            }
            return false;
        },
        getOppositeDir: function getOppositeDir(dir) {
            if (!this.isDir(dir)) {
                return null;
            }
            return _OPPOSITE[dir];
        },
        getNeighbor: function getNeighbor(x, y, dir) {
            // derived should override
            console.log("getNeighbor should be overriden by derived class");
            return null;
        },
        getNeighborDirs: function getNeighborDirs(x, y) {
            // derived should override
            // Classic ignores x and y, but other derived classes may not
            console.log("getNeighborDirs should be overriden by derived class");
            return [];
        },
        getShuffledNeighborDirs: function getShuffledNeighborDirs(x, y) {
            var shuffler = shuffleFactory.create({ array: this.getNeighborDirs(x, y) });
            return shuffler.shuffle();
        },
        markVisited: function markVisited(x, y) {
            return this.set(x, y, this.get(x, y) | VISITED);
        },
        visited: function visited(x, y) {
            if (!this.isCell(x, y)) {
                return false;
            }
            return (this.get(x, y) & VISITED) !== 0;
        },
        mask: function mask(x, y) {
            return this.set(x, y, this.get(x, y) | MASKED);
        },
        isMasked: function isMasked(x, y) {
            if (!this.isCell(x, y)) {
                return false;
            }
            return (this.get(x, y) & MASKED) !== 0;
        },
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
        connect: function connect(x, y, dir) {
            // dir must be string
            // Connect cell to neighbor (one way)}
            if (!this.getNeighbor(x, y, dir)) return false;
            return this.set(x, y, this.get(x, y) | _DIR_MAP[dir]);
        },
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
    if (!_array) {
        return null;
    }

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

module.exports.create = function (spec) {

    spec = spec || {};
    var _grid = spec.grid;

    if (!_grid) {
        return null;
    }

    return Object.assign(_grid, {

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
        generate: function generate(spec) {
            var aMask = null,
                start = null;
            if (spec) {
                aMask = spec.mask;
                start = spec.start;
            }
            this.fill(0);
            for (var key in aMask) {
                var mask = aMask[key];
                this.mask(mask.c, mask.r);
            }
            var maxDepth = this.xSize * this.ySize,
                x = 0,
                y = 0;
            if (start) {
                x = start.c || 0;
                y = start.r || 0;
            }
            this.carveMaze(x, y, 0, maxDepth);
        }
    });
};

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
