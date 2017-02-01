'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var init = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(appDir, force) {
    var fileStream;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(force || !fs.existsSync(CACHE_DIR))) {
              _context.next = 13;
              break;
            }

            console.log('Downloading ...');
            _context.next = 4;
            return downloadFile(DOWNLOAD_URL);

          case 4:
            fileStream = _context.sent;

            console.log('Extracting ...');
            _context.next = 8;
            return extractFiles(fileStream, EXTRACT_DIR);

          case 8:
            console.log('Installing dependencies ...');
            _context.next = 11;
            return run('npm i', CACHE_DIR);

          case 11:
            _context.next = 14;
            break;

          case 13:
            console.log('Cache found ...');

          case 14:
            console.log('Copying files ...');
            _context.next = 17;
            return copyFiles([CACHE_DIR + '/**/*.*', CACHE_DIR + '/**/*', '!' + CACHE_DIR + '/node_modules/**/*.*', '!' + CACHE_DIR + '/node_modules/**/*'], appDir);

          case 17:
            _context.next = 19;
            return copyFiles([CACHE_DIR + '/node_modules/**/*.*', CACHE_DIR + '/node_modules/**/*'], appDir, true);

          case 19:
            _context.next = 21;
            return chmod([appDir + '/bin/*.*'], '777', {
              dot: true,
              nodir: true,
              symlinks: false
            });

          case 21:
            console.log('Done');

          case 22:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function init(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var shify = require('shify');
var request = require('request');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var https = require('https');;
var unzip = require("unzip");
var copy = require('./copy');
var chmod = require('./chmod');

var DOWNLOAD_URL = 'https://codeload.github.com/Houfeng/mokit-app/zip/master';
var EXTRACT_DIR = path.resolve(__dirname, '../tmp');
var CACHE_DIR = EXTRACT_DIR + '/mokit-app-master';

function downloadFile(url) {
  return new Promise(function (resolve, reject) {
    https.get(url, function (res) {
      resolve(res);
    }).on('error', function (err) {
      reject(err);
    });
  });
}

function extractFiles(fileStream, dist) {
  return new Promise(function (resolve, reject) {
    var unzipStream = unzip.Extract({
      path: dist
    });
    unzipStream.on('finish', function () {
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
  return new Promise(function (resolve, reject) {
    var io = shify(command, {
      cwd: cwd || process.cwd(),
      temp: false
    });
    io.on('exit', resolve);
    io.stdout.on('end', resolve).pipe(process.stdout);
  });
};

exports.init = init;
exports.run = run;