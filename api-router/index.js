const bodyParser = require('body-parser');
const { Router } = require('express');
const { addAuthRoute, methods } = require('./util');

const router = Router();
router.use(bodyParser.json());
addAuthRoute(router, methods.GET, '/info', { endpoint: ({ payload }) => payload });
router.use('/customer', require('./customer'));
router.use('/owner', require('./owner'));

module.exports = router;
