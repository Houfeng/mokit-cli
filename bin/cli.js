#!/usr/bin/env node

const cmdline = require('cmdline');
const pkg = require('../package.json');
const fs = require('fs');
const path = require('path');
const shify = require('shify');

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
  .root.command(['create', 'new'])
  .option(['-t', '--type'], 'switch')
  .action(function ($1) {
    console.log($1);
    return false;
  })
  /**
   * 其它未明确定义的命令
   * 统一转为 'npm run xxx'
   */
  // .root.command(/^[a-z]+$/ig)
  // .action(function (command) {
  //   var io = shify(function () {
  //     /* npm run ${command} */
  //   }, { params: { command: command }, temp: false });
  //   io.on('exit', process.exit.bind(process));
  //   io.stdout.pipe(process.stdout);
  // })
  //开始解析
  .ready();