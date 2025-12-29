---
id: token-operations
title: Token Operations
sidebar_label: Token Operations
sidebar_position: 2
---

# Token Operations

Comprehensive guide to all available operations for equity and bond security tokens.

## Overview

ATS provides comprehensive operations for managing security tokens based on ERC-1400 and ERC-3643 standards:

- **ERC-1400 Operations**: Lock, Hold, Cap, Clearing
- **ERC-3643 Operations**: Freeze
- **Common Operations**: Mint, Force Transfer, Force Redeem

![ATS Operations](../../images/ats-web-operations.png)

## Common Operations

### Mint (Issue) Tokens

Create new tokens and assign them to an account.

**When to use**: Initial distribution, employee grants, additional issuance

**Requirements**:

- **ISSUER_ROLE** permission
- Recipient must have valid KYC
- Recipient must pass control list checks
- Must not exceed max supply (if set)

**How to**:

1. Navigate to your token
2. Select **Admin View (green)**
3. Go to **Operations** → **Mint**
4. Enter recipient address and amount
5. Approve transaction

### Force Transfer

Transfer tokens between accounts (issuer-controlled transfer).

**When to use**: Court orders, regulatory compliance, error corrections

**Requirements**:

- **CONTROLLER_ROLE** permission
- Both sender and receiver must have valid KYC
- Must pass control list checks

**How to**:

1. Navigate to your token
2. Select **Admin View (green)**
3. Go to **Operations** → **Force Transfer**
4. Enter:
   - From address (current holder)
   - To address (recipient)
   - Amount to transfer
5. Approve transaction

**Important**: This bypasses normal transfer restrictions but still enforces KYC and control lists.

### Force Redeem

Burn tokens from a specific account (issuer-controlled redemption).

**When to use**: Regulatory compliance, mandatory buybacks, token recalls

**Requirements**:

- **CONTROLLER_ROLE** permission
- Target account must exist

**How to**:

1. Navigate to your token
2. Select **Admin View (green)**
3. Go to **Operations** → **Force Redeem**
4. Enter:
   - Target address (holder)
   - Amount to redeem
5. Approve transaction

### Freeze Account

Prevent an account from transferring or receiving tokens.

**When to use**: Suspicious activity, regulatory holds, dispute resolution

**Requirements**:

- **FREEZE_ROLE** permission

**How to freeze**:

1. Navigate to your token
2. Select **Admin View (green)**
3. Go to **Control** → **Freeze**
4. Enter account address
5. Enter amount to freeze (or full balance)
6. Approve transaction

**How to unfreeze**:

1. Go to **Control** → **Freeze**
2. Find the frozen account
3. Click **"Unfreeze"**
4. Enter amount to unfreeze
5. Approve transaction

### Pause Token

Temporarily halt all token transfers globally.

**When to use**: Emergency situations, security incidents, system maintenance

**Requirements**:

- **PAUSER_ROLE** permission

**How to pause**:

1. Navigate to your token
2. Select **Admin View (green)**
3. Go to **Management** → **Danger Zone**
4. Click **"Pause Token"**
5. Approve transaction

**How to unpause**:

1. Go to **Management** → **Danger Zone**
2. Click **"Unpause Token"**
3. Approve transaction

**Effect**: All transfers are blocked until token is unpaused. Minting and burning may still be possible depending on configuration.

## ERC-1400 Operations

### Hold Operations

Create temporary locks on tokens that can be executed or released.

**When to use**: Escrow, conditional transfers, payment holds

**Requirements**:

- Holder must initiate
- Sufficient unfrozen balance
- Hold must specify notary (can execute hold)

**How to create a hold**:

1. Navigate to your token
2. Select **Holder View (blue)**
3. Go to **Operations** → **Hold**
4. Enter:
   - Recipient address
   - Notary address (who can execute)
   - Amount
   - Lock time (seconds)
   - Partition (default or custom)
5. Approve transaction

**Hold lifecycle**:

