# Gemini Mandates

This file provides foundational mandates for the Gemini CLI agent. These instructions take absolute precedence over general workflows.

## Primary Source of Truth

Gemini **MUST** refer to `AGENTS.md` in the root and package directories for the primary project context, architecture, commands, and standards.

## Foundational Mandates

### Git & Commit Workflow

- **Conventional Commits:** Follow the project's commit message format: `<type>(<scope>): <subject>`.
- **DCO Sign-off:** Every commit **MUST** include `Signed-off-by`. Use `git commit --signoff`.
- **GPG Signature:** Every commit **MUST** be GPG-signed. Use `git commit -S`.
- **Target Branch:** Always target `develop` for PRs.

### Commands & Environment

- **Contract Compilation:** Use `NODE_OPTIONS='--max-old-space-size=8192'` for `npm run ats:contracts:compile`.
- **SDK Testing:** Use `NODE_OPTIONS=--max-old-space-size=16384` for `npm run ats:sdk:test`.

### AI Integration

- **Skills:** Use the `update-docs` skill to sync documentation after changes.
- **Memory:** Use `save_memory` only for global preferences, never for workspace-specific state.
