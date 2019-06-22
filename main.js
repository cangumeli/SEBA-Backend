const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cfg = require('./config');
const api = require('./api-router');

mongoose.connect(cfg.DB_URL, {useNewUrlParser: true});
const app = express();
app.use(cors());
app.use('/api', api);
app.listen(cfg.PORT);
console.log('App is listening on port ' + cfg.PORT);