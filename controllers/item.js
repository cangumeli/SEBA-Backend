const { Shop, Item, Comment } = require('../models');
const { api: apiService, file: fileService } = require('../services');
const { sep } = require('path');

const shopPopulation = { path: 'shopId', select: Item.shopIdPopulateFields() };

const commentAggregation = { _id: '$itemId', average: { $avg: '$rating' }, count: { $sum: 1 } };

async function checkOwnership(shopId, userId) {
  const shop = await Shop.findById(shopId)
    .where({ owner: userId })
    .select({ _id: 1 });
  apiService.errorIf(!shop, apiService.errors.UNAUTHORIZED, 'NotOwner');
}

const addItem = {
  validation: {
    fields: [
      { name: 'shopId', type: 'string', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'price', type: 'number', required: true },
      { name: 'category', type: 'string', required: true, arrayOf: true },
      { name: 'tag', type: 'string', required: true, arrayOf: true },
      { name: 'detail', type: 'string' },
      { name: 'isSponsored', type: 'bool' },
      { name: 'material', type: 'string' },
      { name: 'size', type: 'string' },
    ],
  },
  async endpoint({ body, payload }) {
    await checkOwnership(body.shopId, payload.id);
    const item = await Item.create({ ...body, lastImageIndex: 0 });
    return Item.populate(item, shopPopulation);
  },
};

const deleteItem = {
  validation: {
    fields: [{ name: 'itemId', type: 'string', required: true }],
  },
  async endpoint({ body, payload }) {
    const item = await Item.findById(body.itemId);
    apiService.errorIf(!item, apiService.errors.NOT_FOUND, 'NoSuchItem');
    await checkOwnership(item.shopId, payload.id);
    item.remove();
    const saved = await item.save();
    return Item.populate(saved, shopPopulation);
  },
};

const getItem = {
  validation: deleteItem.validation,
  async endpoint({ body: { itemId } }) {
    const item = await Item.findById(itemId).populate(shopPopulation);
    apiService.errorIf(!item, apiService.errors.NOT_FOUND, 'NoSuchItem');
    // Find the average rating and number of comments
    // const agg = await ItemComment.find({ itemId });

    // const agg = await Comment.aggregate([{ $match: { itemId: item._id } }, { $count: 'count' }]);
    const agg = await Comment.aggregate()
      .match({ itemId: item._id })
      .group(commentAggregation);
    item.averageRating = agg[0].average;
    item.numComments = agg[0].count;
    return item;
  },
};

const getItemList = {
  validation: {
    fields: [{ name: 'itemList', type: 'string', required: true, arrayOf: true }],
  },
  async endpoint({ body: { itemList } }) {
    let items = await Item.find({ _id: itemList }).populate(shopPopulation);
    apiService.errorIf(!items, apiService.errors.NOT_FOUND, 'NoSuchItem');
    const aggs = await Comment.aggregate()
      .match({ itemId: { $in: items.map(item => item._id) } })
      .group(commentAggregation);
    aggs.forEach(a => {
      const item = items.find(item => item._id.toString() == a._id.toString());
      if (item) {
        item.numComments = a.count;
        item.averageRating = a.average;
      }
    });
    return items;
  },
  data: {
    array: true,
    ...apiService.refinedMongooseSchema(Item),
  },
};

const updateItem = {
  validation: {
    fields: [
      { name: 'itemId', type: 'string', required: true },
      ...addItem.validation.fields.map(f => ({ ...f, required: false })),
    ],
    pred: body => Object.keys(body).some(x => body[x]),
    predDesc: 'Something must be updated',
  },
  async endpoint({ body, payload }) {
    const item = await Item.findById(body.itemId);
    apiService.errorIf(!item, apiService.errors.NOT_FOUND, 'NoSuchItem');
    await checkOwnership(item.shopId, payload.id);
    Object.keys(body).forEach(key => {
      if (key != 'shopId' && body[key]) {
        item[key] = body[key];
      }
    });
    const saved = await item.save();
    const poped = await Item.populate(saved, shopPopulation);
    const { count, average } = (await Comment.aggregate()
      .match({ itemId: item._id })
      .group(commentAggregation))[0];
    poped.averageRating = average;
    poped.numComments = count;
    return poped;
  },
};

