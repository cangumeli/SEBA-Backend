const { Shop } = require('../models');

const createShop = {
    validation: {
        fields: [
            {
                name: 'coordinates', type: 'number', required: true, 
                arrayOf: true, arrayPred: a=>a.length==2,  
                arrayPredDesc: '[lon, lat] format is expected',
            },
            {
                name: 'title', type: 'string', required: true, 
                pred: n=>n.length>=1, predDesc: 'Title must be a nonempty string'
            },
            {name: 'locationDesc', type: 'string'}
        ],
    },
    endpoint({ body: {title, locationDesc, coordinates}, payload }) {
        const shop = new Shop({
            owner: payload.id, title, locationDesc, 
            location: { type: "Point", coordinates } }
        );
        return shop.save();
    }
};

const updateShop = {
    validation: {  // replicate the createShop values
        fields: [
            ...createShop.validation.fields.map(field => ({...field, required:false})),
            {name: 'id', type: 'string', required: true}
        ],
        pred: body => Object.keys(body).some(k=>k!='id' && body[k]!=undefined && body[k]!=null), 
        predDesc: 'One of the update fields must be defined and nonnull'
    },
    async endpoint({body, payload}) {
        const shop = await Shop.findById(body.id).where({owner: payload.id});
        if (body.coordinates) {
            shop.location.coordinates = body.coordinates;
        }
        if (body.title) {
            shop.title = body.title;
        }
        if (body.locationDesc || body.locationDesc == '') {
            shop.locationDesc = body.locationDesc;
        }
        return await shop.save();
    }
};

const getShops = {
    endpoint: ({payload: { id }}) => Shop.find({owner: id}).exec()
};

module.exports = {
    createShop,
    updateShop,
    getShops
};