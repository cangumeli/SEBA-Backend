const express = require('express');
const { sep } = require('path');
const { PATH } = require('../config');
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
  if (req.files && req.files.picture && req.files.picture.tempFilePath) {
    format = req.files.picture.mimetype.split('/')[1];
    req.tempDir = req.files.picture.tempFilePath;
    req.fileFormat = format;
  } else if (req.files && req.files.inventoryFile && req.files.inventoryFile.tempFilePath) {
    format = req.files.inventoryFile.mimetype.split('/')[1];
    req.tempDir = req.files.inventoryFile.tempFilePath;
    req.fileFormat = format;
  }
  next();
};

module.exports.addAuthRoute = (router, method, uri, controller) => {
  router[method](uri, [authHandler(), validateBody(controller), fileHandler], handle(controller));
};

module.exports.addCustomerRoute = async (router, method, uri, controller) => {
  router[method](
    uri,
    [authHandler(false), validateBody(controller), fileHandler],
    handle(controller),
  );
};

module.exports.addOwnerRoute = async (router, method, uri, controller) => {
  router[method](
    uri,
    [authHandler(true), validateBody(controller), fileHandler],
    handle(controller),
  );
};

module.exports.addStaticRoute = (router, uri, dir) => {
  router.get(uri, (req, res) => res.sendFile(PATH + sep + dir + sep + req.query.destination));
};
