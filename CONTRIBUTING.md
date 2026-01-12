# Contributing to Asset Tokenization Studio

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md). Please report unacceptable behavior to [oss@hedera.com](mailto:oss@hedera.com).

## Getting Started

1. **Fork and clone the repository**
2. **Check existing issues** or create a new one to discuss your changes
3. **Read the documentation** in [docs/index.md](docs/index.md)

## Development Setup

### Prerequisites

- Node.js v20.19.4+ (ATS) or v24.0.0+ (Mass Payout backend)
- npm v10.9.0+
- PostgreSQL (for Mass Payout backend)

### Quick Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/asset-tokenization-studio.git
cd asset-tokenization-studio

# Install dependencies
npm ci

# Build everything
npm run setup

# Run tests to verify
npm test
```

### Configure Environment

Copy and configure environment files:

```bash
# ATS Web App
cp apps/ats/web/.env.example apps/ats/web/.env.local

# Mass Payout Backend
cp apps/mass-payout/backend/.env.example apps/mass-payout/backend/.env

# Mass Payout Frontend
cp apps/mass-payout/frontend/.env.example apps/mass-payout/frontend/.env
```

## Development Workflow

### Working on Code

```bash
# ATS
npm run ats:build
npm run ats:test
npm run ats:start

# Mass Payout
npm run mass-payout:build
npm run mass-payout:test
npm run mass-payout:backend:dev
npm run mass-payout:frontend:dev
```

### Linting and Formatting

```bash
npm run lint:fix
npm run format
```

## Branch Naming

Create descriptive branches:

- `feature/your-feature-name` - New features
- `fix/issue-description` - Bug fixes
- `docs/documentation-topic` - Documentation updates

```bash
git checkout -b feature/your-feature-name
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

```bash
git commit -m "feat(ats:sdk): add batch transfer support"
git commit -m "fix(mp:backend): resolve payout calculation error"
git commit -m "docs: update quick start guide"
```

## Pull Requests

### Before Submitting

1. Ensure code builds and tests pass
2. Run `npm run lint:fix`
3. Update relevant documentation
4. Create meaningful commit messages

### Submitting

1. Push your branch: `git push origin your-branch-name`
2. Create a Pull Request targeting the **`develop`** branch
3. Fill in the PR description with:
   - Summary of changes
   - Motivation and context
   - Testing performed
   - Related issues
4. Request reviews from maintainers

### PR Title Format

```
feat(ats:sdk): add batch transfer functionality
fix(mp:backend): resolve race condition in scheduler
docs: add deployment guide
```

## Testing

Write tests for new features and bug fixes:

```bash
# Run all tests
npm test

# Run specific tests
npm run ats:test
npm run mass-payout:test

# Run tests for specific workspace
npm run test --workspace=packages/ats/sdk
```

## Documentation

Update documentation when making changes:

- **Code changes**: Update inline comments and JSDoc/TSDoc
- **New features**: Add user guides in `docs/ats/` or `docs/mass-payout/`
- **Architecture changes**: Consider creating an ADR in `docs/references/adr/`

Run documentation site locally:

```bash
npm run docs:dev
```

## Release Process (Maintainers Only)

When making changes to packages, create a changeset:

```bash
npm run changeset
```

Follow the prompts to document your changes. Commit the generated changeset file:

```bash
git add .changeset/*.md
git commit -m "chore: add changeset for feature"
```

## Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/hashgraph/asset-tokenization-studio/issues)
- **Documentation**: [Complete documentation](docs/index.md)
- **Hedera Discord**: [Join the community](https://hedera.com/discord)

## Additional Resources

- [Project README](README.md)
- [ATS Documentation](docs/ats/)
- [Mass Payout Documentation](docs/mass-payout/)
- [Architecture Decision Records](docs/references/adr/)
- [Hedera Documentation](https://docs.hedera.com)

---

Thank you for contributing to Asset Tokenization Studio!
