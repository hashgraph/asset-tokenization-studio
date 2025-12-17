# Contributing to Asset Tokenization Studio

Thank you for your interest in contributing to the Asset Tokenization Studio! This guide will help you get started with contributing to this Open Source project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)
- [Community](#community)

## Code of Conduct

This project is governed by the [Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [oss@hedera.com](mailto:oss@hedera.com).

## Getting Started

Before contributing, please:

1. **Read the Documentation**: Familiarize yourself with the project by reading the [README.md](README.md) and browsing the [documentation site](apps/docs).
2. **Check Existing Issues**: Look for existing issues or create a new one to discuss your proposed changes.
3. **Review Enhancement Proposals**: Check [existing EPs](docs/proposals) to see if similar features are already being discussed.
4. **Join the Community**: Connect with other contributors (see [Community](#community) section).

## Development Environment Setup

### Prerequisites

- **Node.js**:
  - ATS requires **v20.19.4 or newer**
  - Mass Payout backend requires **v24.0.0 or newer**
- **npm**: v10.9.0 or newer
- **PostgreSQL**: Required for Mass Payout backend
- **Git**: For version control
- **Code Editor**: VS Code recommended (see [Editor Setup](#editor-setup))

### Initial Setup

1. **Fork and Clone the Repository**

   ```bash
   # Fork the repository on GitHub
   # Then clone your fork
   git clone https://github.com/YOUR_USERNAME/asset-tokenization-studio.git
   cd asset-tokenization-studio
   ```

2. **Install Dependencies**

   ```bash
   npm ci
   ```

3. **Build All Packages**

   ```bash
   npm run setup
   ```

4. **Configure Environment Variables**

   Copy the sample environment files and configure them:

   ```bash
   # ATS Web App
   cp apps/ats/web/.env.example apps/ats/web/.env.local

   # Mass Payout Backend
   cp apps/mass-payout/backend/.env.example apps/mass-payout/backend/.env

   # Mass Payout Frontend
   cp apps/mass-payout/frontend/.env.example apps/mass-payout/frontend/.env
   ```

   Update the `.env` files with your configuration.

5. **Run Tests to Verify Setup**

   ```bash
   npm run ats:test
   npm run mass-payout:test
   ```

### Editor Setup

We recommend using **Visual Studio Code** with the following extensions:

- **ESLint**: For JavaScript/TypeScript linting
- **Prettier**: For code formatting
- **Solidity**: For Solidity syntax highlighting
- **EditorConfig**: For consistent editor configuration

## Project Structure

This is a monorepo managed with **npm workspaces**:

```
asset-tokenization-studio/
├── packages/              # Shared libraries and SDKs
│   ├── ats/
│   │   ├── contracts/    # ATS Smart Contracts (Solidity)
│   │   └── sdk/          # ATS TypeScript SDK
│   └── mass-payout/
│       ├── contracts/    # Mass Payout Contracts (Solidity)
│       └── sdk/          # Mass Payout TypeScript SDK
├── apps/                 # Applications
│   ├── ats/
│   │   └── web/         # ATS React dApp
│   ├── mass-payout/
│   │   ├── backend/     # NestJS API
│   │   └── frontend/    # React Admin Panel
│   └── docs/            # Docusaurus Documentation Site
├── docs/                # Technical Documentation
│   ├── adr/            # Architecture Decision Records
│   ├── proposals/      # Enhancement Proposals
│   ├── guides/         # Developer Guides
│   └── workflows/      # CI/CD Documentation
├── .github/            # GitHub Actions workflows
└── package.json        # Root workspace configuration
```

## Development Workflow

### Working on ATS

```bash
# Build ATS modules
npm run ats:build

# Start ATS web app in development mode
npm run ats:start

# Run ATS tests
npm run ats:test

# Work on specific modules
npm run ats:contracts:build
npm run ats:contracts:test
npm run ats:sdk:build
npm run ats:sdk:test
npm run ats:web:dev
```

### Working on Mass Payout

```bash
# Build Mass Payout modules
npm run mass-payout:build

# Start backend in dev mode
npm run mass-payout:backend:dev

# Start frontend in dev mode
npm run mass-payout:frontend:dev

# Run Mass Payout tests
npm run mass-payout:test
```

### Linting and Formatting

```bash
# Lint all files
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without modifying
npm run format:check
```

### Cleaning Build Artifacts

```bash
# Clean build artifacts
npm run clean

# Remove node_modules (preserves package-lock.json)
npm run clean:deps

# Complete cleanup including package-lock
npm run clean:full
```

## Branching Strategy

We follow a **GitFlow-inspired** branching strategy:

### Branch Types

- **`main`**: Production-ready code. All releases are tagged from this branch.
- **`develop`**: Integration branch for ongoing development (if used).
- **`feature/*`**: New features or enhancements.
  - Example: `feature/add-staking-rewards`
- **`fix/*`**: Bug fixes.
  - Example: `fix/bond-redemption-calculation`
- **`docs/*`**: Documentation updates.
  - Example: `docs/add-deployment-guide`
- **`refactor/*`**: Code refactoring without functional changes.
  - Example: `refactor/simplify-query-bus`
- **`test/*`**: Test improvements or additions.
  - Example: `test/add-integration-tests`

### Creating a Branch

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Create a new fix branch
git checkout -b fix/issue-description

# Create a new docs branch
git checkout -b docs/documentation-topic
```

### Branch Naming Conventions

- Use **kebab-case** (lowercase with hyphens)
- Be descriptive but concise
- Include the issue number if applicable
  - Example: `feature/123-add-dividend-distribution`

## Commit Guidelines

We follow the **Conventional Commits** specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without functional changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build scripts, etc.)
- **perf**: Performance improvements
- **ci**: CI/CD changes

### Scope (Optional)

The scope indicates which part of the codebase is affected:

- `ats:contracts`, `ats:sdk`, `ats:web`
- `mp:contracts`, `mp:sdk`, `mp:backend`, `mp:frontend`
- `docs`, `ci`, `deps`

### Examples

```bash
# Feature commit
git commit -m "feat(ats:sdk): add support for batch token transfers"

# Bug fix commit
git commit -m "fix(mp:backend): resolve payout distribution calculation error"

# Documentation commit
git commit -m "docs: add guide for custom wallet integration"

# Chore commit
git commit -m "chore(deps): bump @hedera/sdk to version 2.5.0"
```

### Commit Message Best Practices

- Use the imperative mood ("add" not "added" or "adds")
- Keep the subject line under 72 characters
- Capitalize the first letter of the subject
- Do not end the subject with a period
- Separate subject from body with a blank line
- Use the body to explain _what_ and _why_, not _how_

### GPG Signing (Required for Releases)

Release commits must be GPG-signed:

```bash
# Configure GPG signing
git config --global user.signingkey YOUR_GPG_KEY_ID
git config --global commit.gpgsign true

# Create a signed commit
git commit -S -m "chore: release ATS packages"
```

For more information, see [GitHub's GPG signing guide](https://docs.github.com/en/authentication/managing-commit-signature-verification).

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run ATS tests only
npm run ats:test

# Run Mass Payout tests only
npm run mass-payout:test

# Run tests for a specific workspace
npm run test --workspace=packages/ats/sdk

# Run tests in watch mode
npm run test:watch --workspace=packages/ats/sdk
```

### Writing Tests

- **Smart Contracts**: Use Hardhat tests in `test/` directories
- **SDKs**: Use Jest with colocated test files (`*.test.ts` or `*.spec.ts`)
- **Frontend**: Use Vitest + React Testing Library
- **Backend**: Use Jest + NestJS testing utilities

### Test Coverage

```bash
# Generate coverage reports
npm run test:coverage --workspace=packages/ats/sdk
```

### Testing Best Practices

- Write tests for all new features
- Update tests when modifying existing functionality
- Aim for high test coverage (>80%)
- Use descriptive test names
- Keep tests focused and isolated
- Mock external dependencies

## Documentation

We follow a **"Docs-as-Code"** philosophy. Documentation is versioned, reviewed, and maintained alongside code.

### Types of Documentation

#### 1. Code Documentation

- **Inline Comments**: Explain complex logic
- **JSDoc/TSDoc**: Document public APIs and functions
- **NatSpec**: Document Solidity contracts and functions

#### 2. Architecture Decision Records (ADRs)

Document significant architectural decisions.

**When to create an ADR:**

- Choosing a database technology
- Selecting a framework or pattern
- Making infrastructure decisions
- Establishing coding standards

**How to create an ADR:**

```bash
# Copy the template
cp docs/adr/template.md.example docs/adr/0001-your-decision.md

# Edit the ADR with your decision details

# Create a PR for review
git checkout -b docs/adr-your-decision
git add docs/adr/0001-your-decision.md
git commit -m "docs(adr): add ADR for your decision"
git push origin docs/adr-your-decision
```

See [docs/adr/README.md](docs/adr/README.md) for more details.

#### 3. Enhancement Proposals (EPs)

Propose new features before implementation.

**When to create an EP:**

- Adding a new feature
- Making breaking changes
- Significant architectural changes
- Changes requiring community discussion

**How to create an EP:**

```bash
# Copy the template
cp docs/proposals/template.md.example docs/proposals/0001-your-feature.md

# Fill in the proposal details

# Create a DRAFT Pull Request
git checkout -b proposal/your-feature
git add docs/proposals/0001-your-feature.md
git commit -m "docs(ep): propose your feature"
git push origin proposal/your-feature

# Create a PR and mark it as Draft
# Request reviews from relevant team members
# Update based on feedback
# Merge when approved
```

See [docs/proposals/README.md](docs/proposals/README.md) for more details.

#### 4. Developer Guides

Step-by-step tutorials for complex tasks.

**When to create a guide:**

- Setting up a development environment
- Adding a new smart contract facet
- Integrating a custodial wallet
- Deploying to production

Place guides in `docs/guides/` and follow the format outlined in [docs/guides/README.md](docs/guides/README.md).

#### 5. Documentation Site

The Docusaurus site aggregates all documentation:

```bash
# Start the docs site locally
npm run docs:dev

# Build the docs site
npm run docs:build

# Serve the built site
npm run docs:serve
```

## Pull Request Process

### Before Submitting a PR

1. **Ensure your code builds**: Run `npm run build` successfully
2. **Run all tests**: Ensure `npm test` passes
3. **Lint your code**: Run `npm run lint:fix`
4. **Update documentation**: Add/update relevant docs
5. **Write meaningful commit messages**: Follow commit guidelines
6. **Rebase on latest main**: Keep your branch up to date

### Submitting a PR

1. **Push your branch**: `git push origin your-branch-name`
2. **Create a Pull Request** on GitHub
3. **Fill in the PR template**: Provide a clear description
4. **Link related issues**: Use keywords like "Fixes #123"
5. **Request reviews**: Tag relevant reviewers
6. **Add labels**: Apply appropriate labels (e.g., `ats`, `mass-payout`, `documentation`)

### PR Title Format

Follow the same format as commit messages:

```
feat(ats:sdk): add batch transfer functionality
fix(mp:backend): resolve race condition in payout scheduler
docs: add guide for custom facet development
```

### PR Description Template

```markdown
## Summary

Brief description of the changes.

## Motivation

Why is this change needed? What problem does it solve?

## Changes Made

- Change 1
- Change 2
- Change 3

## Testing

How was this tested?

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Documentation

- [ ] Code comments added/updated
- [ ] README updated
- [ ] ADR created (if applicable)
- [ ] EP created (if applicable)
- [ ] Developer guide updated (if applicable)

## Breaking Changes

Does this introduce any breaking changes? If yes, describe the migration path.

## Related Issues

Closes #123
Related to #456

## Checklist

- [ ] Code builds successfully
- [ ] All tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Commits follow conventions
- [ ] PR title follows conventions
```

### Code Review Process

- **Respond to feedback**: Address all review comments
- **Update your PR**: Push new commits or amend existing ones
- **Re-request review**: After making changes
- **Be patient**: Reviewers may be in different time zones

### Merging

- PRs require **at least one approval** from a maintainer
- All CI checks must pass
- Merge conflicts must be resolved
- Maintainers will merge approved PRs

## Release Process

The project uses **Changesets** for version management and **semi-automated releases**.

### Creating a Changeset

When making changes to packages, create a changeset:

```bash
npm run changeset
```

Follow the prompts to:

1. Select the packages that changed
2. Choose the version bump type (major, minor, patch)
3. Provide a summary of the changes

Commit the generated changeset file:

```bash
git add .changeset/*.md
git commit -m "chore: add changeset for your changes"
```

### Release Process (Maintainers Only)

#### ATS Release

1. **Manual Version Bump (Local)**

   ```bash
   # Run changeset version to update package.json and CHANGELOGs
   npm run changeset:version

   # Or ignore Mass Payout packages
   npx changeset version --ignore "@mass-payout/contracts" \
                         --ignore "@mass-payout/sdk" \
                         --ignore "@mass-payout/backend" \
                         --ignore "@mass-payout/frontend"

   # Review changes
   git diff

   # Commit with GPG signature (REQUIRED)
   git commit -S -m "chore: release ATS packages"

   # Push to remote
   git push
   ```

2. **Automated Tag & Release (GitHub Actions)**

   Trigger the release workflow via GitHub UI:
   - Navigate to **Actions → ATS Release → Run workflow**
   - Select `release` mode
   - The workflow will create a git tag (e.g., `v1.2.3-ats`) and GitHub release
   - NPM publishing will trigger automatically

#### Mass Payout Release

Follow the same process, but:

- Ignore ATS packages when running `changeset version`
- Trigger the **Mass Payout Release** workflow
- Tag format: `v1.2.3-mp`

### Version Bump Guidelines

- **Patch** (`1.0.x`): Bug fixes, minor improvements
- **Minor** (`1.x.0`): New features, non-breaking changes
- **Major** (`x.0.0`): Breaking changes

## Community

### Getting Help

- **GitHub Discussions**: Ask questions and share ideas
- **GitHub Issues**: Report bugs or request features
- **Hedera Discord**: Join the Hedera community

### Staying Updated

- **Watch the repository**: Get notifications for new releases and discussions
- **Follow the changelog**: Review `CHANGELOG.md` files in each package
- **Join community calls**: Participate in community meetings (if available)

### Contributing to the Community

- **Answer questions**: Help other contributors in discussions
- **Review PRs**: Provide constructive feedback on pull requests
- **Share knowledge**: Write blog posts, tutorials, or guides
- **Report issues**: Help improve the project by reporting bugs

## Additional Resources

- [Project README](README.md)
- [Architecture Decision Records](docs/adr)
- [Enhancement Proposals](docs/proposals)
- [Developer Guides](docs/guides)
- [CLAUDE.md](CLAUDE.md) - Project instructions for Claude Code
- [Hedera Documentation](https://docs.hedera.com)

## Questions?

If you have questions not covered in this guide, please:

1. Check the [documentation](apps/docs)
2. Search [existing issues](https://github.com/hashgraph/asset-tokenization-studio/issues)
3. Ask in [GitHub Discussions](https://github.com/hashgraph/asset-tokenization-studio/discussions)
4. Reach out to the maintainers

Thank you for contributing to Asset Tokenization Studio!
