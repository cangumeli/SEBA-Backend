const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const PDFDocument = require('pdfkit');

const dirs = {
  CUSTOMER_PROFILE_PICTURES: './CustomerProfilePictures',
  OWNER_PROFILE_PICTURES: './OwnerProfilePictures',
  ITEM_PICTURES: './ItemPictures',
  SHOP_PICTURES: './ShopPictures',
  PDF_FILES: './PDFs',
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
        removeFile(tempDir);
        resolve(items);
      });
  });
}

async function exportPDF(filename, data) {
  const doc = new PDFDocument();
  const dir = dirs.PDF_FILES + path.sep + filename;
  doc.pipe(fs.WriteStream(dir));
  data.forEach(datum => {
    doc
      //.font('fonts/PalatinoBold.ttf')
      .fontSize(15)
      .text('\n' + datum.name)
      .fontSize(12)
      .text('Price: ' + datum.price)
      .text('Tag: ' + datum.tag)
      .text('Category: ' + datum.category);
  });
  doc.save();
  doc.end();
  return { path: dir };
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
  exportPDF,
};
