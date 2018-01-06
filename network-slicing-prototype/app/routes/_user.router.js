import User from '../contracts/user_contract'
import web3 from '../controllers/web3';
export default (app, router, auth) => {

  router.route('/user')

    // Get all the users
    .get((req,res) => {
      User.deployed().then(contractInstance => {
        contractInstance.getAllUsers.call().then(addr => {
          res.json(addr);
        })
      })
    })
    // Method that registers an user
    .post((req, res) => {
      User.deployed().then(contractInstance => {
        contractInstance.insertUser(req.body.address, req.body.email, req.body.role,
          {from: req.body.address, gas: 1400000});
        // Event fired when the user is added
        contractInstance.LogNewUser().watch( (error,result) => {
          if (error) {
            console.log("-- error1", error);
            res.send(error);
          }
          else {
            console.log("-- result.args", result.args);
            res.sendStatus(200);
          }
        });
        contractInstance.LogErrors().watch( (error,result) => {
          res.status(405).send('User already exists in the Blockchain');
        })
      });
    });

  router.route('/user/InPs')
    // Get all Infrastructure Providers
    .get((req,res) => {
      User.deployed().then(contractInstance => {
        contractInstance.getAllUsersAndRoles.call().then(data => {
          let addrs = data[0];
          let roles = data[1];
          let returnAddrs = [];
          roles.forEach((role,index) => {
            if (web3.toUtf8(role) === 'infrastructureProvider')
              returnAddrs.push(addrs[index]);
          });
          res.json(returnAddrs);
        });
      })
    })
}
