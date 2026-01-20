---
id: overview
title: Contract Overview
sidebar_position: 2
---

# Contract Overview

Detailed overview of the LifeCycle Cash Flow smart contract architecture and functions.

## What the Contract Does

The LifeCycle Cash Flow contract manages payment distributions for tokenized securities on Hedera. It supports:

1. **Distribution Execution**: Execute dividend or coupon payments to token holders
2. **Bond Cash-Outs**: Execute bond maturity redemptions
3. **Snapshot Payments**: Execute one-time payments based on token holder snapshots
4. **Payment Management**: Manage payment tokens (USDC, HBAR, or other HTS tokens)

## Architecture

### Upgradeability

The contract uses **OpenZeppelin's Upgradeable Contracts** pattern:

- **Proxy Pattern**: Allows upgrading contract logic without changing address
- **Storage Layout**: Preserves state across upgrades
- **Access Control**: Role-based permissions for upgrade operations

### Role-Based Access Control

The contract implements fine-grained access control:

- **DEFAULT_ADMIN_ROLE**: Full contract administration
- **PAUSER_ROLE**: Pause/unpause contract in emergencies
- **PAYOUT_ROLE**: Execute distributions and snapshots
- **CASHOUT_ROLE**: Execute bond cash-outs
- **TRANSFERER_ROLE**: Transfer payment tokens from contract
- **PAYMENT_TOKEN_MANAGER_ROLE**: Update payment token configuration

## Contract Functions

### Distribution Operations

#### Execute Distribution (Paginated)

Execute dividend/coupon payments to a page of holders:

```solidity
function executeDistribution(
    address _asset,
    uint256 _distributionID,
    uint256 _pageIndex,
    uint256 _pageLength
) external returns (
    address[] memory failed,
    address[] memory succeeded,
    uint256[] memory paidAmount,
    bool hasMore
)
```

**Parameters:**

- `_asset`: ATS token address
- `_distributionID`: Distribution ID from ATS contract
- `_pageIndex`: Starting index for pagination
- `_pageLength`: Number of holders to process

**Returns:**

- `failed`: Addresses where payment failed
- `succeeded`: Addresses where payment succeeded
- `paidAmount`: Amounts paid to each succeeded address
- `hasMore`: True if more holders remain

#### Execute Distribution By Addresses

Retry payments to specific addresses:

```solidity
function executeDistributionByAddresses(
    address _asset,
    uint256 _distributionID,
    address[] calldata _holders
) external returns (
    address[] memory failed,
    address[] memory succeeded,
    uint256[] memory paidAmount
)
```

**Use case:** Retry failed payments from paginated execution

### Bond Cash-Out Operations

#### Execute Bond Cash-Out (Paginated)

Execute bond maturity redemption:

```solidity
function executeBondCashOut(
    address _bond,
    uint256 _pageIndex,
    uint256 _pageLength
) external returns (
    address[] memory failed,
    address[] memory succeeded,
    uint256[] memory paidAmount,
    bool hasMore
)
```

#### Execute Bond Cash-Out By Addresses

Cash out bonds for specific holders:

```solidity
function executeBondCashOutByAddresses(
    address _bond,
    address[] calldata _holders
) external returns (
    address[] memory failed,
    address[] memory succeeded,
    uint256[] memory paidAmount
)
```

### Snapshot Operations

#### Execute Amount Snapshot

Pay fixed amount distributed proportionally:

```solidity
function executeAmountSnapshot(
    address _asset,
    uint256 _snapshotID,
    uint256 _pageIndex,
    uint256 _pageLength,
    uint256 _amount
) external returns (
    address[] memory failed,
    address[] memory succeeded,
    uint256[] memory paidAmount,
    bool hasMore
)
```

**Parameters:**

- `_amount`: Total amount to distribute proportionally based on holdings

**Example:** Distribute $10,000 proportionally to all holders based on their token balance percentage

