
var expect = require('chai').expect;
var tmp = require('tmp');
var fs = require('fs');
var path = require('path');
var sh = require('shelljs');
var rimraf = require('rimraf');
var handlebars = require('handlebars');
var check = require('../../index');
var rimraf = require('rimraf');

var staged_ok = true;
var no_staged = false;
var git_mods = path.resolve(path.join(__dirname, '..', '..'));

var dir;
var files;
tmp.setGracefulCleanup();

describe('git-mods', function() {
	before(function() {
		var pkg = fs.readFileSync('test/fixtures/package.json.hbs', 'utf-8')
		var template = handlebars.compile(pkg);
		var render = template({
			git_mods: git_mods
		});
		this.timeout(10000);
		dir = tmp.dirSync();
		files = {
			staged : path.join(dir.name, 'staged.txt'),
			unstaged: path.join(dir.name, 'unstaged.txt')
		};
		fs.writeFileSync(path.join(dir.name, 'package.json'), render);
		sh.cd(dir.name);
		sh.exec('git init');
		sh.exec('npm install');
	});

	after(function() {
		rimraf.sync(dir.name);
	});

	it('should return no errors with a clean slate', function() {
	  fs.writeFileSync(files.staged, 'staged');
		sh.exec('git add ' + files.staged);
		expect(function() {
			check(staged_ok);
		}).to.not.throw();
		sh.exec('git reset ' + files.staged);
		fs.unlink(files.staged);
	});

	it('should throw when there are unstaged errors', function() {
		var basename = path.basename(files.unstaged);
		fs.writeFileSync(files.unstaged, 'unstaged');
		expect(check(staged_ok)).to.match(new RegExp('.*untracked.*' + basename));
		fs.unlink(files.unstaged);
	});

	// this test interferes with commits. Unskip to test locally and move on.
	it('should throw when there are staged errors', function() {
		var basename = path.basename(files.unstaged);
	  fs.writeFileSync(files.staged, 'staged');
		fs.writeFileSync(files.unstaged, 'unstaged');
		sh.exec('git add ' + files.staged);
		expect(check(no_staged)).to.match(new RegExp('.*untracked.*' + basename));
		sh.exec('git reset ' + files.staged);
		fs.unlink(files.staged);
		fs.unlinkSync(files.unstaged);
	});

});
