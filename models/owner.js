const mongoose = require('mongoose');
const auth = require('../services/auth');

const ownerSchema = new mongoose.Schema({
    // sparse indexing is needed when unique fields are optional,
    // see: https://docs.mongodb.com/manual/core/index-sparse/
    email: {type: String, unique: true, sparse: true},
    phone: {type: String, unique: true, sparse: true},
    _password: mongoose.SchemaTypes.Mixed,
    name: {type:String, required: true},
    surname: {type:String, required: true}
});

ownerSchema.methods.setPassword = async function(password) {
    this._password = await auth.codePassword(password);
}

ownerSchema.methods.verifyPassword = async function (password) {
    return await auth.verifyPassword(password, this._password);
}

module.exports = mongoose.model('Owner', ownerSchema);