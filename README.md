# git-mods
<!-- badge -->
[![npm license](https://img.shields.io/npm/l/git-mods.svg)](https://www.npmjs.com/package/git-mods)
[![build](https://github.com/sramam/git-mods/actions/workflows/.action_ci.yml/badge.svg)](https://github.com/sramam/git-mods/actions/workflows/.action_ci.yml)
[![David](https://david-dm.org/sramam/git-mods/status.svg)](https://david-dm.org/sramam/git-mods)
[![David](https://david-dm.org/sramam/git-mods/dev-status.svg)](https://david-dm.org/sramam/git-mods?type=dev)
<br/>
[![NPM](https://nodei.co/npm/git-mods.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/git-mods/)
<!-- endbadge -->

A common pattern is to find errors during the commit/push process due to tests,git-hooks etc. Once changes are made, it's all too common to finish the original commit that leaves these changes behind.

`git-mods` automates this check. It provides a wrapper around `git status` and parses the output to enable

1. `git-mods`: Checks to ensure there are no modifications in the current repo.
2. `git-mods --staged_ok`: Checks to ensure no unstaged modifications exist. Staged modifications are acceptable.

Typically, `git-mods --staged_ok` is a good option to include in a `precommit`-hook  and `git-mods` to include in the `prepush`-hook.

## Installation & Usage

`git-mods` is best used along with [`husky`](https://www.npmjs.com/package/husky), to easily add git-hooks to your repo.
To make it's installation easier, `husky` uses a post install script to confgure any hooks specified. This results in a
slightly convoluted installation sequence. If you didn't read-the-manual the first time, just `npm install husky` a second time

- First, add precommit/prepush hooks to the scripts section of `package.json`
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

```
npm install git-mods husky --save-dev
```

