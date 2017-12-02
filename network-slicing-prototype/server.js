// =======================
// get the packages we need ============
// =======================
const express     = require('express');
const morgan     = require('morgan');
const bodyParser  = require('body-parser');
const jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
const cuid = require('cuid'); //random string
const ethUtil = require('ethereumjs-util');
const UserContract = require('./app/contracts/user_contract.js');
let config = require('./app/config'); // get our config file


//const cuid = require('cuid');
//const cors = require('cors');

// =======================
// configuration =========
// =======================

const port = config.port || 8080;
//const secret = config.secret || "my super secret passcode"; //used when we create and verify JSON Web Tokens

const userContract = '0xd18197e6b8ee761c6824799c3060e8edac066cce';
// TODO BETTER WAY TO TAKE VALUE

const app = express();

// WARNING: CHANGE IN PRODUCTION
/*app.use(cors({
  origin: 'http://localhost:8080'
}))*/
app.use(bodyParser.json({ type: () => true }));
// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// middleware ================
// =======================

function validateJwt(req, res, next) {
  req.jwt = jwt.verify(req.body.jwt, 'super secret', (err,decoded) => {
    if (err)
      res.json ({ success: false, message: 'Failed to authenticate token.'});
    else {
      req.user = decoded.user;
      console.log(req.user); //used for further requests
      next();
    }
  });
}

// =======================
// routes ================
// =======================
// basic route
app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// API ROUTES -------------------
let apiRoutes = express.Router();


app.post('/authenticate', (req, res) => {
  // All Ethereum addresses are 42 characters long
  if(!req.body.address || req.body.address.length !== 42) {
    res.sendStatus(400);
    return;
  }
  console.log(req.body);
  const signature = ethUtil.fromRpcSig(sig);
  const prefix = new Buffer("\x19Ethereum Signed Message:\n");
  const prefixedMsg = ethUtil.sha3(
    Buffer.concat([prefix, new Buffer(String(req.body.message.length)), req.body.message])
  );

  const pubKey  = ethUtil.ecrecover(prefixedMsg, signature.v, signature.r, signature.s);
  const addrBuf = ethUtil.pubToAddress(pubKey);
  const addr    = ethUtil.bufferToHex(addrBuf);
  console.log(addr);
  if(addr !== req.body.address) {
    console.log('signature check FAILED');
  } else {
    console.log('signature check success');
  }

  // Determine if it is the same address as 'owner'
  if (addr === req.body.address) {
    // If the signature matches the owner supplied, create a
    // JSON web token for the owner that expires in 24 hours.
    let token = jwt.sign({user: req.body.address}, 'super secret',  { expiresIn: '1d' });
    res.json({token: token});
  } else {
    // If the signature doesn’t match, error out
    res.send(500, { err: 'Signature did not match.'});
  }
});

app.post('/apiTest', validateJwt, (req, res) => {
  if(req.jwt.access !== 'full') {
    res.sendStatus(401); //Unauthorized
    return;
  }

  res.json({
    message: 'It works!'
  });
});

// =======================
// start the server ======
// =======================

app.listen(port);
console.log('Magic happens at http://localhost:' + port);
