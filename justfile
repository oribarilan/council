# justfile — local task runner for council
#
# Run `just` (no args) to list available recipes.
# CI uses npm scripts directly so it doesn't need `just` installed; the
# recipes here are thin wrappers that mirror the npm scripts in package.json.

default:
    @just --list

# Run the smoke test (loads plugin, parses manifests, asserts invariants).
test:
    @npm run smoke

# Structural lint of agent files.
lint:
    @npm run lint

# Check formatting without mutating files (Prettier on JS/JSON/YAML).
format-check:
    @npm run format:check

# Format JS/JSON/YAML in-place with Prettier.
format:
    @npm run format

# Run every check that gates a green build: lint + format-check + test.
check: lint format-check test

# Remove generated/ignored artifacts.
clean:
    @rm -rf node_modules .prettiercache
