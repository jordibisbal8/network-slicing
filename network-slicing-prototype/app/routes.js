// ```
// routes.js
// (c) 2015 David Newman
// david.r.niciforovic@gmail.com
// routes.js may be freely distributed under the MIT license
// ```

import jwt from 'jsonwebtoken'; // used to create, sign, and verify tokens


// ## Node API Routes
// Load user model

// Load our API routes for user authentication
import authRoutes from './routes/_authentication.router.js';

// Load our API routes

//import bmRoutes from './routes/_bm.router.js';


export default (app, router, passport) => {

  // ### Express Middlware to use for all requests
  router.use((req, res, next) => {
    console.log('I sense a disturbance in the force...'); // DEBUG
    // Make sure we go to the next routes and don't stop here...
    next();
  });

  // Define a middleware function to be used for all secured routes

  let auth = function validateJwt(req, res, next) {
    req.jwt = jwt.verify(req.body.jwt, 'super secret', (err,decoded) => {
      if (err)
        res.json ({ success: false, message: 'Failed to authenticate token.'});
      else {
        req.user = decoded.user;
        console.log(req.user); //used for further requests
        next();
      }
    });
  };


  // #### RESTful API Routes

  // Pass in our Express app and Router

  authRoutes(app, router, auth);


	// All of our routes will be prefixed with /api
	app.use('/api', router);

};
