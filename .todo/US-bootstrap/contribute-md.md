# contribute-md

## Context

`CONTRIBUTE.md` is the long-form contributor guide: repo layout, dev
loop, changelog discipline, SemVer rules, manual release process,
CI/CD pipeline, harness scope policy, voice and content rules. Same
role as `97/CONTRIBUTE.md`. Where AGENTS.md is rules, CONTRIBUTE is
explanation.

This is the largest doc in the story. Save it for last so all the
other files exist and can be referenced.

**Value delivered**: a new contributor (human or agent) has one place
to look for "how does this repo work?" and finds a tight, complete
answer.

## Related Files

- `.todo/US-bootstrap/main.md` — design and the harness scope policy
- `/Users/orbarila/repos/personal/97/CONTRIBUTE.md` — calibration reference (and structural inspiration)
- `CONTRIBUTE.md` (created)

## Dependencies

- All other tasks (this doc references every file in the story)

## Acceptance Criteria

- [ ] `CONTRIBUTE.md` exists at repo root.
- [ ] Section 1: **What this repo is** — one paragraph on council
      (sub-agent fan-out, Karpathy lineage), one paragraph on
      "supported harness through v1.0: Copilot CLI", and the harness
      scope policy (a new harness requires demonstrated user demand
      AND behavioral evidence that existing roster moves outputs).
- [ ] Section 2: **Repo layout** — the tree from `main.md`'s "Repo
      layout (target)" section, with `[shipped]` / `[future slice]`
      tags carried over.
- [ ] Section 3: **Local development** — `just` recipes, the npm
      script equivalents, prettier scope, cross-platform support
      notes (CI matrix Ubuntu/macOS/Windows × Node 18/20/22), the
      lint constraints (frontmatter etc., currently empty but
      documented for the next slice), the smoke test invariants.
- [ ] Section 4: **Changelog discipline** — Keep a Changelog format,
      which subsection (`Added` / `Changed` / `Fixed` etc) for what,
      style for entries (past tense, reader's perspective, no
      internal references like `.todo/` paths or task slugs in
      changelog entries), when an entry is not needed.
- [ ] Section 5: **Versioning (SemVer)** — three places carry the
      version once `.copilot/plugin.json` exists; smoke enforces
      equality; PATCH / MINOR / MAJOR rules.
- [ ] Section 6: **The release process** — manual, never automatic;
      step-by-step from "verify Unreleased complete" through to "CI
      cuts the GitHub Release"; the release commit subject convention;
      the hotfix variant.
- [ ] Section 7: **CI/CD pipeline** — what `test.yml` does, what
      `release.yml` does, what CI does NOT do (no npm publish, no
      auto-tagging, no auto-merging).
- [ ] Section 8: **Distribution** — Copilot CLI marketplace install
      path (eventual, post-v0.1.0); single-source-of-truth marketplace
      manifest pattern; "we don't maintain a sibling
      `oribarilan/council-marketplace` repo"; rollback playbook.
- [ ] Section 9: **Voice and content rules** — pull from
      `97/CONTRIBUTE.md` Section 10 and adapt. Reference the
      `humanizer` skill, list the no-no patterns concretely.
- [ ] Section 10: **Quick reference** — task-to-command table.
- [ ] Final pointers to `AGENTS.md` and `LICENSE`.
- [ ] Reads as senior-engineer-explaining, not textbook-explaining.
      Voice rules apply.

## Structure (concrete)

```
# Contributing to council

## 1. What this repo is
## 2. Repo layout
## 3. Local development
## 4. Changelog discipline (Keep a Changelog)
## 5. Versioning (SemVer)
## 6. The release process
## 7. CI/CD pipeline
## 8. Distribution
## 9. Voice and content rules
## 10. Quick reference
```

## Verification

- Ad-hoc:
  - All internal links resolve (every `[text](./file)` or
    `[text](#anchor)` lands on real content).
  - Humanizer pass.
  - `npm test` passes.
  - A contributor (or you, with fresh eyes) reads each section and
    can answer the section's headline question without opening
    another file.

## Notes

- This file is large but should not be padded. Aim for 350-500 lines.
  `97/CONTRIBUTE.md` runs ~525 lines covering more (multi-harness
  adapter pattern, Cursor-branch-removal anecdote, etc.). Council's
  scope is narrower in v0.x; the doc should reflect that.
- The harness scope policy section in §1 is load-bearing. Lift the
  language from `97/CONTRIBUTE.md` and adapt: through v1.0, Copilot
  CLI only; new harnesses require demand + behavioral evidence;
  external adapters can live as forks.
- Section 6 (release process) describes the eventual flow, not the
  current state. The repo has no `v0.1.0` yet. Make this clear in
  the section's opening line — "Releases are deliberate and never
  automatic. The first release (v0.1.0) ships with the agent files
  in the next slice; the process below is what that release will
  follow."
