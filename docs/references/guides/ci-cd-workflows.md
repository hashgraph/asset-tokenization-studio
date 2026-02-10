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

- **`.github/workflows/100-flow-ats-test.yaml`**: Runs ATS tests (contracts, SDK, web app)
  - Triggered on: Changes to `packages/ats/**` or `apps/ats/**`

- **`.github/workflows/100-flow-mp-test.yaml`**: Runs Mass Payout tests
  - Triggered on: Changes to `packages/mass-payout/**` or `apps/mass-payout/**`

### Release Workflows

- **`.github/workflows/300-flow-ats-publish.yaml`** / **`.github/workflows/300-flow-mp-publish.yaml`**: Publishes packages to npm
  - Triggered by: Release tags (`v*-ats`, `v*-mp`)

- **ATS Release** / **Mass Payout Release**: Semi-automated release processes with manual version bumping (see [Release Process](#release-process) below)

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

## Release Process

**IMPORTANT**: All commits require GPG signatures. Version bumps must be done locally.

### ATS Release

**Step 1: Local Version Bump**

```bash
# Run changeset version
npm run changeset:version

# Review changes
git diff

# Commit with GPG signature (REQUIRED)
git commit -S -m "chore: release ATS packages v3.0.0"

# Push
git push
```

**Step 2: Trigger Release Workflow**

1. Go to **Actions** → **ATS Release**
2. Click **Run workflow**
3. Select **preview** (dry-run) or **release** (creates tag & publishes)

The workflow will:

- Validate version is committed
- Create & push tag (e.g., `v3.0.0-ats`)
- Create GitHub release
- Auto-trigger NPM publish

### Mass Payout Release

**Step 1: Local Version Bump**

```bash
# Run changeset version (ignore ATS packages)
npx changeset version --ignore "@hashgraph/asset-tokenization-*"

# Review changes
git diff

# Commit with GPG signature (REQUIRED)
git commit -S -m "chore: release Mass Payout packages v2.0.0"

# Push
git push
```

**Step 2: Trigger Release Workflow**

1. Go to **Actions** → **Mass Payout Release**
2. Click **Run workflow**
3. Select **preview** or **release**

### Why Manual Version Bumping?

- GPG-signed commits required for security
- Allows human review of version changes
- Prevents accidental releases

## Workflows Reference

| Workflow            | File                                    | Trigger                | Purpose                   |
| ------------------- | --------------------------------------- | ---------------------- | ------------------------- |
| **ATS Tests**       | `100-flow-ats-test.yaml`                | PR to main (ATS files) | Run ATS package tests     |
| **MP Test**         | `100-flow-mp-test.yaml`                 | PR to main (MP files)  | Run Mass Payout tests     |
| **Changeset Check** | `000-flow-changeset-check.yaml`         | PR to develop          | Validate changeset exists |
| **PR Formatting**   | `000-flow-pull-request-formatting.yaml` | PR events              | Title and assignee checks |
| **ATS Release**     | `000-user-ats-release.yaml`             | Manual                 | Create ATS release tag    |
| **MP Release**      | `000-user-mp-release.yaml`              | Manual                 | Create MP release tag     |
| **ATS Publish**     | `300-flow-ats-publish.yaml`             | Tag push `v*-ats`      | Publish to npm            |
| **MP Publish**      | `300-flow-mp-publish.yaml`              | Tag push `v*-mp`       | Publish to npm            |

## Troubleshooting

### "Uncommitted changes detected"

**Solution**: Run `changeset:version` locally, commit with GPG signature, and push before triggering release workflow.

### "Tag already exists"

**Solution**: Version bump may not have occurred. Check current version and existing tags with `git tag -l`.

### Changeset check failed

**Solution**: Run `npm run changeset` or add bypass label (`no-changeset`, `docs-only`, `chore`, `hotfix`).

### GPG signing error

**Solution**: Configure GPG key:

```bash
git config --global user.signingkey YOUR_GPG_KEY_ID
git config --global commit.gpgsign true
```

### Tests failing

**Solution**: Run tests locally before pushing:

```bash
npm run ats:test
npm run mass-payout:test
```

## Quick Commands

```bash
# Development
npm run changeset              # Create changeset
npm run changeset:status       # Check pending changes
npm run ats:test               # Run ATS tests
npm run mass-payout:test       # Run Mass Payout tests

# Release (local)
npm run changeset:version      # Bump versions & generate CHANGELOGs
```

## Required GitHub Secrets

- `NPM_TOKEN`: For publishing packages to npm registry
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

## Modifying Workflows

When modifying CI/CD workflows:

1. **Test locally first**: Use [act](https://github.com/nektos/act) to test workflows locally
2. **Update documentation**: Keep these docs in sync with workflow changes
3. **Consider impact**: Changes affect all developers, communicate widely
4. **Use conditional runs**: Avoid running unnecessary jobs
5. **Fail fast**: Order jobs to catch errors early

## Questions?

For workflow-related questions:

1. Check this documentation
2. Review the actual workflow files in `.github/workflows/`
3. Create an issue with the `ci/cd` label