1. **Created**: Tokens locked, cannot be transferred
2. **Executed**: Notary transfers tokens to recipient
3. **Released**: Notary returns tokens to holder
4. **Expired**: Hold expires, tokens automatically released

See [Hold Operations Guide](./hold-operations.md) for details.

### Clearing Operations

Two-step transfer process requiring approval from a designated clearing agent.

**When to use**: Regulatory oversight, trade settlement, compliance validation

**Requirements**:

- **Clearing mode** must be activated
- **CLEARING_VALIDATOR_ROLE** assigned to clearing agents
- Sender initiates, validator approves

**How to use clearing**:

1. **Activate clearing mode** (one-time setup):
   - Go to **Management** → **Danger Zone**
   - Click **"Activate Clearing"**
   - Approve transaction

2. **Create clearing transfer**:
   - Go to **Operations** → **Clearing**
   - Enter recipient and amount
   - Submit for clearing

3. **Approve clearing** (clearing agent):
   - Clearing agent reviews request
   - Approves or cancels the transfer

See [Clearing Operations Guide](./clearing-operations.md) for details.

### Protected Partitions

Designate specific token partitions with enhanced security and restrictions.

**When to use**: Regulatory segregation, different share classes, restricted transfers

**Requirements**:

- **ISSUER_ROLE** or **DEFAULT_ADMIN_ROLE**

**How to create**:

1. Go to **Management** → **Partitions**
2. Click **"Add Protected Partition"**
3. Enter partition name (bytes32)
4. Configure restrictions
5. Approve transaction

**Features**:

- Separate balance tracking per partition
- Custom transfer rules per partition
- Independent hold and clearing per partition

See [Protected Partitions Guide](./protected-partitions.md) for details.

### Cap Management

Set maximum token supply to prevent over-issuance.

**When to use**: Fixed supply tokens, regulatory requirements

**Requirements**:

- **ISSUER_ROLE** or **DEFAULT_ADMIN_ROLE**

**How to set cap**:

1. Navigate to your token
2. Go to **Management** → **Cap**
3. Enter maximum supply
4. Approve transaction

**Effect**: Minting operations will fail if they would exceed the cap.

**How to view cap**:

- Go to token details
- Check **"Maximum Supply"** field

## Permission Requirements

| Operation                | Required Role                     |
| ------------------------ | --------------------------------- |
| Mint                     | ISSUER_ROLE                       |
| Force Transfer           | CONTROLLER_ROLE                   |
| Force Redeem             | CONTROLLER_ROLE                   |
| Freeze Account           | FREEZE_ROLE                       |
| Pause Token              | PAUSER_ROLE                       |
| Create Hold              | Token holder (self)               |
| Execute Hold             | Notary address                    |
| Create Clearing Transfer | Token holder (self)               |
| Approve Clearing         | CLEARING_VALIDATOR_ROLE           |
| Set Cap                  | ISSUER_ROLE or DEFAULT_ADMIN_ROLE |
| Add Protected Partition  | ISSUER_ROLE or DEFAULT_ADMIN_ROLE |
| Activate Clearing        | ISSUER_ROLE or DEFAULT_ADMIN_ROLE |

See [Roles and Permissions Guide](./roles-and-permissions.md) for more details on role management.

## Operation Guides

For detailed step-by-step instructions:

- [Hold Operations](./hold-operations.md) - Detailed hold lifecycle management
- [Clearing Operations](./clearing-operations.md) - Two-step transfer process
- [Protected Partitions](./protected-partitions.md) - Partition management
- [Corporate Actions](./corporate-actions.md) - Dividends, coupons, splits, voting
- [Managing KYC & Compliance](./managing-compliance.md) - KYC verification

## Next Steps

- [Roles and Permissions](./roles-and-permissions.md) - Grant access to team members
- [Corporate Actions](./corporate-actions.md) - Execute dividends and coupons
- [Updating Configuration](./updating-configuration.md) - Upgrade token functionality