#### Execute Percentage Snapshot

Pay percentage of contract balance:

```solidity
function executePercentageSnapshot(
    address _asset,
    uint256 _snapshotID,
    uint256 _pageIndex,
    uint256 _pageLength,
    uint256 _percentage
) external returns (
    address[] memory failed,
    address[] memory succeeded,
    uint256[] memory paidAmount,
    bool hasMore
)
```

**Parameters:**

- `_percentage`: Percentage of contract balance to distribute (in basis points, e.g., 1000 = 10%)

**Example:** Distribute 5% of contract's payment token balance to holders

#### By Addresses Variants

Both snapshot types also have `ByAddresses` variants for retrying specific holders.

### Payment Token Management

#### Get Payment Token

```solidity
function getPaymentToken() external view returns (IERC20)
```

Returns the current payment token address (e.g., USDC).

#### Get Payment Token Decimals

```solidity
function getPaymentTokenDecimals() external view returns (uint8)
```

Returns decimals of the payment token (e.g., 6 for USDC).

#### Update Payment Token

```solidity
function updatePaymentToken(address paymentToken) external
```

**Requires:** PAYMENT_TOKEN_MANAGER_ROLE

Change the payment token used for distributions.

#### Transfer Payment Token

```solidity
function transferPaymentToken(address to, uint256 amount) external
```

**Requires:** TRANSFERER_ROLE

Transfer payment tokens from contract to another address.

## Events

### DistributionExecuted

```solidity
event DistributionExecuted(
    uint256 distributionID,
    uint256 pageIndex,
    uint256 pageLength,
    address[] failed,
    address[] succeeded,
    uint256[] paidAmount
)
```

Emitted when a distribution page is executed.

### CashOutExecuted

```solidity
event CashOutExecuted(
    uint256 pageIndex,
    uint256 pageLength,
    address[] failed,
    address[] succeeded,
    uint256[] paidAmount
)
```

Emitted when a bond cash-out page is executed.

### PaymentTokenChanged

```solidity
event PaymentTokenChanged(address paymentToken)
```

Emitted when payment token is updated.

## Pagination Strategy

For large holder lists, use pagination:

```solidity
uint256 pageIndex = 0;
uint256 pageLength = 100;
bool hasMore = true;

while (hasMore) {
    (
        address[] memory failed,
        address[] memory succeeded,
        uint256[] memory paid,
        bool more
    ) = contract.executeDistribution(asset, distributionID, pageIndex, pageLength);

    hasMore = more;
    pageIndex += pageLength;

    // Process results...
}
```

## Integration with ATS

The contract integrates with ATS tokens:

1. **Distribution Data**: Fetches distribution details from ATS contract
2. **Holder Lists**: Retrieves token holders from ATS
3. **Balance Queries**: Checks holder balances for proportional distribution

## Security Features

1. **Role-Based Access**: Only authorized accounts can execute operations
2. **Pausability**: Emergency pause for all operations
3. **Upgradeability**: Fix bugs without redeploying
4. **Event Logging**: Full audit trail of all operations
5. **Failure Tracking**: Failed payments don't block successful ones

## Gas Considerations

- **Page Size**: Recommended 50-100 holders per page
- **Large Distributions**: Use multiple transactions for >100 holders
- **Failed Payments**: Track and retry individually

## Best Practices

1. **Test on Testnet**: Always test full distribution flow before mainnet
2. **Monitor Events**: Subscribe to contract events for real-time tracking
3. **Handle Failures**: Implement retry logic for failed payments
4. **Check Balances**: Ensure contract has sufficient payment tokens
5. **Use Pagination**: Don't execute >100 holders in single transaction

## Related Guides

- [Contract Deployment](./deployment.md) - Deploy the contract
- [SDK Integration](../sdk-integration.md) - Use SDK to interact with contract
- [Backend Integration](../backend/index.md) - Backend integration patterns
