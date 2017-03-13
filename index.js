#!/usr/bin/env node

var sh = require('shelljs')
var chalk = require('chalk')
var program = require('commander')
var pkg = require('./package.json')
var debug = require('debug')('git-mods')

program
  .version(pkg.version)
  .description('check to see there are no modifications in the repo. Default to not allowing and staged/unstaged modifications.')
  .option('--staged_ok', 'staged files are acceptable, no unstaged files allowed', false)
  .parse(process.argv);

function xyShortcode(xy, staged_ok) {
  // xy shortcodes https://git-scm.com/docs/git-status
  var codes = [{
    re: /\?\?/,
    code: 'untracked'
  // }, {
  //   re: /\!\!/,
  //   code: 'ignored'
  }, {
    re: /[ MARC]M/,
    code: 'unstaged (modification)'
  }, {
    re: /[ MARC]D/,
    code: 'unstaged (deletion)'
  }, {
    re: /M /,
    code: 'staged (modification)'
  }, {
    re: /A /,
    code: 'staged (addition)'
  }, {
    re: /D /,
    code: 'staged (deletion)'
  }, {
    re: /R /,
    code: 'staged (rename)'
  }, {
    re: /C /,
    code: 'staged (copy)'
  }, {
    re: /DD/,
    code: 'unmerged (both deleted)'
  }, {
    re: /AU/,
    code: 'unmerged (added by us)'
  }, {
    re: /UD/,
    code: 'unmerged (deleted by them)'
  }, {
    re: /UA/,
    code: 'unmerged (added by them)'
  }, {
    re: /DU/,
    code: 'unmerged (deleted by us)'
  }, {
    re: /AA/,
    code: 'unmerged (both added)'
  }, {
    re: /UU/,
    code: 'unmerged (both modified)'
  }]
  return codes.reduce(function (_, el) {
    var match = (!!xy.match(el.re) && (staged_ok ? !el.code.match(/^staged/) : true));
    if (match) {
      debug('shortcode staged_ok:' + staged_ok + ' match:' + match + ' "' + xy + '" matches "' + el.re + '" => ' + el.code)
    }
    return _ || (match ? el.code : null)
  }, null)
}

function git_status_parse(response, staged_ok) {
  var lines = response.split('\n')
  return lines.reduce((_, line) => {
    if (line !== '') {
      debug('---\n' + line)
      var parts = line.match(/^(..)(.*)/)
      var xy = xyShortcode(parts[1], staged_ok)
      if (xy) {
        _.push(xy + parts[2])
        debug(xy + parts[2])
      }
    }
    return _;
  }, []);
}

var main = function (staged_ok) {
  var response = sh.exec(
    'git status --porcelain', {
      silent: true
    } // do not echo output to shell
  );
  debug('git status --procelain')
  if (response.code !== 0 || response.stderr) {
    throw new Error('ERROR: ' + response.stderr);
  }
  debug(response.stdout)
  return git_status_parse(response.stdout, staged_ok)
}

if (require.main === module) {
  var response = main(program.staged_ok);
  if (0 < response.length) {
    var msg = program.staged_ok ?
      "There are unstaged changes in the repo. Please stage/stash them before proceeding" :
      "There are uncommitted changes in the repo. Please commit/stash them before proceeding";
    console.error(msg);
    console.error(chalk.red('    ' + response.join('\n    ')));
    process.exit(1);
  }
} else {
  module.exports = main;
}
