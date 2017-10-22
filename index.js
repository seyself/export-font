let exportFont = require('./libs/export-font');

module.exports = {
  toPNG: (options)=> {
    options.output = 'png';
    exportFont(options);
  },
  toSVG: (options)=> {
    options.output = 'svg';
    exportFont(options);
  }
};
