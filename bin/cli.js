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
  .option(['-f', '--force'], 'switch')
  .action(function (force) {
    core.init(process.cwd(), force)
      .catch(err => {
        console.error(err);
      });
  }, false)

  /**
   * 其它未明确定义的命令
   * 统一转为 'npm run xxx'
   */
  .root.command(/^[a-z]+$/ig)
  .action(function (command) {
    core.run(`npm run ${command}`).then(() => {
      process.exit(0);
    }).catch(() => {
      process.exit(1);
    })
  })

  //开始解析
  .ready();