# spec-claude-code-adapter

## Context

Park: add a Claude Code adapter so the council plugin loads on
Anthropic's CLI as well as Copilot CLI. Milestone M3 in
`ROADMAP.md`.

This is gated by the harness scope policy in `CONTRIBUTE.md` §1:
demonstrated user demand AND behavioral evidence that the existing
council content moves agent output on Copilot CLI. Don't write the
spec until both bars are met.

**Value delivered (when shipped)**: Claude Code users get the same
council experience without forking the repo or maintaining a
separate adapter.

## Related Files

- `ROADMAP.md` — M3 description and harness scope policy
- `CONTRIBUTE.md` §1 — full policy text
- The eventual adapter lives in `.claude-plugin/`

## Dependencies

- M1 (`US-agent-files`) shipped and stable.
- Demonstrated user demand from Claude Code users (linked issues,
  messages — not maintainer speculation).
- Behavioral evidence the existing council moves Copilot CLI agent
  output (qualitative or quantitative; the bar is "yes, this is
  doing real work" not "the prompt looks reasonable").

## Acceptance Criteria

- [ ] A user story (`US-claude-code-adapter/main.md`) exists with:
      the demand and behavioral evidence cited (links), the
      `.claude-plugin/` manifest shape, the agent-semantics
      differences from Copilot CLI (model name namespaces,
      delegation primitive names, allowlist syntax), the test plan,
      and a release plan.
- [ ] Spec answers: do agent files differ between harnesses, or is
      the same `.copilot/agents/` directory loaded by both? Decide
      and document.
- [ ] Spec answers: does Claude Code's marketplace mechanism work
      the same as Copilot CLI's? What's the install command on
      Claude Code?
- [ ] Spec includes the harness scope policy check: which user
      demand signals were observed, what behavioral evidence
      qualifies. If the bars aren't met, this task stays parked.

## Verification

Ad-hoc: spec is in `.todo/US-claude-code-adapter/main.md`, passes
its own self-review, the policy check at the bottom is honest.

## Notes

The 97 project shows how multi-harness adapters work — same
`skills/` directory loaded by Claude Code, Copilot CLI, OpenCode via
different manifests. Council can follow the same pattern, since
agent files are valid in all three harness ecosystems with minor
frontmatter differences.

Don't pre-emptively add `.claude-plugin/` to the repo before this
spec is written and the policy check is met.
