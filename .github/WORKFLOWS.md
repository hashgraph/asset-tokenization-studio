# GitHub Workflows Guide

Quick reference for development workflow and releases in the Asset Tokenization Studio monorepo.

## Daily Development

### 1. Create Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 2. Make Changes & Create Changeset

```bash
# After making your changes
npm run changeset
```

- Select affected packages
- Choose change type: **patch** (bug fix) / **minor** (feature) / **major** (breaking change)
- Write clear description

### 3. Commit & Push

```bash
git add .
git commit --signoff -S -m "feat: your commit message"
git push origin feature/your-feature-name
```

### 4. Open PR to `develop`

Automated checks will validate:

- ✅ Tests pass
- ✅ Changeset exists (or bypass label)
- ✅ DCO compliance

**Bypass changeset** for non-feature changes by adding label: `no-changeset`, `docs-only`, `chore`, or `hotfix`

---

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

---

## Workflows Reference

| Workflow                | Trigger                | Purpose                   |
| ----------------------- | ---------------------- | ------------------------- |
| **ATS Tests**           | PR to main (ATS files) | Run ATS package tests     |
| **Mass Payout Tests**   | PR to main (MP files)  | Run Mass Payout tests     |
| **Changeset Check**     | PR to develop          | Validate changeset exists |
| **ATS Release**         | Manual                 | Create ATS release tag    |
| **Mass Payout Release** | Manual                 | Create MP release tag     |
| **ATS Publish**         | Tag push `v*-ats`      | Publish to npm            |
| **Mass Payout Publish** | Tag push `v*-mp`       | Publish to npm            |

---

## Troubleshooting

### ❌ "Uncommitted changes detected"

**Solution**: Run `changeset:version` locally, commit with GPG signature, and push before triggering release workflow.

### ❌ "Tag already exists"

**Solution**: Version bump may not have occurred. Check current version and existing tags with `git tag -l`.

### ❌ Changeset check failed

**Solution**: Run `npm run changeset` or add bypass label (`no-changeset`, `docs-only`, `chore`, `hotfix`).

### ❌ GPG signing error

**Solution**: Configure GPG key:

```bash
git config --global user.signingkey YOUR_GPG_KEY_ID
git config --global commit.gpgsign true
```

### ❌ Tests failing

**Solution**: Run tests locally before pushing:

```bash
npm run ats:test
npm run mass-payout:test
```

---

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

---

## Important Notes

- **All commits require GPG signatures** (`git commit -S`)
- **Never run `changeset version` in CI** - always do it locally
- **Version bumps must be committed and pushed** before triggering release workflows
- Only authorized teams can trigger release workflows (see CODEOWNERS)
