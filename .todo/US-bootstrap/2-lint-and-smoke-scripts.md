# 2-lint-and-smoke-scripts

## Context

Replace the stub `lint` and `smoke` npm scripts with real ones. The
lint script audits agent files (frontmatter shape, `agents:` allowlist
consistency, `user-invocable` rules); the smoke script asserts repo-
level invariants (`AGENTS.md` exists, no `CLAUDE.md`, manifest version
equality across `package.json` + `.copilot/plugin.json` when both exist,
package.json version is well-formed).

Both scripts must pass on the empty repo state (no agent files yet, no
`.copilot/plugin.json` yet) by gracefully short-circuiting when the
inputs they audit don't exist. No agent files in this story — the lint
script just verifies the agents directory layout if it's there, or
exits clean if it isn't.

**Value delivered**: `npm test` now does real work. The version-
equality invariant is in the codebase from day one and activates
automatically when the agent-files slice adds `.copilot/plugin.json`.

## Related Files

- `.todo/US-bootstrap/main.md` — "Tooling parity with 97" and
  "Cross-Cutting Concerns: Version sync invariant lives from day one"
- `/Users/orbarila/repos/personal/97/scripts/lint-skills.mjs` — calibration reference
- `/Users/orbarila/repos/personal/97/scripts/smoke-load.mjs` — calibration reference
- `package.json` (modified by this task)
- `scripts/lint-agents.mjs` (created)
- `scripts/smoke-load.mjs` (created)

## Dependencies

- `1-tooling-and-prettier.md`
- `agents-md.md` — smoke asserts `AGENTS.md` exists; without it,
  `npm test` fails immediately. The Task Priority in `main.md`
  schedules `agents-md` before this task for that reason.

## Acceptance Criteria

- [ ] `scripts/lint-agents.mjs` exists, uses Node built-ins only, runs
      cleanly when `.copilot/agents/` doesn't exist (prints "no agents
      directory; nothing to lint" and exits 0).
- [ ] `scripts/smoke-load.mjs` exists, uses Node built-ins only,
      asserts: `AGENTS.md` exists, `CLAUDE.md` does not, `package.json`
      parses and has a SemVer-shaped `version`, and (gated on file
      existence) `.copilot/plugin.json`'s version equals
      `package.json`'s version. Exits non-zero with a readable message
      on any failure.
- [ ] `package.json` `scripts.lint` is `node scripts/lint-agents.mjs`.
- [ ] `package.json` `scripts.smoke` is `node scripts/smoke-load.mjs`.
- [ ] `npm test` passes on the current repo state (no agent files, no
      `.copilot/plugin.json`).
- [ ] Both scripts are formatted by prettier (so `npm run format:check`
      stays green).
- [ ] Each script handles its own errors: any thrown error in the body
      is caught and surfaced as `console.error` + `process.exit(1)`,
      not an unhandled rejection.

## File Content

### `scripts/lint-agents.mjs`

```js
#!/usr/bin/env node
// Structural lint for council agent files.
//
// Currently audits .copilot/agents/*.agent.md when the directory
// exists. Exits 0 when there are no agents yet (this story doesn't
// ship any). Future slices add real frontmatter checks: required
// fields, `agents:` allowlist consistency between moderator and
// councillors, model-pinning presence on every councillor,
// `user-invocable: false` and `disable-model-invocation: true` on
// every councillor.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const AGENTS_DIR = '.copilot/agents';

function main() {
  if (!existsSync(AGENTS_DIR)) {
    console.log('lint: no .copilot/agents directory; nothing to lint.');
    return;
  }

  const entries = readdirSync(AGENTS_DIR);
  const agentFiles = entries.filter((name) => name.endsWith('.agent.md'));

  if (agentFiles.length === 0) {
    console.log('lint: .copilot/agents exists but contains no .agent.md files.');
    return;
  }

  // Minimal smoke-shaped checks until the agent-files slice ships real rules.
  for (const file of agentFiles) {
    const path = join(AGENTS_DIR, file);
    const stat = statSync(path);
    if (!stat.isFile()) {
      throw new Error(`lint: ${path} is not a regular file.`);
    }
    const content = readFileSync(path, 'utf8');
    if (!content.startsWith('---\n')) {
      throw new Error(`lint: ${path} must start with YAML frontmatter ('---').`);
    }
    const end = content.indexOf('\n---', 4);
    if (end === -1) {
      throw new Error(`lint: ${path} has unterminated frontmatter.`);
    }
  }

  console.log(`lint: ${agentFiles.length} agent file(s) passed structural checks.`);
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
```

