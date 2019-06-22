const mongoose = require('mongoose');
const auth = require('../services/auth');

const ownerSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    phone: {type: String, unique: true},
    _password: mongoose.SchemaTypes.Mixed,
    username: {type:String, required: true}
})

ownerSchema.methods.setPassword = async function(password) {
    this._password = await auth.codePassword(password);
}

ownerSchema.methods.verifyPassword = async function (password) {
    return await auth.verifyPassword(password, this._password);
}

module.exports = mongoose.model('Owner', ownerSchema);