const { Router } = require('express');
const { customer, item } = require('../controllers');
const { addRoute, addCustomerRoute, methods } = require('./util');

const router = Router();
// Account
addRoute(router, methods.POST, '/login', customer.login);
addRoute(router, methods.POST, '/register', customer.register);
addCustomerRoute(router, methods.GET, '/info', customer.info);
addCustomerRoute(router, methods.PUT, '/password', customer.changePassword);
// Inventory
addRoute(router, methods.GET, '/inventory', item.getInventory);
addRoute(router, methods.GET, '/item', item.getItem);

module.exports = router;