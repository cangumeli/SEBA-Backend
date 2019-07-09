const { Router } = require('express');
const { customer, item } = require('../controllers');
const { addRoute, addCustomerRoute, methods } = require('./util');

const router = Router();
addRoute(router, methods.POST, '/login', customer.login);
addRoute(router, methods.POST, '/register', customer.register);
addCustomerRoute(router, methods.GET, '/info', customer.info);
// Inventory
addRoute(router, methods.GET, '/inventory', item.getInventory);

module.exports = router;