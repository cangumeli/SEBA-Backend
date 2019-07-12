const mongoose = require('mongoose');

const subscription = new mongoose.Schema({
  shopId: { type: mongoose.SchemaTypes.ObjectId, required: true, index: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['businessPlan', 'sponsoredItem'], required: true },
  price: { type: Number, required: true },
});

module.exports = mongoose.model('Subscription', subscription);
