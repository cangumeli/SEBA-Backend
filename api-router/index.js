const bodyParser = require('body-parser');
const { Router } = require('express');

const router = Router();
router.use(bodyParser.json());
router.use('/customer', require('./customer'));
router.use('/owner', require('./owner'));

module.exports = router;