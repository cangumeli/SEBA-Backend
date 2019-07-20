const bodyParser = require('body-parser');
const { Router } = require('express');
const { addAuthRoute, addRoute, methods } = require('./util');
const { shop, item, comment } = require('../controllers');

const router = Router();
router.use(bodyParser.json());
addAuthRoute(router, methods.GET, '/user-type', { endpoint: ({ payload }) => payload });
addRoute(router, methods.GET, '/shop', shop.get);
// Inventory
addRoute(router, methods.GET, '/inventory', item.getInventory);
addRoute(router, methods.GET, '/item', item.getItem);
addRoute(router, methods.GET, '/items', item.getItemList);
addRoute(router, methods.GET, '/item/search', item.searchItems);
addRoute(router, methods.GET, '/comments', comment.getAll);
addRoute(router, methods.GET, '/rating', comment.getRating);
router.use('/customer', require('./customer'));
router.use('/owner', require('./owner'));

module.exports = router;
