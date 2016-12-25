(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

// Browser distribution of the A-Frame component.
(function () {
  if (typeof AFRAME === 'undefined') {
    console.error('Component attempted to register before AFRAME was available.');
    return;
  }

  // Register all components here.
  var components = {
    "maze": _dereq_('./modules/index').component
  };

  Object.keys(components).forEach(function (name) {
    if (AFRAME.aframeCore) {
      AFRAME.aframeCore.registerComponent(name, components[name]);
    } else {
      AFRAME.registerComponent(name, components[name]);
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

var mazeFactory = _dereq_('@mitchallen/maze-generator');

var maze = null;

module.exports.component = {

    dependencies: ['position', 'rotation'],

    schema: {
        enabled: { default: true },
        size: { default: "5, 6" }
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
            var size = this.data.size.split(','),
                x = parseInt(size[0], 10) || 3,
                y = parseInt(size[1], 10) || 3;
            maze = mazeFactory.Square({ x: x, y: y });
            maze.generate();
            maze.printBoard();
            console.log("MAZE: \n", maze);
        }
    },

    remove: function remove() {}
};

},{"@mitchallen/maze-generator":3}],3:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.MitchAllen || (g.MitchAllen = {})).MazeGenerator = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/maze-generator/../ascii-canvas
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var gridFactory = _dereq_("@mitchallen/grid");

module.exports.Canvas = function (spec) {

    spec = spec || {};

    var _columns = spec.columns || 0,
        _rows = spec.rows || 0,
        _fill = spec.fill || " ";

    var _gridSpec = {
        x: _columns,
        y: _rows
    };

    var grid = gridFactory.Square(_gridSpec);

    grid.fill(_fill);

    return Object.assign(grid, {
        toString: function toString() {
            var str = "";
            for (var row = 0; row < _rows; row++) {
                for (var col = 0; col < _columns; col++) {
                    str += this.get(col, row);
                }
                str += "\n";
            }
            return str;
        },
        print: function print() {
            console.log(this.toString());
        }
    });
};

},{"@mitchallen/grid":9}],2:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/maze-generator/lib/base
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

// var connectionGridFactory = require("@mitchallen/connection-grid");

module.exports = function (spec) {

    spec = spec || {};
    var _grid = spec.grid;

    if (!_grid) {
        return null;
    }

    // Object.defineProperties( _grid, {
    // });

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

},{}],3:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/maze-generator/../circle
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var connectionGridFactory = _dereq_("@mitchallen/connection-grid"),
    baseGrid = _dereq_("./base");

module.exports = function (spec) {

    spec = spec || {};

    var _rings = spec.rings || 0;

    var _gridSpec = {
        rings: _rings
    };

    var _grid = connectionGridFactory.Circle(_gridSpec);
    if (!_grid) {
        return null;
    }

    var obj = baseGrid({
        grid: _grid
    });

    return Object.assign(_grid, {

        printDivider: function printDivider(ring) {
            var row = "",
                rowSize = _grid.ringSize(ring),
                lim = rowSize * 2 + 1;
            for (var i = 0; i < lim; i++) {
                row += "_";
            }
            console.log(row);
        },

        printBorder: function printBorder() {
            this.printDivider(_rings - 1);
        },

        printBoard: function printBoard() {
            console.log("CIRCLE MAZE: %d", _rings);
            this.printBorder();
            var innerWall = "_";
            var innerOpen = " ";
            var incWidth = 1;
            for (var ring = _rings - 1; ring >= 0; ring--) {
                var lim = _grid.ringSize(ring);
                // console.log(lim);
                var row = "";
                if (ring === 0) {
                    row = "|";
                    var cLim = _grid.ringSize(_rings - 1) - 1;
                    for (var ci = 0; ci < cLim; ci++) {
                        row += "__";
                    }
                    row += "_|";
                    console.log(row);
                    continue;
                }
                if (ring != _rings - 1) {
                    if (this.ringSize(ring) != this.ringSize(ring + 1)) {
                        incWidth *= 2;
                        for (var i = 0; i < incWidth; i++) {
                            innerWall += "_";
                            innerOpen += " ";
                        }
                    }
                }
                for (var pos = 0; pos < lim; pos++) {
                    if (pos === 0) {
                        row += this.connects(ring, pos, "CCW") ? "_" : "|";
                    }
                    row += this.connectsAny(ring, pos, ["T", "T0", "T1"]) ? innerOpen : innerWall;
                    row += this.connects(ring, pos, "CW") ? "_" : "|";
                }

                console.log(row);
            }
        }
    });
};

},{"./base":2,"@mitchallen/connection-grid":8}],4:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/maze-generator/../hexagon
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var connectionGridFactory = _dereq_("@mitchallen/connection-grid"),
    baseGrid = _dereq_("./base"),
    ascii = _dereq_("./ascii-canvas");

