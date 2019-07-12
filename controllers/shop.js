const { Shop, Item, Subscription } = require('../models');
const { api: apiService } = require('../services');

const createShop = {
  validation: {
    fields: [
      {
        name: 'title',
        type: 'string',
        required: true,
        pred: title => title.length > 0,
        predDesc: 'Title must be a nonempty string',
      },
      { name: 'locationDesc', type: 'string' },
      { name: 'description', type: 'string' },
      {
        name: 'coordinates',
        type: 'number',
        required: true,
        arrayOf: true,
        arrayPred: coordinates => coordinates.length === 2,
        arrayPredDesc: '[lon, lat] format is expected',
      },
      {
        name: 'subscriptions',
        arrayOf: true,
      },
    ],
  },
  endpoint({ body: { title, locationDesc, description, coordinates, subscriptions }, payload }) {
    const shop = new Shop({
      owner: payload.id,
      title,
      locationDesc,
      description,
      location: { type: 'Point', coordinates },
      subscriptions,
    });
    return shop.save();
  },
  data: apiService.refinedMongooseSchema(Shop),
};

const updateShop = {
  validation: {
    fields: [
      ...createShop.validation.fields.map(field => ({ ...field, required: false })),
      { name: 'id', type: 'string', required: true },
    ],
    pred: body =>
      Object.keys(body).some(k => k !== 'id' && body[k] !== undefined && body[k] != null),
    predDesc: 'One of the update fields must be defined and nonnull',
  },
  async endpoint({ body, payload }) {
    const shop = await Shop.findById(body.id).where({ owner: payload.id });
    apiService.errorIf(!shop, apiService.errors.NOT_FOUND, 'NoSuchShop');
    if (body.coordinates) {
      shop.location.coordinates = body.coordinates;
    }
    if (body.title) {
      shop.title = body.title;
    }
    if (body.locationDesc || body.locationDesc === '') {
      shop.locationDesc = body.locationDesc;
    }
    if (body.description || body.description === '') {
      shop.description = body.description;
    }
    return shop.save();
  },
  data: apiService.refinedMongooseSchema(Shop),
};

const get = {
  validation: {
    fields: [{ name: 'id', type: 'string', required: true }],
  },
  async endpoint({ body, payload }) {
    const shop = await Shop.findById(body.id).where({ owner: payload.id });
    apiService.errorIf(!shop, apiService.errors.NOT_FOUND, 'NoSuchShop');

    return shop;
  },
};

const getShops = {
  endpoint: ({ payload: { id } }) => Shop.find({ owner: id }).exec(),
  data: { array: true, ...apiService.refinedMongooseSchema(Shop) },
};

const deleteShop = {
  validation: {
    fields: [{ name: 'id', type: 'string', required: true }],
  },
  async endpoint({ body, payload }) {
    const shop = await Shop.findOneAndRemove({
      _id: body.id,
      owner: payload.id,
    });
    apiService.errorIf(!shop, apiService.errors.NOT_FOUND, 'NoSuchShop');

    return shop;
  },
};

const subscribe = {
  validation: {
    fields: [
      { name: 'shopId', type: 'string', required: true },
      { name: 'sponsorItem', type: 'boolean' },
      { name: 'price', type: 'number', required: true },
      { name: 'title', type: 'string', required: true },
    ],
  },
  async endpoint({ body: { shopId, sponsorItem, title, price } }) {
    let subscription;
    if (sponsorItem) {
      const items = await Item.updateMany({ shopId }, { $set: { isSponsored: true } });
      apiService.errorIf(!items, apiService.errors.NOT_FOUND, 'NoSuchitems');
      subscription = new Subscription({
        title,
        shopId,
        price,
        type: 'sponsoredItem',
      });
    } else {
      subscription = new Subscription({
        title,
        shopId,
        price,
        type: 'businessPlan',
      });
    }

    return subscription.save();
  },
};

const unsubscribe = {
  validation: {
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'shopId', type: 'string', required: true },
    ],
  },
  async endpoint({ body: { id, shopId } }) {
    const subscription = await Subscription.findOneAndRemove({ _id: id, shopId });
    apiService.errorIf(!subscription, apiService.errors.NOT_FOUND, 'NoSuchSubscription');

    if (subscription.type === 'sponsoredItem') {
      const items = await Item.updateMany({ shopId }, { $set: { isSponsored: false } });
      apiService.errorIf(!items, apiService.errors.NOT_FOUND, 'NoSuchitems');
    }

    return subscription;
  },
};

const getSubscriptions = {
  validation: {
    fields: [{ name: 'shopId', type: 'string', required: true }],
  },
  async endpoint({ body: { shopId } }) {
    const subscriptions = await Subscription.find({ shopId });

    apiService.errorIf(!subscriptions, apiService.errors.NOT_FOUND, 'NoSuchSubscriptions');

    return subscriptions;
  },
};

module.exports = {
  createShop,
  updateShop,
  get,
  getShops,
  deleteShop,
  subscribe,
  unsubscribe,
  getSubscriptions,
};
