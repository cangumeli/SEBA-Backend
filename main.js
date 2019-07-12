const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const cfg = require("./config");
const api = require("./api-router");
const { file: fileService } = require("./services");

fileService.init();
mongoose.connect(cfg.DB_URL, { useNewUrlParser: true });
const app = express();
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./tmp/",
    limits: { fileSize: 50 * 1024 * 1024 }
  })
);
app.use("/api", api);
app.listen(cfg.PORT);
console.log("App is listening on port " + cfg.PORT);
