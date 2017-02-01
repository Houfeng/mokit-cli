'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var copy = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(patterns, dist, options) {
    var _this = this;

    var srcFiles, i;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            options = options || (0, _create2.default)(null);
            options.base = options.base || '/';
            _context2.next = 4;
            return globby(patterns, options);

          case 4:
            srcFiles = _context2.sent;
            i = 0;

          case 6:
            if (!(i < srcFiles.length)) {
              _context2.next = 12;
              break;
            }

            _context2.next = 9;
            return Promise.all(srcFiles.slice(i, i + BATCH_MAX).map(function (srcFile) {
              return (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                var dstFile, dstDir, buffer;
                return _regenerator2.default.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        // let srcStats = await fs.statAsync(srcFile);
                        // if (srcStats.isDirectory()) return;
                        dstFile = srcFile.replace(options.base, dist);
                        dstDir = path.dirname(dstFile);
                        _context.next = 4;
                        return mkdirp(dstDir);

                      case 4:
                        _context.next = 6;
                        return fs.readFileAsync(srcFile);

                      case 6:
                        buffer = _context.sent;

                        if (!options.link) {
                          _context.next = 12;
                          break;
                        }

                        _context.next = 10;
                        return fs.symlinkAsync(srcFile, dstFile);

                      case 10:
                        _context.next = 14;
                        break;

                      case 12:
                        _context.next = 14;
                        return fs.writeFileAsync(dstFile, buffer);

                      case 14:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, _this);
              }))();
            }));

          case 9:
            i += BATCH_MAX;
            _context2.next = 6;
            break;

          case 12:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function copy(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var globby = require('globby');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var mkdirp = Promise.promisify(require('mkdirp'));

var BATCH_MAX = 100;

module.exports = copy;