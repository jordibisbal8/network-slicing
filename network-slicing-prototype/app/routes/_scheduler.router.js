import timeout from 'connect-timeout';
import web3 from '../controllers/web3';

export default (app, router, auth) => {

  router.route('/scheduler')

    .get((req,res) => {
      timeout(10);
      const timeoutObj = setTimeout(() => {
        console.log('timeout beyond time');
      }, 60000);
      setTimeout(endOfCommitTime, 120000, 'funky');
      res.json('si');
    });


}

function endOfCommitTime() {
  console.log("--do the call", );
}