module.exports = function (spec) {

    spec = spec || {};

    var _x = spec.x || 0;
    var _y = spec.y || 0;

    var _gridSpec = {
        x: _x,
        y: _y
    };

    var _connectionGrid = connectionGridFactory.Hexagon(_gridSpec);
    if (!_connectionGrid) {
        return null;
    }

    var obj = baseGrid({
        grid: _connectionGrid
    });

    return Object.assign(_connectionGrid, {

        printBorder: function printBorder() {
            var row = "";
            var lim = _x * 2;
            for (var i = 0; i < lim; i++) {
                row += i === 0 ? " " : "_";
            }
            console.log(row);
        },

        printBoard: function printBoard() {
            console.log("HEXAGON MAZE: %d, %d", _x, _y);
            var dirMap = this.dirMap;
            var canvas = ascii.Canvas({ columns: _x * 2 + 1, rows: _y * 2 + 2 });
            for (var y = 0; y < _y; y++) {
                var py = y * 2;
                for (var x = 0; x < _x; x++) {
                    var cell = this.get(x, y);

                    if (cell !== 0) {
                        var px = x * 2;
                        var shifted = x % 2 !== 0;
                        var ry = py;
                        var nw = "NW";
                        var ne = "NE";
                        var sw = "W";
                        var se = "E";
                        if (shifted) {
                            ry = py + 1;
                            nw = "W";
                            ne = "E";
                            sw = "SW";
                            se = "SE";
                        }

                        if (!this.connects(x, y, "N")) {
                            canvas.set(px + 1, ry, "_");
                        }

                        if (!this.connects(x, y, nw)) {
                            canvas.set(px, ry + 1, "/");
                        }

                        if (!this.connects(x, y, ne)) {
                            canvas.set(px + 2, ry + 1, "\\");
                        }

                        if (!this.connects(x, y, sw)) {
                            canvas.set(px, ry + 2, "\\");
                        }

                        if (!this.connects(x, y, "S")) {
                            canvas.set(px + 1, ry + 2, "_");
                        }

                        if (!this.connects(x, y, se)) {
                            canvas.set(px + 2, ry + 2, "/");
                        }
                    }
                }
            }

            canvas.print();
        }
    });
};

},{"./ascii-canvas":1,"./base":2,"@mitchallen/connection-grid":8}],5:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/maze-generator
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var connectionGridFactory = _dereq_("@mitchallen/connection-grid"),
    squareMaze = _dereq_('./square'),
    hexagonMaze = _dereq_('./hexagon'),
    triangleMaze = _dereq_('./triangle'),
    circleMaze = _dereq_('./circle');

var createMaze = function createMaze(spec) {
    console.warn("@mitchallen/maze-generator: .create is deprecated. Use .Square instead.");
    return squareMaze(spec);
};

module.exports = {
    create: createMaze,
    Square: squareMaze,
    Hexagon: hexagonMaze,
    Triangle: triangleMaze,
    Circle: circleMaze
};

},{"./circle":3,"./hexagon":4,"./square":6,"./triangle":7,"@mitchallen/connection-grid":8}],6:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/maze-generator/../square
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var connectionGridFactory = _dereq_("@mitchallen/connection-grid"),
    baseGrid = _dereq_("./base");

