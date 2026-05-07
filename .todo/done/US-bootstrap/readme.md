# readme

## Context

The user-facing README. It is the first and often only thing a
visitor reads. It must (a) explain what council is in under 30
seconds, (b) show the (eventual) Copilot CLI install path, (c) link
to `CONTRIBUTE.md` for contributor docs.

The repo is pre-release. The README must be honest about that: no
fake install instructions, no claims of features that haven't shipped.

**Value delivered**: a visitor lands on the repo and understands the
project; a future contributor knows where to go for deeper docs.

## Related Files

- `.todo/US-bootstrap/main.md` — full design (architecture, roster,
  flow, output) — the README's job is to compress this into ~30
  lines of prose
- `/Users/orbarila/repos/personal/97/README.md` — calibration reference
  for tone, structure, and voice
- `README.md` (modified — currently a 1-line stub)

## Dependencies

- `1-tooling-and-prettier.md` (so the badge URL has a workflow to
  point at; technically the badge can be added before CI runs but
  the file paths must be right)
- `agents-md.md` and `contribute-md.md` ideally land first so the
  README's links resolve, but the README can be drafted with
  forward-references and the links land green when those tasks
  complete

## Acceptance Criteria

- [x] `README.md` exists at repo root.
- [x] Title and one-line tagline at top. Tagline is a real sentence
      that says what council is, not marketing prose.
- [x] CI badge near the top, linking to `actions/workflows/test.yml`.
- [x] **Pre-release banner** prominently visible (a short italics line
      or callout): something like *"Early scaffolding. No working
      install yet — agent files ship in the next release."* Tone
      matches `97`'s "Early beta" line, but more honest about state.
- [x] **What this is** section: 2 short paragraphs explaining the
      multi-LLM council concept (Karpathy lineage acknowledged), what
      problem it addresses, how it differs from a single agent.
- [x] **How it works** section: 3-round flow (independent opinions →
      anonymized peer review → moderator synthesis). One sentence per
      round. Optionally a small ASCII diagram or just prose.
- [x] **Default roster** section: the table from `main.md` — six
      councillors, role, stance, model family. Tagged as "default;
      override at user/project level."
- [x] **Install** section: documents the eventual Copilot CLI install
      command (`copilot plugin marketplace add oribarilan/council` etc)
      but is **clearly tagged "coming with v0.1.0"** so a reader
      doesn't try it today and get a 404.
- [x] **Customize** section: 3-4 sentences explaining the override
      pattern (drop `council-pragmatist.agent.md` in
      `~/.copilot/agents/` to swap model or system prompt; same
      mechanism per-project). No invented config schema. Link to
      Copilot CLI's own agent docs for the format.
- [x] **FAQ** section with at least: "How is this different from one
      strong model thinking harder?" (answer: cognitive diversity
      across model families, not strength-stacking) and "Why Copilot
      CLI only at first?" (answer: agent semantics differ; one-harness-
      first beats multi-harness-half-right; cite the harness scope
      policy in `CONTRIBUTE.md`).
- [x] **Credits** section: links to Karpathy's `llm-council`,
      `oh-my-opencode-slim`, the `97` project, and `superpowers`.
- [x] **Licensing** section: one paragraph, MIT, link to `LICENSE`.
- [x] **Development** section: short, points at `CONTRIBUTE.md` for
      the long-form guide; lists `just check` as the canonical local
      command.
- [x] No inflated AI vocabulary, no rule-of-three padding, no
      `..., enabling X` participles, em dashes only where they earn
      their keep. Compare to `97/README.md` for voice calibration.
- [x] `npm run format:check` still passes (the README is excluded
      from prettier per `.prettierignore`, but make sure no other
      formatting changes regress).

## Structure (concrete)

```
<h1 align="center">council</h1>
<p align="center"><strong>A council of LLMs for your coding agent.</strong></p>
<p align="center">[CI badge]</p>
<p align="center"><em>Early scaffolding. No working install yet — agent files ship in v0.1.0.</em></p>

## What this is
[2 paragraphs]

## How it works
[3-round flow]

## Default roster
[table]

## Install
[Copilot CLI command, tagged with v0.1.0 availability]

## Customize
[override pattern]

## FAQ
[2-3 Q&A]

## Credits
[bullet list of links]

## Licensing
[1 paragraph]

## Development
[points at CONTRIBUTE.md]
```

## Verification

- Ad-hoc:
  - Read the rendered README in GitHub's preview (or `glow README.md`
    locally if installed). Confirm it answers "what is this?" within
    the first viewport.
  - All internal links (`CONTRIBUTE.md`, `LICENSE`, AGENTS.md`)
    resolve to existing files.
  - All external links resolve.
  - `npm run format:check` passes.
  - Run a humanizer pass: search for the AI-vocabulary patterns
    (`crucial`, `seamless`, `robust`, `holistic`, `landscape`,
    `tapestry`, `vibrant`, `enduring`, `pivotal`, `vital`,
    `testament`, `serves as`, `stands as`, `marks`, `boasts`); none
    should appear.

## Notes

- The README is the file most likely to drift over time as the project
  evolves. Treat it as the canonical compression of `main.md` plus the
  pre-release banner. When a slice ships, the banner is the first
  thing to update.
- Do not invent feature claims that don't exist. If the FAQ wants to
  say "council uses anonymized peer review," that's fine because it's
  in the design and will exist when agents ship; do not say "council
  has a slack integration" or anything not in the spec.
- The default roster table in the README is a slim version of the one
  in `main.md`. Drop the model-family caveat paragraph from
  `main.md`; the README isn't the place for that nuance.
