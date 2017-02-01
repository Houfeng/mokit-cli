const shify = require('shify');
const request = require('request');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const https = require('https');;
const unzip = require("unzip");
const copy = require('./copy');
const chmod = require('./chmod');

const DOWNLOAD_URL = 'https://codeload.github.com/Houfeng/mokit-app/zip/master';
const EXTRACT_DIR = path.resolve(__dirname, '../tmp');
const CACHE_DIR = `${EXTRACT_DIR}/mokit-app-master`;

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      resolve(res);
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function extractFiles(fileStream, dist) {
  return new Promise((resolve, reject) => {
    let unzipStream = unzip.Extract({
      path: dist
    });
    unzipStream.on('finish', () => {
      setTimeout(function () {
        resolve(dist);
      }, 100);
    });
    fileStream.pipe(unzipStream);
  });
}

function copyFiles(patterns, dist, link) {
  return copy(patterns, dist, {
    dot: true,
    nodir: true,
    link: link,
    base: CACHE_DIR
  });
}

function run(command, cwd) {
  return new Promise((resolve, reject) => {
    var io = shify(command, {
      cwd: cwd || process.cwd(),
      temp: false
    });
    io.on('exit', resolve);
    io.stdout.on('end', resolve).pipe(process.stdout);
  });
};

async function init(appDir, force) {
  if (force || !fs.existsSync(CACHE_DIR)) {
    console.log('Downloading ...');
    let fileStream = await downloadFile(DOWNLOAD_URL);
    console.log('Extracting ...');
    await extractFiles(fileStream, EXTRACT_DIR);
    console.log('Installing dependencies ...');
    await run(`npm i`, CACHE_DIR);
  } else {
    console.log('Cache found ...');
  }
  console.log('Copying files ...');
  await copyFiles([
    `${CACHE_DIR}/**/*.*`,
    `${CACHE_DIR}/**/*`,
    `!${CACHE_DIR}/node_modules/**/*.*`,
    `!${CACHE_DIR}/node_modules/**/*`
  ], appDir);
  await copyFiles([
    `${CACHE_DIR}/node_modules/**/*.*`,
    `${CACHE_DIR}/node_modules/**/*`
  ], appDir, true);
  await chmod([
    `${appDir}/bin/*.*`
  ], '777', {
    dot: true,
    nodir: true,
    symlinks: false
  });
  console.log('Done');
}

exports.init = init;
exports.run = run;