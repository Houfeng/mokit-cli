#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cmdline = require('cmdline');
const pkg = require('../package.json');
const core = require('../');

cmdline
  .version(pkg.version)
  .help(path.normalize('@' + __dirname + '/help.txt'))
  .error(function (err) {
    console.error(err.message);
    process.exit(1);
  })

  /**
   * 创建工程
   */
  .root.command(['init'])
  .action(function () {
    core.init(process.cwd()).catch(err => {
      console.error(err);
    });;
  })

  /**
   * 其它未明确定义的命令
   * 统一转为 'npm run xxx'
   */
  .root.command(/^[a-z]+$/ig)
  .action(function (command) {
    core.run(command).then(() => {
      process.exit();
    }).catch(() => {
      process.exit();
    })
  })

  //开始解析
  .ready();