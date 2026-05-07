# US-agent-files

## Goal

Ship the moderator and six councillor agent files, the Copilot CLI
plugin manifest, real lint rules, and a smoke fixture that verifies
override-loading semantics. Cut `v0.1.0` and publish the GitHub
Release. After this slice, a Copilot CLI user runs the documented
install commands and gets a working `@council "<question>"` workflow.

This is Milestone M1 in [`ROADMAP.md`](../../ROADMAP.md). It builds
directly on `US-bootstrap` and assumes everything that story shipped
(layout, tooling, CI matrix, voice rules, harness scope policy).

## Background

The architecture, roster, deliberation flow, customization model, and
output format are already settled in
[`.todo/done/US-bootstrap/main.md`](../done/US-bootstrap/main.md).
This story does not redesign any of that. It executes it.

What's still up for decision in this slice — captured in the relevant
sections below — is concrete model pinning, the actual prose of each
councillor's system prompt, real lint rule definitions, and the
specific shape of the override-loading smoke fixture.

If scope grows past one cycle, the story splits into:
- **M1a — agent files land.** Manifests, agents, lint rules, override
  fixture, CI green. No tag.
- **M1b — release.** CHANGELOG roll, version bump in lockstep, tag,
  GitHub Release, install verification.

Default plan is one slice. Split only if the agent-files work
generates surprises that warrant a checkpoint.

## Definition of Done

This story is complete when:

### Plugin and agents

- [ ] `.copilot/plugin.json` exists with `name`, `description`,
      `version` (matching `package.json`), `author`, `license`,
      `agents: ".copilot/agents/"`, and any other Copilot CLI
      manifest fields the reference doc requires.
- [ ] `.copilot/agents/council.agent.md` exists. Frontmatter:
      `description`, `tools: ['agent', 'task']` (the delegation
      primitives), `agents: [council-pragmatist, council-contrarian,
      council-simplifier, council-architect, council-skeptic,
      council-novice]`, `user-invocable: true`, `model:` pinned to a
      strong synthesis-capable model. Body is the moderator system
      prompt: it implements the 3-round flow, anonymizes peer-review
      identities, produces the conversational-with-structure output
      (TL;DR, consensus, splits, minorities, plan forward), and
      offers to write the fuller markdown report.
- [ ] Six councillor agent files exist, one per role
      (`council-pragmatist`, `council-contrarian`, `council-
      simplifier`, `council-architect`, `council-skeptic`,
      `council-novice`). Each has frontmatter: `description`,
      `tools: []`, `user-invocable: false`, `disable-model-invocation:
      true`, `model:` pinned. Body is the role's system prompt.
- [ ] Concrete model pins are recorded in each agent file. Model
      strings track Copilot CLI's plan-scoped namespace (e.g.
      `Claude Sonnet 4.5`, `gpt-5`, `Gemini 2.5 Pro`, `Claude Haiku`,
      `Gemini Flash`). The README and CONTRIBUTE.md acknowledge
      these as best-effort defaults expected to drift.

### Lint and smoke

- [ ] `scripts/lint-agents.mjs` enforces, per agent file:
      frontmatter parses, required fields present, councillors have
      `user-invocable: false` and `disable-model-invocation: true`,
      councillors have `model:` pinned, the moderator's `agents:`
      allowlist contains every councillor slug and nothing else.
      Lint failures are concrete and actionable.
- [ ] `scripts/smoke-load.mjs`'s plugin-manifest gate goes live.
      `package.json` `version` and `.copilot/plugin.json` `version`
      must match; drift fails CI.
- [ ] Override-loading smoke fixture exists. The fixture creates a
      temporary user-level or project-level agent file with the same
      slug as a shipped councillor and asserts that Copilot CLI
      resolution picks the override (or, if the resolution rule
      turns out to be different from the documented assumption,
      surfaces the actual rule and updates the README accordingly).

### CI and release

- [ ] CI is green on all 9 matrix cells.
- [ ] `CHANGELOG.md` `[Unreleased]` roll: heading replaced with
      `## [0.1.0] - YYYY-MM-DD`, link references updated.
- [ ] `package.json` `version` and `.copilot/plugin.json` `version`
      both bumped to `0.1.0` in lockstep. Smoke verifies equality.
- [ ] Tag `v0.1.0` exists, pushed to `origin`. `release.yml` workflow
      ran, created a GitHub Release with the matching CHANGELOG
      section as body.
- [ ] **Install verification.** On a fresh shell with Copilot CLI
      installed:
      ```sh
      copilot plugin marketplace add oribarilan/council
      copilot plugin install council@council-marketplace
      ```
      followed by `@council "<a real question>"` produces a council
      reply. Recorded as evidence in this story file before
      finalization.

### Documentation