module.exports = function (spec) {

    spec = spec || {};

    var _x = spec.x || 0;
    var _y = spec.y || 0;

    var _gridSpec = {
        x: _x,
        y: _y
    };

    var _connectionGrid = connectionGridFactory.Square(_gridSpec);
    if (!_connectionGrid) {
        return null;
    }

    var obj = baseGrid({
        grid: _connectionGrid
    });

    return Object.assign(_connectionGrid, {
        printBorder: function printBorder() {
            var row = "";
            var lim = _x * 2;
            for (var i = 0; i < lim; i++) {
                row += i === 0 ? " " : "_";
            }
            console.log(row);
        },
        printBoard: function printBoard() {
            console.log("SQUARE MAZE: %d, %d", _x, _y);
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

},{"./base":2,"@mitchallen/connection-grid":8}],7:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/maze-generator/../triangle
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var connectionGridFactory = _dereq_("@mitchallen/connection-grid"),
    baseGrid = _dereq_("./base"),
    ascii = _dereq_("./ascii-canvas");

module.exports = function (spec) {

    spec = spec || {};

    var _x = spec.x || 0;
    var _y = spec.y || 0;

    var _gridSpec = {
        x: _x,
        y: _y
    };

    var _connectionGrid = connectionGridFactory.Triangle(_gridSpec);
    if (!_connectionGrid) {
        return null;
    }

    var obj = baseGrid({
        grid: _connectionGrid
    });

    return Object.assign(_connectionGrid, {

        printBorder: function printBorder() {
            var row = "";
            var lim = _x * 2;
            for (var i = 0; i < lim; i++) {
                row += i === 0 ? " " : "_";
            }
            console.log(row);
        },

        printBoard: function printBoard() {
            console.log("TRIANGLE MAZE: %d, %d", _x, _y);
            var dirMap = this.dirMap;
            var canvas = ascii.Canvas({ columns: _x * 3, rows: _y * 3 });

            var UP = 0x01,
                DOWN = 0x02;

            for (var y = 0; y < _y; y++) {
                for (var x = 0; x < _x; x++) {

                    //     __
                    //   /\  /\
                    //  /__\/__\
                    //  \  /\  /
                    //   \/__\/

                    var tDir = (x + y) % 2 === 0 ? UP : DOWN;

                    var cell = this.get(x, y);

                    var px = x * 2;
                    var py = y * 2 + 1;

                    if (cell !== 0) {

                        if (tDir == UP) {

                            //   /\  
                            //  /__\

                            // West Wall 
                            if (!this.connects(x, y, "W")) {
                                canvas.set(px + 1, py, "/");
                                canvas.set(px, py + 1, "/");
                            }
                            // East Wall
                            if (!this.connects(x, y, "E")) {
                                canvas.set(px + 3, py + 1, "\\");
                                canvas.set(px + 2, py, "\\");
                            }
                            // South Wall
                            if (!this.connects(x, y, "S")) {
                                canvas.set(px + 1, py + 1, "_");
                                canvas.set(px + 2, py + 1, "_");
                            }
                        } else {

                            //  __
                            // \  /
                            //  \/

                            // North Wall Border (only draw for first row)
                            if (y === 0) {
                                canvas.set(px, py - 1, "_");
                                canvas.set(px + 1, py - 1, "_");
                                canvas.set(px + 2, py - 1, "_");
                                canvas.set(px + 3, py - 1, "_");
                            }

                            // West Wall (only draw for first column)
                            if (y % 2 !== 0 && x === 0) {
                                // console.log("x: %d, y: %d", x, y);
                                canvas.set(px, py, "\\");
                                canvas.set(px + 1, py + 1, "\\");
                            }

                            // East Wall Border (only draw at end)
                            if (x === _x - 1) {
                                // console.log("x: %d, y: %d", x, y);
                                canvas.set(px + 3, py, "/");
                                canvas.set(px + 2, py + 1, "/");
                            }
                        }
                    }
                }
            }

            canvas.print();
        }
    });
};

},{"./ascii-canvas":1,"./base":2,"@mitchallen/connection-grid":8}],8:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.MitchAllen || (g.MitchAllen = {})).ConnectionGrid = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/connection-grid/lib/base.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var shuffleFactory = _dereq_("@mitchallen/shuffle");

module.exports = function (spec) {

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

},{"@mitchallen/shuffle":8}],2:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/connection-grid/lib/circle.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var gridFactory = _dereq_("@mitchallen/grid"),
    baseGrid = _dereq_("./base");

