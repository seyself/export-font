const proc = require('child_process');
const fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');
const xfs = require('./xfs');
const xopt = require('./export-font-options');
const exportJSON = require('./create-font-json');

const _HEIGHT_OFFSET = 0;

module.exports = (options)=>
{
  let _options = xopt(options);

  _options.font.obj = fontkit.openSync(_options.font.file);
  _options.font2.obj = fontkit.openSync(_options.font2.file);

  let size1 = maxSize(options.font.obj, options.vert);
  let size2 = maxSize(options.font2.obj, options.vert);

  _options.maxWidth = Math.max(size1.width, size2.width) + _options.marginH * 2;
  _options.maxHeight = Math.max(size1.height, size2.height) + _options.marginV * 2 + _HEIGHT_OFFSET;
  _options.offsetX = _options.maxWidth + Math.min(size1.x, size2.x);
  _options.offsetY = _options.maxHeight + Math.min(size1.y, size2.y);

  // _options.multiple = 1000 / Math.max(_options.maxWidth, _options.maxHeight);
  _options.multiple = 1000 / _options.maxWidth;
  _options.multiple = _getMultiple(_options);

  xfs.mkdir(path.resolve(_options.dest));

  iterate(options);
}

function _getMultiple(options)
{
  if (options.fixed == 'h' || options.fixed == 'width')
  {
    return 1000 / options.maxWidth;
  }
  if (options.fixed == 'v' || options.fixed == 'height')
  {
    return 1000 / options.maxHeight;
  }
  if (options.fixed)
  {
    return 1000 / Math.max(options.maxWidth, options.maxHeight);
  }
  return 1000 / options.maxWidth;
}

function maxSize(font, vert)
{
  let text = '1234567890ASZMWXQ8/!?$@%`abjghklpqÒÛÙŰあア漢☆※';
  let layout = vert
               ? font.layout(text, ['vert'])
               : font.layout(text);
  let glyphs = layout.glyphs;
  let minX = 1000;
  let maxX = 0;
  let minY = 1000;
  let maxY = 0;
  glyphs.map( glyph =>{
    if (glyph.bbox.minX < minX) minX = glyph.bbox.minX;
    if (glyph.bbox.maxX > maxX) maxX = glyph.bbox.maxX;
    if (glyph.bbox.minY < minY) minY = glyph.bbox.minY;
    if (glyph.bbox.maxY > maxY) maxY = glyph.bbox.maxY;
  });
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}


function iterate(options)
{
  let glyphs = [];
  let len = options.codes.length;
  for(let i=0;i<len;i++)
  {
    let range = options.codes[i];
    setGlyphs(glyphs, options, range[0], range[1]);
  }
  let counter = {
    total: 0,
    max: 100
  };
  for(let i=0;i<counter.max;i++)
  {
    generateIteration(glyphs, options, counter);
  }
}

function generateIteration(glyphs, options, counter)
{
  if (counter.total < counter.max)
  {
    let glyph = glyphs.shift();
    if (glyph)
    {
      counter.total++;
      generateFontImage(glyph, options, function(){
        counter.total--;
        generateIteration(glyphs, options, counter);
      });
    }
    else
    {
      if (counter.total == 0)
      {
        // console.log('complete');
        complete(options);
      }
    }
  }
}

function complete(options)
{
  if (options.json && options.output == 'png')
  {
    exportJSON(options);
  }
}

function setGlyphs(dict, options, start, end)
{
  for(let i=start; i<=end; i++)
  {
    if (i == 8260)
      continue;

    let char = String.fromCharCode(i);
    let layout = options.vert
               ? options.font.obj.layout(char, ['vert'])
               : options.font.obj.layout(char);
    let glyph = layout.glyphs[0];
    let box = glyph.bbox;
    if (box.minX != Infinity || glyph.codePoints[0] == 32)
    {
      glyph.scale = options.font.scale;
      dict.push(glyph);
    }
    else
    {
      let layout2 = options.vert
                  ? options.font2.obj.layout(char, ['vert'])
                  : options.font2.obj.layout(char);
      let glyph2 = layout2.glyphs[0];
      let box2 = glyph2.bbox;
      if (box2.minX != Infinity || glyph2.codePoints[0] == 32)
      {
        glyph2.scale = options.font2.scale;
        dict.push(glyph2);
      }
    }
  }
}


