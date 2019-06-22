const { Router } = require('express');
const { customer } = require('../controllers');
const { addRoute, addAuthRoute, methods } = require('./util');

const router = Router();
addRoute(router, methods.POST, '/login', customer.login);
addRoute(router, methods.POST, '/register', customer.register);
addAuthRoute(router, methods.GET, '/info', customer.info);

module.exports = router;