module.exports = function (spec) {

    spec = spec || {};
    var _rings = spec.rings || 0;

    var _grid = gridFactory.Circle({
        rings: _rings
    });

    if (!_grid) {
        return null;
    }

    _grid.fill(0);

    var _dirMap = {
        "CCW": 0x010, // Counter-Clockwise 
        "CW": 0x020, // Clockwise
        "A": 0x040, // Away from Center (1:1)
        "T": 0x080, // Toward Center (1:1)
        "A0": 0x100, // Away 0 (2:1)
        "T0": 0x200, // Toward 0 (2:1)
        "A1": 0x400, // Away 1 
        "T1": 0x800 // Toward
    };

    var _oppositeMap = {
        "CCW": "CW",
        "CW": "CCW",
        "A": "T",
        "T": "A",
        "A0": "T0",
        "T0": "A0",
        "A1": "T1",
        "T1": "A1"
    };

    var obj = baseGrid({
        grid: _grid,
        dirMap: _dirMap,
        oppositeMap: _oppositeMap
    });

    Object.assign(obj, {
        getNeighborDirs: function getNeighborDirs(ring, pos) {
            // Classic ignores x and y, but other derived classes may not
            // return [ "N", "S", "E", "W" ];

            if (ring === 0 && pos === 0) {
                // one neighbor, away from center.
                // center may be expanded to have more than one as an option
                return ["A0"];
            }

            if (ring === 1 && pos !== 0) {
                // Ring 1 - only let 0 connect to center (for now)
                return ["CCW", "CW", "A0", "A1"];
            }

            var aSize = this.ringSize(ring + 1); // 0 means current ring is outer
            var rSize = this.ringSize(ring);
            var tSize = this.ringSize(ring - 1);

            if (rSize === tSize) {
                // | * |
                // | T |
                if (aSize === 0) {
                    // Current ring is outer ring
                    // | CCW | * | CW |
                    //       | T |
                    return ["CCW", "CW", "T"];
                }
                if (aSize > rSize) {
                    // |     | A0 | A1 |
                    // | CCW |    *    | CW |
                    //       |    T    |
                    return ["CCW", "CW", "A0", "A1", "T"];
                }
                //       | A |
                // | CCW | * | CW |
                //       | T |
                return ["CCW", "CW", "A", "T"];
            }
            // | *? | *? |
            // | T0 | T1 |  
            if (pos % 2 === 0) {
                // | * |  |
                // | T0   |
                if (aSize === 0) {
                    // | CCW | * | CW |
                    //       | T0     |
                    return ["CCW", "CW", "T0"];
                }
                if (aSize > rSize) {
                    // |     | A0 | A1 |
                    // | CCW |    *    | CW |
                    //       | T0           |
                    return ["CCW", "CW", "A0", "A1", "T0"];
                }
                // |     | A  |
                // | CCW | *  | CW |
                //       | T0      |
                return ["CCW", "CW", "A", "T0"];
            }

            // |   | *  |
            // |     T1 |
            if (aSize === 0) {
                // | CCW | * | CW |
                // |      T1 |
                return ["CCW", "CW", "T1"];
            }
            if (aSize > rSize) {
                // |     | A0 | A1 |
                // | CCW |    *    | CW |
                // |          T1   |
                return ["CCW", "CW", "A0", "A1", "T1"];
            }
            // |     | A  |
            // | CCW | *  | CW |
            // |       T1 |
            return ["CCW", "CW", "A", "T1"];
        },
        getNeighbor: function getNeighbor(ring, pos, dir) {
            if (!this.isCell(ring, pos)) {
                return null;
            }
            // dir must be string and in dirmap
            if (!this.isDir(dir)) {
                return null;
            }

            var ringSize = this.ringSize(ring);
            // nr = 0, // neighbor ring
            // np = 0; // neighbor position

            var NEIGHBOR_MAP = {
                "CCW": { x: ring, y: pos === 0 ? ringSize - 1 : pos - 1 },
                "CW": { x: ring, y: (pos + 1) % ringSize },
                "A": { x: ring + 1, y: pos },
                "A0": { x: ring + 1, y: pos * 2 },
                "A1": { x: ring + 1, y: pos * 2 + 1 },
                "T": { x: ring - 1, y: pos },
                "T0": { x: ring - 1, y: pos / 2 },
                "T1": { x: ring - 1, y: (pos - 1) / 2 }
            };

            var nc = NEIGHBOR_MAP[dir];

            if (!nc) {
                return null;
            }

            if (!this.isCell(nc.x, nc.y)) {
                return null;
            }

            return nc;
        }
    });

    return obj;
};

},{"./base":1,"@mitchallen/grid":7}],3:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/connection-grid/lib/hexagon.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var gridFactory = _dereq_("@mitchallen/grid"),
    baseGrid = _dereq_("./base");

