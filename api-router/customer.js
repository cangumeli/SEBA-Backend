const { Router } = require('express');
const { customer, item, comment} = require('../controllers');
const { addRoute, addCustomerRoute, methods } = require('./util');

const router = Router();
addRoute(router, methods.POST, '/login', customer.login);
addRoute(router, methods.POST, '/register', customer.register);
addCustomerRoute(router, methods.GET, '/info', customer.info);
// Inventory
addRoute(router, methods.GET, '/inventory', item.getInventory);
addRoute(router, methods.GET, '/item', item.getItem);
addCustomerRoute(router, methods.POST, '/comment/create', comment.create);
addCustomerRoute(router, methods.GET, '/comments/getAll', comment.getAll);
addCustomerRoute(router, methods.PUT, '/comment/update', comment.update);
addCustomerRoute(router, methods.DELETE, '/comment/deleteComment', comment.deleteComment);

module.exports = router;