export default (app, router, auth) => {

  router.route('/service')

    // Method that registers a service
    .post(auth, (req, res) => {
    });

  router.route('/user/:idUser')

  // Get all the new or open services were the user is a Member
    .get(auth, (req,res) => {
    })

}
