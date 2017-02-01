'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var createPackageLinks = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(pkgFile) {
    var pkgText, pkgInfo, binDir, commands;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fs.readFileAsync(pkgFile);

          case 2:
            pkgText = _context.sent;

            if (pkgText) {
              _context.next = 5;
              break;
            }

            return _context.abrupt('return');

          case 5:
            pkgInfo = JSON.parse(pkgText.toString());

            if (pkgInfo.bin) {
              _context.next = 8;
              break;
            }

            return _context.abrupt('return');

          case 8:
            binDir = path.resolve(path.dirname(pkgFile), '../.bin');
            _context.next = 11;
            return mkdirp(binDir);

          case 11:
            commands = (0, _keys2.default)(pkgInfo.bin);
            _context.next = 14;
            return Promise.all(commands.map(function (cmd) {
              var cmdFile = path.resolve(path.dirname(pkgFile), pkgInfo.bin[cmd]);
              return fs.symlinkAsync(cmdFile, binDir + '/' + cmd);
            }));

          case 14:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function createPackageLinks(_x) {
    return _ref.apply(this, arguments);
  };
}();

var createAllLinks = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(appDir) {
    var packages;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return globby(appDir + '/**/package.json');

          case 2:
            packages = _context2.sent;
            _context2.next = 5;
            return Promise.all(packages.map(function (pkgFile) {
              return createPackageLinks(pkgFile);
            }));

          case 5:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function createAllLinks(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

var init = function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(appDir, force) {
    var fileStream;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return mkdirp(CACHE_DIR);

          case 2:
            if (!(force || !fs.existsSync(TEMPLATE_DIR))) {
              _context3.next = 17;
              break;
            }

            console.log('Downloading ...');
            _context3.next = 6;
            return del([CACHE_DIR + '/**/*.*', CACHE_DIR + '/**/*'], {
              force: true
            });

          case 6:
            _context3.next = 8;
            return downloadFile(DOWNLOAD_URL);

          case 8:
            fileStream = _context3.sent;

            console.log('Extracting ...');
            _context3.next = 12;
            return extractFiles(fileStream, CACHE_DIR);

          case 12:
            console.log('Installing dependencies ...');
            _context3.next = 15;
            return run('npm i', TEMPLATE_DIR);

          case 15:
            _context3.next = 18;
            break;

          case 17:
            console.log('Cache found ...');

          case 18:
            console.log('Copying files ...');
            _context3.next = 21;
            return copyFiles([TEMPLATE_DIR + '/**/*.*', TEMPLATE_DIR + '/**/*', '!' + TEMPLATE_DIR + '/**/node_modules/.bin/**/*.*', '!' + TEMPLATE_DIR + '/**/node_modules/.bin/**/*'], appDir);

          case 21:
            console.log('Linking commands ...');
            _context3.next = 24;
            return chmod([appDir + '/**/bin/**/*.*', appDir + '/**/bin/**/*'], '777', {
              dot: true,
              nodir: true,
              symlinks: false
            });

          case 24:
            _context3.next = 26;
            return createAllLinks(appDir);

          case 26:
            console.log('Done');

          case 27:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function init(_x3, _x4) {
    return _ref3.apply(this, arguments);
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
var mkdirp = Promise.promisify(require('mkdirp'));
var globby = require('globby');
var utils = require('ntils');
var del = require('del');

var DOWNLOAD_URL = 'https://codeload.github.com/Houfeng/mokit-app/zip/master';
var CACHE_DIR = path.resolve(__dirname, '../.cache');
var TEMPLATE_DIR = CACHE_DIR + '/mokit-app-master';

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
    base: TEMPLATE_DIR
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