var express = require('express'),
    router  = express.Router();

var usersCtrl = require('./controllers/users');
router.route('/user/:id').get(usersCtrl.getInfo);
router.route('/user/:id/info').get(usersCtrl.getUser);
router.route('/user/:id/update').get(usersCtrl.updateFriends);

module.exports = router;