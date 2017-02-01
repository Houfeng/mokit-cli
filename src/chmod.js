const globby = require('globby');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

async function chmodOne(file, mode) {
  await fs.chmodAsync(file, mode);
}

async function chmodMult(files, mode) {
  await Promise.all(files.map(file => chmodOne(file, mode)));
}

async function chmod(patterns, mode, options) {
  let files = await globby(patterns, options);
  await chmodMult(files, mode);
}

chmod.chmodOne = chmodOne;
chmod.chmodMult = chmodMult;

module.exports = chmod;