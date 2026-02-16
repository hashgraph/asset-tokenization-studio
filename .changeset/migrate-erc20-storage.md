---
"@hashgraph/asset-tokenization-contracts": minor
---

Migrate totalSupply and balances to ERC20 storage with lazy migration strategy

This PR introduces a storage migration that moves `totalSupply` and `balances` from the legacy ERC1410BasicStorage to the new ERC20Storage, enabling better separation of concerns and improved gas efficiency.

**Key Changes:**

- **New Storage Structure**: Added `totalSupply` and `balances` fields to ERC20Storage struct in ERC20StorageWrapper1
- **Lazy Migration**: Implemented `_migrateTotalSupplyIfNeeded()` and `_migrateBalanceIfNeeded()` functions that automatically migrate values from deprecated storage on first access
- **Backward Compatibility**: View functions prioritize legacy storage values, falling back to new storage when legacy is empty
- **Deprecated Fields**: Renamed `_totalSupply_` to `DEPRECATED_totalSupply` and `_balances_` to `DEPRECATED_balances` in ERC1410BasicStorage to indicate deprecation
- **Event Emission**: Simplified Transfer event emission by replacing internal `_emitTransferEvent` wrapper with direct `emit Transfer` statements
- **New Helper Methods**: Added `_increaseBalance`, `_reduceBalance`, `_increaseTotalSupply`, `_reduceTotalSupply`, and `_adjustTotalBalanceFor` functions
- **Migration Test Contract**: Added MigrationFacetTest for testing the migration scenarios

**Benefits:**

- Cleaner storage architecture with ERC20-specific data in ERC20Storage
- Automatic, transparent migration with no disruption to existing tokens
- Small gas savings from simplified event emission (~50-70 gas per transfer operation)
