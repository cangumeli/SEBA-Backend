module.exports = {
  Customer: require('./customer'),
  Owner: require('./owner'),
  Shop: require('./shop'),
  Item: require('./item'),
  Subscription: require('./subscription'),
  ...require('./comment'),
  ShoppingList: require('./shopping-list'),
};
