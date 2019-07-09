const { Shop, Item } = require('../models');
const { api: apiService } = require('../services');

const addInventory = {
    validation: {
        fields: [
            {name: 'shopId', type:'string', required: true},
            {
                name: 'items', required: true, arrayOf: true,
                arrayPred: a=>a.length>=1, arrayPredDesc: 'Must add at least one item', 
                validation: {
                    fields: [
                        {name: 'name', type: 'string', required: true},
                        {name: 'price', type: 'number', required: true},
                        {name: 'category', type: 'string', required: true},
                        {name: 'tag', type: 'string', required: true},
                        {name: 'description', type: 'string'}
                    ]
                }
            }
        ]
    },
    async endpoint({body, payload}) {
        const shop = await Shop
            .findById(body.shopId)
            .where({owner: payload.id})
            .select({_id: 1});
        apiService.errorIf(!shop, apiService.errors.NOT_FOUND, 'NoSuchShop');
        return await Item.insertMany(body.items.map(item => ({
            shopId: shop._id, ownerId: payload.id, ...item
        })));
    },
    data: {
        array: true,
        ...apiService.refinedMongooseSchema(Item)
    }
};


const getInventory = {
    validation: {
        fields: [{name: 'shopId', type: 'string', required: true}]
    },
    endpoint: ({body: { shopId }}) => Item.find({shopId}).exec(),
    data: {
        array: true,
        ...apiService.refinedMongooseSchema(Item)
    }
}

module.exports = {
    addInventory,
    getInventory
};