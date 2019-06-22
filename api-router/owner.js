const { Router } = require('express');
const { methods, addRoute, addAuthRoute } = require('./util');
const { owner } = require('../controllers');

const router = Router();
addRoute(router, methods.POST, '/login', owner.login);
addRoute(router, methods.POST, '/register', owner.register);
addAuthRoute(router, methods.GET, '/info', owner.info);

module.exports = router;