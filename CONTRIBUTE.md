# Contributing to council

The long-form contributor guide. Repo layout, local development, the
changelog and SemVer rules, the manual release process, CI/CD, the
harness scope policy, and the voice rules that apply to user-facing
prose.

If you're an AI agent (Claude Code, Copilot CLI, OpenCode, etc.),
read [`AGENTS.md`](./AGENTS.md) first — it's the short imperative
version of what's here.

---

## 1. What this repo is

`council` is a coding-agent plugin that adds a Karpathy-style council
mode to your agent. A user-invocable moderator agent dispatches a
question to six councillor sub-agents in parallel — each pinned to a
different LLM and given a different cognitive stance — runs a three-
round deliberation (independent opinions → anonymized peer review →
synthesis), and returns a recommendation. The architecture is sub-
agent fan-out with per-agent model pinning, hidden councillors
(`user-invocable: false` so they don't pollute the user's `/agent`
list), and a static `agents:` allowlist on the moderator.

The deliberation protocol follows
[Andrej Karpathy's `llm-council`](https://github.com/karpathy/llm-council).
The repo shape — `justfile`, lint and smoke scripts, three-place
version sync, Keep a Changelog, manual releases — follows
[`97`](https://github.com/oribarilan/97).

### Harness scope policy (through v1.0)

**Supported harness through v1.0: GitHub Copilot CLI.** Claude Code
and OpenCode are explicit v1.x targets but ship later. Cursor, Codex,
Gemini CLI, and other harnesses are not in scope.

Adding a new harness adapter requires both:

1. **Demonstrated user demand** — concrete inbound interest from users
   of that harness, not a maintainer's speculative interest.
2. **Behavioral evidence** that the existing council moves agent
   output on the harness already supported. Until the project has
   measured evidence that the council content is doing real work,
   adapter breadth is the wrong investment.

Adapter PRs that don't meet both bars will be deferred at least to
v1.0. This is scope discipline, not rejection. External adapters can
be maintained as forks by interested parties without inflating the
core repo's CI matrix or maintenance load.

The deliberate inversion of `97`'s order — `97` started multi-harness
because skill content is harness-neutral markdown — is intentional.
Council's primitive is the agent, and per-harness agent semantics
(model pinning, delegation, parallelism) differ enough that getting
one right first is worth more than getting three half-right.

---

## 2. Repo layout

```
council/
├── .github/
│   └── workflows/
│       ├── test.yml         # CI: lint + smoke on push/PR (Ubuntu/macOS/Windows × Node 18/20/22)
│       └── release.yml      # CI: GitHub Release on v* tag
├── .copilot/                # Copilot CLI plugin manifest + agents [future slice]
│   ├── plugin.json
│   └── agents/              # Moderator + 6 councillors
├── scripts/
│   ├── lint-agents.mjs      # Structural lint of agent files
│   └── smoke-load.mjs       # Repo-level invariant checks
├── AGENTS.md                # Contributor conventions for AI agents
├── CHANGELOG.md             # Keep a Changelog
├── CONTRIBUTE.md            # ← you are here
├── LICENSE                  # MIT
├── README.md                # User-facing intro
├── justfile                 # Local task runner
├── package.json             # Zero runtime deps, prettier dev dep
├── .prettierrc.json         # Prettier config
└── .prettierignore          # Prettier exclusions
```

`.copilot/` doesn't exist yet — agent files ship in the next slice
along with the plugin manifest. The lint and smoke scripts are
already wired for that arrival; the version-sync invariant
(`package.json` `version` ≡ `.copilot/plugin.json` `version`) goes
live the moment that file lands. No retrofitting.

`AGENTS.md` is the **single source of truth for contributor
conventions**. Most modern coding agents (OpenCode, Copilot CLI,
Cursor, Codex) read it automatically. Claude Code reads `CLAUDE.md`
instead and won't auto-load `AGENTS.md` — if you contribute using
Claude Code, load it manually at session start. The smoke test
rejects a `CLAUDE.md` to prevent drift.

---

## 3. Local development

[`just`](https://github.com/casey/just) is the local task runner. Run
`just` (no args) to list available recipes:

```sh
just            # list available recipes
just check      # everything CI runs: lint + format-check + smoke
just test       # smoke test only
just lint       # structural lint of agent files
just format     # prettier --write on JS/JSON/YAML
just format-check  # prettier --check (non-mutating)
just clean      # remove node_modules and prettier cache
```

CI uses `npm test` directly, so it doesn't need `just` installed; the
`justfile` recipes are thin wrappers over the same `npm` scripts. If
you prefer npm:

```sh
npm test                 # same as `just check`
npm run lint             # same as `just lint`
npm run smoke            # same as `just test`
npm run format           # same as `just format`
npm run format:check     # same as `just format-check`
```

One devDependency: `prettier`. Zero runtime dependencies. Both lint
and smoke scripts use Node built-ins only. Node ≥ 18.

### Prettier scope

Prettier formats `**/*.{js,mjs,cjs,json,yml,yaml}`. Markdown is **not**
formatted automatically:

- Agent files (when they land in `.copilot/agents/`) have lint-enforced
  frontmatter rules and careful prose layout that Prettier would
  re-flow.
- Root `*.md` files (README, CONTRIBUTE, AGENTS, CHANGELOG) are
  hand-managed for clarity — letting Prettier near them adds drift
  risk without value.

`.prettierignore` is the source of truth for what's excluded.

### Cross-platform support

CI runs the test suite on Ubuntu, macOS, and Windows across Node 18,
20, and 22 (matrix in `.github/workflows/test.yml`). A red Windows job
blocks merge just like a red Ubuntu job.

If you add code that touches the filesystem, an environment variable,
or a shell command, make sure it works on all three platforms or
branch on `process.platform`. The lint and smoke scripts are written
in pure Node with no shell-out — keep them that way.

### Lint constraints

`scripts/lint-agents.mjs` is currently minimal: it exits 0 if
`.copilot/agents/` doesn't exist, and runs basic frontmatter shape
checks (file starts with `---`, frontmatter is terminated) on
`*.agent.md` files when they do.

The slice that ships agent files adds the real rules: required
frontmatter fields (`name`, `description`, `model`), `agents:`
allowlist consistency between moderator and councillors,
`user-invocable: false` and `disable-model-invocation: true` on every
councillor, model-pinning audit, and any per-role invariants. Those
rules live alongside the files they apply to, not ahead of them.

### Smoke test

`scripts/smoke-load.mjs` enforces repo-level invariants on every
`npm test`:

- `AGENTS.md` exists.
- `CLAUDE.md` does **not** exist (single-source-of-truth rule).
- `package.json` parses and has a SemVer-shaped `version`.
- `.copilot/plugin.json` `version` equals `package.json` `version`,
  when both files exist.

The plugin-manifest gate is dormant in the foundation slice (no
`.copilot/plugin.json` yet) and activates the moment that file lands.
Drift in any other invariant fails CI immediately.

---

## 4. Changelog discipline (Keep a Changelog)

`CHANGELOG.md` follows
[Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/). The
top section is always `## [Unreleased]`.

### When you add a feature, fix, or doc change

Add an entry to the right `### Subsection` of `[Unreleased]` **in the
same commit** as the change:

| Subsection | Use for |
|---|---|
| `### Added` | New agents, new councillor roles, new tooling |
| `### Changed` | Behavior changes to existing agents or plugin |
| `### Deprecated` | Features still present but scheduled for removal |
| `### Removed` | Features removed in this release |
| `### Fixed` | Bug fixes |
| `### Security` | Vulnerability fixes |
| `### Documentation` | README/CONTRIBUTE/AGENTS edits worth flagging |

### Style for changelog entries

Write for a user reading the GitHub release notes, not for a release
historian or a contributor justifying their PR.

- **Past tense, reader's perspective.** What changed for them, not
  what process produced it.
- **Bullets describe the change, not the deliberation.** "Anonymized
  peer review now strips model identifiers before redispatching" —
  yes. "After council review the team agreed to..." — no.
- **One bullet per logical change. Don't pad.** If a bullet runs past
  six or seven lines, you're explaining yourself; cut.
- **Keep internal references out.** Task IDs, story slugs, `.todo/`
  paths, and PR-process artifacts belong in commit bodies, not the
  changelog. The changelog is what users read.
- Name agents, files, and config keys in backticks.
- Voice rules from §9 apply.

### When you don't need an entry

Pure internal refactors, dependency-free reorganizations, and CI
tweaks that don't change behavior do not need entries. When in doubt,
add one.

---

## 5. Versioning (SemVer)

Two places carry the plugin version once the agent-files slice
lands, and they must stay in sync:

1. `package.json` `version`
2. `.copilot/plugin.json` `version`

(A marketplace manifest may join this list when the Copilot CLI
marketplace path is wired in. The smoke script's gate generalizes —
add a check for the third file when it lands.)

`scripts/smoke-load.mjs` enforces equality on every `npm test`. The
`release.yml` workflow re-asserts equality before tagging. Drift is a
CI failure, not a runtime bug.

Git tags are `v` + the package version (e.g., `v0.1.0`). We follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html):

- **PATCH** (`0.2.0` → `0.2.1`): Bug fixes, doc-only changes,
  internal refactors with no observable effect from outside.
- **MINOR** (`0.2.0` → `0.3.0`): New councillors, new moderator
  variants, new opt-in features. Backward compatible.
- **MAJOR** (`0.2.0` → `1.0.0`): Removed councillors, renamed agent
  slugs, changed deliberation protocol, changed the moderator's
  output contract, breaking config changes.

A councillor that ships fewer roles than before is a **MAJOR** bump.
Removing the anonymization step in round 2 is **MAJOR**. Err on the
side of MAJOR for anything user-visible.

The current `package.json` `version` is `0.0.0`. The first tagged
release (`v0.1.0`) ships when the agent files land.

---

## 6. The release process

Releases are deliberate and never automatic. They must be carried
out manually — either by a human following the steps below, or by an
agent explicitly instructed to perform a release using these steps.
Don't bump versions or tag as part of unrelated feature work.

The first release (`v0.1.0`) ships with the agent files in the next
slice; the process below is what that release will follow.

### Step-by-step

1. **Verify `[Unreleased]` is complete.** Read `CHANGELOG.md` top to
   bottom. Every user-facing change since the previous tag should
   have an entry. Add anything missing.

2. **Decide the version bump.** Use the SemVer rules above. If unsure
   between PATCH and MINOR, go MINOR.

3. **Update the changelog.** Replace the `## [Unreleased]` heading
   with:

   ```markdown
   ## [Unreleased]

   ## [X.Y.Z] - YYYY-MM-DD
   ```

   Keep `[Unreleased]` empty (it stays at the top, ready for the next
   round). Update the link reference at the bottom of the file.

4. **Bump the version in both places, in lockstep.** They must match
   exactly or `npm test` will fail:

   - `package.json` `version`
   - `.copilot/plugin.json` `version` (once it exists)

   ```sh
   npm version X.Y.Z --no-git-tag-version    # bumps package.json only
   # then hand-edit .copilot/plugin.json to match
   ```

5. **Run the full test suite.**

   ```sh
   just check    # or: npm test
   ```

   Asserts version equality, the AGENTS.md-only single-source rule,
   structural lint, and Prettier formatting.

6. **Commit, tag, push.** The release commit subject is
   `Release vX.Y.Z: <one-line summary>`. Concrete, no internal jargon,
   ≤ 60 characters after the colon.

   ```sh
   git add CHANGELOG.md package.json .copilot/
   git commit -m "Release vX.Y.Z: <one-line summary>"
   git tag vX.Y.Z
   git push origin main vX.Y.Z
   ```

7. **CI takes over.** The `release.yml` workflow triggers on the tag
   push, re-asserts version equality, runs the test suite, and creates
   a GitHub Release with notes pulled from the matching `CHANGELOG.md`
   section.

8. **Verify the release.** Visit
   `https://github.com/oribarilan/council/releases` and confirm the
   `vX.Y.Z` release exists with the correct notes.

### Hotfix releases

For an urgent bug fix that should ship without waiting for unreleased
features:

1. Branch from the latest tag (`git checkout -b hotfix/X.Y.Z+1 vX.Y.Z`).
2. Cherry-pick or write the fix.
3. Bump PATCH version.
4. Add a `### Fixed` entry directly under a new `## [X.Y.Z+1]` heading.
5. Commit (using the `Release vX.Y.Z+1: <summary>` convention), tag,
   push.
6. Merge the hotfix branch back into `main`.

---

## 7. CI/CD pipeline

Two GitHub Actions workflows.

### `.github/workflows/test.yml` — runs on every push and PR

Triggers: push to any branch, pull request to `main`.
Jobs:

- Checkout
- Set up Node (matrix: 18, 20, 22)
- `npm ci` (zero runtime deps, but ensures clean state)
- `npm test` (lint + format:check + smoke, including manifest version
  equality once that gate is live)

Matrix: Ubuntu, macOS, Windows. A red CI job on any platform blocks
merge to `main`.

### `.github/workflows/release.yml` — runs on `v*` tag push

Triggers: push of any tag matching `v*` (e.g., `v0.1.0`).
Jobs:

- Checkout (with full history so the changelog parser can read old
  tags)
- Run `npm test` once more as a safety gate
- Verify tag matches `package.json` `version`
- Extract the matching section from `CHANGELOG.md`
- Create a GitHub Release with that text as the body, marking it as
  the latest release

### What CI does NOT do

- **No publish to npm.** Council is a Copilot CLI plugin distributed
  via the Copilot marketplace; npm is not in the picture.
- **No auto-tagging.** Tags are created manually during the release
  process. CI never bumps versions on its own.
- **No auto-merging.** Dependabot is not enabled. Zero runtime
  dependencies.

---

## 8. Distribution

### Install path (post-v0.1.0)

```sh
copilot plugin marketplace add oribarilan/council
copilot plugin install council@council-marketplace
```

Updates ship via the marketplace; users run
`copilot plugin update council` to pull a new release.

### Marketplace strategy

The marketplace manifest (`.claude-plugin/marketplace.json` in
Copilot CLI's plugin format, when it lands) lives in this repo —
named `council-marketplace` — and lists this repo as the source. We
do **not** maintain a sibling `oribarilan/council-marketplace` repo.
Single source of truth, one repo to keep in sync. Users
`marketplace add oribarilan/council` and that pulls both the listing
and the plugin from the same checkout.

### Rollback playbook

If a bad commit lands on `main`:

1. **Revert it.** `git revert <bad-sha>` and merge.
2. **For marketplace users**, the bad commit was visible only if it
   was part of a tagged release. If it was, cut a new release (PATCH
   bump) with the revert included. Users get the fix via
   `copilot plugin update council`.
3. **There is no canary, no release branch, no staged rollout.**
   Recovery is forward-only. Don't try to retroactively un-publish a
   tagged release. Cut a new one.

The test matrix (three OSes × three Node versions, run before merge)
catches almost everything that would warrant a rollback.

---

## 9. Voice and content rules

User-facing prose (README, CONTRIBUTE, AGENTS, CHANGELOG, agent
system prompts when they ship) must read as written by a senior
engineer giving rules — not a textbook, not an AI draft.

The full rule set lives in the
[`humanizer`](https://github.com/obra/superpowers/tree/main/skills/humanizer)
skill. The short list:

- **No inflated AI vocabulary**: testament, pivotal, vital,
  landscape, tapestry, vibrant, enduring, crucial, essential, key
  (as adjective).
- **No copula avoidance**: use `is`/`are`, not `serves as`/`stands
  as`/`marks`/`boasts`.
- **No promotional language**: nestled, breathtaking, groundbreaking,
  seamless, robust, holistic.
- **No trailing -ing participle clauses** (`..., enabling X` /
  `..., highlighting Y`).
- **No rule-of-three padding.** Don't force ideas into groups of
  three.
- **No vague attributions** (`industry observers`, `experts argue`).
- **No knowledge-cutoff hedging.**
- **Em dashes in moderation** — fine for parenthetical / appositional
  use, not as a rhythm trick.
- **The imperative voice in checklists is intentional.** Keep it
  terse and direct.

Apply the rules as you write. Run a humanizer pass on user-facing
markdown before committing — search for the AI-vocabulary words above
and confirm none appear unintentionally.

---

## 10. Quick reference

| Task | Command |
|---|---|
| List recipes | `just` |
| Run all checks | `just check` (= `npm test`) |
| Lint only | `just lint` |
| Smoke only | `just test` |
| Format JS/JSON/YAML | `just format` |
| Check formatting | `just format-check` |
| Bump version (no tag) | `npm version X.Y.Z --no-git-tag-version` then update `.copilot/plugin.json` |
| Tag a release | `git tag vX.Y.Z && git push origin vX.Y.Z` |

For agent-specific contributor conventions, see [`AGENTS.md`](./AGENTS.md).
For licensing, see [`LICENSE`](./LICENSE).
