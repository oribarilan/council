<h1 align="center">council</h1>

<p align="center"><strong>A council of LLMs for your coding agent.</strong></p>

<p align="center">
  <a href="https://github.com/oribarilan/council/actions/workflows/test.yml"><img src="https://github.com/oribarilan/council/actions/workflows/test.yml/badge.svg?branch=main" alt="CI"></a>
</p>

<p align="center"><em>Pre-release. Foundation only — agent files ship with v0.1.0. Don't try to install yet.</em></p>

<p align="center">
  <a href="#what-this-is">What this is</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#default-roster">Roster</a> ·
  <a href="#install">Install</a> ·
  <a href="#customize">Customize</a> ·
  <a href="#faq">FAQ</a>
</p>

---

## What this is

When your coding agent answers a hard question, it asks one model. Council
asks several. A moderator dispatches the question to a panel of councillor
sub-agents — each pinned to a different LLM and given a different cognitive
stance (pragmatist, contrarian, simplifier, architect, skeptic, novice) —
runs a three-round deliberation, and returns a synthesized recommendation.
Cross-model diversity is the point. One strong model thinking harder produces
one strong opinion; six different models thinking independently surface
disagreements you wouldn't otherwise see.

The design follows Andrej Karpathy's
[`llm-council`](https://github.com/karpathy/llm-council). The plugin shape
follows [`97`](https://github.com/oribarilan/97). Council ships as a GitHub
Copilot CLI plugin; Claude Code and OpenCode are explicit v1.x targets.

## How it works

Three rounds, all driven by a single moderator agent. The user invokes
`@council "<question>"`; the moderator does the rest.

1. **Independent opinions.** Moderator dispatches the question to all six
   councillors in parallel. Each one sees only the question and its own
   role.
2. **Anonymized peer review.** Moderator collects the answers, strips
   model identities, and re-dispatches: each councillor ranks its peers
   on accuracy and insight. Anonymization stops the "vote for the model
   I recognize" failure mode flagged in the original Karpathy paper.
3. **Synthesis.** Moderator weighs opinions and rankings and writes the
   final answer in chat: where the council agreed, where it split, any
   noteworthy minority flags, and a concrete plan forward. If you want
   the longer write-up, the moderator offers to save a fuller markdown
   report.

## Default roster

| Slug | Stance |
|---|---|
| `council-pragmatist` | Smallest thing that works; ship it |
| `council-contrarian` | Steelmans the opposite; names hidden assumptions |
| `council-simplifier` | YAGNI/KISS; strips scope; kills speculative knobs |
| `council-architect` | Long-term boundaries, coupling, evolvability |
| `council-skeptic` | Failure modes, edge cases, ops and security risk |
| `council-novice` | Dumb-but-real questions; surfaces unstated assumptions |

Six councillors, three model families (Anthropic, OpenAI, Google) by
default. The exact model pins live in each agent file's frontmatter and
can be overridden — see [Customize](#customize).

## Install

> **Not yet.** Agent files ship with v0.1.0. The commands below are the
> intended install path; they don't work today.

```sh
copilot plugin marketplace add oribarilan/council
copilot plugin install council@council-marketplace
```

After v0.1.0, run `copilot plugin update council` to pull new releases.

## Customize

Council uses Copilot CLI's standard agent-override mechanism — there is no
custom config schema. To swap a model, edit a system prompt, or change the
tools any councillor has, drop a same-named file in your user agents dir
(`~/.copilot/agents/council-pragmatist.agent.md`) or your project agents
dir (`./.copilot/agents/council-pragmatist.agent.md`). The plugin's
defaults still ship; your override wins for that one councillor.

The format is documented in
[Copilot CLI's custom agents reference](https://docs.github.com/en/copilot/reference/custom-agents-configuration).
Same `model:`, `tools:`, frontmatter you'd use for any other custom agent.

## FAQ

### How is this different from one strong model thinking harder?

A single model with a longer prompt is still one prior, one training set,
one set of blind spots. Council's payoff is cognitive diversity: a
contrarian on GPT will refuse the same shortcut a pragmatist on Claude
took for granted; a skeptic on Gemini will name a failure mode the
architect didn't see. The synthesis is more useful than the strongest
councillor's individual answer because the synthesis has been challenged
by the others. Strength-stacking five copies of the same model gets you
five copies of the same answer.

### Why Copilot CLI only at first?

Council's primitive is the agent — per-agent model pinning, parallel
delegation, allowlist plumbing. Each harness implements those slightly
differently. Getting one harness right first beats getting three half-
right. Claude Code and OpenCode are v1.x targets; the harness scope
policy in [`CONTRIBUTE.md`](./CONTRIBUTE.md) covers when a new harness
clears the bar.

### Can I add a brand-new councillor role?

Yes, with one extra step. Drop a `council-<your-role>.agent.md` in
your user or project agents dir, then override the moderator too — its
`agents:` allowlist is static frontmatter and only dispatches to slugs
it knows about. Power-user move. Not the common path; the default
roster covers most needs.

## Credits

- Andrej Karpathy — [`llm-council`](https://github.com/karpathy/llm-council),
  the deliberation protocol this project implements.
- [`oh-my-opencode-slim`](https://github.com/alvinunreal/oh-my-opencode-slim) —
  reference council agent for OpenCode that informed the moderator design.
- [`97`](https://github.com/oribarilan/97) — distribution shape, tooling
  parity (`justfile`, lint and smoke scripts, three-place version sync,
  Keep a Changelog).
- [`superpowers`](https://github.com/obra/superpowers) — voice rules
  (`humanizer`) and the multi-harness adapter pattern that v1.x will
  follow.

## Licensing

MIT — see [`LICENSE`](./LICENSE). Plugin code only; council does not ship
proprietary model content.

## Development

[`just`](https://github.com/casey/just) is the local task runner:

```sh
just            # list available recipes
just check      # everything CI runs: lint + format-check + smoke
just lint       # structural lint of agent files
just format     # prettier --write on JS/JSON/YAML
```

CI uses `npm test` directly, so contributors who prefer npm don't need
`just` installed. Zero runtime dependencies; prettier is the only dev
dep.

For repo layout, changelog discipline, the manual release process, the
harness scope policy, and CI/CD details, see
[`CONTRIBUTE.md`](./CONTRIBUTE.md). For agent-specific contributor
conventions, see [`AGENTS.md`](./AGENTS.md).
