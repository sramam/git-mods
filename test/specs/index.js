var expect = require('chai').expect;
var tmp = require('tmp');
var fs = require('fs');
var path = require('path');
var sh = require('shelljs');
var check = require('../../index');
var rimraf = require('rimraf');

var staged_ok = true;
var no_staged = false;
var git_mods = path.resolve(path.join(__dirname, '..', '..'));

var dir;
var files;
// tmp.setGracefulCleanup();

var pkgGen = function (dir) {
  return {
    name: 'fixtures',
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {
      'staged-mods-ok': 'git-mods --staged_ok',
      'no-mods': 'git-mods'
    },
    keywords: [],
    author: '',
    license: 'ISC',
    devDependencies: {
      'git-mods': dir.toString()
    }
  }
}

describe('git-mods', function () {
  before(function () {
    this.timeout(10000);
    var pkg = pkgGen(git_mods);
    dir = tmp.dirSync();
    files = {
      staged: path.join(dir.name, 'staged.txt'),
      unstaged: path.join(dir.name, 'unstaged.txt'),
      modified: path.join(dir.name, 'modified.txt')
    };
    fs.writeFileSync(path.join(dir.name, 'package.json'), JSON.stringify(pkg, null, 2));
    sh.cd(dir.name);
    sh.exec('git init');
    sh.exec('npm install');
  });


  it('should return no errors with a clean slate', function () {
    fs.writeFileSync(files.staged, 'staged');
    sh.exec('git add ' + files.staged);
    expect(function () {
      check(staged_ok);
    }).to.not.throw();
    sh.exec('git reset ' + files.staged);
    fs.unlink(files.staged);
  });

  it('should throw when there are unstaged files', function () {
    var basename = path.basename(files.unstaged);
    fs.writeFileSync(files.unstaged, 'unstaged');
    sh.exec('git status');
    expect(check(staged_ok)).to.match(new RegExp('.*untracked.*' + basename));
    fs.unlink(files.unstaged);
  });

  // this test interferes with commits. Unskip to test locally and move on.
  it('should throw when there are staged files', function () {
    var basename = path.basename(files.unstaged);
    fs.writeFileSync(files.staged, 'staged');
    fs.writeFileSync(files.unstaged, 'unstaged');
    sh.exec('git add ' + files.staged);
    sh.exec('git status');
    expect(check(no_staged)).to.match(new RegExp('.*untracked.*' + basename));
    sh.exec('git reset ' + files.staged);
    fs.unlink(files.staged);
    fs.unlinkSync(files.unstaged);
  });

  it('should throw when there are modifications', function () {
    var basename = path.basename(files.modified);
    fs.writeFileSync(files.modified, 'initial add', 'utf8');
    fs.writeFileSync('.gitignore', 'node_modules', 'utf8');
    sh.exec('git add . --all');
    sh.exec('git config --global user.email "travis-ci@example.com"');
    sh.exec('git config --global user.name "Travis Check"');
    sh.exec('git commit -m "initial add"');
    fs.writeFileSync(files.modified, 'modified', 'utf8');
    sh.exec('git status');
    expect(check(staged_ok)).to.match(new RegExp('.*modified.*' + basename));
    fs.unlink(files.modified);
  });
});
