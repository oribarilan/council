# US-bootstrap

## Goal

Stand up `council` as a new repo: a multi-harness coding-agent plugin that
adds a Karpathy-style LLM council to the user's coding agent. Round one of
work is the foundation — README, AGENTS.md, CONTRIBUTE.md, justfile, lint
and smoke scripts, manifests, repo skeleton — modeled on the `97` project
sitting next to it. The agent files (moderator + 6 councillors) are scoped
out and documented here, but ship in a later slice.

The foundation is what makes the rest of the project safe to build: it
locks the layout, the tooling, the changelog discipline, the version-sync
invariants, and the harness scope policy before any agent content lands.

## Background and design

### What council is

A "council mode" for coding agents, in the spirit of Andrej Karpathy's
[`llm-council`](https://github.com/karpathy/llm-council). The user asks
a hard question; instead of one model answering, a moderator agent
dispatches the question to several councillor sub-agents — each pinned to
a different LLM and given a different cognitive stance — runs a 3-round
deliberation, and returns a synthesized recommendation.

Conceptually adjacent to the `council` agent in
[`oh-my-opencode-slim`](https://github.com/alvinunreal/oh-my-opencode-slim),
but built as a standalone harness plugin with its own deliberation
protocol and roster.

### Harness scope

Through v1.0: **Copilot CLI only**. Claude Code and OpenCode are explicit
v1.x targets — the layout, manifests, and adapter pattern are designed
to absorb them later without restructuring — but no Claude Code or
OpenCode adapter ships in v0.x. Cursor, Codex, Gemini CLI, etc. follow
the same scope policy `97` uses: demonstrated user demand plus
behavioral evidence required before adding a new harness.

This is a deliberate inversion of `97`'s order. `97` started with
multi-harness because skill content is harness-neutral markdown.
Council's primitive is the agent, and per-harness agent semantics differ
enough (model pinning, delegation, parallelism) that getting one right
first is worth more than getting three half-right.

### Architecture

**Sub-agent fan-out.** Copilot CLI supports per-agent model pinning
(`model:` in frontmatter), agent-to-agent dispatch (the built-in `task`
tool, alias `agent`), parallel execution (up to 32 concurrent / depth 6
via the `/fleet` orchestrator and the `task` tool when an agent emits
multiple calls in one turn), and an `agents:` allowlist on the parent.
Combined with `user-invocable: false` and `disable-model-invocation:
true` on the children, this is enough to ship council natively without
an MCP server, an external service, or any custom runtime.

```
User → /agent council "<question>"
        │
        ▼
   moderator.agent.md          (user-invocable: true; tools: [agent, task])
        │ task() ×6 in one turn → parallel fan-out
        ▼
   ┌──────────────┬──────────────┬──────────────┐
   │ pragmatist   │ contrarian   │ simplifier   │   (round 1: independent opinions)
   │ architect    │ skeptic      │ novice       │
   └──────────────┴──────────────┴──────────────┘
        │
        ▼
   moderator collects opinions, anonymizes identities, fans out again
        │
        ▼
   councillors rank peers' answers on accuracy and insight   (round 2: peer review)
        │
        ▼
   moderator synthesizes opinions + rankings                 (round 3: synthesis)
        │
        ▼
   Final response in chat: consensus, splits, minorities, plan forward
        │
        ▼
   Offer to write a fuller markdown report on user request.
```

Every councillor and the moderator is a static `.agent.md` file. There
is no runtime config layer, no custom parser, no separate process. The
plugin is the agent files plus their manifest.

### Deliberation protocol (3 rounds)

1. **Independent opinions.** Moderator emits one `task` call per active
   councillor in a single turn. Each councillor sees only the user's
   question and its own role/system prompt. Runs in parallel.
2. **Anonymized peer review.** Moderator collects round-1 outputs,
   strips identity (renames to "Councillor A", "Councillor B", …), and
   re-dispatches to the same councillors with peers' answers attached
   and a ranking instruction (accuracy + insight, ordinal). Runs in
   parallel. Anonymization is per Karpathy's design — prevents
   model-name favoritism in cross-evaluation.
3. **Synthesis.** Moderator (no further fan-out) writes the final
   response. Same model as the moderator agent's pinned model.

### Default roster

Six councillors. Two design rules: diversity over strength (pin different
model families per role to avoid groupthink), and roles map to genuinely
different cognitive stances (not "senior vs junior", which is the same
prior thinking harder).

| Slug | Role | Stance | Default model family |
|---|---|---|---|
| `council-pragmatist` | Pragmatist | Smallest thing that works; ship it | Anthropic mid-tier |
| `council-contrarian` | Contrarian | Steelmans the opposite; names hidden assumptions | OpenAI top-tier |
| `council-simplifier` | Simplifier | YAGNI/KISS; strips scope; kills speculative knobs | Cheap fast model (Haiku-class or GPT-mini-class) |
| `council-architect` | Architect | Long-term boundaries, coupling, evolvability | Anthropic top-tier |
| `council-skeptic` | Skeptic | Failure modes, edge cases, ops/security risk | Google top-tier |
| `council-novice` | Novice | Asks dumb-but-real questions; surfaces unstated assumptions | Cheap fast model (Haiku-class or Flash-class) |

The moderator itself is its own agent (`council`, user-invocable) pinned
to a strong synthesis model (Anthropic top-tier or equivalent).

Concrete model strings (`Claude Sonnet 4.5`, `gpt-5`, etc.) ship as
plausible defaults but are explicitly tagged as expected-to-drift in
both the agent files and the README. Copilot CLI's model namespace is
plan-scoped with no documented enum, so mismatches are inevitable as
the ecosystem moves; we document the override pattern, not a stable
matrix.

### Customization model

Harness-native overrides only. No `council.toml`, no custom parser, no
separate config schema.

- Councillors are namespaced `council-*.agent.md` and shipped with
  `user-invocable: false` + `disable-model-invocation: true`. They never
  appear in `/agent` lists, never auto-fire, and only the moderator can
  dispatch them. This is the answer to "council agents shouldn't
  interrupt with project/global agents": they are inert outside the
  moderator's reach.
- Users customize a councillor (model swap, role tweak, tools, mcp
  servers) by dropping a same-named file in `~/.copilot/agents/` (user
  level) or `./.copilot/agents/` (project level), per Copilot CLI's
  standard agent override semantics. Same file format, same frontmatter,
  same docs they already have.
- To add a brand-new councillor role beyond the shipped six, the user
  must also override the moderator (its `agents:` allowlist is static
  frontmatter). Documented as a power-user move, not the common path —
  the default roster is generous enough that adding new roles should be
  rare.

The override-loading rules are the one place this design has real
runtime risk: it assumes Copilot CLI's last-wins file resolution
between plugin / user / project agent dirs. The smoke test in this
repo will pin that assumption with a fixture rather than trusting docs.

### Entry point

One user-invocable moderator agent: `council`. Full 6-member, 3-round
deliberation. No quick mode, no flavored variants in scope. Session-
level subset selection (e.g. `council-quick`, `council-design`,
`council-security`) is parked in the backlog under
`spec-multi-moderator-entry-points.md` — a deliberate decision to
prove the single-flow shape before adding choice surface.

### Output format

Conversational with structure. The moderator's chat reply contains, in
order:

1. **TL;DR** — 2–3 sentences, the recommended path.
2. **Where the council agreed** — one short paragraph or a tight bullet
   list of consensus points.
3. **Where it split** — the live disagreements, with each side's
   strongest argument. No more than three splits called out.
4. **Noteworthy minorities** — flags from the skeptic / contrarian /
   novice that didn't make it into the synthesis but the user should
   see (one or two, max).
5. **Plan forward** — a concrete next step the user can act on.
6. **Offer**: "Want me to write up a fuller markdown report? I'll save
   it to `<path>`." Generated only on user assent. Not exhaustive — a
   tier above the chat reply, not a full transcript dump.

The full per-councillor transcripts are not surfaced by default. The
report file, if generated, includes them in a collapsed section at the
end so audit is possible without making the default output noisy.

### Repo layout (target)

Modeled on `97`, adapted for one harness. Files marked `[this story]`
ship in this user story; files marked `[later]` are scoped here so the
layout makes sense but ship in subsequent slices.

```
council/
├── .github/
│   └── workflows/
│       ├── test.yml         # CI: lint + smoke on push/PR (Linux/macOS/Windows × Node 18/20/22)  [this story]
│       └── release.yml      # CI: GitHub Release on v* tag                                       [this story]
├── .copilot/                # Copilot CLI plugin manifest + agent dir                            [later]
│   ├── plugin.json
│   └── agents/              # Moderator + 6 councillors                                          [later]
├── scripts/
│   ├── lint-agents.mjs      # Frontmatter, allowlist consistency, model-pinning audit            [this story]
│   └── smoke-load.mjs       # Parses manifests, asserts version equality, override-loading test  [this story]
├── AGENTS.md                # Contributor conventions for AI agents                              [this story]
├── CHANGELOG.md             # Keep a Changelog format                                            [this story]
├── CONTRIBUTE.md            # Repo layout, dev loop, release process, harness policy             [this story]
├── LICENSE                  # MIT                                                                [this story]
├── README.md                # User-facing intro: install, what it does, FAQ                      [this story]
├── justfile                 # Local task runner, mirrors npm scripts                             [this story]
├── package.json             # Zero runtime deps, prettier devdep                                 [this story]
└── .prettierrc.json / .prettierignore                                                            [this story]
```

`.opencode/` and `.claude-plugin/` are deferred — not just unimplemented
but explicitly out of scope through v1.0 per the harness policy. The
layout reserves room for them but this story's manifests do not pretend
they exist.

### Tooling parity with 97

Lifted directly:

- `just` as the local task runner; `justfile` is a thin wrapper over
  `npm run` so CI doesn't need `just` installed.
- `npm test` = lint + format-check + smoke. Zero runtime deps.
- Prettier on `**/*.{js,mjs,cjs,json,yml,yaml}`. Markdown intentionally
  hand-managed (Prettier reflows skill/agent prose).
- `scripts/lint-*.mjs` and `scripts/smoke-load.mjs` use Node built-ins
  only.
- Three-place version sync (`package.json`, `.copilot/plugin.json`, and
  whatever marketplace manifest Copilot CLI's marketplace expects) with
  smoke-enforced equality. `.copilot/` files don't ship in v0.1, so the
  three-place rule activates in the slice that adds them.
- Keep a Changelog format in `CHANGELOG.md`; `[Unreleased]` always at
  the top.
- Cross-platform CI matrix: Ubuntu / macOS / Windows × Node 18 / 20 / 22.
- Voice rules from the `humanizer` skill apply to all user-facing prose.

### Distribution

Through v1.0: Copilot CLI marketplace install, same pattern `97` uses
for its Copilot CLI distribution. Versioned releases via git tag,
GitHub Release notes pulled from CHANGELOG. No npm publish, no
auto-tagging, no auto-merging.

The asymmetric-distribution model `97` documents (commit-shipped on
OpenCode vs release-shipped on Claude Code / Copilot CLI) does not
apply here in v0.x — there is only one channel.

## Definition of Done

This story is complete when a fresh clone of `council` has, at HEAD:

- [ ] `README.md` exists, follows the voice rules, and a reader who has
      never heard of council can (a) understand what it does in under
      30 seconds, (b) find an install path for Copilot CLI, and (c)
      find the link to `CONTRIBUTE.md`. The Install section is
      placeholder-honest about pre-release status (no false claims of
      working install while the agent files haven't shipped yet).
- [ ] `AGENTS.md` exists and is the single source of truth for
      contributor conventions. No `CLAUDE.md` exists (smoke test
      enforces this).
- [ ] `CONTRIBUTE.md` exists and covers: repo layout, local dev loop,
      changelog discipline, SemVer rules, the manual release process,
      CI/CD, harness scope policy, and voice/content rules.
- [ ] `CHANGELOG.md` exists with a populated `## [Unreleased]` section
      and the structural skeleton for future versions.
- [ ] `LICENSE` exists (MIT).
- [ ] `package.json` exists with zero runtime dependencies, prettier as
      devDependency, `engines.node >= 18`, and `scripts.test`,
      `scripts.lint`, `scripts.smoke`, `scripts.format`,
      `scripts.format:check` defined.
- [ ] `justfile` exists and `just` with no args lists the recipes.
- [ ] `.prettierrc.json` and `.prettierignore` exist.
- [ ] `scripts/lint-agents.mjs` exists and runs cleanly on an empty
      `agents/` dir (no false failures when there is nothing to lint).
- [ ] `scripts/smoke-load.mjs` exists and passes on the v0.1 layout
      (asserts `AGENTS.md` exists, `CLAUDE.md` does not, package.json
      version is well-formed; manifest version-equality check is
      stubbed to skip when `.copilot/plugin.json` doesn't yet exist
      and is documented as activating in the agent-files slice).
- [ ] `.github/workflows/test.yml` exists, runs the matrix
      (Ubuntu/macOS/Windows × Node 18/20/22), and `npm test` passes on
      all nine cells. Verified by a green CI run on the first push to
      `main`.
- [ ] `.github/workflows/release.yml` exists, triggers on `v*` tags,
      and re-runs the test suite before publishing a GitHub Release.
      Not exercised in this story (no v0.1.0 tag yet) but file lands.
- [ ] `npm test` passes locally on macOS (developer's box). Linux and
      Windows are validated by CI.
- [ ] All files this story adds pass the voice rules in `humanizer`:
      no inflated AI vocabulary, no rule-of-three padding, no
      `..., enabling X` participles, em dashes only where they earn
      their keep.

The agent files (moderator + 6 councillors), the `.copilot/plugin.json`
manifest, the marketplace manifest, and any actual deliberation
behavior are **out of scope** for this story. They are the next slice.

## Cross-Cutting Concerns

- **No agent files in this story.** The repo describes them, the lint
  script is ready for them, the smoke test reserves the version-sync
  check, and the README is honest that the install is not user-runnable
  yet. Resist the temptation to "just stub one in" — every stub is a
  half-decision that will need to be re-made.
- **Voice.** All user-facing prose follows the humanizer rules. The
  `97` README, AGENTS.md, and CONTRIBUTE.md are the calibration
  reference for tone — match their density and directness. No marketing
  prose, no AI-ese.
- **Version sync invariant lives from day one.** Even though only
  `package.json` carries a version in this story, the smoke test
  contains the three-place-equality check, gated on the presence of
  `.copilot/plugin.json`. When the agent-files slice lands and adds
  that manifest, the gate flips automatically and the invariant is
  enforced from that commit forward. No retrofitting.
- **Override-loading assumption is a known unknown.** The README and
  CONTRIBUTE.md describe the customization model as documented (user/
  project agent dirs override plugin agents by name). The agent-files
  slice is responsible for adding a smoke fixture that actually
  exercises this resolution; this story documents the assumption and
  flags it as the contract the next slice must verify.
- **Don't import 97 verbatim.** The tooling shape is parity, not a
  copy-paste. `97`'s `lint-skills.mjs` enforces skill-specific rules
  (frontmatter, line budgets, principle citations) that don't apply to
  council's agents. Council's `lint-agents.mjs` enforces agent-specific
  rules (frontmatter shape, `agents:` allowlist consistency between
  moderator and councillors, model-pinning presence on every
  councillor, `user-invocable: false` on every councillor). Different
  rules, same shape.

## Task Priority

Three prefixed tasks form a strict pipeline (each depends on the
previous):

1. `1-tooling-and-prettier.md` — package.json, justfile, prettier
   configs. `npm test` exists with stub scripts.
2. `2-lint-and-smoke-scripts.md` — replaces stubs with real audit
   logic. The version-sync gate goes live here, dormant until
   `.copilot/plugin.json` arrives.
3. `3-ci-workflows.md` — `test.yml` matrix and `release.yml`. CI
   green is the gating verification.

Four unprefixed tasks are independent and can land any time after
task 1 (no enforced order, prioritized for execution as listed):

- `agents-md.md` — required before task 2's smoke check passes; do
  this first among the unprefixed group.
- `license-and-changelog.md` — small, mechanical.
- `readme.md` — needs the CI badge from task 3 to be honest, but
  can be drafted anytime and the badge link added once `test.yml`
  lands.
- `contribute-md.md` — last; references everything else.

Practical ordering: `1` → `agents-md` → `2` → `license-and-changelog`
→ `readme` → `3` → `contribute-md`. Any sequence honoring the
prefixed-task order and the AGENTS.md-before-task-2 rule is valid.
