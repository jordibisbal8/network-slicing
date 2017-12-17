import User from '../contracts/user_contract'
import web3 from '../controllers/web3';
export default (app, router, auth) => {

  router.route('/service')

    // Method that registers a service
    .post((req, res) => {
    });

  router.route('/user/:idUser')

  // Get all the new or open services were the user is a Member
    .get((req,res) => {
    })

}
