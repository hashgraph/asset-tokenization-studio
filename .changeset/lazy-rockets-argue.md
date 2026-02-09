---
"@hashgraph/mass-payout-contracts": minor
"@hashgraph/mass-payout-frontend": minor
"@hashgraph/mass-payout-backend": minor
"@hashgraph/asset-tokenization-contracts": minor
"@hashgraph/asset-tokenization-sdk": minor
---

Add support for multiple bond types (Variable Rate, Fixed Rate, KPI Linked, SPT)

This release introduces comprehensive support for multiple bond asset types across the entire Asset Tokenization Studio and Mass Payout platform:

**Breaking Changes:**

- Refactored Solidity contracts to check for Equity type instead of Bond type, as Bond is no longer a single type but a family of types (Variable Rate, Fixed Rate, KPI Linked Rate, SPT Rate)
- Updated asset type filtering logic to use enum values (BOND_VARIABLE_RATE, BOND_FIXED_RATE, BOND_KPI_LINKED_RATE, BOND_SPT_RATE, EQUITY) instead of display strings

**Contract Changes:**

- Updated LifeCycleCashFlowStorageWrapper.sol to invert AssetType checks: now validates if asset is Equity (special case) with bond types as the default behavior
- Added comprehensive test coverage for all bond types in lifecycle cash flow tests

**Frontend Changes:**

- Fixed asset type filter dropdown to use proper enum values for all bond types
- Updated filtering logic to correctly handle multiple bond type variants

**Backend Changes:**

- Enhanced SDK type compatibility by adding required properties to CouponViewModel (rateDecimals, startDate, endDate, fixingDate, rateStatus) and DividendsViewModel (amountDecimals)
- Updated test mocks to reflect new SDK type requirements

**SDK Changes:**

- Extended asset type system to support four distinct bond types plus equity
- Maintained backward compatibility for existing integrations

This is a **minor** version bump as it adds new functionality (multiple bond types) while maintaining backward compatibility through the enum-based approach.
