const { Shop, Item } = require('../models');
const { api: apiService, file: fileService } = require('../services');

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
    return await Item.create(body);
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
    fields: [{ name: 'shopId', type: 'string', required: true }],
  },
  async endpoint({ body: { shopId }, payload: { id }, tempDir, fileFormat }) {
    apiService.errorIf(!tempDir, apiService.errors.INVALID_BODY, 'NoCsvFile');
    const shop = await Shop.findById(shopId).where({ owner: id });
    apiService.errorIf(!shop, apiService.errors.NOT_FOUND, 'NoSuchShop');

    const items = await fileService.readCSV(tempDir);

    return await Item.insertMany(
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
  },
  data: { path: 'string' },
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

module.exports = {
  addInventory,
  getInventory,
  updateItem,
  addItem,
  deleteItem,
  getItem,
};
