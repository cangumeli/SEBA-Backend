// All authentication related functions goes here
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

module.exports.codePassword = password => {
    let hash, salt;
    return new Promise((resolve, reject) => {
        salt = crypto.randomBytes(16).toString('hex');
        crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, buf) => {
            if (err) {
                reject(err);
            } else {
                hash = buf.toString('hex');
                resolve({ hash, salt });
            }
        })
    })
}

module.exports.verifyPassword = (password, code) => 
    new Promise((resolve, reject) => 
        crypto.pbkdf2(password, code.salt, 1000, 64, 'sha512', (err, buf) => 
            err ? reject(err) : resolve(code.hash === buf.toString('hex'))));


const KEY = process.env.KEY || 'PRIVATE_KEY';

module.exports.createJwt = payload => 
    new Promise((resolve, reject) => 
        jwt.sign(payload, KEY, (err, token) => 
            err ? reject(err) : resolve(token)));

module.exports.verifyJwt = token => 
    new Promise((resolve, reject) => 
        jwt.verify(token, KEY, (err, payload) => 
            err ? reject(err) : resolve(payload)));