#!/usr/bin/env node
var sh = require('shelljs');
var chalk = require('chalk');
var program = require('commander');
var pkg = require('./package.json');

program
	.version(pkg.version)
  .description('check to see there are no modifications in the repo. Default to not allowing and staged/unstaged modifications.')
	.option('--staged_ok', 'staged files are acceptable, no unstaged files allowed', false)
  .parse(process.argv);

var keys = {
    'M': 'modified   ',
    'A': 'added      ',
    'D': 'deleted    ',
    'R': 'renamed    ',
    'C': 'copied     ',
    '?': 'untracked  '
};

function git_status_parse(response) {
	var lines = response.split('\n')
	return lines.reduce((_, line) => {
		if (line !== '') {
      var parts = line.trim().split(/ +/)
      var xy = parts[0].split('')
			var x = xy[0] || ' '
			var y = xy[1] || ' '
			_.push({
				x: x,
				y: y,
				from: parts[1],
				to: parts[3] || null
			})
		}
		return _;
	}, []);
}

var main = function(staged_ok) {
	var response = sh.exec(
		'git status --porcelain',
		{ silent: true } // do not echo output to shell
	);

	if (response.code !== 0 || response.stderr) {
    throw new Error ('ERROR: ' + response.stderr);
	}
	return git_status_parse(response.stdout).reduce(function(acc, el) {
		var is_changed = el.x;
    switch (is_changed) {
			case 'M':
			case 'A':
			case 'D':
			case '?':
				return acc + '    ' + keys[is_changed] + ' ' + el.from + '\n';
			case 'C':
			case 'R':
				return acc + '    ' + keys[is_changed] + ' ' + el.from + ' -> ' + el.to + '\n';
			case ' ':
				// this is a staged change, no-op for our purposes
				return acc;
			default:
				throw new Error('Unknown git status:' + is_changed + ' ' + JSON.stringify(el));
		}
	}, '');
}

if (require.main === module) {
	var response = main(program.staged_ok);
  if (0 < response.length) {
		var msg = program.staged_ok ?
			"There are unstaged changes in the repo. Please stage/stash them before proceeding" :
			"There are uncommitted changes in the repo. Please commit/stash them before proceeding";
		console.error(msg);
		console.error(chalk.red(response));
		process.exit(1);
	}
} else {
	module.exports = main;
}
