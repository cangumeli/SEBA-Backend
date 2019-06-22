const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    shopId: {type: mongoose.SchemaTypes.ObjectId, required: true, index: true},
    name: {type: String, require: true},
    category: {type: String, required: true},
    tag: {type: String, required: true},
    price: {type: Number, required: true}
})

module.exports = mongoose.model('Item', itemSchema);