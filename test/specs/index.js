
var expect = require('chai').expect;
var tmp = require('tmp');
var fs = require('fs');
var path = require('path');
var sh = require('shelljs');
var check = require('../../index'); 

var staged_ok = true;
var no_staged = false;

describe('no-git-unstaged', function() {
	it('should return no errors with a clean slate', function() {
		expect(function() {
			check(staged_ok);
		}).to.not.throw();
	});

	it('should throw when there are unstaged errors', function() {
	  var basename = path.basename(tmp.tmpNameSync())
		var fname = path.join(__dirname, basename);
		fs.writeFileSync(fname, "Testing creation of an untracked file");
		expect(check(staged_ok)).to.match(new RegExp('.*untracked.*' + basename));
		fs.unlinkSync(fname);
	});

	it('should throw when there are staged errors', function() {
	  var basename = path.basename(tmp.tmpNameSync())
		var fname = path.join(__dirname, basename);
		fs.writeFileSync(fname, "Testing creation of an untracked file");
		expect(sh.exec('git add ' + fname)).to.have.property('code', 0);
		expect(check(no_staged)).to.match(new RegExp('.*untracked.*' + basename));
		fs.unlinkSync(fname);
		expect(sh.exec('git reset ' + fname)).to.have.property('code', 0);
	});

});
