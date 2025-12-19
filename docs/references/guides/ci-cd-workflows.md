---
id: ci-cd-workflows
title: CI/CD Workflows
sidebar_label: CI/CD Workflows
---

# CI/CD Workflows Documentation

This guide explains the Continuous Integration and Continuous Deployment (CI/CD) workflows used in the Asset Tokenization Studio monorepo.

## Purpose

These documents explain how our automated workflows function, making it easier for developers to:

- Understand what happens when they push code
- Debug CI/CD failures
- Modify or extend existing workflows
- Set up new automation pipelines

## What Belongs Here

- **Workflow Explanations**: Detailed descriptions of GitHub Actions workflows
- **Pipeline Diagrams**: Visual representations of CI/CD flows
- **Troubleshooting Guides**: Common CI/CD issues and solutions
- **Secrets Management**: Documentation of required secrets and environment variables
- **Release Process**: Step-by-step release procedures

## Current Workflows

### Testing Workflows

- **`.github/workflows/test-ats.yml`**: Runs ATS tests (contracts, SDK, web app)
  - Triggered on: Changes to `packages/ats/**` or `apps/ats/**`
  - Docs: `test-ats-workflow.md` (coming soon)

- **`.github/workflows/test-mp.yml`**: Runs Mass Payout tests
  - Triggered on: Changes to `packages/mass-payout/**` or `apps/mass-payout/**`
  - Docs: `test-mp-workflow.md` (coming soon)

### Release Workflows

- **`.github/workflows/publish.yml`**: Publishes packages to npm
  - Triggered by: Release tags (`v*-ats`, `v*-mp`)
  - Docs: `publishing-workflow.md` (coming soon)

- **ATS Release**: Semi-automated release process with manual version bumping
  - Docs: `ats-release-process.md` (coming soon)

- **Mass Payout Release**: Semi-automated release process with manual version bumping
  - Docs: `mp-release-process.md` (coming soon)

## Workflow Documentation Format

Each workflow documentation file should include:

1. **Overview**: What does this workflow do?
2. **Triggers**: When does it run?
3. **Steps**: What are the main stages?
4. **Secrets/Variables**: What configuration is required?
5. **Outputs**: What artifacts or results are produced?
6. **Troubleshooting**: Common failures and how to fix them
7. **Maintenance**: How to update or modify the workflow

## Understanding Conditional Workflows

The monorepo uses **path-based filtering** to run tests only for changed modules:

```yaml
on:
  push:
    paths:
      - "packages/ats/**"
      - "apps/ats/**"
```

This improves CI efficiency by avoiding unnecessary test runs.

## Release Process Overview

Both ATS and Mass Payout follow a **semi-automated release process**:

1. **Manual Version Bump** (Local):
   - Developer runs `npm run changeset:version`
   - Reviews changes to `package.json` and `CHANGELOG.md`
   - Commits with GPG signature: `git commit -S -m "chore: release"`
   - Pushes to remote

2. **Automated Tag & Release** (GitHub Actions):
   - Triggered via GitHub UI: Actions → Release → Run workflow
   - Validates version bump is committed
   - Creates and pushes git tag (e.g., `v1.2.3-ats`)
   - Creates GitHub release with auto-generated notes
   - Triggers npm publishing workflow

**Why Manual Version Bumping?**

- GPG-signed commits required for security
- Allows human review of version changes
- Prevents accidental releases

## Required GitHub Secrets

Document all required secrets and their purpose:

- `NPM_TOKEN`: For publishing packages to npm registry
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- (Add others as needed)

## Modifying Workflows

When modifying CI/CD workflows:

1. **Test locally first**: Use [act](https://github.com/nektos/act) to test workflows locally
2. **Update documentation**: Keep these docs in sync with workflow changes
3. **Consider impact**: Changes affect all developers, communicate widely
4. **Use conditional runs**: Avoid running unnecessary jobs
5. **Fail fast**: Order jobs to catch errors early

## Contributing

If you modify a workflow, update this documentation. Include:

- What changed and why
- How to test the changes
- Any new requirements or breaking changes

## Questions?

For workflow-related questions:

1. Check this documentation
2. Review the actual workflow files in `.github/workflows/`
3. Ask in the team chat
4. Create an issue with the `ci/cd` label
