const {
  api: { validateBody, handle, errors },
  auth: { verifyJwt },
} = require('../services');

module.exports.methods = {
  POST: 'post',
  GET: 'get',
  PUT: 'put',
  DELETE: 'delete',
};

module.exports.addRoute = (router, method, uri, controller) => {
  router[method](uri, [validateBody(controller)], handle(controller));
};

const authHandler = isOwner => async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(errors.UNAUTHORIZED).json({ message: 'NoToken' });
    return;
  }
  try {
    req.payload = await verifyJwt(token);
    if (isOwner && !req.payload.owner) {
      res.status(errors.UNAUTHORIZED).json({ message: 'InvalidUserType' });
    } else if (isOwner === false && req.payload.owner) {
      res.status(errors.UNAUTHORIZED).json({ message: 'InvalidUserType' });
    } else {
      next();
    }
  } catch (error) {
    res.status(errors.UNAUTHORIZED).json({ message: 'InvalidToken' });
  }
};

const fileHandler = (req, _, next) => {
    
    if (req.files && req.files.profile && req.files.profile.tempFilePath) {
        req.tempDir = req.files.profile.tempFilePath;
    }
    next();
};

module.exports.addAuthRoute = (router, method, uri, controller) => {
  router[method](uri, [authHandler(), validateBody(controller)], handle(controller));
};

module.exports.addCustomerRoute = async (router, method, uri, controller) => {
  router[method](uri, [authHandler(false), validateBody(controller), fileHandler], handle(controller));
};

module.exports.addOwnerRoute = async (router, method, uri, controller) => {
  router[method](uri, [authHandler(true), validateBody(controller), fileHandler], handle(controller));
};
