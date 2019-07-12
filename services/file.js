const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const dirs = {
  CUSTOMER_PROFILE_PICTURES: './CustomerProfilePictures',
  OWNER_PROFILE_PICTURES: './OwnerProfilePictures',
  ITEM_PICTURES: './ItemPictures',
  SHOP_PICTURES: './ShopPictures',
};

/* dirFor is an element from module.exports.dirs*/
function getDir(dirFor, dest, format) {
  return dirFor + path.sep + dest + '.' + format;
}

function init() {
  Object.keys(dirs).forEach(key => {
    const dir = dirs[key];
    if (!fs.existsSync(`./${dir}`)) {
      fs.mkdirSync(`./${dir}`);
    }
  });
}

function copyFile(sourceDir, targetDir) {
  return new Promise((resolve, reject) => {
    fs.copyFile(sourceDir, targetDir, err => {
      err ? reject(err) : resolve({ path: targetDir });
    });
  });
}

function readCSV(tempDir) {
  let items = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(tempDir)
      .pipe(csv())
      .on('data', row => items.push(row))
      .on('error', err => reject(err))
      .on('end', () => {
        removeFilesAsync(tempDir);
        resolve(items);
      });
  });
}

function removeFilesAsync(dirs) {
  let toRemove = dirs;
  if (!Array.isArray(dirs)) {
    toRemove = [dirs];
  }
  dirs.forEach(
    dir =>
      dir &&
      fs.unlink(dir, err => {
        // TODO: use a non-blocking logger
        err && console.error(err);
      }),
  );
}

async function removeFile(dir) {
  return new Promise((resolve, reject) => {
    fs.unlink(dir, err => {
      err ? reject(err) : resolve(true);
    });
  });
}

module.exports = {
  init,
  dirs,
  copyFile,
  removeFilesAsync,
  getDir,
  removeFile,
  readCSV,
};
