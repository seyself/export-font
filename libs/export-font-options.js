const fs = require('fs');
const path = require('path');

module.exports = (options)=>
{
  if (!options) options = {};
  if (!options.dest) options.dest = './dist';
  if (!options.output) options.output = 'png';
  if (!options.fixed) options.fixed = false;
  if (!options.vert) options.vert = false;
  if (!options.color) options.color = 'black';
  if (!options.size) options.size = 128;
  if (!options.text) options.text = '';
  if (!options.charset) options.charset = 0;
  if (!options.json) options.json = 0;
  if (!options.marginV) options.marginV = options.margin || 0;
  if (!options.marginH) options.marginH = options.margin || 0;
  options.scale = options.size / 1000;
  options.charset = options.charset || 0;
  
  if (typeof(options.font) == 'string')
  {
    options.font = {
      file: options.font,
      scale: 1
    };
  }
  if (typeof(options.font2) == 'string')
  {
    options.font2 = {
      file: options.font2,
      scale: 1
    };
  }
  if (!options.font2)
  {
    options.font2 = {
      file: options.font.file,
      scale: options.font.scale
    };
  }
  

  const DEST = options.dest;
  const FONT1 = options.font.file;
  const FONT2 = options.font2 ? options.font2.file : FONT1;
  const FONT1_SCALE = options.font.scale || 1;
  const FONT2_SCALE = options.font2 ? options.font2.scale : FONT1_SCALE;
  const FONT_SCALE = options.size / 1000;

  let ADD_CHARS = options.text;

  let CODE_CHOICES = [];
  if (options.charset > 0)
  {
    CODE_CHOICES.push([0x0020, 0x007D]); // ASCIIコード
  }
  if (options.charset > 1)
  {
    CODE_CHOICES.push([0x3041, 0x3093]); // ひらがな
    CODE_CHOICES.push([0x30A1, 0x30F6]); // カタカナ
    CODE_CHOICES.push([0x3000, 0x301C]); // 全角スペース、句読点など
    CODE_CHOICES.push([0x309B, 0x309E]); // ゛, ゜, ゝ, ゞ
    CODE_CHOICES.push([0x30FB, 0x30FE]); // ・, ー, ヽ, ヾ
  }
  if (options.charset > 2)
  {
    CODE_CHOICES.push([0x00A2, 0x00F7]); // Latin-1 に含まれる各種記号
    CODE_CHOICES.push([0x0391, 0x03C9]); // ギリシャ文字
    CODE_CHOICES.push([0x0401, 0x0451]); // キリル文字
    CODE_CHOICES.push([0x2010, 0x2312]); // 矢印、科学技術記号など
    CODE_CHOICES.push([0x2500, 0x254B]); // 罫線
    CODE_CHOICES.push([0x25A0, 0x266F]); // 図形など
    CODE_CHOICES.push([0xFF01, 0xFF5D]); // 全角英数字など
  }
  if (options.charset > 3)
  {
    CODE_CHOICES.push([0x4E00, 0x9FA0]); // 漢字
  }
  if (options.charset > 4)
  {
    CODE_CHOICES.push([0xFF61, 0xFF9F]); // 半角カナ
  }

  //==========================================================================================

  let addstr = ADD_CHARS;
  let addstr_len = addstr.length;
  for(let i=0; i<addstr_len; i++)
  {
    let strcode = addstr.charCodeAt(i);
    CODE_CHOICES.push([strcode, strcode]);
  }

  options.codes = CODE_CHOICES;
  
  return options;
}