const addInventory = {
  validation: {
    fields: [{ name: 'shopId', type: 'string', required: true }],
  },
  async endpoint({ body: { shopId }, payload: { id }, tempDir, fileFormat }) {
    apiService.errorIf(!tempDir, apiService.errors.INVALID_BODY, 'NoCsvFile');
    const shop = await Shop.findById(shopId).where({ owner: id });
    apiService.errorIf(!shop, apiService.errors.NOT_FOUND, 'NoSuchShop');

    const items = await fileService.readCSV(tempDir);

    const docs = await Item.insertMany(
      items.map(item => ({
        shopId: shopId,
        name: item['name'],
        price: item['price'],
        category: item['category'],
        tag: item['tag'],
        detail: item['detail'],
        material: item['material'],
      })),
    );
    return Item.populate(docs, shopPopulation);
  },
};

const getInventory = {
  validation: {
    fields: [{ name: 'shopId', type: 'string', required: true }],
  },
  endpoint: async ({ body: { shopId } }) => {
    const items = await Item.find({ shopId }).populate(shopPopulation);
    const aggs = await Comment.aggregate()
      .match({ itemId: { $in: items.map(item => item._id) } })
      .group(commentAggregation);
    aggs.forEach(a => {
      const item = items.find(item => item._id.toString() == a._id.toString());
      if (item) {
        item.numComments = a.count;
        item.averageRating = a.average;
      }
    });
    return items;
  },
  data: {
    array: true,
    ...apiService.refinedMongooseSchema(Item),
  },
};

const uploadPicture = {
  validation: {
    fields: [{ name: 'itemId', type: 'string', required: true }],
  },
  async endpoint({ body: { itemId }, payload: { id: ownerId }, tempDir, fileFormat }) {
    apiService.errorIf(!tempDir, apiService.errors.INVALID_BODY, 'NoProfileImage');
    const item = await Item.findById(itemId);
    apiService.errorIf(!item, apiService.errors.NOT_FOUND, 'NoSuchItem');
    const targetDir = fileService.getDir(
      fileService.dirs.ITEM_PICTURES,
      itemId + '_' + item.lastImageIndex,
      fileFormat,
    );
    const { path } = await fileService.copyFile(tempDir, targetDir);
    const toRemoves = [tempDir];
    item.images.push(itemId + '_' + item.lastImageIndex + '.' + fileFormat);
    item.lastImageIndex += 1;
    await item.save();
    // Do not wait for file removal, it can be done after sending the response
    fileService.removeFilesAsync(toRemoves);
    return { path: itemId + '_' + (item.lastImageIndex - 1) + '.' + fileFormat };
  },
};

const removePicture = {
  validation: {
    fields: [
      { name: 'itemId', type: 'string', required: true },
      { name: 'filename', type: 'string', required: true },
    ],
  },
  async endpoint({ body: { itemId, filename }, payload: { id: ownerId } }) {
    const item = await Item.findById(itemId);
    apiService.errorIf(!item, apiService.errors.NOT_FOUND, 'NoSuchItem');
    apiService.errorIf(!item.images.includes(filename), apiService.errors.NOT_FOUND, 'NoSuchImage');
    const index = item.images.indexOf(filename);
    image = item.images[index];
    item.images.splice(index, 1);
    await item.save();
    await fileService.removeFile(fileService.dirs.ITEM_PICTURES + sep + image);
    return { success: true };
  },
  data: { success: 'bool' },
};

module.exports = {
  addInventory,
  getInventory,
  updateItem,
  addItem,
  deleteItem,
  getItem,
  getItemList,
  uploadPicture,
  removePicture,
};
