const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    owner: {type: mongoose.SchemaTypes.ObjectId, unique: true},
    title: {type: String, required: true},
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

module.exports = mongoose.model('Shop', shopSchema);