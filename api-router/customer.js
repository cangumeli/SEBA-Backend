const { Router } = require('express');
const { customer, item, comment, shoppingList, shop } = require('../controllers');
const { addRoute, addCustomerRoute, methods, addStaticRoute } = require('./util');
const { file: fileService } = require('../services');

const router = Router();
// Account
addRoute(router, methods.POST, '/login', customer.login);
addRoute(router, methods.POST, '/register', customer.register);
addCustomerRoute(router, methods.GET, '/info', customer.info);
addCustomerRoute(router, methods.GET, '/user', customer.getName);
addCustomerRoute(router, methods.GET, '/users', customer.getNameList);
addCustomerRoute(router, methods.PUT, '/password', customer.changePassword);
addCustomerRoute(router, methods.PUT, '/info', customer.update);
addCustomerRoute(router, methods.DELETE, '/info', customer.remove);
addCustomerRoute(router, methods.POST, '/image', customer.uploadPic);
addStaticRoute(router, '/image', fileService.dirs.CUSTOMER_PROFILE_PICTURES);
addCustomerRoute(router, methods.DELETE, '/image', customer.removePicture);
// Inventory
addRoute(router, methods.GET, '/inventory', item.getInventory);
addRoute(router, methods.GET, '/item', item.getItem);
addRoute(router, methods.GET, '/items', item.getItemList);
// Comment
addRoute(router, methods.GET, '/comments', comment.getAll);
addRoute(router, methods.GET, '/rating', comment.getRating);
addCustomerRoute(router, methods.GET, '/comment', comment.get);
addCustomerRoute(router, methods.POST, '/comment', comment.create);
addCustomerRoute(router, methods.PUT, '/comment', comment.update);
addCustomerRoute(router, methods.DELETE, '/comment', comment.deleteComment);
addCustomerRoute(router, methods.PUT, '/comment/upvote', comment.upvote);
addCustomerRoute(router, methods.PUT, '/comment/downvote', comment.downvote);
// Shopping list
addCustomerRoute(router, methods.GET, '/shopping-list', shoppingList.get);
addCustomerRoute(router, methods.POST, '/shopping-list/item', shoppingList.addItem);
addCustomerRoute(router, methods.DELETE, '/shopping-list/item', shoppingList.removeItem);
addCustomerRoute(router, methods.DELETE, '/shopping-list/items', shoppingList.removeAll);
// Shop
addStaticRoute(router, '/shop/image', fileService.dirs.SHOP_PICTURES);
addRoute(router, methods.GET, '/shop', shop.get);
module.exports = router;
