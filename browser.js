// Browser distribution of the A-Frame component.
(function () {
  if (typeof AFRAME === 'undefined') {
    console.error('Component attempted to register before AFRAME was available.');
    return;
  }

  var maze = require('./modules/index');

  console.log( maze.Component.name() + ": " + maze.Component.version() );

  // Register all components here.
  var components = {
    "maze": maze.Component
  };

  var primitives = {
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