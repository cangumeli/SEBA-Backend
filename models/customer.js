const mongoose = require('mongoose');
const auth = require('../services/auth');


const customerSchema = new mongoose.Schema({
    email: {type: String, unique: true, required: true},
    _password: mongoose.SchemaTypes.Mixed,
    name: {type:String, required: true},
    surname: {type:String, required: true},
    addressLine1: {type:String},
    addressLine2: {type:String},
    zipCode: {type: Number},
    city: {type:String},
    country: {type:String},
    phone: {type:String}
});

customerSchema.methods.setPassword = async function(password) {
    this._password = await auth.codePassword(password);
}

customerSchema.methods.verifyPassword = async function (password) {
    return await auth.verifyPassword(password, this._password);
}

module.exports = mongoose.model('Customer', customerSchema);