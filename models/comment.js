const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {type: String, required: true},
    rating: {type: Number, min: 1, max:5, required: True},
    date: {type: Date},
    upvote: {type: Number, default: 0},
    downvote: {type: Number, default: 0},
    date: {type: Date},
    userId: {type: mongoose.SchemaTypes.ObjectId, required: True}
})

commentSchema.pre('save', doc=> {
    doc.date = new Date();
})

const Comment = mongoose.model('Comment', commentSchema);

module.exports.ShopComment = Comment.discriminator(
    'ShopComment',
    new mongoose.Schema({
        shopId: {type: mongoose.SchemaTypes.ObjectId, index: true}
    })
);

module.exports.ItemComment = Comment.discriminator(
    'ItemComment',
    new mongoose.Schema({
        itemId: { type: mongoose.SchemaTypes.ObjectId, index: true}
    })
);