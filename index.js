'use strict';

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const async = require('async');
const Canvas = require('canvas');
const Image = Canvas.Image;

const WIDTH = 1280;
const HEIGHT = 720;
const IMG_SOURCE_DIR = './source-images';
const IMG_TARGET_DIR = './target-images';

function getImageInfos(imgSourceDir = './source-images') {
  const names = fs.readdirSync(imgSourceDir);
  const regExp = /img\[(\d+)\]\((\d+),(\d+),/;

  return names.map(name => {
    const result = regExp.exec(name);

    return {
      file: result.input,
      path: imgSourceDir,
      frame: result[1],
      x: parseInt(result[2], 10),
      y: parseInt(result[3], 10)
    };
  });
}

function makeDrawers(imageInfos) {
  const drawInfos = _.groupBy(imageInfos, 'frame');

  return _.mapValues(drawInfos, (infos, key) => {
    const canvas = new Canvas(WIDTH, HEIGHT);

    return {
      canvas,
      infos,
    };
  });
}

function attachImage(canvas, pngData, info) {
  const image = new Image();
  const { x, y } = info;
  const ctx = canvas.getContext('2d');

  image.src = pngData;

  ctx.drawImage(image, x, y, image.width, image.height);
}

function composeImages(drawers) {
  _.forEach(drawers, (drawer, key) => {
    const { canvas, infos } = drawer;

    async.eachSeries(infos, (info, done) => {
      fs.readFile(path.resolve(info.path, info.file), (err, data) => {
        if (err) {
          console.error(err);
          return;
        }

        attachImage(canvas, data, info);
        done();
      });
    }, (err) => {
      if (err) {
        console.error(err);
        return;
      }

      const out = fs.createWriteStream(path.resolve(IMG_TARGET_DIR, key + '.png'));
      canvas.pngStream().pipe(out);
    });
  });
}

(function run() {
  const imageInfos = getImageInfos(IMG_SOURCE_DIR);
  const drawers = makeDrawers(imageInfos);

  composeImages(drawers);
})();

