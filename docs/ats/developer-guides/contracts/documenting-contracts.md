---
id: documenting-contracts
title: Documenting Smart Contracts with NatSpec
sidebar_label: Documenting Contracts
---

# Documenting Smart Contracts with NatSpec

This guide explains how to properly document Solidity smart contracts using NatSpec (Natural Specification) format and generate API documentation automatically.

## Overview

The ATS contracts use **NatSpec** (Ethereum Natural Language Specification Format) for inline documentation. This documentation is automatically extracted and published to the [API Documentation](/docs/references/api) section.

## NatSpec Basics

NatSpec uses special comment formats that are processed by documentation generators:

- `///` - Single-line NatSpec comment
- `/** ... */` - Multi-line NatSpec comment

### NatSpec Tags

| Tag           | Purpose                  | Where to Use                   |
| ------------- | ------------------------ | ------------------------------ |
| `@title`      | Contract name            | Contract definition            |
| `@author`     | Contract author          | Contract definition            |
| `@notice`     | User-facing description  | Contract, functions, events    |
| `@dev`        | Developer notes          | Contract, functions, modifiers |
| `@param`      | Parameter description    | Functions with parameters      |
| `@return`     | Return value description | Functions that return values   |
| `@inheritdoc` | Inherit documentation    | Override functions             |
| `@custom:*`   | Custom tags              | Any context-specific info      |

## Documentation Structure

### Contract Documentation

Every contract should have a title and notice explaining its purpose:

```solidity
/**
 * @title BondFacet
 * @author Hedera Hashgraph
 * @notice Manages bond-specific operations including coupon payments and maturity redemption
 * @dev Implements bond lifecycle management using Diamond storage pattern
 * @custom:security-contact security@hedera.com
 */
contract BondFacet is IBond, AccessControlStorageWrapper {
  // Contract implementation
}
```

### Function Documentation

Document all public and external functions with clear descriptions:

```solidity
/**
 * @notice Pay a coupon to all bond holders based on a snapshot
 * @dev Executes the coupon payment distribution and updates payment history
 * @param security The security token address for which to pay coupons
 * @param couponDate The date identifier for this coupon payment
 * @param paymentTokenAddress The ERC20 token used for payment
 * @param totalAmount The total amount to be distributed
 * @return success True if the payment was successfully initiated
 */
function payCoupon(
  address security,
  uint256 couponDate,
  address paymentTokenAddress,
  uint256 totalAmount
) external override returns (bool success) {
  // Implementation
}
```

### Internal Functions

Internal functions should use `@dev` for implementation details:

```solidity
/**
 * @dev Calculates the pro-rata coupon amount for a specific holder
 * @param holderBalance The holder's token balance at snapshot time
 * @param totalSupply The total supply at snapshot time
 * @param totalCoupon The total coupon amount to distribute
 * @return amount The calculated coupon amount for the holder
 */
function _calculateCouponAmount(
  uint256 holderBalance,
  uint256 totalSupply,
  uint256 totalCoupon
) internal pure returns (uint256 amount) {
  // Implementation
}
```

### Events Documentation

Document all events with clear descriptions of when they're emitted:

```solidity
/**
 * @notice Emitted when a coupon payment is successfully completed
 * @param security The security token address
 * @param couponDate The coupon payment date identifier
 * @param totalAmount The total amount paid
 * @param recipientCount The number of recipients who received payment
 */
event CouponPaid(address indexed security, uint256 indexed couponDate, uint256 totalAmount, uint256 recipientCount);
```

### Modifiers Documentation

Document modifiers explaining their validation logic:

```solidity
/**
 * @notice Ensures the caller has the BOND_MANAGER role
 * @dev Reverts with AccessDenied if caller lacks the required role
 */
modifier onlyBondManager() {
    require(hasRole(BOND_MANAGER_ROLE, msg.sender), "AccessDenied");
    _;
}
```

### Storage Documentation

Document storage structures and state variables:

