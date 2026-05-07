# agents-md

## Context

`AGENTS.md` is the single source of truth for contributor conventions
that AI coding agents (Copilot CLI, OpenCode, Cursor, Codex) read
automatically. Same role as `97/AGENTS.md`. Modern agents ingest it
on session start; humans use it as a quick imperative reference.

The smoke test asserts `AGENTS.md` exists, so this task is required
before `npm test` can pass.

**Value delivered**: an AI agent (or a human contributor) opens this
repo and within 5 minutes knows the layout, the test command, the
voice rules, and where to dig deeper.

## Related Files

- `.todo/US-bootstrap/main.md` — full design and conventions
- `/Users/orbarila/repos/personal/97/AGENTS.md` — calibration reference
- `AGENTS.md` (created)

## Dependencies

- None (independent of the prefixed pipeline; can land any time)

## Acceptance Criteria

- [ ] `AGENTS.md` exists at repo root.
- [ ] Length: target 200-400 lines. Imperative voice. Terse. No
      narrative, no "we did X because" paragraphs — that's
      `CONTRIBUTE.md`'s job. AGENTS.md is rules.
- [ ] Section: **Quick start** — the three commands an agent needs
      first (`npm install`, `npm test`, `just check`).
- [ ] Section: **Layout** — the repo tree (mirror the one in
      `main.md`) with one-line descriptions per file.
- [ ] Section: **What you're working on** — one paragraph: this is a
      Copilot CLI plugin that ships a moderator agent and six
      councillor sub-agents implementing Karpathy-style council
      deliberation.
- [ ] Section: **Conventions** —
      - Markdown is hand-managed (Prettier doesn't touch it)
      - Voice rules (humanizer): no AI vocabulary, no copula
        avoidance, no `..., enabling X` participles, em dashes in
        moderation
      - JSON / YAML / JS go through Prettier
      - Commits: imperative subject, short body, never amend
        unrelated work
- [ ] Section: **Definition of done** — short version of: tests pass
      locally on macOS, CI is green, AGENTS.md and CHANGELOG updated
      where relevant.
- [ ] Section: **Don'ts** — bullet list of anti-patterns specific to
      this repo:
      - Don't add a `CLAUDE.md` (smoke enforces absence)
      - Don't drift `package.json` version from
        `.copilot/plugin.json` (smoke enforces equality once both
        exist)
      - Don't bump the version as part of unrelated feature work
      - Don't add agent files in the bootstrap story; they're a
        separate slice
      - Don't add new harnesses (Claude Code, OpenCode, Cursor)
        without the scope policy in `CONTRIBUTE.md` being met
      - Don't ship marketing prose in user-facing markdown
- [ ] Section: **Pointers** — links to `CONTRIBUTE.md` (long-form),
      `CHANGELOG.md`, the spec at `.todo/US-bootstrap/main.md`,
      Karpathy's `llm-council`, Copilot CLI plugin docs.
- [ ] Reads as imperative. Compare to `97/AGENTS.md` line-for-line
      for tone match.

## Verification

- Ad-hoc:
  - `node scripts/smoke-load.mjs` exits 0 (AGENTS.md exists).
  - Read the file end-to-end. Every section answers a contributor
    question without forcing them to open another file.
  - Humanizer pass: same AI-vocabulary search as readme.md task.
  - `npm test` passes.

## Notes

- This is not a beginner tutorial. The audience is an AI agent or a
  competent human contributor who needs the rules, not the rationale.
  Rationale lives in `CONTRIBUTE.md`.
- Resist the urge to copy `97/AGENTS.md` verbatim. The conventions are
  similar but not identical (council has agent files instead of skill
  files; different lint rules; different version-sync invariant
  surface). Calibrate tone, write fresh content.
