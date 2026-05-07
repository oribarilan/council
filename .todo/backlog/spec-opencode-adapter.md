# spec-opencode-adapter

## Context

Park: add an OpenCode adapter so the council plugin loads in
OpenCode. Milestone M4 in `ROADMAP.md`. Same scope-policy gate as
the Claude Code adapter (M3).

OpenCode supports per-agent model pinning and parallel sub-agent
delegation natively, so the adapter is mostly manifest plumbing
plus an agent-loader that points at the existing agent files.

**Value delivered (when shipped)**: OpenCode users get the council
without forking.

## Related Files

- `ROADMAP.md` — M4 and the scope policy
- `CONTRIBUTE.md` §1 — full policy text
- Eventual `.opencode/plugins/council.js` (loader)

## Dependencies

- M3 (Claude Code adapter) shipped and stable. M4 follows M3 because
  M3 forces the multi-harness adapter pattern to be designed; M4 is
  cheaper once that's done.
- Same demand + behavioral evidence bars as M3.

## Acceptance Criteria

- [ ] A user story (`US-opencode-adapter/main.md`) exists, citing
      demand and behavioral evidence.
- [ ] Spec answers: how does OpenCode's `agent` configuration map
      to Copilot CLI's `.agent.md` frontmatter? Is one-to-one
      conversion possible, or does the loader need to translate?
- [ ] Spec answers: does OpenCode's `task` tool support parallel
      delegation in the same way Copilot CLI does? Document any
      differences that affect the moderator's behavior.
- [ ] Spec answers: how does override-loading work in OpenCode (user
      / project agent dirs)? If different from Copilot CLI, the
      customization story in README needs harness-specific
      sub-sections.

## Notes

Worth re-reading `97`'s `.opencode/plugins/97.js` and the OpenCode
plugin docs (https://opencode.ai/docs/plugins/) at spec time. The
loader is ~100-150 lines of pure Node; not complex.

Like M3, don't pre-emptively add `.opencode/` to the repo before
the spec is written and the policy check is met.
