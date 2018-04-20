// ```
// routes.js
// (c) 2015 David Newman
// david.r.niciforovic@gmail.com
// routes.js may be freely distributed under the MIT license
// ```

import jwt from 'jsonwebtoken'; // used to create, sign, and verify tokens
import config from '../config/config';

// Load our API routes for user authentication
import authRoutes from './routes/_auth.router.js';

// Load our API routes
import userRoutes from './routes/_users.router';
import virtualNetworkRoutes from './routes/_virtual-network.router';
import evaluationNetworkRoutes from './routes/_evaluation.router';


export default (app, router, passport) => {

  // ### Express Middlware to use for all requests
  router.use((req, res, next) => {
    console.log('I sense a disturbance in the force...'); // DEBUG
    // Make sure we go to the next routes and don't stop here...
    next();
  });

  // Define a middleware function that validates the token.
  let auth = function validateJwt(req, res, next) {
    let token = req.header('Authorization');
    jwt.verify(token, config.secret, (err,decoded) => {
      if (err){
        if (err.name === 'TokenExpiredError')
          return res.send(401, err);
        res.send(500, err);
      }
      else {
        req.user = decoded.user;
        next();
      }
    });
  };


  // Pass in our Express app and Router

  authRoutes(app, router, auth);

  // #### RESTful API Routes

  userRoutes(app, router, auth);

  virtualNetworkRoutes(app, router, auth);

  evaluationNetworkRoutes(app, router, auth);


	// All of our routes will be prefixed with /api
	app.use('/api', router);
};
