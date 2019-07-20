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

// Comment
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
addCustomerRoute(router, methods.POST, '/shopping-list/pdf', shoppingList.exportPDF);
addStaticRoute(router, '/shopping-list/pdf', fileService.dirs.PDF_FILES);
// Shop
addStaticRoute(router, '/shop/image', fileService.dirs.SHOP_PICTURES);

module.exports = router;
