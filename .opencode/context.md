# Project Context: Asset Tokenization Studio

## Environment

- **Language**: Solidity (Smart Contracts) + TypeScript (SDK + Tests)
- **Runtime**: Node.js v20+ / npm v10+
- **Build**: Hardhat (Solidity) / TypeChain
- **Package Manager**: npm workspaces
- **Test Framework**: Hardhat + Mocha/Chai

## Project Type

- [x] Library/Package (SDK)
- [x] Application (Smart Contracts)
- [x] Monorepo (npm workspaces)

## Infrastructure

- **Network**: Hedera (HBAR, HTS tokens)
- **Pattern**: Diamond (EIP-2535) for upgradeable facets
- **CI/CD**: GitHub Actions

## Project Structure

```
packages/ats/contracts/
├── contracts/
│   ├── facets/features/          # Feature facets (Clearing, Hold, ERC3643, ERC1410, etc.)
│   ├── constants/resolverKeys/   # Resolver keys configuration
│   └── test/timeTravel/variants/ # Test variants
├── scripts/domain/               # Configuration scripts (equity, bond)
├── test/contracts/integration/   # Integration tests
└── typechain-types/              # Generated TypeScript types
```

## Conventions

- **Naming**: PascalCase for contracts, camelCase for functions
- **Pattern**: Diamond Pattern (EIP-2535)
- **Facets**: Grouped by domain (Clearing, Hold, ERC3643, ERC1410)
- **Resolver Keys**: Each consolidated facet has a unique key

## Recent Work (Session 2026-03-04 to 2026-03-05)

### Completed: Facet Consolidation

**Mission**: Unify divided facets into single deployable facets per domain.

**Changes Made**:

1. **Clearing** - 5 facets → 1 (ClearingFacet)
2. **ERC3643** - 4 facets → 1 (ERC3643Facet)
3. **ERC1410** - 4 facets → 1 (ERC1410Facet)
4. **Hold** - 3 facets → 1 (HoldFacet)
5. **BondUSA** - 2 facets → 1 (BondUSAFacet already consolidated)

**Files Created**:

- `contracts/facets/features/clearing/Clearing.sol`
- `contracts/facets/features/clearing/ClearingFacet.sol`
- `contracts/facets/features/ERC3643/ERC3643.sol`
- `contracts/facets/features/ERC3643/ERC3643Facet.sol`
- `contracts/facets/features/ERC1400/ERC1410/ERC1410.sol`
- `contracts/facets/features/ERC1400/ERC1410/ERC1410Facet.sol`
- `contracts/facets/features/hold/Hold.sol`
- `contracts/facets/features/hold/HoldFacet.sol`
- Test TimeTravel variants for each consolidated facet

**Files Deleted** (deprecated):

- All individual facet files (*ActionsFacet, *ReadFacet, etc.)
- Individual TimeTravel variants

**Configuration Updates**:

- `scripts/domain/equity/createConfiguration.ts` - Updated facet list
- `scripts/domain/bond/createConfiguration.ts` - Updated facet list
- `contracts/constants/resolverKeys/features.sol` - Added new resolver keys

**Compilation Status**: ✅ SUCCESS (exit code 0)

## Pending Actions

- [ ] Commit changes to git
- [ ] Run full test suite to verify no regressions
- [ ] Consider updating SDK documentation

## Key Patterns Used

### Consolidated Facet Pattern

```solidity
// Clearing.sol - inherits from all logic contracts
contract Clearing is ClearingActions, ClearingHoldCreation, ClearingRead, ClearingRedeem, ClearingTransfer {
  // Logic provided by inherited contracts
}

// ClearingFacet.sol - Diamond entry point
contract ClearingFacet is Clearing, IStaticFunctionSelectors {
  function getStaticResolverKey() external pure override returns (bytes32) {
    return _CLEARING_RESOLVER_KEY;
  }
  // ... all function selectors
}
```

## Notes

- All interfaces (IClearingActions, etc.) are preserved for compatibility
- Original logic contracts are kept for reference
- Compilation successful with no errors
- 26 contract files eliminated (36 → 10)
