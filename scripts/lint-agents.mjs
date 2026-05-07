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
