---
id: index
title: Smart Contracts
sidebar_label: Smart Contracts
---

# Smart Contracts API

Auto-generated API documentation from Solidity smart contract NatSpec comments.

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

```solidity
/**
 * @title Contract name
 * @notice User-facing description
 * @dev Developer implementation notes
 */
contract MyContract {
  /**
   * @notice What this function does (user-facing)
   * @dev How this function works (developer notes)
   * @param _param Description of parameter
   * @return Description of return value
   */
  function myFunction(uint256 _param) external returns (bool) {
    // ...
  }
}
```

## Finding Documentation

Navigate the API documentation by:

- **By Feature**: Look for domain-specific facets (Bond, Equity, etc.)
- **By Layer**: Explore contracts by their architectural layer (0-3)
- **By Interface**: Find interface definitions in the interfaces section
- **Search**: Use the search functionality to find specific contracts or functions

## Documentation Structure

The generated API documentation is organized by contract hierarchy:

- **Layer 0**: Storage Wrappers (ERC1400StorageWrapper, KycStorageWrapper, etc.)
- **Layer 1**: Core Implementation (ERC1400Implementation, AccessControl, etc.)
- **Layer 2**: Domain Features (BondFacet, EquityFacet, etc.)
- **Layer 3**: Jurisdiction-Specific (USA implementations)
- **Infrastructure**: ProxyAdmin, BusinessLogicResolver, Factory

## Contributing Documentation

When adding new contracts or modifying existing ones:

1. Write comprehensive NatSpec comments
2. Generate documentation: `npm run doc`
3. Review the generated output
4. Commit both code and documentation changes

For detailed guidelines on writing contract documentation, see the [Documenting Contracts Guide](../../developer-guides/contracts/documenting-contracts.md).

## Related Guides

- [Contract Overview](../../developer-guides/contracts/overview.md) - Understand contract architecture
- [Documenting Contracts](../../developer-guides/contracts/documenting-contracts.md) - Write better documentation
- [Adding Facets](../../developer-guides/contracts/adding-facets.md) - Create new facets

---

**Note**: This documentation is auto-generated from the latest source code. If you find errors or missing documentation, please check the source contracts and update the NatSpec comments accordingly.
