var expect = require('chai').expect;
var tmp = require('tmp');
var fs = require('fs');
var path = require('path');
var sh = require('shelljs');
var check = require('../index');
var rimraf = require('rimraf');

var staged_ok = true;
var git_mods = path.resolve(path.join(__dirname, '..'));

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

const exists = function (arr, re) {
  // console.log(arr)
  return arr.reduce(function (_, el) {
    // console.log('--')
    // console.log(el);
    // console.log(re)
    // console.log(el.match(re));
    // console.log(_ || (null !== el.match(re)))
    return _ || (null !== el.match(re))
  }, false)
}

describe('git-mods', function () {
  var filename = 'file.txt'
  var re = {
    untracked: (new RegExp('^untracked ' + filename)),
    staged: (new RegExp('^staged .* ' + filename)),
    unstaged: (new RegExp('^unstaged .* ' + filename))
  }
  var repodir;
  this.timeout(20000)

  before(function () {
    var pkg = pkgGen(git_mods)
    repodir = tmp.dirSync().name;
    fs.writeFileSync(path.join(repodir, 'package.json'), JSON.stringify(pkg, null, 2))
    sh.cd(repodir)
    sh.exec('npm install')
  })

  // --
  it('untracked file, tagged when  staged_ok', function () {
    rimraf.sync(path.join(repodir, '.git'))
    sh.exec('git init')
    sh.exec('git config user.email "you@example.com"')
    sh.exec('git config user.name "Your Name"')
    fs.writeFileSync('.gitignore', 'node_modules', 'utf8')
    fs.writeFileSync(filename, 'content', 'utf8')
    // sh.exec('git status --porcelain')
    expect(
      exists(check(staged_ok), re.untracked)
    ).to.be.true
  })

  it('untracked file, tagged when !staged_ok', function () {
    rimraf.sync(path.join(repodir, '.git'))
    sh.exec('git init')
    sh.exec('git config user.email "you@example.com"')
    sh.exec('git config user.name "Your Name"')
    fs.writeFileSync('.gitignore', 'node_modules', 'utf8')
    fs.writeFileSync(filename, 'content', 'utf8')
    // sh.exec('git status --porcelain')
    expect(
      exists(check(!staged_ok), re.untracked)
    ).to.be.true
  })

  // --
  it('staged addition, not tagged when staged_ok', function () {
    rimraf.sync(path.join(repodir, '.git'))
    sh.exec('git init')
    sh.exec('git config user.email "you@example.com"')
    sh.exec('git config user.name "Your Name"')
    fs.writeFileSync('.gitignore', 'node_modules', 'utf8')
    fs.writeFileSync(filename, 'content', 'utf8')
    sh.exec('git add . --all')
    // sh.exec('git status --porcelain')
    expect(
      exists(check(staged_ok), re.staged)
    ).to.be.false
  })

  it('staged addition, tagged when !staged_ok', function () {
    rimraf.sync(path.join(repodir, '.git'))
    sh.exec('git init')
    sh.exec('git config user.email "you@example.com"')
    sh.exec('git config user.name "Your Name"')
    fs.writeFileSync('.gitignore', 'node_modules', 'utf8')
    fs.writeFileSync(filename, 'content', 'utf8')
    sh.exec('git add . --all')
    // sh.exec('git status --porcelain')
    expect(
      exists(check(!staged_ok), re.staged)
    ).to.be.true
  })

  // --
  it('unstaged modification, tagged when staged_ok', function () {
    rimraf.sync(path.join(repodir, '.git'))
    sh.exec('git init')
    sh.exec('git config user.email "you@example.com"')
    sh.exec('git config user.name "Your Name"')
    fs.writeFileSync('.gitignore', 'node_modules', 'utf8')
    fs.writeFileSync(filename, 'content', 'utf8')
    sh.exec('git add . --all')
    sh.exec('git commit -m "initial commit"')
    fs.writeFileSync(filename, 'content-modified', 'utf8')
    // sh.exec('git status --porcelain')
    expect(
      exists(check(staged_ok), re.unstaged)
    ).to.be.true
  })

  it('unstaged modification, tagged when !staged_ok', function () {
    rimraf.sync(path.join(repodir, '.git'))
    sh.exec('git init')
    sh.exec('git config user.email "you@example.com"')
    sh.exec('git config user.name "Your Name"')
    fs.writeFileSync('.gitignore', 'node_modules', 'utf8')
    fs.writeFileSync(filename, 'content', 'utf8')
    sh.exec('git add ' + filename)
    sh.exec('git commit -m "initial commit"')
    fs.writeFileSync(filename, 'content-modified', 'utf8')
    // sh.exec('git status --porcelain')
    expect(
      exists(check(!staged_ok), re.unstaged)
    ).to.be.true
  })

  // --
  it('unstaged delete, tagged when staged_ok', function () {
    rimraf.sync(path.join(repodir, '.git'))
    sh.exec('git init')
    sh.exec('git config user.email "you@example.com"')
    sh.exec('git config user.name "Your Name"')
    fs.writeFileSync('.gitignore', 'node_modules', 'utf8')
    fs.writeFileSync(filename, 'content', 'utf8')
    sh.exec('git add . --all')
    sh.exec('git commit -m "initial commit"')
    sh.exec('rm ' + filename);
    sh.exec('git status --porcelain')
    expect(
      exists(check(staged_ok), re.unstaged)
    ).to.be.true
  })

  it('unstaged delete, tagged when !staged_ok', function () {
    rimraf.sync(path.join(repodir, '.git'))
    sh.exec('git init')
    sh.exec('git config user.email "you@example.com"')
    sh.exec('git config user.name "Your Name"')
    fs.writeFileSync('.gitignore', 'node_modules', 'utf8')
    fs.writeFileSync(filename, 'content', 'utf8')
    sh.exec('git add . --all')
    sh.exec('git commit -m "initial commit"')
    sh.exec('rm ' + filename);
    sh.exec('git status --porcelain')
    expect(
      exists(check(!staged_ok), re.unstaged)
    ).to.be.true
  })

  // --
  it('staged delete, tagged when staged_ok', function () {
    rimraf.sync(path.join(repodir, '.git'))
    sh.exec('git init')
    sh.exec('git config user.email "you@example.com"')
    sh.exec('git config user.name "Your Name"')
    fs.writeFileSync('.gitignore', 'node_modules', 'utf8')
    fs.writeFileSync(filename, 'content', 'utf8')
    sh.exec('git add . --all')
    sh.exec('git commit -m "initial commit"')
    sh.exec('git rm ' + filename);
    sh.exec('git status --porcelain')
    expect(
      exists(check(staged_ok), re.staged)
    ).to.be.false
  })

  it('staged delete, tagged when !staged_ok', function () {
    rimraf.sync(path.join(repodir, '.git'))
    sh.exec('git init')
    sh.exec('git config user.email "you@example.com"')
    sh.exec('git config user.name "Your Name"')
    fs.writeFileSync('.gitignore', 'node_modules', 'utf8')
    fs.writeFileSync(filename, 'content', 'utf8')
    sh.exec('git add . --all')
    sh.exec('git commit -m "initial commit"')
    sh.exec('git rm ' + filename);
    sh.exec('git status --porcelain')
    expect(
      exists(check(!staged_ok), re.staged)
    ).to.be.true
  })
});
