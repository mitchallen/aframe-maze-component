// Browser distribution of the A-Frame component.
(function () {
  if (typeof AFRAME === 'undefined') {
    console.error('Component attempted to register before AFRAME was available.');
    return;
  }

  var maze = require('./modules/index');

  // Register all components here.
  var components = {
    "maze": maze.Component
  };

  var primitives = {
    "a-maze": maze.Primitive
  };

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