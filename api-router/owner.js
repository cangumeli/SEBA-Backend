const { Router } = require('express');
const { methods, addRoute, addOwnerRoute } = require('./util');
const { owner, shop, item, comment } = require('../controllers');

const router = Router();
// Account operations
addRoute(router, methods.POST, '/login', owner.login);
addRoute(router, methods.POST, '/register', owner.register);
addOwnerRoute(router, methods.GET, '/info', owner.info);
// Shop operations
addOwnerRoute(router, methods.POST, '/shop', shop.createShop);
addOwnerRoute(router, methods.PUT, '/shop', shop.updateShop);
addOwnerRoute(router, methods.GET, '/shops', shop.getShops);
addOwnerRoute(router, methods.GET, '/comments/getAll', comment.getAll);
// Inventory operations
addOwnerRoute(router, methods.POST, '/inventory', item.addInventory);
addRoute(router, methods.GET, '/inventory', item.getInventory);

module.exports = router;