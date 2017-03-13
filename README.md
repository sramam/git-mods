# git-mods
<!-- badge -->
[![npm license](https://img.shields.io/npm/l/git-mods.svg)](https://www.npmjs.com/package/git-mods)
[![travis status](https://img.shields.io/travis/sramam/git-mods.svg)](https://travis-ci.org/sramam/git-mods)
[![Build status](https://ci.appveyor.com/api/projects/status/l734j8mjdy9px31q?svg=true)](https://ci.appveyor.com/project/sramam/git-mods)
[![David](https://david-dm.org/sramam/git-mods/status.svg)](https://david-dm.org/sramam/git-mods)
[![David](https://david-dm.org/sramam/git-mods/dev-status.svg)](https://david-dm.org/sramam/git-mods?type=dev)
<!-- endbadge -->

A common pattern is to find errors during the commit/push process due to tests,git-hooks etc. Once changes are made, it's all too common to finish the original commit that leaves these changes behind.

`git-mods` automates this check. It provides a wrapper around `git status` and parses the output to enable

1. `git-mods`: Checks to ensure there are no modifications in the current repo.
2. `git-mods --staged_ok`: Checks to ensure no unstaged modifications exist. Staged modifications are acceptable.

Typically, `git-mods --staged_ok` is a good option to include in a `precommit`-hook  and `git-mods` to include in the `prepush`-hook.

## Installation
- First, add precommit/prepush hooks to the scripts section of `package.json`
## Usage
In `package.json:scripts`:
```json
...
"scripts": {
  "precommit": "git-mods --staged_ok",
  "prepush": "git-mods"
}
...
```
- THEN, install the dependencies.

*NOTE*: This inversion actually makes the flow easier, since `husky` uses a postinstall script to setup any hooks specified from the scripts section. This way we don't have to run the post-install script manually.

```
npm install git-mods husky --save-dev
```
