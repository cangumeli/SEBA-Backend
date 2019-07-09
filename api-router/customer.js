const { Router } = require("express");
const { customer, item, comment } = require("../controllers");
const { addRoute, addCustomerRoute, methods } = require("./util");

const router = Router();
// Account
addRoute(router, methods.POST, "/login", customer.login);
addRoute(router, methods.POST, "/register", customer.register);
addCustomerRoute(router, methods.GET, "/info", customer.info);
addCustomerRoute(router, methods.PUT, "/password", customer.changePassword);
addCustomerRoute(router, methods.PUT, "/info", customer.update);
addCustomerRoute(router, methods.DELETE, "/info", customer.remove);
// Inventory
addRoute(router, methods.GET, "/inventory", item.getInventory);
addRoute(router, methods.GET, "/item", item.getItem);
// Comment
addCustomerRoute(router, methods.POST, "/comment/create", comment.create);
addCustomerRoute(router, methods.GET, "/comments/getAll", comment.getAll);
addCustomerRoute(router, methods.PUT, "/comment/update", comment.update);
addCustomerRoute(
  router,
  methods.DELETE,
  "/comment/deleteComment",
  comment.deleteComment
);
addCustomerRoute(router, methods.PUT, "/comment/upvote", comment.upvote);
addCustomerRoute(router, methods.PUT, "/comment/downvote", comment.downvote);

module.exports = router;
