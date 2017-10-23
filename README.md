# export-font

```
let exportFont = require('./index');

let options = {
  dest: './dist',
  font: { // First candidate font.
    file: './fonts/TsukushiAMaruGothicBold.ttf',
    scale: 1
  },
  font2: { // Second candidate font.
    file: './fonts/A-OTF-ShinMGoPro-Medium.otf',
    scale: 1
  },
  json: './dist/_font.json', // It is effective only when PNG is output.
  output: 'png', // svg, png (default)
  vert: false, // Set 'true' for export for vertical writing. false (default) 
  fixed: 'v', // v=fixed height, h=fixed width, true=fixed size, false=trimming (default)
  size: 200, // Export size.
  margin: 4, // Margin Space
  charset: 1, // 0=none、1=ASCII, 2=Ja-KANA、3=Symbols, 4=KANJI, 5=Half-width Kana
  text: 'ABCかなカナ漢字azjgy12。「」', // Export charactors.
  color: 'black' // Text Color >> black, #0000FF, rgba(255, 120, 10, 0.5)
};

// export PNG32
exportFont.toPNG(options);

// export SVG
exportFont.toSVG(options);
```

