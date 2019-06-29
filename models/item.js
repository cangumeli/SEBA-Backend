const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    ownerId: {type: mongoose.SchemaTypes.ObjectId, required: true, index: true},
    shopId: {type: mongoose.SchemaTypes.ObjectId, required: true, index: true},
    name: {type: String, required: true},
    category: {type: String, required: true, index: true},
    tag: {type: String, required: true},
    price: {type: Number, required: true},
    description: String
});

module.exports = mongoose.model('Item', itemSchema);