module.exports = function (spec) {

    spec = spec || {};
    var _x = spec.x || 0;
    var _y = spec.y || 0;

    var _grid = gridFactory.Hexagon({
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
        "W": 0x080,
        "NW": 0x100,
        "NE": 0x200,
        "SW": 0x400,
        "SE": 0x800 };

    var _oppositeMap = {
        "N": "S", "S": "N", "E": "W", "W": "E",
        "NE": "SW", "NW": "SE", "SE": "NW", "SW": "NE"
    };

    var obj = baseGrid({
        grid: _grid,
        dirMap: _dirMap,
        oppositeMap: _oppositeMap
    });

    Object.assign(obj, {
        getNeighborDirs: function getNeighborDirs(x, y) {
            // Classic ignores x and y, but other derived classes may not
            // return [ "N", "S", "E", "W" ];
            if (x % 2 === 0) {
                return ["N", "S", "E", "W", "NW", "NE"];
            }
            return ["N", "S", "E", "W", "SW", "SE"];
        },
        getNeighbor: function getNeighbor(x, y, dir) {
            if (!this.isCell(x, y)) {
                return null;
            }
            // dir must be string and in dirmap
            if (!this.isDir(dir)) {
                return null;
            }
            var _DX = {
                "E": 1, "NE": 1, "SE": 1,
                "W": -1, "NW": -1, "SW": -1,
                "N": 0, "S": 0
            };
            var _DY = {
                "S": 1, "SE": 1, "SW": 1,
                "N": -1, "NE": -1, "NW": -1,
                "E": 0, "W": 0
            };
            var nx = x + _DX[dir];
            var ny = y + _DY[dir];
            if (!this.isCell(nx, ny)) {
                return null;
            }
            return { x: nx, y: ny };
        }
    });

    return obj;
};

},{"./base":1,"@mitchallen/grid":7}],4:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/connection-grid
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var gridFactory = _dereq_("@mitchallen/grid"),
    baseGrid = _dereq_('./base'),
    squareGrid = _dereq_('./square'),
    hexagonGrid = _dereq_('./hexagon'),
    circleGrid = _dereq_('./circle'),
    triangleGrid = _dereq_('./triangle');

var createGrid = function createGrid(spec) {
    console.warn("@mitchallen/connection-grid: .create is deprecated. Use .Square instead.");
    return squareGrid(spec);
};

module.exports = {
    create: createGrid,
    Square: squareGrid,
    Hexagon: hexagonGrid,
    Circle: circleGrid,
    Triangle: triangleGrid
};

},{"./base":1,"./circle":2,"./hexagon":3,"./square":5,"./triangle":6,"@mitchallen/grid":7}],5:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/connection-grid/lib/square.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var gridFactory = _dereq_("@mitchallen/grid"),
    baseGrid = _dereq_("./base");

module.exports = function (spec) {

    spec = spec || {};
    var _x = spec.x || 0;
    var _y = spec.y || 0;

    var _grid = gridFactory.Square({
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

},{"./base":1,"@mitchallen/grid":7}],6:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/connection-grid/lib/triangle.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var gridFactory = _dereq_("@mitchallen/grid"),
    baseGrid = _dereq_("./base");

module.exports = function (spec) {

    spec = spec || {};
    var _x = spec.x || 0;
    var _y = spec.y || 0;

    var _grid = gridFactory.Square({
        x: _x,
        y: _y
    });

    if (!_grid) {
        return null;
    }

    _grid.fill(0);

    var UP = 0x01,
        DOWN = 0x02;

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

            var tDir = (x + y) % 2 === 0 ? UP : DOWN;
            /*
                list the vertical direction twice. Otherwise the horizontal direction (E/W)
                will be selected more often (66% of the time), resulting in mazes with a
                horizontal bias.
            */
            var vertical = tDir === DOWN ? "N" : "S";

            // return [ vertical, vertical, "E", "W ];
            return [vertical, "E", "W"];
        }
    });

    return obj;
};

},{"./base":1,"@mitchallen/grid":7}],7:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.MitchAllen || (g.MitchAllen = {})).Grid = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/grid/../base.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

module.exports = function (spec) {

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

},{}],2:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/grid/../square.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var baseGrid = _dereq_('./base');

module.exports = function (spec) {

    spec = spec || {};

    var _rings = spec.rings || 0;

    _rings = Math.max(_rings, 0);

    var obj = baseGrid({ rows: _rings });

    // prepare grid

    // Single cell on row 0.
    obj.set(0, 0, 0);

    // rings are rows
    var rowHeight = 1.0 / _rings;

    for (var i = 1; i < _rings; i++) {
        // console.log("row: %d", i );
        var radius = i / _rings;
        // console.log(" ... row: %d, radius: %d", i, radius );
        var circumference = 2 * Math.PI * radius;
        // console.log(" ... circumference:", circumference );
        var previousCount = obj.rowSize(i - 1);
        // console.log(" ... previousCount:", previousCount );
        var estimatedCellWidth = circumference / previousCount;
        // console.log(" ... estimatedCellWidth:", estimatedCellWidth );
        var ratio = Math.round(estimatedCellWidth / rowHeight);
        // console.log(" ... ratio:", ratio );
        var cells = previousCount * ratio;
        // console.log(" ... cells:", cells );
        for (var j = 0; j < cells; j++) {
            // _array[i].push(0);
            obj.set(i, j, 0);
        }
        // console.log(_array[i]);
    }

    Object.defineProperties(obj, {
        "rings": {
            writeable: false,
            value: _rings,
            enumerable: true
        }
    });

    return Object.assign(obj, {
        ringSize: function ringSize(ring) {
            // rings equal rows in base class
            return this.rowSize(ring);
        }
    });
};

},{"./base":1}],3:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/grid
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var baseGrid = _dereq_('./base'),
    squareGrid = _dereq_('./square'),
    circleGrid = _dereq_('./circle');

