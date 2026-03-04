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

## Workflow Naming Standards

This repository follows the [Hiero naming convention](https://github.com/hiero-ledger/hiero-consensus-node/blob/main/.github/workflows/docs/naming-standards.md) for GitHub Actions workflows.

### Workflow Name Format

`ddd: [XXXX] <Name>`

- **3-digit prefix** (`ddd`): Category identifier
- **Workflow code** (`[XXXX]`): Type of trigger

### 3-Digit Prefix Categories

| Prefix | Category      | Description                        |
| ------ | ------------- | ---------------------------------- |
| `000`  | User-centric  | PR checks, manual release dispatch |
| `100`  | Operational   | Automated test/build workflows     |
| `200`  | CITR          | Ad-hoc and scheduled runs          |
| `300`  | Trigger-based | Tag push → publish workflows       |
| `800`  | Reusable      | Reusable workflow definitions      |
| `900`  | Cron          | Scheduled tasks                    |

### Workflow Code Types

| Code     | Meaning           | Trigger                                          |
| -------- | ----------------- | ------------------------------------------------ |
| `[USER]` | User-initiated    | `workflow_dispatch` (manual)                     |
| `[FLOW]` | Event-triggered   | PR target, branch push, or tag push              |
| `[CALL]` | Reusable          | `workflow_call`                                  |
| `[CRON]` | Scheduled         | `schedule`                                       |
| `[DISP]` | Internal dispatch | `workflow_dispatch` triggered by other workflows |

### File Naming Format

`ddd-xxxx-<name>.yaml`

- All lowercase, hyphen-separated, no special characters
- Maximum 30 characters for the name portion
- Always use `.yaml` extension (not `.yml`)

**Example**: File `002-user-ats-release.yaml` → Name `000: [USER] ATS Release`

## Current Workflows

### Testing Workflows

- **`.github/workflows/100-flow-ats-test.yaml`**: Runs ATS tests (contracts, SDK, web app)
  - Triggered on: Changes to `packages/ats/**` or `apps/ats/**`

- **`.github/workflows/101-flow-mp-test.yaml`**: Runs Mass Payout tests
  - Triggered on: Changes to `packages/mass-payout/**` or `apps/mass-payout/**`

- **`.github/workflows/102-flow-ats-deployment-test.yaml`**: Tests contract deployments
  - Triggered on: Changes to `packages/ats/contracts/**`

### Release Workflows

- **`.github/workflows/300-flow-ats-publish.yaml`** / **`.github/workflows/301-flow-mp-publish.yaml`**: Publishes packages to npm
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

**IMPORTANT**: All commits require GPG signatures and DCO sign-off. Version bumps must be done locally.

### ATS Release

**Step 1: Create Release Branch and Version Bump**

```bash
# Create release branch from development
git checkout -b chore/release-ats-vX.Y.Z development

# Run changeset version
npm run changeset:version

# Review changes
git diff

# Commit with GPG signature and DCO sign-off (REQUIRED)
git commit --signoff -S -m "chore: release ATS packages vX.Y.Z"

# Push release branch
git push -u origin chore/release-ats-vX.Y.Z
```

> **Note**: The `release/**` branch pattern is protected with creation restrictions. Use the `chore/release-{project}-vX.Y.Z` naming convention instead (e.g., `chore/release-ats-v5.0.0`, `chore/release-mp-v2.0.0`) and create a PR to `main`.

**Step 2: Trigger Release Workflow**

1. Go to **Actions** → **ATS Release**
2. Click **Run workflow**
3. Select **preview** (dry-run) or **release** (creates tag & publishes)

The workflow will:

- Validate version is committed
- Create & push tag (e.g., `v3.0.0-ats`)
- Create GitHub release
- Auto-trigger NPM publish

**Step 3: Post-Release Sync (MANDATORY)**

After the release PR is merged into `main`, immediately sync `main` back into `development`:

```bash
git checkout development
git pull origin development
git merge origin/main --no-edit
git push origin development
```

> **Why this is mandatory**: Release PRs are squash-merged into `main`, which creates a new commit that shares no ancestry with the original commits on `development`. Without this sync, the next release will have massive merge conflicts because git cannot recognize that both branches contain the same changes. Syncing after each release establishes a shared merge-base and prevents this divergence.

### Mass Payout Release

**Step 1: Local Version Bump**

```bash
# Run changeset version (ignore ATS packages)
npx changeset version --ignore "@hashgraph/asset-tokenization-*"

# Review changes
git diff

# Commit with GPG signature and DCO sign-off (REQUIRED)
git commit --signoff -S -m "chore: release Mass Payout packages v2.0.0"

# Push
git push
```

**Step 2: Trigger Release Workflow**

1. Go to **Actions** → **Mass Payout Release**
2. Click **Run workflow**
3. Select **preview** or **release**

**Step 3: Post-Release Sync (MANDATORY)**

After the release PR is merged into `main`, immediately sync `main` back into `development`:

```bash
git checkout development
git pull origin development
git merge origin/main --no-edit
git push origin development
```

> **Why this is mandatory**: See [ATS Release Step 3](#ats-release) for details. Skipping this step causes massive merge conflicts on the next release.

### Why Manual Version Bumping?

- GPG-signed commits required for security
- Allows human review of version changes
- Prevents accidental releases

## Workflows Reference

| Workflow                | File                                    | Trigger                | Purpose                   |
| ----------------------- | --------------------------------------- | ---------------------- | ------------------------- |
| **Changeset Check**     | `000-flow-changeset-check.yaml`         | PR to develop          | Validate changeset exists |
| **PR Formatting**       | `001-flow-pull-request-formatting.yaml` | PR events              | Title and assignee checks |
| **ATS Release**         | `002-user-ats-release.yaml`             | Manual                 | Create ATS release tag    |
| **MP Release**          | `003-user-mp-release.yaml`              | Manual                 | Create MP release tag     |
| **ATS Tests**           | `100-flow-ats-test.yaml`                | PR to main (ATS files) | Run ATS package tests     |
| **MP Test**             | `101-flow-mp-test.yaml`                 | PR to main (MP files)  | Run Mass Payout tests     |
| **ATS Deployment Test** | `102-flow-ats-deployment-test.yaml`     | PR (contracts files)   | Test contract deployments |
| **ATS Publish**         | `300-flow-ats-publish.yaml`             | Tag push `v*-ats`      | Publish to npm            |
| **MP Publish**          | `301-flow-mp-publish.yaml`              | Tag push `v*-mp`       | Publish to npm            |

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

### "Cannot create ref due to creations being restricted"

**Solution**: The `release/**` branch pattern has creation restrictions. Use the `chore/release-{project}-vX.Y.Z` naming convention instead:

```bash
git branch -m release/vX.Y.Z chore/release-ats-vX.Y.Z
git push -u origin chore/release-ats-vX.Y.Z
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
