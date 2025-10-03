---
'@hashgraph/asset-tokenization-contracts': minor
'@hashgraph/asset-tokenization-sdk': minor
'@hashgraph/asset-tokenization-dapp': minor
---

Integrate Changesets for version management and implement enterprise-grade release workflow

## Changesets Integration

- Add Changesets configuration with fixed versioning for ATS packages (contracts, SDK, dapp)
- Configure develop-branch strategy as base for version management
- Add comprehensive changeset management scripts: create, version, publish, status, snapshot
- Implement automated semantic versioning and changelog generation
- Add @changesets/cli dependency for modern monorepo version management

## Enterprise Release Workflow

- Implement new ats.publish.yml workflow focused exclusively on contracts and SDK packages
- Add manual trigger with dry-run capability for safe testing before actual releases
- Configure parallel execution of contracts and SDK publishing jobs for improved performance
- Support automatic triggers on version tags, release branches, and GitHub releases
- Add changeset validation workflow to enforce one changeset per PR requirement
- Include bypass labels for non-feature changes (no-changeset, docs-only, hotfix, chore)

## Repository Configuration

- Update .gitignore to properly track .github/ workflows while excluding build artifacts
- Remove deprecated all.publish.yml workflow in favor of focused ATS publishing
- Update package.json with complete changeset workflow scripts and release commands
- Enhance documentation with new version management workflow and enterprise practices

## Benefits

- **Modern Version Management**: Semantic versioning with automated changelog generation
- **Enterprise Compliance**: Manual release control with proper audit trails
- **Parallel Publishing**: Improved CI/CD performance with independent job execution
- **Developer Experience**: Simplified workflow with comprehensive documentation
- **Quality Assurance**: Mandatory changeset validation ensures all changes are documented

This establishes a production-ready, enterprise-grade release management system that follows modern monorepo practices while maintaining backward compatibility with existing development workflows.
