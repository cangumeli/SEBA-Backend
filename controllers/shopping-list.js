const { ShoppingList } = require('../models');

const addItem = {
    validation: {
        fields: [
            {name: 'itemId', required: true, type: 'string'}
        ]
    },
    async endpoint({body, payload}) {
        let list = await ShoppingList.findOne({user: payload.id});
        if (!list) {
            list = new ShoppingList({user: payload.id});
        }
        list.items.addToSet(body.itemId);
        return await list.save();
    }
};

module.exports = {
    addItem
};
