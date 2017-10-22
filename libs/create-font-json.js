const sizeOf = require('image-size');
const fs = require('fs');
const path = require('path');

module.exports = (options) =>
{
  let FONT_DIR = options.dest;
  let JSON_FILE = options.json;
  let data = {};
  fs.readdir(FONT_DIR, function(error, files){
    let items = files
      .filter(function(file){
        return file.match(/\.png$/);
      }).map(function(file){
        return file.replace('.png', '');
      });
    items.forEach(function(code, index) {
      let filepath = path.resolve(FONT_DIR, code + '.png');
      let dimensions = sizeOf(filepath);
      data[code] = [dimensions.width, dimensions.height];
    });
    fs.writeFileSync(JSON_FILE, JSON.stringify(data), 'utf8');
  });
}

