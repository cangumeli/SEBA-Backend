const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema({
    user: {type: mongoose.SchemaTypes.ObjectId, unique: true},
    items: [{type: mongoose.SchemaTypes.ObjectId}]
});

module.exports = mongoose.model('ShoppingList', shoppingListSchema);