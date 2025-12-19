---
id: index
title: References
sidebar_label: References
---

# References

Technical references and historical documentation for the Asset Tokenization Studio.

## Contents

### [Architecture Decision Records (ADRs)](./adr/)

Historical records of significant architectural decisions:

- Context and problem statements
- Decisions and rationale
- Consequences and trade-offs

ADRs provide valuable context for understanding why the system is designed the way it is.

### [Enhancement Proposals (EPs)](./proposals/)

Proposals for new features or significant changes:

- Feature specifications
- Design alternatives
- Implementation plans
- Community discussion

EPs enable transparent planning and community input before implementation.

### API Documentation

Auto-generated API documentation is available within each package:

#### Solidity Contracts

Contract documentation is generated using NatSpec and hardhat-dodoc:

- **ATS Contracts**: Run `npm run doc` in `packages/ats/contracts/`
  - Output: `packages/ats/contracts/docs/api/`
- **Mass Payout Contracts**: Run `npm run doc` in `packages/mass-payout/contracts/`
  - Output: `packages/mass-payout/contracts/docs/api/`

Generated documentation remains in package directories for developer reference during development.

#### TypeScript SDKs

- **ATS SDK API** - Generated with TypeDoc _(coming soon)_
- **Mass Payout SDK API** - Generated with TypeDoc _(coming soon)_

## How to Contribute

### Creating an ADR

See [ADR Overview](./adr/index.md) for the ADR template and process.

### Proposing an Enhancement

See [Enhancement Proposals Overview](./proposals/index.md) for the EP template and process.

### Documenting Code

**Solidity Contracts:**

- Use NatSpec comments (`///` or `/** */`)
- Document all public/external functions
- Include `@param`, `@return`, `@notice`, `@dev` tags

**TypeScript:**

- Use JSDoc comments (`/** */`)
- Document all exported functions, classes, and interfaces
- Include `@param`, `@returns`, `@throws` tags

Documentation is auto-generated during the build process.
