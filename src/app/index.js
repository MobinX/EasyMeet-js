(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('react'), require('react-dom'), require('process')) :
  typeof define === 'function' && define.amd ? define(['react', 'react-dom', 'process'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.React, global.ReactDOM, global.process));
})(this, (function (React, require$$0, process) { 'use strict';

  var client = {};

  var m = require$$0;
  {
    var i = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    client.createRoot = function (c, o) {
      i.usingClientEntryPoint = true;
      try {
        return m.createRoot(c, o);
      } finally {
        i.usingClientEntryPoint = false;
      }
    };
    client.hydrateRoot = function (c, h, o) {
      i.usingClientEntryPoint = true;
      try {
        return m.hydrateRoot(c, h, o);
      } finally {
        i.usingClientEntryPoint = false;
      }
    };
  }

  function App() {
      return (React.createElement("div", { className: "App" },
          React.createElement("h1", null, "EasyMeet")));
  }

  window.process = process; // Add process to the global object
  // console.log(""development"", "development");
  // Create a root element for your React application
  var root = client.createRoot(document.getElementById('root'));
  // Render the App component into the root element
  root.render(React.createElement(App, null));

}));
//# sourceMappingURL=index.js.map
