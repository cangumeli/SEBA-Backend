const { Router } = require("express");
const { methods, addRoute, addOwnerRoute } = require("./util");
const { owner, shop, item, comment } = require("../controllers");

const router = Router();
// Account operations
addRoute(router, methods.POST, "/login", owner.login);
addRoute(router, methods.POST, "/register", owner.register);
addOwnerRoute(router, methods.GET, "/info", owner.info);
addOwnerRoute(router, methods.PUT, "/password", owner.changePassword);
addOwnerRoute(router, methods.PUT, "/info", owner.update);
addOwnerRoute(router, methods.DELETE, "/info", owner.remove);
addOwnerRoute(router, methods.POST, "/image", owner.uploadPic);
// Shop operations
addOwnerRoute(router, methods.POST, "/shop", shop.createShop);
addOwnerRoute(router, methods.PUT, "/shop", shop.updateShop);
addOwnerRoute(router, methods.GET, "/shops", shop.getShops);
addOwnerRoute(router, methods.GET, "/comments/getAll", comment.getAll);
// Inventory operations
addOwnerRoute(router, methods.POST, "/inventory", item.addInventory);
addOwnerRoute(router, methods.GET, "/inventory", item.getInventory);
addOwnerRoute(router, methods.PUT, "/item", item.updateItem);
addOwnerRoute(router, methods.POST, "/item", item.addItem);
addOwnerRoute(router, methods.DELETE, "/item", item.deleteItem);

module.exports = router;