function generateFontImage(glyph, options, cb)
{
  let charPath = glyph.path;
  let pathCode = charPath.toSVG();
  let box = charPath.bbox;
  let fontScale = glyph.scale;
  let fontDescale = 1 / fontScale;
  let scale = options.scale * fontScale * options.multiple;
  let descale = 1 / scale;
  let maxWidth = Math.ceil(1000 * fontDescale / options.multiple);
  let maxHeight = Math.ceil(1000 * fontDescale / options.multiple);
  let marginH = options.marginH * descale;
  let marginV = options.marginV * descale;
  let parceint = Number(scale * 100).toFixed(2) + '%';

  if (box.minX == Infinity)
  {
    box = {
      minX: 0,
      minY: 0,
      maxX: 500 * fontDescale,
      maxY: 500 * fontDescale,
    };
  }
  let boxHeight = box.maxY - box.minY;
  if (boxHeight < 500)
  {
    marginV = Math.floor((500 - boxHeight) / 2);
  }
  let pos = getPosition(box, glyph, maxWidth, maxHeight, marginV, marginH, options);
  let viewBox = getViewBox(box, glyph, maxWidth, maxHeight, marginV, marginH, options);
  
  let code = '';
  code += '<?xml version="1.0" encoding="utf-8"?>\n';
  code += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" \n';
  code += '   viewBox="' + viewBox.join(' ') + '">\n';
  code += '<g transform="translate(' + pos.join(',') + ') scale(1,-1)">\n';
  code += '<path d="' + pathCode + '" fill="' + options.color + '"/>\n';
  code += '</g>\n';
  code += '</svg>\n';
  let codePoint = glyph.codePoints[0];
  let destSVG = path.resolve(options.dest, codePoint + '.svg');
  let destPNG = path.resolve(options.dest, codePoint + '.png');

  if (options.output == 'svg')
  {
    fs.writeFileSync(destSVG, code, 'utf8');
    cb();
  }

  if (options.output == 'png')
  {
    let args = [
      '-background','none', 
      '-resize', parceint, 
      'svg:', 
      '-channel', 'RGBA',
      '-alpha', 'set',
      '-quality', '100',
      '-define', 'png:format=png32',
      destPNG
    ];
    // console.log(code);
    // console.log(destPNG);
    // console.log('convert ' + args.join(' '));
    
    let convert = proc.spawn('convert', args);
    convert.stdin.write(code);
    convert.stdin.end();
    convert.on('close', (code) => {
      cb();
    });
  }

}

function getPosition(box, glyph, maxWidth, maxHeight, marginV, marginH, options)
{
  if (options.fixed == 'h' || options.fixed == 'width')
  {
    return [
      (maxWidth-glyph.advanceWidth)*0.5,
      box.maxY + marginV
    ];
  }
  if (options.fixed == 'v' || options.fixed == 'height')
  {
    return [
      -box.minX + marginH,
      options.offsetY,
    ];
  }
  if (options.fixed)
  {
    return [
      (maxWidth-glyph.advanceWidth)*0.5,
      options.offsetY,
    ];
  }
  return [
    -box.minX + marginH,
    box.maxY + marginV
  ];
}

function getViewBox(box, glyph, maxWidth, maxHeight, marginV, marginH, options)
{
  if (options.fixed == 'h' || options.fixed == 'width')
  {
    return [
      0, 
      0, 
      maxWidth, 
      box.maxY - box.minY + marginV * 2
    ];
  }
  if (options.fixed == 'v' || options.fixed == 'height')
  {
    return [
      0, 
      0, 
      box.maxX - box.minX + marginH * 2,
      maxHeight
    ];
  }
  if (options.fixed)
  {
    return [
      0, 
      0, 
      maxWidth,
      maxHeight
    ];
  }
  return [
    0, 
    0, 
    box.maxX - box.minX + marginH * 2, 
    box.maxY - box.minY + marginV * 2
  ];
}
