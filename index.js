#!/usr/bin/env node
var sh = require('shelljs');
var chalk = require('chalk');
var parse = require('parse-git-status');
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
    '?': 'untracked '
};

var main = function(staged_ok) {
	var response = sh.exec(
		'git status --porcelain -z',
		{ silent: true } // do not echo output to shell
	);

	if (response.code !== 0 || response.stderr) {
    throw new Error ('ERROR: ' + response.stderr);
	}
	return parse(response.stdout).reduce(function(acc, el) {
		// el.x = staged stage.
		// el.y = unstaged state,
		var is_changed = (!staged_ok && el.x !== ' ') ? el.x : el.y;
		switch (is_changed) {
			case 'M':
			case 'A':
			case 'D':
			case '?':
				return acc + '    ' + keys[is_changed] + ' ' + el.to + '\n';
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