```solidity
/**
 * @notice Bond configuration and state data
 * @dev Stored in Diamond storage pattern to support upgradeability
 * @custom:storage-location erc1967:bondFacet.storage
 */
struct BondStorage {
  /// @notice Mapping of security addresses to their bond configurations
  mapping(address => BondConfig) bondConfigs;
  /// @notice Mapping of security and coupon date to payment records
  mapping(address => mapping(uint256 => CouponPayment)) couponPayments;
  /// @notice The default payment token for coupon distributions
  address defaultPaymentToken;
}
```

### Errors Documentation

Document custom errors with clear descriptions:

```solidity
/**
 * @notice Thrown when attempting to pay a coupon for an invalid date
 * @param security The security token address
 * @param couponDate The invalid coupon date provided
 */
error InvalidCouponDate(address security, uint256 couponDate);

/**
 * @notice Thrown when insufficient funds are available for payment
 * @param required The amount required for the payment
 * @param available The amount currently available
 */
error InsufficientFunds(uint256 required, uint256 available);
```

## Best Practices

### 1. Be Clear and Concise

Write documentation for developers who are unfamiliar with the code:

```solidity
// ❌ Bad - too vague
/// @notice Does stuff with bonds
function processBond() external;

// ✅ Good - specific and clear
/// @notice Matures a bond and releases principal to token holders
/// @dev Transfers the bond's face value to all holders proportionally
function processBond() external;
```

### 2. Document the "Why", Not Just the "What"

```solidity
// ❌ Bad - only describes what
/// @dev Sets the maturity date
function setMaturityDate(uint256 date) external;

// ✅ Good - explains why and constraints
/// @notice Sets the bond maturity date when principal becomes due
/// @dev Can only be called before the bond is issued. Once set, cannot be changed
///      to ensure investor certainty. Maturity date must be in the future.
function setMaturityDate(uint256 date) external;
```

### 3. Document Edge Cases and Constraints

```solidity
/**
 * @notice Transfers tokens between accounts with compliance checks
 * @dev Validates the transfer against KYC, freeze, and partition restrictions
 * @param from The sender address (must have sufficient balance)
 * @param to The recipient address (must pass KYC and not be frozen)
 * @param amount The amount to transfer (must be > 0 and <= sender balance)
 * @return success True if transfer was successful
 *
 * Requirements:
 * - `from` must have at least `amount` tokens
 * - `to` must be KYC verified
 * - Neither `from` nor `to` can be frozen
 * - Transfer must comply with all active compliance modules
 */
function transfer(address from, address to, uint256 amount) external returns (bool success);
```

### 4. Link Related Functions

```solidity
/**
 * @notice Creates a snapshot of current token holder balances
 * @dev The snapshot ID can be used in {payCoupon} to execute payments
 * @param security The security token to snapshot
 * @return snapshotId The unique identifier for this snapshot
 * @see payCoupon
 */
function createSnapshot(address security) external returns (uint256 snapshotId);
```

### 5. Document Security Considerations

```solidity
/**
 * @notice Updates the bond's interest rate
 * @dev ⚠️ SECURITY: This is a privileged operation that affects all bond holders
 *      Only BOND_ADMIN role can call this function. Rate changes do not apply
 *      retroactively to already-accrued interest.
 * @param security The bond token address
 * @param newRate The new annual interest rate in basis points (e.g., 500 = 5%)
 * @custom:security Critical - requires BOND_ADMIN role
 * @custom:emits InterestRateUpdated
 */
function updateInterestRate(address security, uint256 newRate) external;
```

## Generating Documentation

### Prerequisites

Ensure you're in the contracts directory:

```bash
cd packages/ats/contracts
```

### Generate API Documentation

Run the documentation generator:

```bash
npm run doc
```

This command:

1. Extracts NatSpec comments from all contracts
2. Generates markdown files in `/docs/references/api/ats-contracts/`
3. Organizes documentation by contract hierarchy

### Configuration

The documentation generator is configured in `hardhat.config.ts`:

