const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  shopId: { type: mongoose.SchemaTypes.ObjectId, required: true, index: true, ref: 'Shop' },
  name: { type: String, required: true },
  category: { type: String, required: true, index: true },
  tag: { type: String, required: true },
  price: { type: Number, required: true },
  material: { type: String },
  isSponsored: { type: Boolean },
  size: { type: String },
  detail: { type: String },
  images: [String],
  lastImageIndex: { type: Number },
  averageRating: Number,
  numComments: Number,
});

itemSchema.index({ name: 'text' });
itemSchema.statics.shopIdPopulateFields = function() {
  return { _id: 1, location: 1, locationDesc: 1, title: 1 };
};

module.exports = mongoose.model('Item', itemSchema);
