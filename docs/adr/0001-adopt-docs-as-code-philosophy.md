---
id: 0001-adopt-docs-as-code-philosophy
title: Adopt Docs-as-Code Philosophy for Documentation Management
status: Accepted
date: 2025-12-16
authors: [themariofrancia]
scope: Global
---

# Adopt Docs-as-Code Philosophy for Documentation Management

|             |                                                        |
| ----------- | ------------------------------------------------------ |
| **Status**  | ✅ Accepted                                            |
| **Date**    | 2025-12-16                                             |
| **Authors** | [@themariofrancia](https://github.com/themariofrancia) |
| **Scope**   | Global                                                 |

---

> "En cuestiones de cultura y de saber, solo se pierde lo que se guarda; solo se gana lo que se da." — Antonio Machado

## Context and Problem Statement

The Asset Tokenization Studio is a complex monorepo containing two main products (ATS and Mass Payout) with multiple layers: React frontends, TypeScript APIs, SDKs, and Solidity Smart Contracts. Currently, critical documentation resides in internal systems (Confluence), creating information silos that:

- **Limit community adoption**: External contributors cannot access design specs and architectural context
- **Hinder external contribution**: Contributors lack visibility into the "why" behind technical decisions
- **Decouple context from code**: Documentation drifts out of sync with implementation when stored separately
- **Reduce AI-assisted development effectiveness**: LLM-based coding assistants cannot access full project context

We need a unified strategy to manage both technical documentation (for contributors) and user manuals (for operators) following strict Open Source best practices.

## Decision Drivers

- **Community Transparency**: Open Source projects require visible roadmaps and design discussions
- **Single Source of Truth**: Documentation must live with the code to prevent drift
- **AI-Assisted Development**: Co-located documentation enables LLM tools to understand full project scope
- **Industry Standards**: Major OSS projects (Kubernetes, Backstage, Ethereum, Hedera) use similar approaches
- **Review Culture**: Design discussions should happen in Pull Requests with line-by-line feedback
- **Version Control**: Documentation should be versioned alongside code changes
- **Developer Experience**: Contributors need easy access to architectural context and decision history

## Considered Options

### Option 1: Maintain Status Quo (Confluence-only)

Keep all documentation in Confluence with occasional README updates.

**Pros:**

- No migration effort required
- Familiar to current team members
- Rich editing features and collaboration tools

**Cons:**

- Documentation remains siloed from codebase
- External contributors cannot access design context
- No version control or PR review process
- Documentation inevitably drifts from code
- Not compatible with AI-assisted development

### Option 2: Move Everything to GitHub Wiki

Use GitHub's built-in wiki functionality for all documentation.

**Pros:**

- Built into GitHub platform
- Simple to set up
- Version controlled

**Cons:**

- Separate git repository from main codebase
- Limited customization and theming
- No automated API documentation integration
- Difficult to enforce review process
- Not as discoverable or searchable as dedicated docs site

### Option 3: Docs-as-Code with Docusaurus (Chosen)

Adopt a "Docs-as-Code" philosophy using Docusaurus for public documentation, maintaining strict separation between public technical docs and internal sensitive information.

**Pros:**

- Documentation lives with code in same repository
- Full PR review process for docs changes
- Version controlled and synchronized with code
- Automated API documentation generation possible
- Professional, searchable documentation site
- Industry-standard approach (Kubernetes, Backstage, etc.)
- Enables AI-assisted development
- Community-friendly and transparent
- Clear distinction between ADRs (decisions made) and EPs (proposals)

**Cons:**

- Requires discipline to keep documentation updated
- Initial migration effort needed
- Team must learn new workflow

## Decision Outcome

Chosen option: **Option 3 - Docs-as-Code with Docusaurus**, because it best aligns with Open Source best practices, enables community contribution, maintains documentation synchronization with code, and follows industry standards from major OSS projects.

We will implement a clear distinction between:

- **ADRs (Architecture Decision Records)**: Document decisions already made, providing historical context and consequences
- **EPs (Enhancement Proposals)**: Propose new features or changes before implementation, enabling community discussion

This approach is inspired by:

- Kubernetes Enhancement Proposals (KEPs)
- Backstage Enhancement Proposals (BEPs)
- Ethereum Improvement Proposals (EIPs)
- Hedera Improvement Proposals (HIPs)

### Implementation Strategy

#### Three-Layer Documentation Architecture

**Layer 1: Technical Documentation (Target: Developers)**

Location: Repository root and co-located within packages

- **Root README.md**: High-level entry point, monorepo structure overview
- **Module READMEs**: Package-specific tactical documentation
- **CONTRIBUTING.md**: Engineer's handbook covering GitFlow, environment setup, release process
- **Developer Guides** (`docs/guides/`): Step-by-step tutorials for complex tasks
- **ADRs** (`docs/adr/`): Historical architectural decisions
- **EPs** (`docs/proposals/`): Feature specifications and proposals

**Layer 2: Documentation Hub (Target: All Users)**

Location: `apps/docs` (Docusaurus application)

- Product manuals for end-users
- Synced developer guides from Layer 1
- Automated API reference (TypeDoc for TypeScript, solidity-docgen for contracts)
- Searchable, professional documentation site

**Layer 3: Internal Documentation (Target: Employees)**

Location: Confluence (restricted access)

Strictly limited to:

- Sensitive credentials and client data
- HR processes and internal meeting minutes
- Strategic roadmap discussions (pre-public phase)

#### Directory Structure

```
/ (root)
├── apps/
│   ├── ats/
│   ├── mass-payout/
│   └── docs/                # [NEW] Docusaurus App (User Hub)
├── packages/
├── docs/                    # [NEW] Technical Global Docs
│   ├── adr/                 # Architecture Decisions (0001-xxx.md)
│   ├── proposals/           # EPs / Feature Specs (0001-xxx.md)
│   ├── guides/              # Developer Cookbooks
│   └── workflows/           # CI/CD explanations
├── CONTRIBUTING.md          # Dev setup & Branching rules
└── README.md                # Project Landing Page
```

#### Naming Conventions

- All documentation files use **kebab-case** (lowercase with hyphens)
- ADRs: `docs/adr/NNNN-short-description.md` (e.g., `0001-adopt-docs-as-code.md`)
- EPs: `docs/proposals/NNNN-feature-name.md` (e.g., `0015-staking-rewards.md`)
- Strict numerical sequence to preserve chronological timeline
- Scope (ATS vs. Mass Payout) defined in file metadata, not filename

#### ADR and EP Process

**ADR Creation:**

1. Copy template: `cp docs/adr/template.md.example docs/adr/NNNN-decision.md`
2. Fill in context, decision drivers, options, and consequences
3. Set status: Proposed, Accepted, Rejected, or Superseded
4. Create PR for review
5. Merge when approved

**EP Creation:**

1. Copy template: `cp docs/proposals/template.md.example docs/proposals/NNNN-feature.md`
2. Fill in summary, motivation, design, implementation details
3. Create **Draft PR** for community discussion
4. Iterate based on feedback
5. Change status to Implementable when approved
6. Merge and begin implementation
7. Update status to Implemented when complete

## Consequences

### Positive

- **Transparency**: Community and team have visibility into architectural decisions and future roadmap
- **Single Source of Truth**: Documentation lives with code, preventing drift
- **Review Culture**: Design discussions happen in PRs with line-by-line feedback before implementation
- **Contextual Sync**: Documentation versioned with code in same commits
- **AI-Assisted Development**: LLM tools can access full context for better code generation and understanding
- **Standardization**: Clear process for discussing and approving features across teams/SIGs
- **Community Adoption**: External contributors can understand project direction and contribute effectively
- **Historical Context**: ADRs preserve the "why" behind technical decisions for future maintainers
- **Professional Documentation**: Docusaurus provides searchable, navigable docs site
- **Automated API Docs**: TypeDoc and solidity-docgen can generate reference documentation

### Negative

- **Discipline Required**: Team must consistently update documentation when features change
- **Learning Curve**: Contributors must learn ADR/EP process and markdown documentation
- **Migration Effort**: Existing Confluence documentation needs to be migrated (where appropriate)
- **Maintenance Overhead**: Documentation site requires build and deployment infrastructure
- **Process Overhead**: Formal EP process may slow down small changes (mitigated by clear guidelines on when EPs are required)

### Risks and Mitigation

| Risk                                  | Mitigation                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| Documentation becomes stale           | Make docs updates part of PR review checklist                                    |
| Contributors skip EP process          | Clear guidelines on when EPs are required; lightweight process for small changes |
| Confluence still used for public docs | Regular audits; strict policy enforcement; education on proper channels          |
| Docusaurus maintenance burden         | Use stable versions; automated deployment; community templates                   |

## Compliance and Security

- **Smart Contracts**: Security audits and technical specs will be referenced in package READMEs
- **Licensing**: Apache 2.0 license is visible in documentation site footer
- **Sensitive Information**: Confluence remains for credentials, HR, and pre-public strategic discussions
- **Access Control**: Documentation site is public; internal docs remain restricted

## References

- [Kubernetes Enhancement Proposals (KEPs)](https://github.com/kubernetes/enhancements/tree/master/keps)
- [Backstage Enhancement Proposals (BEPs)](https://github.com/backstage/backstage/tree/master/beps)
- [Ethereum Improvement Proposals (EIPs)](https://eips.ethereum.org/)
- [Hedera Improvement Proposals (HIPs)](https://hips.hedera.com/)
- [Architecture Decision Records (ADR) Pattern](https://adr.github.io/)
- [Docusaurus Documentation](https://docusaurus.io/)

## Implementation Status

**Status**: ✅ Implemented (2025-12-16)

The following have been created:

- Documentation directory structure (`docs/adr/`, `docs/proposals/`, `docs/guides/`, `docs/workflows/`)
- ADR and EP templates
- Docusaurus application at `apps/docs`
- Updated root `README.md` with documentation strategy
- Comprehensive `CONTRIBUTING.md` with ADR/EP processes
- Documentation scripts in root `package.json`

**Next Steps:**

1. Migrate relevant existing documentation from Confluence
2. Create initial developer guides for common tasks
3. Set up automated TypeDoc and solidity-docgen generation
4. Configure GitHub Pages deployment for docs site
5. Train team on ADR/EP processes
6. Create first Enhancement Proposals for upcoming features
