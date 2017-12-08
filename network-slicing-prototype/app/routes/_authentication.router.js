import jwt from 'jsonwebtoken'; // used to create, sign, and verify tokens
import ethUtil from 'ethereumjs-util';
import UserContract from '../contracts/user_contract.js';


export default (app, router, auth) => {

  router.route('/authenticate')

    .get((req,res) => {
      res.send('Hello! The API is at http://localhost:8000' + '/api');
    })

    .post((req,res) => {
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
    })
}