var createGrid = function createGrid(spec) {
    console.warn("@mitchallen/grid: .create is deprecated. Use .Square instead.");
    return squareGrid(spec);
};

module.exports = {
    create: createGrid,
    Square: squareGrid,
    Circle: circleGrid,
    // For future expansion (mapped to square for now)
    Hexagon: squareGrid,
    Triangle: squareGrid
};

},{"./base":1,"./circle":2,"./square":4}],4:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/grid/../square.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var baseGrid = _dereq_('./base');

module.exports = function (spec) {

    spec = spec || {};

    var _x = spec.x || 0;
    var _y = spec.y || 0;

    _x = Math.max(_x, 0);
    _y = Math.max(_y, 0);

    var obj = baseGrid({ rows: _x });

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

},{"./base":1}]},{},[3])(3)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(_dereq_,module,exports){
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
},{}]},{},[4])(4)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.MitchAllen || (g.MitchAllen = {})).Grid = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/grid/../base.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

module.exports = function (spec) {

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

},{}],2:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/grid/../square.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var baseGrid = _dereq_('./base');

module.exports = function (spec) {

    spec = spec || {};

    var _rings = spec.rings || 0;

    _rings = Math.max(_rings, 0);

    var obj = baseGrid({ rows: _rings });

    // prepare grid

    // Single cell on row 0.
    obj.set(0, 0, 0);

    // rings are rows
    var rowHeight = 1.0 / _rings;

    for (var i = 1; i < _rings; i++) {
        // console.log("row: %d", i );
        var radius = i / _rings;
        // console.log(" ... row: %d, radius: %d", i, radius );
        var circumference = 2 * Math.PI * radius;
        // console.log(" ... circumference:", circumference );
        var previousCount = obj.rowSize(i - 1);
        // console.log(" ... previousCount:", previousCount );
        var estimatedCellWidth = circumference / previousCount;
        // console.log(" ... estimatedCellWidth:", estimatedCellWidth );
        var ratio = Math.round(estimatedCellWidth / rowHeight);
        // console.log(" ... ratio:", ratio );
        var cells = previousCount * ratio;
        // console.log(" ... cells:", cells );
        for (var j = 0; j < cells; j++) {
            // _array[i].push(0);
            obj.set(i, j, 0);
        }
        // console.log(_array[i]);
    }

    Object.defineProperties(obj, {
        "rings": {
            writeable: false,
            value: _rings,
            enumerable: true
        }
    });

    return Object.assign(obj, {
        ringSize: function ringSize(ring) {
            // rings equal rows in base class
            return this.rowSize(ring);
        }
    });
};

},{"./base":1}],3:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/grid
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var baseGrid = _dereq_('./base'),
    squareGrid = _dereq_('./square'),
    circleGrid = _dereq_('./circle');

var createGrid = function createGrid(spec) {
    console.warn("@mitchallen/grid: .create is deprecated. Use .Square instead.");
    return squareGrid(spec);
};

module.exports = {
    create: createGrid,
    Square: squareGrid,
    Circle: circleGrid,
    // For future expansion (mapped to square for now)
    Hexagon: squareGrid,
    Triangle: squareGrid
};

},{"./base":1,"./circle":2,"./square":4}],4:[function(_dereq_,module,exports){
/**
    Module: @mitchallen/grid/../square.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

var baseGrid = _dereq_('./base');

module.exports = function (spec) {

    spec = spec || {};

    var _x = spec.x || 0;
    var _y = spec.y || 0;

    _x = Math.max(_x, 0);
    _y = Math.max(_y, 0);

    var obj = baseGrid({ rows: _x });

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

},{"./base":1}]},{},[3])(3)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[5])(5)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
