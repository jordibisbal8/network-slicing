// ```
// server.conf.js
// (c) 2016 David Newman
// david.r.niciforovic@gmail.com
// server.conf.js may be freely distributed under the MIT license
// ```

// *server.conf.js*

//  This is the file where we will:
//  - Configure our application
//  - Define routes for our RESTful API
//  - Define routes for our frontend Angular application
//  - Set the app to listen on a port so we can view it in our browser


// # Modules

// Load Express
import express from 'express';
// Load Socket.io
import socketio from 'socket.io';
// Load Node http module
import http from 'http';
// Create our app with Express
let app = express();
// Create a Node server for our Express app
let server = http.createServer(app);
// Integrate Socket.io
let io = socketio.listen(server);
// Log requests to the console (Express 4)
import morgan from 'morgan';
// Pull information from HTML POST (express 4)
import bodyParser from 'body-parser';
// Simulate DELETE and PUT (Express 4)
import methodOverride from 'method-override';

import async from 'async';
import cors from 'cors';


// # Configuration

// Set the port for this app
let port = 3001;

app.use(morgan('dev'));

// Parse application/json
app.use(bodyParser.json());

// Parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Override with the X-HTTP-Method-Override header in the request. Simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

/*// Set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/dist'));*/

//WARNING: CHANGE IN PRODUCTION
app.use(cors({
  origin: 'http://localhost:8000'
}));

// ## Routes

// Get an instance of the express Router
let router = express.Router();

// Load our application API routes
// Pass in our express and express router instances
import routes from './app/routes';
routes(app,router);

// Error handler
//app.use(express.errorHandler({showStack: true, dumpExceptions: true}));
app.use(function(err, req, res, next) {
  console.log('error', err);
  res.send(err); // send a proper HTTP 500 message back to the client
});

// =======================
// start the server ======
// =======================

server.listen(port);
//app.listen(port);
console.log('Magic happens at http://localhost:' + port);

export {app,server};
