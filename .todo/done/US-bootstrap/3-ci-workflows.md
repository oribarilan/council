# 3-ci-workflows

## Context

Add the two GitHub Actions workflows: `test.yml` (runs `npm test` on
push and PR across the matrix) and `release.yml` (creates a GitHub
Release on `v*` tag push). After this task, every push triggers CI on
nine cells (Ubuntu / macOS / Windows × Node 18 / 20 / 22), and a tagged
release auto-publishes Release notes from `CHANGELOG.md`.

**Value delivered**: drift in any platform / Node version becomes a CI
failure, not a runtime surprise. The release process is mechanical: tag
a commit, GitHub does the rest.

## Related Files

- `.todo/US-bootstrap/main.md` — "Cross-platform support",
  "CI/CD pipeline", "Distribution"
- `/Users/orbarila/repos/personal/97/.github/workflows/test.yml` — calibration reference
- `/Users/orbarila/repos/personal/97/.github/workflows/release.yml` — calibration reference
- `.github/workflows/test.yml` (created)
- `.github/workflows/release.yml` (created)

## Dependencies

- `2-lint-and-smoke-scripts.md` (CI runs `npm test`; needs real scripts)
- `agents-md.md` (smoke asserts AGENTS.md exists; CI fails until it does)
- `license-and-changelog.md` (release.yml extracts release notes from CHANGELOG)

## Acceptance Criteria

- [x] `.github/workflows/test.yml` exists and triggers on push to any
      branch and PR to `main`. Runs the matrix Ubuntu / macOS / Windows
      × Node 18 / 20 / 22. Each cell runs `npm ci` then `npm test`.
- [x] `.github/workflows/release.yml` exists and triggers on push of
      tags matching `v*`. Runs `npm test` once as a safety gate, then
      verifies tag matches `package.json` version, then creates a
      GitHub Release with notes extracted from `CHANGELOG.md`.
- [x] Both workflow files pass `prettier --check`.
- [x] After this task lands on `main` and is pushed, the `test.yml`
      workflow runs to green on all nine cells. **This is the gating
      verification — the task is not done until CI is green.**
- [x] `release.yml` is not exercised in this task (no tag is pushed).
      The file exists and is syntactically valid; an end-to-end test
      lands when the agent-files slice cuts `v0.1.0`.

## File Content

### `.github/workflows/test.yml`

```yaml
name: test

on:
  push:
  pull_request:
    branches: [main]

jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: [18, 20, 22]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm test
```

### `.github/workflows/release.yml`

```yaml
name: release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test

      - name: Verify tag matches package.json version
        run: |
          tag="${GITHUB_REF#refs/tags/v}"
          pkg=$(node -p "require('./package.json').version")
          if [ "$tag" != "$pkg" ]; then
            echo "tag $tag does not match package.json version $pkg" >&2
            exit 1
          fi

      - name: Extract release notes from CHANGELOG.md
        id: notes
        run: |
          tag="${GITHUB_REF#refs/tags/v}"
          notes=$(awk -v ver="$tag" '
            $0 ~ "^## \\[" ver "\\]" { capture=1; next }
            capture && $0 ~ "^## \\[" { exit }
            capture { print }
          ' CHANGELOG.md)
          {
            echo 'body<<EOF'
            echo "$notes"
            echo 'EOF'
          } >> "$GITHUB_OUTPUT"

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          name: ${{ github.ref_name }}
          body: ${{ steps.notes.outputs.body }}
          draft: false
          prerelease: false
```

## Verification

- Ad-hoc local:
  - `prettier --check .github/workflows/*.yml` exits 0.
  - `npm test` still exits 0 locally.
- Required gating verification:
  - Push the branch with this task's files; observe `test.yml` runs
    on all nine matrix cells and all are green. Link the run in this
    file's Notes before moving the task to done.
- `release.yml` is verified syntactically only at this stage.

## Notes

- The release workflow uses `softprops/action-gh-release@v2`. Pin to a
  major; this is a well-maintained action and the project does not
  need a private fork.
- The CHANGELOG extraction is `awk`-based and assumes the format
  `## [X.Y.Z] - YYYY-MM-DD`. Task `license-and-changelog.md` ships the
  exact heading shape; if that task changes the heading format, this
  workflow has to follow.
- Cross-platform shells: `release.yml` runs only on Ubuntu, so bash is
  fine. `test.yml`'s steps are all `npm` commands, which work
  identically on Windows.
- After this task ships, **add the CI badge to the README** (task
  `readme.md` Acceptance Criteria already requires it).
- Record the green CI run URL in this file's Notes section before
  moving to done.

### Verification record

- First push (`ea6c8f3`): 6/9 green. Windows failed on all three Node
  versions due to Prettier `format:check` rejecting CRLF line endings
  (Git on Windows defaults `core.autocrlf=true`, converting LF→CRLF
  on checkout; Prettier defaults `endOfLine: lf`).
- Fix (`a1c878f`): added `.gitattributes` pinning LF for all text
  files. Same pattern `97` uses.
- Second push: 9/9 green.
  https://github.com/oribarilan/council/actions/runs/25504881406