### `scripts/smoke-load.mjs`

```js
#!/usr/bin/env node
// Repo-level invariants. Run on every npm test.
//
// Enforces:
//  - AGENTS.md exists (single source of truth for contributor conventions)
//  - CLAUDE.md does not exist (drift prevention)
//  - package.json parses and has a SemVer-shaped version
//  - .copilot/plugin.json's version equals package.json's, when both exist
//
// The plugin manifest gate activates automatically the moment
// .copilot/plugin.json lands in a future slice. No retrofitting.

import { existsSync, readFileSync } from 'node:fs';

const SEMVER = /^\d+\.\d+\.\d+(-[\w.-]+)?(\+[\w.-]+)?$/;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function main() {
  assert(existsSync('AGENTS.md'), "smoke: AGENTS.md must exist.");
  assert(
    !existsSync('CLAUDE.md'),
    "smoke: CLAUDE.md must not exist (AGENTS.md is the single source of truth)."
  );

  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert(typeof pkg.version === 'string', 'smoke: package.json must have a version.');
  assert(
    SEMVER.test(pkg.version),
    `smoke: package.json version "${pkg.version}" is not SemVer-shaped.`
  );

  if (existsSync('.copilot/plugin.json')) {
    const plugin = JSON.parse(readFileSync('.copilot/plugin.json', 'utf8'));
    assert(
      plugin.version === pkg.version,
      `smoke: version drift: package.json=${pkg.version} .copilot/plugin.json=${plugin.version}.`
    );
  }

  console.log('smoke: all invariants hold.');
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
```

### `package.json` patch

In the `scripts` block:

```json
"lint": "node scripts/lint-agents.mjs",
"smoke": "node scripts/smoke-load.mjs",
```

(Replaces the stub strings from task 1.)

## Verification

- Ad-hoc:
  - `node scripts/lint-agents.mjs` exits 0 with the "nothing to lint" message.
  - `node scripts/smoke-load.mjs` exits 0 with "all invariants hold".
  - **Negative case**: `touch CLAUDE.md && node scripts/smoke-load.mjs` exits 1 with the drift message. `rm CLAUDE.md` after.
  - **Negative case**: temporarily edit `package.json` `version` to `not-semver`, run `node scripts/smoke-load.mjs`, confirm exit 1. Revert.
  - `npm test` exits 0 on the clean repo.
  - `npm run format:check` exits 0.

## Notes

- The lint script is intentionally thin. Real frontmatter rules (the
  `agents:` allowlist consistency check, model-pinning audit,
  `user-invocable: false` enforcement on councillors) ship alongside
  the actual agent files in the next slice — that's where the rules
  earn their keep. Pre-shipping rules without files to apply them to
  invents a contract before there's a counterparty.
- The smoke script's plugin-manifest check is gated on
  `existsSync('.copilot/plugin.json')`. The moment that file lands in
  a future commit, the gate flips and version drift becomes a CI
  failure. This is the "version sync invariant lives from day one"
  cross-cutting concern made concrete.
- AGENTS.md is asserted to exist by the smoke test. Task `agents-md.md`
  must land before this script can pass — see Cross-Cutting Concerns
  in `main.md` for ordering. If the docs tasks haven't run yet,
  `npm test` will fail until AGENTS.md is created, which is the
  desired forcing function.
