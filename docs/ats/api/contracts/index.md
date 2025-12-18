---
id: index
title: ATS Contracts API Documentation
sidebar_label: ATS Contracts
---

# ATS Contracts API Documentation

Auto-generated API documentation from Solidity smart contract NatSpec comments.

## Overview

This section contains comprehensive API documentation for all ATS smart contracts, automatically extracted from inline NatSpec comments in the source code.

## Documentation Structure

The API documentation is organized by contract hierarchy:

### Layer 0 - Storage Wrappers

Storage access layer contracts that provide type-safe access to Diamond storage:

- ERC1400StorageWrapper
- KycStorageWrapper
- CapStorageWrapper
- And more...

### Layer 1 - Core Implementation

Base implementation contracts for ERC-1400 and ERC-3643 standards:

- ERC1400Implementation
- AccessControl
- Freeze
- Hold
- ControlList

### Layer 2 - Domain Features

Feature-specific facets for equity and bond operations:

- **Bond Facets**: BondFacet, BondReadFacet
- **Equity Facets**: EquityFacet
- **Scheduled Tasks**: ScheduledTasksFacet
- **Proceed Recipients**: ProceedRecipientsFacet

### Layer 3 - Jurisdiction-Specific

Jurisdiction-specific implementations:

- USA Bond implementations
- USA Equity implementations

### Infrastructure

Core infrastructure contracts:

- BusinessLogicResolver
- TREXFactory
- ProxyAdmin

## Generating Documentation

To generate or update the API documentation:

```bash
cd packages/ats/contracts
npm run doc
```

This will:

1. Extract NatSpec comments from all Solidity contracts
2. Generate markdown files in this directory
3. Organize documentation by contract hierarchy

## Documentation Standards

All public contracts, functions, and events should include:

- `@title` - Contract name
- `@notice` - User-facing description
- `@dev` - Developer implementation notes
- `@param` - Parameter descriptions
- `@return` - Return value descriptions

For detailed guidelines on writing contract documentation, see the [Documenting Contracts Guide](/docs/guides/developer/ats-contracts/documenting-contracts).

## Finding Documentation

You can navigate the API documentation by:

- **By Feature**: Look for domain-specific facets (Bond, Equity, etc.)
- **By Layer**: Explore contracts by their architectural layer
- **By Interface**: Find interface definitions in the `interfaces/` section
- **Search**: Use the search functionality to find specific contracts or functions

## Additional Resources

- [ATS Contracts Source Code](https://github.com/hashgraph/asset-tokenization-studio/tree/main/packages/ats/contracts)
- [Deployment Guide](/docs/guides/developer/ats-contracts/deployment)
- [Adding Facets Guide](/docs/guides/developer/ats-contracts/adding-facets)
- [Upgrading Guide](/docs/guides/developer/ats-contracts/upgrading)

## Contributing

When adding new contracts or modifying existing ones:

1. Write comprehensive NatSpec comments
2. Generate documentation: `npm run doc`
3. Review the generated output
4. Commit both code and documentation changes

See the [Documenting Contracts Guide](/docs/guides/developer/ats-contracts/documenting-contracts) for best practices and examples.

---

**Note**: This documentation is auto-generated from the latest source code. If you find errors or missing documentation, please check the source contracts and update the NatSpec comments accordingly.
