const { Shop, Item } = require('../models');
const { api: apiService, file: fileService } = require('../services');
const { sep } = require('path');

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
      { name: 'category', type: 'string', required: true },
      { name: 'tag', type: 'string', required: true },
      { name: 'detail', type: 'string' },
      { name: 'isSponsored', type: 'bool' },
      { name: 'material', type: 'string' },
    ],
  },
  async endpoint({ body, payload }) {
    await checkOwnership(body.shopId, payload.id);
    return await Item.create({ ...body, lastImageIndex: 0 });
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
    return await item.save();
  },
};

const getItem = {
  validation: deleteItem.validation,
  async endpoint({ body: { itemId } }) {
    const item = await Item.findById(itemId);
    apiService.errorIf(!item, apiService.errors.NOT_FOUND, 'NoSuchItem');
    return item;
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
    return await item.save();
  },
};

const addInventory = {
  validation: {
    fields: [
      { name: 'shopId', type: 'string', required: true },
      {
        name: 'items',
        required: true,
        arrayOf: true,
        arrayPred: a => a.length >= 1,
        arrayPredDesc: 'Must add at least one item',
        validation: {
          fields: [
            { name: 'name', type: 'string', required: true },
            { name: 'price', type: 'number', required: true },
            { name: 'category', type: 'string', required: true },
            { name: 'tag', type: 'string', required: true },
            { name: 'detail', type: 'string' },
            { name: 'isSponsored', type: 'bool' },
            { name: 'material', type: 'string' },
          ],
        },
      },
    ],
  },
  async endpoint({ body, payload }) {
    apiService.errorIf(
      !(await isOwner(body.shopId, payload.id)),
      apiService.errors.UNAUTHORIZED,
      'NotOwner',
    );
    return await Item.insertMany(
      body.items.map(item => ({
        shopId: shop._id,
        ...item,
      })),
    );
  },
  data: {
    array: true,
    ...apiService.refinedMongooseSchema(Item),
  },
};

const getInventory = {
  validation: {
    fields: [{ name: 'shopId', type: 'string', required: true }],
  },
  endpoint: ({ body: { shopId } }) => Item.find({ shopId }).exec(),
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
  uploadPicture,
  removePicture,
};
