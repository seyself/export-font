
let exportFont = require('./index');
let options = {
  dest: './dist',
  font: {
    file: './fonts/TsukushiAMaruGothicBold.ttf',
    scale: 1
  },
  font2: {
    file: './fonts/A-OTF-ShinMGoPro-Medium.otf',
    scale: 1
  },
  json: './dist/_font.json', // PNG出力時のみ
  output: 'png', // svg, png (default)
  vert: false, // 縦書き用フォント true, false (default) 
  fixed: 'v', // 高さ固定=v, 幅固定=h, 縦横固定=true, トリミング=false (default)
  size: 200, // 出力基準サイズ
  margin: 4, 
  charset: 1, // 0=無し、1=英数字、2=かな・カナ、3=記号、4=漢字、5=半角カナ
  text: 'ABCかなカナ漢字azjgy12。「」', // 出力文字指定
  color: 'black' // 文字色 black, #0000FF, rgba(255, 120, 10, 0.5) ...
};
exportFont.toPNG(options);
// exportFont.toSVG(options);
