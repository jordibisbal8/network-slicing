// Require babel hook included to load all subsequent files required by node
// with the extensions .es6, .es, .jsx, .js and transpile them with babel.
// This will also automatically require the polyfill
require("babel-register");

//Load server configurations
let app = require('./server.conf');
