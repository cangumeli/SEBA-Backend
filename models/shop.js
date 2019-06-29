const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    owner: {type: mongoose.SchemaTypes.ObjectId, required: true},
    title: {type: String, required: true},
    locationDesc: {type: String, default: ''},
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});

shopSchema.index({ location: "2dsphere" });
shopSchema.index({ owner: 1});

module.exports = mongoose.model('Shop', shopSchema);