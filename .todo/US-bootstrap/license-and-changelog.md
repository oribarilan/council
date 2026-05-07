# license-and-changelog

## Context

Two small mechanical files: `LICENSE` (MIT) and `CHANGELOG.md` (Keep
a Changelog skeleton with `[Unreleased]` populated).

**Value delivered**: licensing is unambiguous from the first commit;
the changelog is ready to receive entries the moment the next user-
facing change lands. No retrofitting.

## Related Files

- `.todo/US-bootstrap/main.md` — "Tooling parity with 97" and
  the `LICENSE` / `CHANGELOG.md` items in DoD
- `/Users/orbarila/repos/personal/97/CHANGELOG.md` — calibration reference
- `LICENSE` (created)
- `CHANGELOG.md` (created)

## Dependencies

- None (independent of the prefixed pipeline; can land any time)

## Acceptance Criteria

- [ ] `LICENSE` exists, contains the MIT License with copyright line
      "Copyright (c) 2025 Or Barila" (or the contributor's name as
      appropriate). No additional license text appended.
- [ ] `CHANGELOG.md` exists, follows
      [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/),
      starts with the standard preamble, has a `## [Unreleased]`
      section at the top with the standard subsections (`Added`,
      `Changed`, `Fixed`, etc. — empty sub-bullets are fine, omit
      sections that have no entries).
- [ ] `[Unreleased]` contains an entry under `### Added` describing
      this story's contribution: "Initial repo scaffolding: README,
      AGENTS.md, CONTRIBUTE.md, justfile, lint and smoke scripts, CI
      workflows."
- [ ] No version section other than `[Unreleased]` exists yet — the
      first tagged version lands when the agent-files slice ships
      `v0.1.0`.
- [ ] Link references at the bottom of `CHANGELOG.md` resolve to the
      GitHub repo URL (`https://github.com/oribarilan/council`).

## File Content

### `LICENSE`

Standard MIT, copyright line `Copyright (c) 2025 Or Barila`. Pull the
canonical text from `https://opensource.org/licenses/MIT` or copy from
the `97` repo and update only the copyright holder line.

### `CHANGELOG.md`

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial repo scaffolding: README, AGENTS.md, CONTRIBUTE.md, justfile,
  lint and smoke scripts, CI workflows on a Linux/macOS/Windows × Node
  18/20/22 matrix. No agent files yet — they ship in the next slice.

[Unreleased]: https://github.com/oribarilan/council/compare/HEAD...HEAD
```

## Verification

- Ad-hoc:
  - `cat LICENSE` shows MIT text with the correct copyright line.
  - `cat CHANGELOG.md` shows the structure above.
  - `npm test` still passes (smoke does not check these files yet).

## Notes

- Voice rules apply to the changelog entry. The shipped entry is one
  sentence, plain prose, says what users get. No "comprehensive
  scaffolding leveraging best practices" — just what's there.
- The `[Unreleased]` link resolves to a GitHub compare URL that's
  effectively a no-op until the first tag exists. Both `97` and the
  Keep a Changelog example use this pattern.
