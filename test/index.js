'use strict';

const fs = require('fs');
const Canvas = require('canvas');
const Image = Canvas.Image;

const canvas = new Canvas(1280, 720);
const ctx = canvas.getContext('2d');

fs.readFile('./source-images/img[17](872,0,256,180)_1538206401234.png', (err, png) => {
  if (err) {
    console.error(err);
    return;
  }

  const img = new Image();
  img.src = png;
  ctx.drawImage(img, 10, 10, img.width, img.height);

  const out = fs.createWriteStream('./target-images/output.png');
  canvas.pngStream().pipe(out);
});

