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
  assert(existsSync('AGENTS.md'), 'smoke: AGENTS.md must exist.');
  assert(
    !existsSync('CLAUDE.md'),
    'smoke: CLAUDE.md must not exist (AGENTS.md is the single source of truth).',
  );

  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert(typeof pkg.version === 'string', 'smoke: package.json must have a version.');
  assert(
    SEMVER.test(pkg.version),
    `smoke: package.json version "${pkg.version}" is not SemVer-shaped.`,
  );

  if (existsSync('.copilot/plugin.json')) {
    const plugin = JSON.parse(readFileSync('.copilot/plugin.json', 'utf8'));
    assert(
      plugin.version === pkg.version,
      `smoke: version drift: package.json=${pkg.version} .copilot/plugin.json=${plugin.version}.`,
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
