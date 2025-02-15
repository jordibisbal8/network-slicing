import jwt from 'jsonwebtoken'; // used to create, sign, and verify tokens
import ethUtil from 'ethereumjs-util';
import config from '../../config/config'

export default (app, router, auth) => {

  router.route('/isAuthenticated')

    // Sends a new token with expiration time 1h later
    .get(auth, (req,res) => {
      let token = jwt.sign({user: req.user}, config.secret,  {expiresIn: '1h' });
      res.json({token});
    });

  router.route('/authenticate')

    // Performs the digital signature verification and if address matched, a token is created.
    .post((req,res) => {
      // All Ethereum addresses are 42 characters long
      if(!req.body.address || req.body.address.length !== 42) {
        res.sendStatus(400);
        return;
      }
      let message = new Buffer(req.body.message);
      let signature = ethUtil.fromRpcSig(req.body.signature);
      let prefix = new Buffer("\x19Ethereum Signed Message:\n");
      let prefixedMsg = ethUtil.sha3(
        Buffer.concat([prefix, new Buffer(String(message.length)), message])
      );
      let pubKey  = ethUtil.ecrecover(prefixedMsg, signature.v, signature.r, signature.s);
      let addrBuf = ethUtil.pubToAddress(pubKey);
      let addr    = ethUtil.bufferToHex(addrBuf);
      if (addr === req.body.address) {
        console.log('signature check SUCCEED');
        // JSON web token for the owner that expires in 1h
        let token = jwt.sign({user: req.body.address}, config.secret,  {expiresIn: '3h' });
        res.json({token: token});
      }
      else {
        console.log('signature check FAILED');
        res.send(500, { err: 'Signature did not match.'});
      }
    })
}
