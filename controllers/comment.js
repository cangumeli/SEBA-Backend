const { api: apiService } = require('../services');
const { ItemComment } = require('../models');
const { ShopComment } = require('../models');
const { Comment } = require('../models');

const create = {
  validation: {
    fields: [
      { name: 'text', type: 'string', required: true },
      {
        name: 'rating',
        type: 'number',
        required: true,
        pred: rating => rating > 0 && rating < 6,
        predDesc: 'Rating should be between 1 and 5',
      },
      { name: 'date', type: 'string' },
      { name: 'upvote', type: 'number' },
      { name: 'downvote', type: 'number' },
      { name: 'shopId', type: 'string' },
      { name: 'itemId', type: 'string' },
    ],
    pred: ({ shopId, itemId }) => shopId || itemId,
    predDesc: 'Either shopId or itemId must exist',
  },
  endpoint({ body: { text, rating, date, upvote, downvote, shopId, itemId }, payload }) {
    let comment;
    if (shopId) {
      comment = new ShopComment({
        userId: payload.id,
        text,
        rating,
        date,
        upvote,
        downvote,
        shopId,
      });
    } else if (itemId) {
      comment = new ItemComment({
        userId: payload.id,
        text,
        rating,
        date,
        upvote,
        downvote,
        itemId,
      });
    }
    return comment.save();
  },
  data: apiService.refinedMongooseSchema(Comment),
};

const get = {
  validation: {
    fields: [{ name: 'id', type: 'string', required: true }],
  },
  async endpoint({ body, payload }) {
    const comment = await Comment.findById(body.id).where({ userId: payload.id });
    apiService.errorIf(!comment, apiService.errors.NOT_FOUND, 'NoSuchComment');
    return comment;
  },
};

const getAll = {
  validation: {
    fields: [
      { name: 'shopId', type: 'string' },
      { name: 'itemId', type: 'string' },
      { name: 'userId', type: 'string' },
    ],
    pred: ({ shopId, itemId, userId }) => shopId || itemId || userId,
    predDesc: 'Either shopId, itemId or userId must exist',
  },
  async endpoint({ body: { shopId, itemId, userId } }) {
    let comments;
    if (shopId) {
      comments = await ShopComment.find({
        shopId,
      });
    } else if (itemId) {
      comments = await ItemComment.find({
        itemId,
      });
      console.log(comments);
    } else if (userId) {
      comments = await Comment.find({
        userId,
      });
    }
    return comments;
  },
};

const getRating = {
  validation: {
    fields: [{ name: 'shopId', type: 'string' }, { name: 'itemId', type: 'string' }],
    pred: ({ shopId, itemId }) => shopId || itemId,
    predDesc: 'Either shopId or itemId must exist',
  },
  async endpoint({ body: { shopId, itemId } }) {
    let comments;
    let avg = 0;
    let commentNum = 0;
    if (shopId) {
      comments = await ShopComment.find({
        shopId,
      });
      comments.forEach(element => {
        avg += element.rating;
        commentNum++;
      });
      avg /= commentNum;
    } else if (itemId) {
      comments = await ItemComment.find({
        itemId,
      });
      console.log(comments);
      comments.forEach(element => {
        console.log(element);
        avg += element.rating;
        commentNum++;
      });
      avg /= commentNum;
    }
    return avg;
  },
};

const update = {
  validation: {
    fields: [
      ...create.validation.fields.map(field => ({ ...field, required: false })),
      { name: 'id', type: 'string', required: true },
    ],
    pred: body =>
      Object.keys(body).some(k => k !== 'id' && body[k] !== undefined && body[k] != null),
    predDesc: 'One of the update fields must be defined and nonnull',
  },
  async endpoint({ body, payload }) {
    const comment = await Comment.findOneAndUpdate({ _id: body.id, userId: payload.id }, body, {
      new: true,
    });
    apiService.errorIf(!comment, apiService.errors.NOT_FOUND, 'NoSuchComment');

    return comment.save();
  },
};

const deleteComment = {
  validation: {
    fields: [{ name: 'id', type: 'string', required: true }],
  },
  async endpoint({ body, payload }) {
    const comment = await Comment.findOneAndRemove({
      _id: body.id,
      userId: payload.id,
    });
    apiService.errorIf(!comment, apiService.errors.NOT_FOUND, 'NoSuchComment');

    return comment;
  },
};

const upvote = {
  validation: {
    fields: [{ name: 'commentId', type: 'string', required: true }],
  },
  async endpoint({ body, payload }) {
    const comment = await Comment.findById(body.commentId)
      .where('userId')
      .ne(payload.id);
    apiService.errorIf(!comment, apiService.errors.NOT_FOUND, 'NoSuchComment');
    comment.upvote.addToSet(payload.id);
    comment.downvote.pull(payload.id);
    return comment.save();
  },
};

const downvote = {
  validation: upvote.validation,
  async endpoint({ body, payload }) {
    const comment = await Comment.findById(body.commentId)
      .where('userId')
      .ne(payload.id);
    apiService.errorIf(!comment, apiService.errors.NOT_FOUND, 'NoSuchComment');
    comment.downvote.addToSet(payload.id);
    comment.upvote.pull(payload.id);
    return comment.save();
  },
};

module.exports = {
  create,
  update,
  deleteComment,
  get,
  getAll,
  upvote,
  downvote,
  getRating,
};
