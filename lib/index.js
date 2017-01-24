const shify = require('shify');
const request = require('request');
const fs = require('fs');
const path = require('path');
const https = require('https');;
const unzip = require("unzip");
const copy = require('copy');
const chmod = require('chmod-plus');

const TMP_DIR = path.resolve(__dirname, '../tmp');
const ZIP_FILE = `${TMP_DIR}/app.zip`;
const ZIP_DIR = `${TMP_DIR}/mokit-app-master`;
const DOWNLOAD_URL = 'https://codeload.github.com/Houfeng/mokit-app/zip/master';

exports.init = function (dir) {
  return new Promise((resolve, reject) => {
    https.get(DOWNLOAD_URL, (res) => {
      res.on('end', () => {
        fs.createReadStream(ZIP_FILE).on('end', () => {
          copy(`${ZIP_DIR}/**/*.*`, dir, {
            dot: true
          }, function (err, files) {
            if (err) return reject(err);
            console.log(dir);
            resolve(files);
          });
        }).pipe(unzip.Extract({ path: TMP_DIR }));
      }).pipe(fs.createWriteStream(ZIP_FILE));
    }).on('error', (err) => {
      console.error(err);
      reject(err);
    });
  });

};

exports.run = function (command) {
  return new Promise((resolve, reject) => {
    var io = shify(function () {
      /* npm run ${command} */
    }, { params: { command: command }, temp: false });
    io.on('exit', resolve);
    io.stdout.on('end', resolve).pipe(process.stdout);
    io.stderr.on('end', reject).pipe(process.stderr);
  });

};