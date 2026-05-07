# 1-tooling-and-prettier

## Context

Stand up the local development tooling: `package.json`, `justfile`,
prettier config, and a sane `.gitignore`. After this task, `npm test`
exists as a command but does nothing yet — the lint and smoke scripts
arrive in task 2. This task locks the tooling shape so every subsequent
task plugs into the same hooks.

**Value delivered**: a clone of this repo runs `npm install` and gets
prettier; `just` lists recipes; the npm script surface is wired even if
the targets are empty stubs.

## Related Files

- `.todo/US-bootstrap/main.md` — full design, "Tooling parity with 97"
- `/Users/orbarila/repos/personal/97/package.json` — calibration reference
- `/Users/orbarila/repos/personal/97/justfile` — calibration reference

## Dependencies

- None

## Acceptance Criteria

- [ ] `package.json` exists with: name `council`, version `0.0.0`,
      `type: module`, `engines.node >= 18`, `license: MIT`, `repository`
      block pointing at `git+https://github.com/oribarilan/council.git`,
      empty `dependencies`, prettier-only `devDependencies`, `files`
      array listing what eventually gets published, and `scripts`:
      `lint`, `smoke`, `format`, `format:check`, `test` (= lint +
      format:check + smoke).
- [ ] `justfile` exists with recipes: `default` (= `--list`), `test`,
      `lint`, `format`, `format-check`, `check` (= lint + format-check
      + test), `clean`. All recipes are thin wrappers over `npm run X`.
- [ ] `.prettierrc.json` exists with `97`'s settings (single-quote JS,
      JSON allowed double-quote, sensible width).
- [ ] `.prettierignore` exists and excludes `node_modules/`,
      `.todo/`, all markdown files (`**/*.md`), and `.github/` is NOT
      excluded (workflow YAML must be formatted).
- [ ] `.gitignore` already exists; verify `node_modules/` and
      `.prettiercache` are listed; add if missing. Do not strip
      anything currently there.
- [ ] `scripts/` directory exists (created with a `.gitkeep` if empty,
      so task 2 has somewhere to land).
- [ ] `npm install` runs cleanly. `npx prettier --version` works.
- [ ] `just` (no args) lists all recipes without errors.
- [ ] The `lint` and `smoke` npm scripts exist but currently print a
      stub message (e.g. `node -e "console.log('lint stub')"`) so
      `npm test` exits 0 — task 2 replaces them with real scripts.

## File Content

### `package.json`

```json
{
  "name": "council",
  "version": "0.0.0",
  "type": "module",
  "description": "A multi-agent council for your coding agent: parallel deliberation, peer review, synthesis. Plugin for GitHub Copilot CLI.",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/oribarilan/council.git"
  },
  "files": [
    ".copilot/",
    "scripts/",
    "AGENTS.md",
    "CHANGELOG.md",
    "CONTRIBUTE.md",
    "LICENSE",
    "README.md"
  ],
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "lint": "node -e \"console.log('lint stub - replaced in task 2')\"",
    "smoke": "node -e \"console.log('smoke stub - replaced in task 2')\"",
    "format": "prettier --write \"**/*.{js,mjs,cjs,json,yml,yaml}\"",
    "format:check": "prettier --check \"**/*.{js,mjs,cjs,json,yml,yaml}\"",
    "test": "npm run lint && npm run format:check && npm run smoke"
  },
  "devDependencies": {
    "prettier": "^3.3.3"
  }
}
```

### `justfile`

```make
# justfile — local task runner for council
#
# Run `just` (no args) to list available recipes.
# CI uses npm scripts directly so it doesn't need `just` installed; the
# recipes here are thin wrappers that mirror the npm scripts in package.json.

default:
    @just --list

# Run the smoke test (loads plugin, parses manifests, asserts invariants).
test:
    @npm run smoke

# Structural lint of agent files.
lint:
    @npm run lint

# Check formatting without mutating files (Prettier on JS/JSON/YAML).
format-check:
    @npm run format:check

# Format JS/JSON/YAML in-place with Prettier.
format:
    @npm run format

# Run every check that gates a green build: lint + format-check + test.
check: lint format-check test

# Remove generated/ignored artifacts.
clean:
    @rm -rf node_modules .prettiercache
```

### `.prettierrc.json`

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "overrides": [
    {
      "files": ["*.json", "*.yml", "*.yaml"],
      "options": { "singleQuote": false }
    }
  ]
}
```

### `.prettierignore`

```
node_modules/
.prettiercache
.todo/
**/*.md
package-lock.json
```

## Verification

- Ad-hoc:
  - `npm install` runs cleanly, exits 0.
  - `npm test` exits 0 (stubs print, format check passes on the JSON
    files we just wrote).
  - `just` (no args) lists recipes, exits 0.
  - `just check` exits 0.
- Run on macOS (developer box). Linux/Windows validated later via CI in
  task 3.

## Notes

- `package.json` `version` is `0.0.0` deliberately. The first real
  release tag (`v0.1.0`) lands when the agent-files slice ships, not
  here.
- `files` array lists `.copilot/` even though it doesn't exist yet. It
  will exist when the agent-files slice ships, and `npm publish` is not
  in this story's scope, so the array is documenting future intent.
- Voice rules apply only to user-facing markdown, not to JSON/YAML
  comments. Keep this task file plain.
