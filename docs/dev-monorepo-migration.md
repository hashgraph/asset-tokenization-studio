# Migration Guide: Workspace Structure Update

This document outlines the changes made during the BBND-1075 workspace migration and how to adapt to the new structure.

## Overview

The Asset Tokenization Studio has been restructured into a proper npm workspaces monorepo. This change improves dependency management, build processes, and development workflows.

## What Changed

### Repository Structure

**Before:**

```
├── contracts/
├── sdk/
├── web/
└── package.json (individual packages)
```

**After:**

```
├── packages/
│   ├── ats/
│   │   ├── contracts/
│   │   └── sdk/
│   └── mass-payout/
├── apps/
│   ├── ats/
│   │   └── web/
│   └── mass-payout/
└── package.json (workspace root)
```

### Installation Commands

| Task                     | Old Command              | New Command                         |
| ------------------------ | ------------------------ | ----------------------------------- |
| Install dependencies     | `npm run install:all`    | `npm ci`                            |
| Install specific package | `cd contracts && npm ci` | Handled automatically by workspaces |

### Build Commands

| Task            | Old Command               | New Command                   |
| --------------- | ------------------------- | ----------------------------- |
| Build contracts | `npm run build:contracts` | `npm run ats:contracts:build` |
| Build SDK       | `npm run build:sdk`       | `npm run ats:sdk:build`       |
| Build web       | `npm run build:web`       | `npm run ats:web:build`       |
| Build all       | Multiple commands         | `npm run ats:build`           |

### Development Commands

| Task             | Old Command          | New Command                        |
| ---------------- | -------------------- | ---------------------------------- |
| Start web app    | `cd web && yarn dev` | `npm run ats:web:dev`              |
| Full development | Manual build + start | `npm start` or `npm run ats:start` |

### Testing Commands

| Task           | Old Command                | New Command                  |
| -------------- | -------------------------- | ---------------------------- |
| Test contracts | `cd contracts && npm test` | `npm run ats:contracts:test` |
| Test SDK       | `cd sdk && npm test`       | `npm run ats:sdk:test`       |
| Test web       | `cd web && npm test`       | `npm run ats:web:test`       |
| Test all       | Manual in each directory   | `npm run ats:test`           |

### Environment Setup

**Before:**

- Environment file location: `web/.env`

**After:**

- Environment file location: `apps/ats/web/.env`

## Migration Steps for Developers

### 1. Update Local Development Environment

```bash
# Clean existing installations
npm run clean:deps  # or manually delete node_modules directories

# Fresh install with new structure
npm ci

# Build all components
npm run ats:build
```

### 2. Update Environment Files

Move your `.env` file from `web/.env` to `apps/ats/web/.env`:

```bash
mv web/.env apps/ats/web/.env
```

### 3. Update IDE/Editor Settings

Update any IDE configurations that reference the old paths:

- `contracts/` → `packages/ats/contracts/`
- `sdk/` → `packages/ats/sdk/`
- `web/` → `apps/ats/web/`

### 4. Update CI/CD and Scripts

If you have custom scripts or CI/CD configurations, update them to use the new workspace commands.

## Key Benefits

1. **Simplified Dependency Management**: All dependencies are managed from the root
2. **Faster Development**: Automatic dependency linking between packages
3. **Better CI/CD**: Path-based test triggers and conditional publishing
4. **Scalability**: Ready for additional packages (e.g., mass-payout)
5. **Consistent Tooling**: Unified linting, formatting, and testing across all packages

## Troubleshooting

### Common Issues

**Issue**: Commands not found or packages not linking
**Solution**: Run `npm ci` from the root directory

**Issue**: TypeScript/build errors
**Solution**: Ensure you build in the correct order:

```bash
npm run ats:contracts:build
npm run ats:sdk:build
npm run ats:web:build
```

**Issue**: Environment variables not working
**Solution**: Check that your `.env` file is in `apps/ats/web/.env`

### Getting Help

If you encounter issues during migration:

1. Check that you're using Node.js v22.x
2. Ensure you've run `npm ci` from the root directory
3. Verify your `.env` file is in the correct location
4. Try the clean and rebuild process described above
