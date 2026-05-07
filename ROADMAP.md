# Roadmap

The forward map of council. What's shipped, what's next, what's parked,
what's explicitly out of scope. This file is the index. Per-slice specs
live in `.todo/US-<slug>/main.md` and `.todo/done/US-<slug>/main.md`;
backlog items in `.todo/backlog/`.

## Vision

A council mode for coding agents, in the spirit of Andrej Karpathy's
[`llm-council`](https://github.com/karpathy/llm-council). A user-
invocable moderator agent dispatches a question to several councillor
sub-agents — each pinned to a different LLM and given a different
cognitive stance — runs a three-round deliberation (independent
opinions → anonymized peer review → synthesis), and returns a
recommendation. Cross-model diversity is the point.

Distributed as a [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-creating)
plugin through v1.0. Claude Code and OpenCode are explicit v1.x targets.

## Status

**Pre-release. Foundation only.** The repo carries
`package.json` `version` `0.0.0` and no git tag. CI matrix
(Ubuntu / macOS / Windows × Node 18 / 20 / 22) is green. There are no
agent files yet — the install path documented in `README.md` does
not work today.

The first user-runnable version is `v0.1.0` (Milestone 1 below).

## Milestones

Each milestone is a discrete user story in `.todo/`. Status legend:
✅ shipped · 🟡 in flight · ⬜ planned · ⚪ parked.

### M0 — Foundation ✅

`.todo/done/US-bootstrap/`

Repo scaffolding: README, AGENTS.md, CONTRIBUTE.md, justfile, lint and
smoke scripts, CI workflows, prettier config, `.gitattributes` for
cross-platform line endings. Spec lives in
[`.todo/done/US-bootstrap/main.md`](./.todo/done/US-bootstrap/main.md).

**Outcome:** a fresh clone runs `npm test` green on macOS / Linux /
Windows; `just check` passes; the version-sync invariant
(`package.json` ≡ `.copilot/plugin.json`) is dormant in the smoke
script and activates the moment the manifest lands.

### M1 — Working agents and v0.1.0 release ⬜

`.todo/US-agent-files/`

Ship the moderator and six councillor agent files plus the Copilot
CLI plugin manifest. Real lint rules (frontmatter audit, allowlist
consistency, model-pinning, `user-invocable: false` enforcement on
councillors). Smoke fixture that exercises plugin / user / project
override-loading resolution (the "known unknown" flagged in
`US-bootstrap`). Cut `v0.1.0` and publish the GitHub Release.

**Outcome:** `copilot plugin marketplace add oribarilan/council`
followed by `copilot plugin install council@council-marketplace`
gives the user a working `@council "<question>"` workflow.

The story may split into two if scope grows: M1a "agents land" and
M1b "release cuts." The story file decides.

### M2 — Multi-moderator presets ⚪

`.todo/backlog/spec-multi-moderator-entry-points.md`

Ship more user-invocable moderator agents with different rosters /
round counts / system prompts: e.g. `council-quick` (3 members, 1
round), `council-design`, `council-security`. Parked until M1 has
real user feedback. Designing without that is dark-room work.

### M3 — Claude Code adapter ⬜

The first additional harness. Adapter PR adds a `.claude-plugin/`
manifest and resolves the agent-semantics differences between
Copilot CLI and Claude Code (model strings differ, delegation
primitives differ slightly). Ships when the harness scope policy in
[`CONTRIBUTE.md`](./CONTRIBUTE.md) is met: demonstrated user demand
plus behavioral evidence that the existing council moves agent
output on Copilot CLI.

### M4 — OpenCode adapter ⬜

Same gate as M3. OpenCode supports per-agent model pinning and
parallel delegation natively, so the adapter is mostly manifest +
agent-loader plumbing.

### M5 — v1.0 ⬜

Scope freeze. Three supported harnesses (Copilot CLI, Claude Code,
OpenCode). Agent files stable. Default roster stable. Release process
stable. Major version cut signals API stability for users overriding
councillor agents at the user / project level — frontmatter shape
won't break.

After v1.0, additional harnesses (Cursor, Codex, Gemini CLI, etc.)
need both the demand signal and behavioral evidence. See
"Harness scope policy" in `CONTRIBUTE.md`.

## Backlog

Items tracked but not yet specced into a user story.

- `.todo/backlog/spec-multi-moderator-entry-points.md` — M2 above.

Future entries to expect (no files yet; placeholders for memory):

- **Per-question council customization.** A way for a user to
  override the active roster for a single invocation without editing
  files. Likely a first-line directive the moderator parses
  (`@council --skip=novice "<q>"` or in-prompt syntax). Needs design.
- **Anonymization-safe attribution in the chat reply.** The user
  sees the moderator say "the architect flagged X" — but during
  round 2 the councillors saw peers as "Councillor B." How is
  attribution rebuilt for the synthesis without leaking identities
  back into round 2's prompt context? Audit before M1 ships.
- **Model-pin drift policy.** Copilot CLI's model namespace is
  plan-scoped with no documented enum. When a default pin disappears
  from a user's plan tier, what happens? Document and decide between
  "fail loud" and "fall back to default model with a warning."
- **Cost / latency reporting.** Three rounds × six councillors = 18
  LLM calls per question, plus synthesis. Worth surfacing this in
  the moderator's reply or as a one-line summary at the end.
- **Council transcripts persistence.** The "offer to save a fuller
  markdown report" mechanic in the moderator's reply needs a
  durable destination (`./council-reports/<timestamp>.md`?). Needs
  design.

## Out of scope (deliberate non-goals)

- **No `council.toml` or runtime config schema.** Customization is
  harness-native: users override agent files at user or project
  level. Don't reinvent what the harness already does.
- **No MCP server.** The architecture is pure sub-agent fan-out.
  Adding an MCP server would be a different project.
- **No npm publish.** Council is distributed via the Copilot CLI
  marketplace (and the Claude Code marketplace if M3 ships).
- **No second harness through v1.0** beyond Copilot CLI without the
  scope policy met. See `CONTRIBUTE.md` §1.
- **No background daemons, no sidecar processes.** The plugin is
  static agent files plus a manifest.

## Known unknowns

- **Override-loading resolution rules.** The customization model in
  the README assumes Copilot CLI does last-wins file resolution
  between plugin / user / project agent dirs. Documented in
  `US-bootstrap/main.md` Cross-Cutting Concerns. M1 must verify with
  a smoke fixture, not trust the docs.
- **Real-world cognitive diversity payoff.** The Karpathy paper
  argues different models surface genuinely different perspectives.
  How much of that holds across the six roles we shipped vs. five,
  vs. four? Worth measuring before M2 designs new presets.

## How to use this file

- **Picking up the project after a break:** read this file top to
  bottom, then open the most recent `.todo/US-<slug>/main.md` for
  the in-flight slice.
- **Adding a backlog item:** drop it under `## Backlog` with a
  one-paragraph description. Don't write the spec until you're ready
  to work on it.
- **Marking a milestone done:** flip the emoji and link to the
  finalized story in `.todo/done/US-<slug>/main.md`. Update
  `## Status` if user-visible status changed.

For long-form contributor docs see [`CONTRIBUTE.md`](./CONTRIBUTE.md).
For agent-specific conventions see [`AGENTS.md`](./AGENTS.md).
