const { api: { validateBody, handle }, auth: { verifyJwt } } = require('../services');

module.exports.methods = {
    POST: 'post',
    GET: 'get',
    PUT: 'put',
    DELETE: 'delete'
};

module.exports.addRoute = (router, method, uri, controller) => {
    router[method](uri, [validateBody(controller)], handle(controller));
}

async function authHandler(req, res, next) {
    const token = req.headers.authorization
    if (!token) {
        res.status(401).json({message: 'No token'});
        return;
    }
    try {
        req.payload = await verifyJwt(token);
        next();
    } catch (error) {
        res.status(401).json({message: 'Invalid token'});
    }
}

module.exports.addAuthRoute = (router, method, uri, controller) => {
    router[method](uri, [authHandler, validateBody(controller)], handle(controller));
}
