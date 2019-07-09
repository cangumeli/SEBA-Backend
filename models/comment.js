const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  date: { type: Date },
  upvote: [mongoose.SchemaTypes.ObjectId],
  downvote: [mongoose.SchemaTypes.ObjectId],
  userId: { type: mongoose.SchemaTypes.ObjectId, required: true }
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports.Comment = Comment;

module.exports.ShopComment = Comment.discriminator(
  "ShopComment",
  new mongoose.Schema({
    shopId: { type: mongoose.SchemaTypes.ObjectId, index: true }
  })
);

module.exports.ItemComment = Comment.discriminator(
  "ItemComment",
  new mongoose.Schema({
    itemId: { type: mongoose.SchemaTypes.ObjectId, index: true }
  })
);