- [ ] README's pre-release banner is removed. Install instructions
      are no longer tagged as "coming with v0.1.0".
- [ ] CHANGELOG `[0.1.0]` section names the agents shipped, the
      lint rules added, the override-fixture verification, and any
      surprises caught.
- [ ] `ROADMAP.md` Status section flips from "pre-release, foundation
      only" to whatever's true after release. M1 emoji flips to ✅
      with a link to `.todo/done/US-agent-files/main.md`.
- [ ] AGENTS.md "Adding a new councillor or moderator" section, which
      currently says "no agent files exist yet," is updated to
      reflect reality.

### Voice

- [ ] All user-facing prose (agent system prompts included — these
      are what shapes the model's behavior) passes the humanizer
      voice scan: no AI vocabulary, no rule-of-three padding, no
      `..., enabling X` participles, em dashes only where they earn
      their keep.

## Cross-Cutting Concerns

- **System prompts are user-facing.** The councillor system prompts
  shape what each model writes back; voice rules apply, but more
  importantly, the prompt has to be specific enough that the model
  actually plays the role and not "a helpful assistant trying to be
  pragmatic." Lift the role-stance language directly from
  `US-bootstrap`'s roster table; expand each into 5–10 lines of
  imperative-voice instruction. Test with a real LLM call before
  shipping; a councillor whose output is indistinguishable from the
  base model is dead weight.
- **Model strings will drift.** Copilot CLI's model namespace is
  plan-scoped with no documented enum. The pins this slice ships are
  best-effort defaults, not a stable matrix. Document the override
  pattern in README; do not pretend the pins are durable. Add a
  README FAQ entry: "the model X isn't on my plan, what do I do?"
  (answer: override the agent file).
- **Override-loading is the load-bearing assumption.** Until the
  smoke fixture proves it, the customization story in README is
  hypothesis. If the fixture shows Copilot CLI does *not* do
  last-wins resolution as assumed, the customization story has to
  rewrite before release. Don't ship if this contract is wrong; the
  whole "harness-native customization, no config file" decision
  rests on it.
- **Anonymization in round 2.** The moderator must strip model
  identifiers from peer outputs before re-dispatching. The mechanism
  is in the moderator's system prompt: explicit instructions to
  rename "Claude Sonnet's answer" → "Councillor A," etc. Test that
  this works in practice, not just that the prompt says to do it.
  Round 2's whole purpose dies if anonymization fails.
- **Final report destination.** "Want me to write the longer report?"
  needs a destination. Default to `./council-reports/<timestamp>.md`
  in the user's CWD. Add `council-reports/` to a stock `.gitignore`
  recommendation in the README. Don't ship the directory; the
  moderator creates it on demand.
- **Cost / latency reality check.** 18 councillor calls + 1
  synthesis per question. Document the cost ballpark in README's FAQ
  before users discover it on their bill. Mention that
  `council-quick` (M2) will reduce this once it lands.
- **No new harness in this slice.** This story ships only the Copilot
  CLI artifacts. Claude Code (M3) and OpenCode (M4) come later, after
  M1 has real user feedback. Don't pre-emptively add `.claude-plugin/`
  or `.opencode/` directories.

## Task Priority

Tasks land in the next writing-plans cycle. Indicative shape:

1. Plugin manifest + bare moderator agent (no councillors yet,
   smoke gate live, lint passes on the empty roster).
2. The six councillor agent files. One commit per file is fine; they
   are independent.
3. Real lint rules. Councillor invariants enforced. Run the lint
   against the just-shipped files and fix anything it catches.
4. Override-loading smoke fixture. This is the gate on the
   customization story.
5. Moderator system prompt: implement the 3-round flow,
   anonymization, output format. Test end-to-end with a real LLM.
6. Documentation roll: README pre-release banner removed, CHANGELOG
   section, AGENTS.md update, ROADMAP.md status update.
7. Release: version bump in lockstep, tag, push, verify GitHub
   Release fires, run the install commands on a fresh shell.

## Verification

End-to-end test, recorded in this file before finalization:

1. Fresh shell, Copilot CLI installed, no prior knowledge of council.
2. `copilot plugin marketplace add oribarilan/council` — succeeds.
3. `copilot plugin install council@council-marketplace` — succeeds.
4. `copilot --agent council "Should I use Postgres or SQLite for a
   side project that might grow?"` (or another real question).
5. Output contains TL;DR, consensus / split section, plan forward,
   and offers to save a longer report. Save it; verify file exists
   and has per-councillor transcripts.
6. Override sanity check: drop a `~/.copilot/agents/council-
   contrarian.agent.md` with a different model, re-run, verify the
   override took effect (e.g., the model in the report's transcript
   matches the override).

Save the run output to this file's Verification section before
moving `main.md` to `.todo/done/`.
