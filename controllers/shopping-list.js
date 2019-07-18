const { api: apiService, file: fileService } = require('../services');
const { ShoppingList } = require('../models');

const addItem = {
  validation: {
    fields: [{ name: 'itemId', required: true, type: 'string' }],
  },
  async endpoint({ body, payload }) {
    let list = await ShoppingList.findOne({ user: payload.id });
    if (!list) {
      list = new ShoppingList({ user: payload.id });
    }
    list.items.addToSet(body.itemId);
    return list.save();
  },
};

const get = {
  validation: {
    fields: [],
  },
  async endpoint({ payload }) {
    let list = await ShoppingList.findOne({ user: payload.id });
    if (!list) {
      list = new ShoppingList({ user: payload.id });
      list.save();
    }
    return list.items;
  },
};

const removeItem = {
  validation: {
    fields: [{ name: 'itemId', required: true, type: 'string' }],
  },
  async endpoint({ body, payload }) {
    const list = await ShoppingList.findOne({ user: payload.id });
    apiService.errorIf(!list, apiService.errors.NOT_FOUND, 'ShoppingListDoesntExist');
    apiService.errorIf(
      !list.items.includes(body.itemId),
      apiService.errors.NOT_FOUND,
      'ItemNotInShoppingList',
    );
    list.items.pull({ _id: body.itemId });
    list.save();

    return list.items;
  },
};

const removeAll = {
  validation: { fields: [] },
  async endpoint({ payload }) {
    const list = await ShoppingList.findOne({ user: payload.id });
    apiService.errorIf(!list, apiService.errors.NOT_FOUND, 'ShoppingListDoesntExist');
    list.items = [];
    return list.save();
  },
};

const exportPDF = {
  validation: { fields: [] },
  async endpoint({ payload }) {
    const list = await ShoppingList.findOne({ user: payload.id }).populate('items');
    const listObj = apiService.refineMongooseObject(list);
    const filename = payload.id + '.pdf';
    await fileService.exportPDF(filename, listObj.items);
    return { path: filename };
  },
  data: { path: 'string' },
};

module.exports = {
  addItem,
  get,
  removeItem,
  removeAll,
  exportPDF,
};
