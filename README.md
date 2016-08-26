# git-mods
It's common to use (pre-commit)[https://github.com/observing/pre-commit] and (pre-push)[https://github.com/dflourusso/pre-push]hooks] hooks to validate that commits follows code quality guidelines - code-style, test-coverage etc. 

When these fail, it requires changes. On the second run, the checks pass, but the changes are unstaged and do not get committed. I've made this mistake once too many times.

`git-mods` is an attempt to automate this check. It provides a wrapper around `git status` and parses the output to enable
1. `git-mods`: Checks to ensure there are no modifications in the current repo.
2. `git-mods --no-unstaged`: Checks to ensure no unstaged modifications exist. Staged modifications are acceptable.

With pre-commit and pre-push checks, the operation fails when some checks fail. Fixing this requires modifications and it's too easy to complete the operation without staging/commiting the changes on the second run. 

I have obviously done this one-too-many times. `git-mods` provides a simple script - meant to be invoked as a shell command to help automate the second-pass check.

### Side effect
A development process side effect is that no process 

## Installation

    npm install no-git-unstaged -D
    # Since we are designed to work with pre-commit and pre-push, install 'em too.
    npm install pre-commit pre-push -D

## Usage
In package.json

    "scripts": {
       "staged-mods-ok": "git-mods --staged_ok",
       "no-mods": "git-mods"
    },
		"pre-commit": [
      ...
      "staged-mods-ok" // should be the last check
		],
		"pre-push": [
      ...
      "no-mods" // should be the last check
		]

All `git commit` & `git push` operations should be safe at this point.

