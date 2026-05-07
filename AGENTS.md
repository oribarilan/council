# AGENTS.md

Conventions for AI coding agents (Claude Code, Copilot CLI, OpenCode
subagents, etc.) working in this repo. The same rules apply to humans;
they are written here in the imperative because agents need explicit
instruction.

For the full contributor and release docs, see
[`CONTRIBUTE.md`](./CONTRIBUTE.md). This file is the short list.

## What this repo is

`council` is a coding-agent plugin that adds a council mode to your
agent: a moderator dispatches a question to several councillor sub-
agents in parallel, each pinned to a different LLM and given a
different cognitive stance, runs a three-round deliberation
(independent opinions → anonymized peer review → synthesis), and
returns a recommendation. The design follows Andrej Karpathy's
[`llm-council`](https://github.com/karpathy/llm-council); the
distribution shape follows [`97`](https://github.com/oribarilan/97).

**Supported harness through v1.0: GitHub Copilot CLI.** Claude Code
and OpenCode are explicit v1.x targets but ship later. See "Harness
scope" below.

**Status: pre-release.** This repo is at the foundation stage. Agent
files (the moderator and six councillors) ship in the next slice.
This story builds the docs, tooling, and CI that the agent files
plug into.

Layout (target — `[shipped]` / `[future slice]` tags):

```
council/
├── .copilot/                      # Copilot CLI plugin manifest + agents [future slice]
├── .github/workflows/             # CI: test.yml, release.yml         [shipped]
├── scripts/                       # lint-agents.mjs, smoke-load.mjs   [shipped]
├── AGENTS.md                      # this file                         [shipped]
├── CHANGELOG.md                   # Keep a Changelog                  [shipped]
├── CONTRIBUTE.md                  # Long-form contributor guide       [shipped]
├── LICENSE                        # MIT                               [shipped]
├── README.md                      # User-facing intro                 [shipped]
├── justfile                       # Local task runner                 [shipped]
└── package.json                   # Zero runtime deps, prettier dev   [shipped]
```

## The seven rules

1. **Test before you say done.** Run `just check` (lint + format-check
   + smoke). All three must pass. (`npm test` is the same thing — CI
   uses it; `just` is the local convenience.)

2. **Update the changelog.** Any user-facing change goes in the
   `[Unreleased]` section of `CHANGELOG.md` in the same commit as the
   change. See "Changelog discipline" below.

3. **Don't bump versions yourself.** `package.json` `version` and
   (once it ships) `.copilot/plugin.json` `version` are release
   activities, not feature activities. The release happens in a
   separate, deliberate commit. The two version fields stay in sync
   from the moment the plugin manifest exists; the smoke test
   enforces equality.

4. **Don't touch shared files in parallel work.** When dispatching
   multiple subagents, forbid each from editing `README.md`,
   `package.json`, `AGENTS.md`, `CHANGELOG.md`, or anything under
   `.copilot/`. Those updates land in the integration step.

5. **Voice rules apply to user-facing markdown.** No AI tells
   (testament, pivotal, landscape, "serves as", trailing -ing
   clauses, rule-of-three padding). The `humanizer` skill is the
   source of truth for voice. The imperative voice in checklists is
   intentional — keep it terse.

6. **Cross-platform is non-negotiable.** This plugin must work on
   Linux, macOS, and Windows. CI runs the matrix
   Ubuntu / macOS / Windows × Node 18 / 20 / 22. A red Windows job
   blocks merge just like a red Ubuntu job. See "Cross-platform
   discipline" below.

7. **Harness scope is frozen through v1.0.** Supported: Copilot CLI.
   Adding a new harness adapter (Claude Code, OpenCode, Cursor,
   Codex, Gemini) requires both demonstrated user demand and
   behavioral evidence that the existing council moves agent output.
   PRs that add a second harness without meeting both bars will be
   deferred. See "Harness scope policy" in `CONTRIBUTE.md`.

## Cross-platform discipline

CI runs `npm test` on Ubuntu, macOS, and Windows across Node 18, 20,
and 22 — nine cells. Anything that touches the filesystem, the
environment, or a shell command must work on all three.

### The four traps

1. **Hardcoded paths.** Never assume `~/.config/...` or `~/.cache/...`
   — those don't exist on Windows. Use `os.homedir()`, `path.join()`,
   and a platform branch when conventions differ.

2. **Env-var syntax in docs and error messages.** When you tell a
   user to set an env var, give all three forms:

   ```
   bash/zsh:    export FOO=1
   Windows cmd: set FOO=1
   PowerShell:  $env:FOO = "1"
   ```

3. **Shell built-ins in scripts.** Don't assume `bash`, `awk`, `sed`,
   `grep`, `chmod`, or `curl` are available. Branch on
   `process.platform` or rewrite in pure Node. The lint and smoke
   scripts use Node built-ins only — keep them that way.

4. **Shebangs and executable bits.** `#!/usr/bin/env node` is ignored
   on Windows. Don't rely on it for direct invocation; let `npm run`
   resolve the interpreter.

## Changelog discipline (Keep a Changelog)

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
The top section is always `## [Unreleased]`. When you make a change
worth a user noticing, add a bullet under the right subsection:

- `### Added` — new agents, new councillor roles, new tooling
- `### Changed` — behavior changes to existing agents
- `### Deprecated` — features still present but scheduled for removal
- `### Removed` — features removed in this release
- `### Fixed` — bug fixes
- `### Security` — vulnerability fixes
- `### Documentation` — README / CONTRIBUTE / AGENTS edits worth flagging

**Bullets are tight.** Past tense, reader's perspective, period at
the end. One change per bullet. Files and config keys in backticks.

**Describe the change, not the deliberation.** No task IDs, story
slugs, `.todo/` paths, or file-touched lists in the bullet. Those
belong in the commit body. The changelog is what users read.

**If a bullet runs past 6–7 lines, you are explaining yourself.** Cut.

Bad — wall of prose, file list, AI-ish phrasing:

```markdown
- Holistically reframed the council's identity: leveraging the
  groundbreaking Karpathy llm-council methodology, this seamless
  refactor pivotally repositions council as a robust foundation for
  agentic deliberation. Touches `README.md`, `AGENTS.md`,
  `CONTRIBUTE.md`, …
```

Good — one bullet, one change, reader's perspective:

```markdown
- Council's anonymized peer-review round now strips model identifiers
  before redispatching. Prevents the "vote for the model I recognize"
  failure mode flagged in the Karpathy paper.
```

If your change is a pure internal refactor with no user-visible
effect, you do not need a changelog entry. When in doubt, add one.

## Adding a new councillor or moderator (forward-looking)

No agent files exist yet. When the next slice ships them, this
section becomes the canonical add/edit guide. The expected shape:

1. New councillor → add `.copilot/agents/council-<role>.agent.md`
   with frontmatter: `name`, `description`, `model` (pinned),
   `user-invocable: false`, `disable-model-invocation: true`,
   `tools: []` (councillors don't need tools — they reason over the
   prompt). Body is the role's system prompt.

2. Add the new councillor's slug to the moderator's
   `agents:` allowlist. The moderator is the only place that
   dispatches councillors — without the allowlist entry, the
   moderator can't reach the new role.

3. Update the lint script (`scripts/lint-agents.mjs`) if the new
   role introduces a new structural rule (rare). The default
   per-councillor checks (frontmatter present, model pinned,
   `user-invocable: false`) apply to every councillor without
   special-casing.

4. Add the new role to the README's "Default roster" table.

5. Add a `### Added` entry under `[Unreleased]` in `CHANGELOG.md`.

6. Run `npm test`. Add a smoke fixture if the override-loading
   resolution rules between plugin / user / project agent dirs
   need exercising for this role.

The lint and smoke scripts already exist as stubs that activate
once `.copilot/` lands. Don't pre-author agent files in the
foundation story — that's the next slice.

## Don'ts

- **Don't add a `CLAUDE.md`.** The smoke test enforces its absence.
  AGENTS.md is the single source of truth for contributor
  conventions; see "AGENTS.md is the single source of truth" below.
- **Don't drift `package.json` version from `.copilot/plugin.json`**
  once both exist. Smoke enforces equality. The two move together
  in release commits, never in feature commits.
- **Don't bump versions as part of unrelated feature work.** Releases
  are deliberate and manual. See "Releases" below and the full
  process in `CONTRIBUTE.md`.
- **Don't add agent files in the bootstrap story.** They are the
  next slice. Stubbing one in to "make progress" creates
  half-decisions that will need to be re-made.
- **Don't add a second harness adapter (Claude Code, OpenCode,
  Cursor, Codex, Gemini) without the scope policy in
  `CONTRIBUTE.md` being met.** Demand + behavioral evidence are
  both required.
- **Don't ship marketing prose in user-facing markdown.** "Robust",
  "seamless", "groundbreaking", "holistic", "pivotal", "vital",
  "crucial", "landscape", "tapestry" — none of these are real
  words in this repo's voice.
- **Don't invent a `council.toml` or other runtime config schema.**
  Customization is harness-native: users override agent files in
  `~/.copilot/agents/` (user) or `./.copilot/agents/` (project).
  Don't reinvent what the harness already does.
- **Don't make councillors `user-invocable: true`.** They are
  dispatched only by the moderator. Exposing them in `/agent`
  pollutes the user's agent picker and breaks the
  "council is one feature" UX.

## AGENTS.md is the single source of truth

This file is the contributor-conventions document. It is **not**
shipped to plugin users — end users get the moderator and councillor
agents through the plugin loader, not these conventions.

Most modern coding agents (OpenCode, Copilot CLI, Cursor, Codex)
read `AGENTS.md` automatically. **Claude Code** does not — it reads
`CLAUDE.md`. If you contribute using Claude Code, manually load this
file at session start (e.g., paste it, `@AGENTS.md`, or "read
AGENTS.md before making changes").

The smoke test rejects a `CLAUDE.md` to prevent drift. AGENTS.md is
the only contributor-conventions file in this repo by design — one
file means one set of conventions, no subtle skew.

## Releases (manual only)

Releases are NOT automatic. The release process is documented in
`CONTRIBUTE.md` and must be carried out manually — either by a human
following the steps, or by an agent explicitly instructed to perform
a release using those steps. The release commit reviews the
changelog, decides the SemVer bump, bumps both manifest versions in
lockstep, tags the commit, and pushes. Don't take any of those steps
as part of unrelated feature work.

The first tagged release (`v0.1.0`) ships when the agent files land.
The current foundation slice carries `package.json` `version`
`0.0.0` and no tag.

## Where the deeper rules live

- Voice and writing style: `humanizer` skill (in superpowers)
- Repo layout, dev loop, release process, harness scope policy: `CONTRIBUTE.md`
- Bootstrap story design and DoD: `.todo/done/US-bootstrap/main.md` (after this story ships) or `.todo/US-bootstrap/main.md` (during)
- Karpathy's lineage: <https://github.com/karpathy/llm-council>
- Copilot CLI plugin format: <https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-creating>
- Copilot CLI custom agents reference: <https://docs.github.com/en/copilot/reference/custom-agents-configuration>
