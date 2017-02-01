const globby = require('globby');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = Promise.promisifyAll(require('path'));
const mkdirp = Promise.promisify(require('mkdirp'));

const BATCH_MAX = 100;

async function copy(patterns, dist, options) {
  options = options || Object.create(null);
  options.base = options.base || '/';
  let srcFiles = await globby(patterns, options);
  for (let i = 0; i < srcFiles.length; i += BATCH_MAX) {
    await Promise.all(srcFiles.slice(i, i + BATCH_MAX).map(srcFile => {
      return (async() => {
        // let srcStats = await fs.statAsync(srcFile);
        // if (srcStats.isDirectory()) return;
        let dstFile = srcFile.replace(options.base, dist);
        let dstDir = path.dirname(dstFile);
        await mkdirp(dstDir);
        let buffer = await fs.readFileAsync(srcFile);
        if (options.link) {
          await fs.symlinkAsync(srcFile, dstFile);
        } else {
          await fs.writeFileAsync(dstFile, buffer);
        }
      })();
    }));
  }
}

module.exports = copy;