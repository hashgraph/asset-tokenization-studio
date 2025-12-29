---
id: 0001-adopt-docs-as-code-philosophy
title: Adopt Docs-as-Code Philosophy for Documentation Management
status: Proposed
date: 2025-12-16
authors: [themariofrancia]
scope: Global
---

# Adopt Docs-as-Code Philosophy for Documentation Management

|             |                                                        |
| ----------- | ------------------------------------------------------ |
| **Status**  | 📝 Proposed                                            |
| **Date**    | 2025-12-16                                             |
| **Authors** | [@themariofrancia](https://github.com/themariofrancia) |
| **Scope**   | Global                                                 |

---

## Knowledge Sharing Philosophy

> "En cuestiones de cultura y de saber, solo se pierde lo que se guarda; solo se gana lo que se da." — Antonio Machado

This ADR applies Open Source principles to documentation.

### Documentation Principles

We apply these characteristics to the documentation:

- **ADRs (Architecture Decision Records)**: Transparent decision-making preserves the "why" for future contributors
- **EPs (Enhancement Proposals)**: Open proposal process enables community participation in project direction
- **Co-located Docs**: Version-controlled documentation ensures freedom to fork, adapt, and redistribute
- **Permissive Licensing**: Apache 2.0 for both code and docs

### Key Principles

1. **Co-location**: Documentation lives with code, preventing drift
2. **Transparency by Default**: Architectural decisions are public unless security/privacy concerns exist
3. **Context Preservation**: ADRs capture the "why," not just the "what"
4. **Community Accessibility**: External contributors access the same context as core team
5. **Review Culture**: Documentation changes go through PR review like code
6. **Machine-Readable**: AI-assisted tools can leverage full project context

## Context and Problem Statement

Asset Tokenization Studio is a complex monorepo with two products (ATS and Mass Payout) spanning React frontends, TypeScript SDKs, and Solidity contracts. Critical documentation currently resides in private repositories, creating silos that:

- Block external contributors from accessing design context
- Cause documentation drift from implementation
- Prevent AI-assisted development tools from accessing full project context
- Hinder community adoption

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

Keep documentation in Confluence.

**Cons:** Siloed from code, no version control, inaccessible to external contributors, drifts from implementation.

### Option 2: GitHub Wiki

Use GitHub's built-in wiki.

**Cons:** Separate repository, limited customization, difficult to enforce review, poor discoverability.

### Option 3: Docs-as-Code with Docusaurus ✅

Docs-as-Code using Docusaurus with ADRs and EPs.

**Pros:** Co-located with code, PR review, version-controlled, professional docs site, AI-accessible, industry-standard.

**Cons:** Requires discipline, migration effort.

## Decision Outcome

**Option 3 - Docs-as-Code with Docusaurus** aligns with Open Software principles and industry standards (Kubernetes, Backstage, Hedera).

**Documentation types:**

- **ADRs**: Document decisions made, providing historical context
- **EPs**: Propose features before implementation, enabling community discussion

### Implementation Strategy

#### Three-Layer Architecture

**Layer 1 (Developers):** Repository root, module READMEs, CONTRIBUTING.md, developer guides, ADRs, EPs

**Layer 2 (All Users):** Docusaurus app (`apps/docs`) with user manuals, API reference, searchable site

**Layer 3 (Internal):** private repositories for sensitive credentials, HR, pre-public discussions

#### Documentation Directory Structure

```
docs/                        # Documentation source (consumed by Docusaurus)
├── ats/                     # ATS product documentation
│   ├── getting-started/     # Quick start and setup guides
│   ├── user-guides/         # End-user guides
│   ├── developer-guides/    # Developer documentation
│   └── api/                 # API reference documentation
├── mass-payout/             # Mass Payout product documentation
│   ├── getting-started/     # Quick start and setup guides
│   ├── user-guides/         # End-user guides
│   ├── developer-guides/    # Developer documentation
│   └── api/                 # API reference documentation
├── references/              # Cross-product reference documentation
│   ├── adr/                 # Architecture Decision Records
│   ├── proposals/           # Enhancement Proposals
│   └── guides/              # General guides (monorepo, CI/CD)
└── images/                  # Shared images and assets
```

**Location:** `docs/` directory at repository root, consumed by Docusaurus app at `apps/docs/`

**Note on Auto-Generated API Documentation:**
Contract documentation (NatSpec) is generated locally in `packages/*/contracts/docs/api/` using hardhat-dodoc. Generated files are gitignored and kept close to source code for developer reference, preventing the main documentation site from being bloated with hundreds of auto-generated files.

#### Naming Conventions

- All documentation files use **kebab-case** (lowercase with hyphens)
- **ADRs:** `docs/references/adr/NNNN-short-description.md` (e.g., `0001-adopt-docs-as-code-philosophy.md`)
- **EPs:** `docs/references/proposals/NNNN-feature-name.md` (e.g., `0001-staking-rewards.md`)
- **ATS Guides:**
  - User guides: `docs/ats/user-guides/topic-name.md` (e.g., `creating-bond.md`)
  - Developer guides: `docs/ats/developer-guides/topic-name.md` (e.g., `sdk-integration.md`)
- **Mass Payout Guides:**
  - User guides: `docs/mass-payout/user-guides/topic-name.md` (e.g., `importing-assets.md`)
  - Developer guides: `docs/mass-payout/developer-guides/topic-name.md` (e.g., `sdk-integration.md`)
- **General Guides:** `docs/references/guides/topic-name.md` (e.g., `monorepo-migration.md`, `ci-cd-workflows.md`)
- Strict numerical sequence for ADRs and EPs to preserve chronological timeline
- Scope (ATS vs. Mass Payout vs. Global) defined in file frontmatter metadata

#### ADR and EP Process

**ADRs:** Copy template → Fill frontmatter → Complete sections → Status (📝 Proposed / ✅ Accepted / ❌ Rejected / 🔄 Superseded) → PR review → Merge

**EPs:** Copy template → Fill frontmatter → Draft PR for discussion → Iterate → Status to Implementable when approved → Merge → Implement → Update to Implemented

## Consequences

### Positive

- Transparency and review culture for design decisions
- Documentation synchronized with code (single source of truth)
- AI-accessible full project context
- Community can participate and contribute effectively
- ADRs preserve historical "why" for future maintainers
- Professional, searchable docs site with automated API reference

### Negative

- Requires discipline to keep docs updated
- Learning curve for ADR/EP process
- Migration effort from private repositories

### Risks and Mitigation

| Risk                                 | Mitigation                                |
| ------------------------------------ | ----------------------------------------- |
| Documentation becomes stale          | Docs updates part of PR review checklist  |
| Contributors skip EP process         | Clear guidelines on when EPs required     |
| private repositories used for public | Regular audits; strict policy enforcement |

## Compliance and Security

- **Smart Contracts**: Security audits and technical specs will be referenced in package READMEs
- **Licensing**: Apache 2.0 license is visible in the documentation site footer
- **Sensitive Information**: private repositories remain for credentials, HR, and pre-public strategic discussions
- **Access Control**: Documentation site is public; internal docs remain restricted

## References

- [Kubernetes Enhancement Proposals (KEPs)](https://github.com/kubernetes/enhancements/tree/master/keps)
- [Architecture Decision Records (ADR) Pattern](https://adr.github.io/)
- [Docusaurus Documentation](https://docusaurus.io/)
