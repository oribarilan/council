# spec-multi-moderator-entry-points

## Context

Park: design and ship multiple user-invocable moderator agents so users
can pick a council "shape" per session without a runtime config file or
agent-file overrides.

The single-entry-point decision in `US-bootstrap` keeps `council` as the
only moderator through the early slices. Once the single flow is in
users' hands and we have feedback on what subsets and roster flavors
people actually want, this task picks up the design.

**Value delivered**: a spec (not implementation) for a small, opinionated
set of additional moderator entry points, each backed by a `.agent.md`
file with a different `agents:` allowlist. No new config schema. No new
runtime layer.

## Related Files

- `.todo/US-bootstrap/main.md` — single-entry-point decision and the
  customization model this builds on
- `.copilot/agents/council.agent.md` — the existing single moderator
  (lands in the agent-files slice)

## Dependencies

- The agent-files slice must ship first — there is nothing to vary
  until the base moderator + 6 councillors exist and have run in the
  wild.
- At least one cycle of real user feedback on the single-entry-point
  flow before this gets specced. Specifically: what councils do people
  override? What subsets do they wish for? Don't design in the dark.

## Acceptance Criteria

- [ ] A user story (`US-multi-moderator/main.md`) exists with: the
      shipped roster of moderator entry points, each one's `agents:`
      allowlist, the round count and protocol per entry point (full
      3-round vs. shortened), and the rationale grounded in real user
      feedback (cite issues / messages, not speculation).
- [ ] The spec answers: do flavored councils (`council-design`,
      `council-security`) get their own councillor sets, or do they
      reuse the base six with different system-prompt shading? Pick
      one, document why.
- [ ] The spec addresses naming collision risk with user/project
      agent overrides (`council-quick.agent.md` etc. are now plugin-
      shipped names users could already be using).
- [ ] Trade-off explicitly evaluated against the alternative (single
      entry point + a simple `--quick` style argument the moderator
      parses). If multi-entry-point still wins, say why concretely.

## Verification

Ad-hoc: spec is in `.todo/US-multi-moderator/main.md`, passes its own
brainstorming-style self-review (no placeholders, no overloaded terms,
testable DoD), and at least one of the cited feedback signals is real
(linked issue, message, log).

## Notes

Original sketch from the bootstrap brainstorm:

- `council` — full 6-member, 3-round deliberation (already shipped)
- `council-quick` — 3 members (pragmatist, contrarian, architect),
  1 round, no peer review
- `council-design` — design-flavored roster (later)
- `council-security` — security-flavored roster (later)

Treat the sketch as a starting point, not a commitment. The single-
entry-point experience may show that none of these earn their slot.