```typescript
dodoc: {
  runOnCompile: false,         // Don't auto-generate on every compile
  outputDir: "../../../docs/references/api/ats-contracts",
  freshOutput: true,           // Clear old docs before generating
  include: ["contracts"],      // Include all contracts
  exclude: [
    "contracts/test",          // Exclude test contracts
    "contracts/mocks",         // Exclude mock contracts
    "node_modules"             // Exclude dependencies
  ],
},
```

### Viewing Generated Documentation

After generation, the documentation is available at:

- **Local**: `http://localhost:3000/docs/references/api`
- **Production**: `https://hashgraph.github.io/asset-tokenization-studio/docs/references/api`

## Documentation Workflow

### During Development

1. **Write the contract** with inline NatSpec comments
2. **Document as you code** - don't leave it for later
3. **Review your documentation** before submitting PR

### Before Committing

1. **Generate docs** to verify NatSpec is valid:

   ```bash
   npm run doc
   ```

2. **Check for warnings** - fix any NatSpec syntax errors

3. **Review generated output** in `/docs/references/api/`

### In Pull Requests

- Documentation changes are automatically reviewed
- Generated API docs should be committed with code changes
- CI/CD pipeline will verify documentation builds successfully

## Common Patterns in ATS

### Facet Pattern Documentation

Document facets with their layer and purpose:

```solidity
/**
 * @title BondFacet
 * @author Hedera Hashgraph
 * @notice Layer 2 facet implementing bond-specific corporate actions
 * @dev Part of the Diamond pattern - uses BondStorageWrapper for data access
 * @custom:layer Layer 2 - Domain Features
 * @custom:security-contact security@hedera.com
 */
contract BondFacet is IBond, BondStorageWrapper {
  // Implementation
}
```

### Storage Wrapper Documentation

Document storage access patterns:

```solidity
/**
 * @title BondStorageWrapper
 * @notice Provides type-safe access to bond storage in Diamond pattern
 * @dev Implements the storage access layer for bond data
 * @custom:layer Layer 0 - Storage
 */
abstract contract BondStorageWrapper {
  /**
   * @dev Returns the bond storage pointer
   * @return s Storage pointer to BondStorage struct
   * @custom:storage-location erc1967:bondFacet.storage
   */
  function _bondStorage() internal pure returns (BondStorage storage s);
}
```

### Interface Documentation

Document interfaces with implementation requirements:

```solidity
/**
 * @title IBond
 * @notice Interface for bond token operations
 * @dev Implementers must support coupon payments and maturity redemption
 */
interface IBond {
  /**
   * @notice Pay a coupon to bond holders
   * @dev Must validate caller permissions and check payment token allowance
   * @param security The bond token address
   * @param amount The total coupon amount
   * @return success True if payment initiated successfully
   */
  function payCoupon(address security, uint256 amount) external returns (bool success);
}
```

## Troubleshooting

### Common Issues

**Issue**: Documentation generator fails

```bash
Error: Unable to find contract sources
```

**Solution**: Ensure contracts are compiled first:

```bash
npm run compile
npm run doc
```

---

**Issue**: Missing documentation in generated output

**Solution**: Check that your NatSpec uses proper syntax:

- Use `///` or `/** */` format
- Place comments directly above the documented element
- Include required tags (`@notice` for public functions)

---

**Issue**: Documentation not showing in Docusaurus

**Solution**: Rebuild the documentation site:

```bash
cd ../../../apps/docs
npm run build
```

## Additional Resources

- [NatSpec Format Specification](https://docs.soliditylang.org/en/latest/natspec-format.html)
- [Solidity Documentation Best Practices](https://docs.soliditylang.org/en/latest/style-guide.html#natspec)
- [Hardhat Dodoc Plugin Documentation](https://github.com/primitivefinance/primitive-dodoc)

## Summary

- ✅ Use NatSpec format for all public interfaces
- ✅ Document functions with `@notice`, `@dev`, `@param`, `@return`
- ✅ Include security considerations and constraints
- ✅ Generate docs with `npm run doc` before committing
- ✅ Review generated documentation for clarity

Well-documented contracts make the codebase more maintainable and help developers understand the system architecture and business logic.
