const { Router } = require('express');
const { methods, addRoute, addOwnerRoute, addStaticRoute } = require('./util');
const { owner, shop, item, comment } = require('../controllers');
const { file: fileService } = require('../services');

const router = Router();
// Account operations
addRoute(router, methods.POST, '/login', owner.login);
addRoute(router, methods.POST, '/register', owner.register);
addOwnerRoute(router, methods.GET, '/info', owner.info);
addOwnerRoute(router, methods.PUT, '/password', owner.changePassword);
addOwnerRoute(router, methods.PUT, '/info', owner.update);
addOwnerRoute(router, methods.DELETE, '/info', owner.remove);
addOwnerRoute(router, methods.POST, '/image', owner.uploadPic);
addStaticRoute(router, '/image', fileService.dirs.OWNER_PROFILE_PICTURES);
addOwnerRoute(router, methods.DELETE, '/image', owner.removePicture);
// Shop operations
addOwnerRoute(router, methods.GET, '/shop', shop.get);
addOwnerRoute(router, methods.POST, '/shop', shop.createShop);
addOwnerRoute(router, methods.PUT, '/shop', shop.updateShop);
addOwnerRoute(router, methods.DELETE, '/shop', shop.deleteShop);
addOwnerRoute(router, methods.GET, '/shops', shop.getShops);
addOwnerRoute(router, methods.POST, '/shop/subscribe', shop.subscribe);
addOwnerRoute(router, methods.DELETE, '/shop/unsubscribe', shop.unsubscribe);
addOwnerRoute(router, methods.POST, '/shop/image', shop.uploadPicture);
addStaticRoute(router, '/shop/image', fileService.dirs.SHOP_PICTURES);
addOwnerRoute(router, methods.DELETE, '/shop/image', shop.removePicture);

addOwnerRoute(router, methods.GET, '/shop/subscriptions', shop.getSubscriptions);
addOwnerRoute(router, methods.GET, '/comments/getAll', comment.getAll);
// Inventory operations
addOwnerRoute(router, methods.POST, '/inventory', item.addInventory);
addOwnerRoute(router, methods.GET, '/inventory', item.getInventory);
addOwnerRoute(router, methods.PUT, '/item', item.updateItem);
addOwnerRoute(router, methods.GET, '/item', item.getItem);
addOwnerRoute(router, methods.GET, '/items', item.getItemList);
addOwnerRoute(router, methods.POST, '/item', item.addItem);
addOwnerRoute(router, methods.DELETE, '/item', item.deleteItem);
addOwnerRoute(router, methods.POST, '/item/image', item.uploadPicture);
addStaticRoute(router, '/item/image', fileService.dirs.ITEM_PICTURES);
addOwnerRoute(router, methods.DELETE, '/item/image', item.removePicture);

module.exports = router;
