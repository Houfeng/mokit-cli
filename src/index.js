const shify = require('shify');
const request = require('request');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const https = require('https');;
const unzip = require("unzip");
const copy = require('./copy');
const chmod = require('./chmod');
const mkdirp = Promise.promisify(require('mkdirp'));
const globby = require('globby');
const utils = require('ntils');

const DOWNLOAD_URL = 'https://codeload.github.com/Houfeng/mokit-app/zip/master';
const CACHE_DIR = path.resolve(__dirname, '../.cache');
const TEMPLATE_DIR = `${CACHE_DIR}/mokit-app-master`;

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
    base: TEMPLATE_DIR
  });
}

async function createPackageLinks(pkgFile) {
  let pkgText = await fs.readFileAsync(pkgFile);
  if (!pkgText) return;
  let pkgInfo = JSON.parse(pkgText.toString());
  if (!pkgInfo.bin) return;
  let binDir = path.resolve(path.dirname(pkgFile), '../.bin');
  await mkdirp(binDir);
  let commands = Object.keys(pkgInfo.bin);
  await Promise.all(commands.map(cmd => {
    let cmdFile = path.resolve(path.dirname(pkgFile), pkgInfo.bin[cmd]);
    console.log(cmd, cmdFile);
    return fs.symlinkAsync(cmdFile, `${binDir}/${cmd}`);
  }));
}

async function createAllLinks(appDir) {
  let packages = await globby(`${appDir}/**/package.json`);
  await Promise.all(packages.map(pkgFile => {
    return createPackageLinks(pkgFile);
  }));
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
  await mkdirp(CACHE_DIR);
  if (force || !fs.existsSync(TEMPLATE_DIR)) {
    console.log('Downloading ...');
    let fileStream = await downloadFile(DOWNLOAD_URL);
    console.log('Extracting ...');
    await extractFiles(fileStream, CACHE_DIR);
    console.log('Installing dependencies ...');
    await run(`npm i`, TEMPLATE_DIR);
  } else {
    console.log('Cache found ...');
  }
  console.log('Copying files ...');
  await copyFiles([
    `${TEMPLATE_DIR}/**/*.*`,
    `${TEMPLATE_DIR}/**/*`,
    `!${TEMPLATE_DIR}/**/node_modules/.bin/**/*.*`,
    `!${TEMPLATE_DIR}/**/node_modules/.bin/**/*`
  ], appDir);
  console.log('');
  await chmod([
    `${appDir}/**/bin/**/*.*`,
    `${appDir}/**/bin/**/*`
  ], '777', {
    dot: true,
    nodir: true,
    symlinks: false
  });
  await createAllLinks(appDir);
  console.log('Done');
}

exports.init = init;
exports.run = run;