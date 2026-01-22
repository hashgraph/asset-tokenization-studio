---
id: clearing-operations
title: Clearing Operations
sidebar_label: Clearing Operations
sidebar_position: 8
---

# Clearing Operations

Learn how to manage clearing and settlement operations for securities trading with T+2 or T+3 settlement cycles.

## Overview

Clearing operations require validator approval before tokens can be transferred or redeemed. This enforces regulatory compliance and jurisdiction-specific rules.

### Why Clearing Mode?

Different jurisdictions have unique regulatory requirements that may not be built into the ATS. Instead of trying to code every possible rule, clearing mode provides a flexible solution:

**Without Clearing Mode (Standard):**

- Users freely transfer and redeem tokens
- Only basic restrictions apply (KYC, control lists, pause)

**With Clearing Mode (Regulated):**

- Users **submit** transfer/redeem requests on-chain
- **Validators** review and approve/reject each operation
- Only approved operations are executed
- Provides flexibility to enforce any jurisdiction's rules

### Key Concepts

**Clearing**: Validator approval required before transfers/redeems execute

**Validator**: Account with CLEARING_VALIDATOR_ROLE that approves/rejects operations

- You **cannot** choose which validator reviews your operation
- **Any** account with CLEARING_VALIDATOR_ROLE can approve/reject
- Validators approve or reject the **entire** operation (not partial)

**How it works:**

1. You submit operation (transfer, redeem, or hold creation)
2. Tokens are locked from your available balance
3. Validator reviews the operation
4. **If approved**: Operation executes, tokens transfer/redeem
5. **If rejected or expired**: Tokens return to your available balance

### Clearing vs Hold Operations

Both lock tokens pending approval, but clearing has key differences:

| Feature                 | Clearing Operations                                         | Hold Operations                    |
| ----------------------- | ----------------------------------------------------------- | ---------------------------------- |
| **Validator selection** | You don't choose - any CLEARING_VALIDATOR_ROLE can validate | You choose the notary/escrow       |
| **Destination account** | You specify (required for transfers)                        | Optional                           |
| **Validator control**   | Can only approve/reject entire operation                    | Can execute partial amounts        |
| **Token modes**         | Cleared mode: ONLY clearing operations allowed              | Works alongside normal transfers   |
| **Use case**            | Regulatory compliance, jurisdiction rules                   | Escrow, marketplace, general holds |

**Important**: When clearing mode is activated, you **cannot** use normal transfers, redeems, or hold creation. You **must** use the clearing versions.

### Roles in Clearing

**CLEARING_ROLE**:

- Can activate/deactivate clearing mode on a token
- Typically held by token administrators

**CLEARING_VALIDATOR_ROLE**:

- Can approve or reject clearing operations
- Typically held by compliance officers, regulators, or automated compliance systems

## Prerequisites

### Clearing Mode Must Be Enabled

Clearing operations **require** that clearing mode is activated on your security token.

#### Option 1: Enable During Token Creation

When creating a new equity or bond token:

1. In **Step 1: General Information** (or Bond Details)
2. Locate **"Digital Security Configuration"** (or Bond Configuration)
3. Enable **"Clearing Mode"** checkbox
4. Complete token creation as normal

See guides:

- [Creating Equity Tokens - Step 1](./creating-equity.md#step-1-general-information)
- [Creating Bond Tokens - Step 1](./creating-bond.md#step-1-bond-details)

#### Option 2: Enable After Token Deployment

For existing tokens without clearing mode:

1. Navigate to your **security token** from the dashboard
2. Go to the **"Management"** tab
3. Scroll to **"Danger Zone"** section
4. Locate **"Clearing Mode"** setting
5. Click **"Enable Clearing Mode"**
6. Confirm the action (this is irreversible)
7. Approve the transaction in your wallet

> **Warning**: Enabling clearing mode is a one-way operation. Once enabled, it cannot be disabled. This ensures settlement process integrity.

### Additional Prerequisites

- CLEARING_ROLE to create clearing operations
- CLEARING_VALIDATOR_ROLE to approve/reject operations
- Understanding of your settlement cycle requirements
- Integration with clearing house (if applicable)

## Accessing Clearing Operations

1. Navigate to your **security token** from the dashboard
2. Go to the **"Operations"** tab
3. Select **"ERC1400"** (securities are compatible with both ERC-20 and ERC-1400 standards)
4. Select **"Clearing"** from the submenu

> **Note**: If you don't see "Clearing" option, verify that clearing mode is enabled on your token.

From this interface, you can:

- **View clearing operations**: See all pending, approved, and settled operations
- **Create clearing operation**: Initiate a new settlement process
- **Manage operations**: Approve, reject, or execute clearing operations

## Creating Clearing Operations

There are three types of clearing operations you can create:

### Clearing Transfer

Transfer tokens to another account (requires validator approval).

**When to use:** Selling, gifting, or transferring tokens to another investor

**Steps:**

1. From Clearing Operations, click **"Create Clearing Transfer"**
2. Configure:
   - **Destination Account**: **(Required)** Who receives the tokens
   - **Amount**: Number of tokens to transfer
   - **Expiration Date**: When the operation expires if not approved
   - **Partition** (if applicable): Token partition/tranche
   - **Data** (optional): Additional information/reference
3. Click **"Submit"**
4. Approve transaction in your wallet

**What happens:**

- Tokens are locked from your available balance
- Operation status: "Pending"
- Awaits approval from any CLEARING_VALIDATOR_ROLE account
- If approved: Tokens transfer to destination account
- If rejected or expired: Tokens return to your available balance

### Clearing Redeem

Redeem (burn) tokens, typically for cash redemption or bond maturity.

**When to use:** Redeeming bonds at maturity, buying back shares, exiting positions

**Steps:**

1. From Clearing Operations, click **"Create Clearing Redeem"**
2. Configure:
   - **Amount**: Number of tokens to redeem
   - **Expiration Date**: When the operation expires if not approved
   - **Partition** (if applicable): Token partition/tranche
   - **Data** (optional): Redemption reason/reference
3. Click **"Submit"**
4. Approve transaction in your wallet

**What happens:**

- Tokens are locked from your available balance
- Operation status: "Pending"
- Awaits approval from validator
- If approved: Tokens are burned (removed from circulation)
- If rejected or expired: Tokens return to your available balance

> **Note**: Destination account is always address 0 (burn address) for redeems.

### Clearing Hold Creation

Create a hold that requires validator approval before the hold is established.

**When to use:** Creating escrow holds in clearing mode, marketplace orders in regulated tokens

**Steps:**

1. From Clearing Operations, click **"Create Clearing Hold"**
2. Configure clearing operation:
   - **Amount**: Tokens to lock for the hold
   - **Expiration Date**: When clearing operation expires
   - **Partition** (if applicable): Token partition/tranche
   - **Data** (optional): Operation reference
3. Configure the hold that will be created:
   - **Hold Escrow Address**: **(Required)** Who manages the hold
   - **Hold Destination** (optional): Final recipient if hold is executed
   - **Hold Expiration Date**: When the hold expires
   - **Hold Data** (optional): Hold reference/instructions
4. Click **"Submit"**
5. Approve transaction in your wallet

**What happens:**

- Tokens are locked from your available balance
- Operation status: "Pending"
- Awaits approval from validator
- If approved: Hold is created with specified escrow
- If rejected or expired: Tokens return to your available balance

> **Note**: This is different from a direct hold. In clearing mode, even hold creation requires validator approval.

### Common Fields Explained

**Amount**

- Must not exceed your available balance
- Respects token decimals
- Once submitted, cannot be changed (only approve/reject)

**Expiration Date**

- Must be a future date
- If validator doesn't approve/reject by this date, operation auto-expires
- Tokens automatically return to you after expiration
- Typical values: 24-72 hours for review

**Partition** (Advanced)

- For tokens with multiple partitions/tranches
- Leave default if token doesn't use partitions
- Example: "tranche-A", "series-2024"

**Data**

- Optional unformatted text
- Use for reference numbers, notes, or instructions
- Example: "Trade ID: 12345", "Redemption for maturity"

## Viewing Clearing Operations

### Clearing Operations List

The Clearing Operations interface displays all operations in a table:

**Table Columns:**

- **Operation ID**: Unique identifier
- **From**: Seller account
- **To**: Buyer account
- **Amount**: Tokens to settle
- **Value**: Trade value (if recorded)
- **Status**: Pending, Approved, Rejected, Executed
- **Settlement Date**: Target settlement date
- **Actions**: Approve, Reject, or Execute buttons

**Filters:**

- **By Status**: Pending, Approved, Rejected, Executed
- **By Date**: Settlement date range
- **By Account**: Filter by seller or buyer
- **By Operation ID**: Search specific operation

### Clearing Operation Details

Click on an operation to view complete details:

- Operation ID
- Creator account
- From account (seller)
- To account (buyer)
- Amount
- Value
- Current status
- Settlement date
- Instructions
- Creation timestamp
- Approval/rejection timestamp (if applicable)
- Execution timestamp (if applicable)
- Validator who approved/rejected
- Transaction history

## Managing Clearing Operations

### Approve Clearing Operation

Approve the operation, which immediately executes it.

**Who can approve:**

- Any account with CLEARING_VALIDATOR_ROLE

**Prerequisites:**

- Operation status must be "Pending"
- Operation must not be expired
- All on-chain restrictions must pass (KYC, control lists, pause)

**Steps:**

1. Navigate to the clearing operation in the list
2. Review all operation details carefully:
   - Operation type (Transfer, Redeem, Hold Creation)
   - From account, destination account (if applicable)
   - Amount
   - Expiration date
3. Verify compliance requirements are met
4. Click **"Approve"** button
5. Confirm approval
6. Approve transaction in your wallet

**What happens immediately after approval:**

- **If Transfer**: Tokens transfer from sender to destination account
- **If Redeem**: Tokens are burned (removed from circulation)
- **If Hold Creation**: Hold is created with specified escrow
- Operation status changes to "Executed"
- Cannot be reversed

> **Important**: Approval executes the operation **immediately**. There is no separate "execute" step.

### Cancel (Reject) Clearing Operation

Reject the operation and return tokens to the sender.

**Who can cancel:**

- Any account with CLEARING_VALIDATOR_ROLE

**Prerequisites:**

- Operation status must be "Pending"

**Steps:**

1. Navigate to the clearing operation
2. Review operation details
3. Click **"Cancel"** or **"Reject"** button
4. Provide rejection reason (optional but recommended)
5. Confirm cancellation
6. Approve transaction in your wallet

**What happens after cancellation:**

- Tokens are unlocked and returned to sender's available balance
- Operation status changes to "Cancelled" or "Rejected"
- Operation cannot be approved later
- Sender can create a new operation if needed

**Common cancellation reasons:**

- Compliance check failure (destination account not KYC'd)
- Jurisdiction restriction violation
- Suspicious activity detected
- Incomplete documentation
- Regulatory hold or investigation

### Reclaim Expired Operation

Anyone can reclaim tokens from an expired clearing operation.

**Who can reclaim:**

- **Anyone** (no special role required)

**Prerequisites:**

- Operation status must be "Pending"
- Current date/time must be **after** expiration date

**Steps:**

1. Navigate to an expired operation in the list
2. Click **"Reclaim"** button
3. Confirm reclaim
4. Approve transaction in your wallet

**What happens after reclaim:**

- Tokens are unlocked and returned to sender's available balance
- Operation status changes to "Expired"
- Operation cannot be approved or executed

> **Note**: Reclaim ensures tokens aren't stuck indefinitely if validators don't respond before expiration.

## Clearing Workflow

### Standard Clearing Flow

**Step 1: User Submits Operation**

- User creates clearing transfer/redeem/hold
- Tokens are locked from available balance
- Operation status: "Pending"
- Visible to all validators

**Step 2: Validator Review**

- Any CLEARING_VALIDATOR_ROLE account can review
- Validator checks:
  - Compliance requirements met
  - Destination account is valid (if transfer)
  - No jurisdiction violations
  - KYC and control list checks pass

**Step 3: Validator Decision**

**If Approved:**

- Operation executes **immediately**
- Transfer: Tokens move to destination
- Redeem: Tokens are burned
- Hold Creation: Hold is established
- Status: "Executed"

**If Rejected:**

- Tokens return to user's available balance
- Status: "Cancelled" or "Rejected"
- User can submit new operation if issues resolved

**If Expires:**

- No validator action before expiration date
- Anyone can reclaim tokens
- Tokens return to user
- Status: "Expired"

## Common Use Cases

### Jurisdiction-Specific Compliance

**Scenario**: Token has specific jurisdiction rules that aren't coded in the smart contract

**Example:**

- Country X requires manual approval for all token transfers
- Clearing mode is enabled on the token
- Users submit clearing transfer operations
- Compliance officer (with CLEARING_VALIDATOR_ROLE) reviews each transfer
- Approves if compliant, rejects if not
- Flexible enforcement without changing smart contract

### Regulatory Review Required

**Scenario**: All transfers require regulatory oversight before execution

**Example:**

- Regulated security token with strict compliance
- Enable clearing mode
- Investors submit clearing transfers
- Regulator or compliance team reviews each operation
- Ensures all transfers meet legal requirements before execution

### Smart Contract Wallets / Custodians

**Scenario**: Token holder is a smart contract without private keys

**Benefit:**

- Smart contracts can't use protected partitions (requires signatures)
- Clearing operations work on-chain without signatures
- Smart contract can create clearing operations
- Validator reviews and approves
- Enables regulated trading for smart contract holders

### Bond Redemption with Approval

**Scenario**: Bond maturity requires manual verification before redemption

**Example:**

- Bondholder submits clearing redeem operation
- Issuer's treasury team verifies payment is ready
- Approves redemption
- Tokens burned, cash payment processed
- Controlled redemption flow

## Best Practices

### For Users Submitting Operations

**Set Appropriate Expiration:**

- Give validators enough time to review (24-72 hours typical)
- Too short: Operation may expire before review
- Too long: Tokens locked unnecessarily

**Include Helpful Data:**

- Use the "Data" field for reference numbers
- Makes it easier for validators to track and approve
- Example: "Trade ID: 12345", "Redemption: Bond Maturity"

**Verify Before Submitting:**

- Double-check destination account address
- Ensure amount is correct
- Confirm compliance requirements are met
- Reduces rejections and delays

### For Validators (CLEARING_VALIDATOR_ROLE)

**Review Checklist:**

- Verify both parties pass KYC
- Check destination account is valid
- Confirm compliance with jurisdiction rules
- Verify no control list violations
- Check operation hasn't expired

**Document Decisions:**

- Provide rejection reasons when cancelling
- Helps users understand and fix issues
- Creates audit trail for compliance

**Timely Response:**

- Review operations promptly
- Avoid letting operations expire unnecessarily
- Communicate with users about delays

## Common Issues

### Cannot Create Clearing Operation

**Problem**: Clearing option not available or creation fails

**Solutions:**

- Verify clearing mode is enabled on the token
- Check you have CLEARING_ROLE
- Ensure seller has sufficient token balance
- Verify both accounts pass KYC and compliance checks

### Cannot Approve Operation

**Problem**: Approve button disabled or transaction fails

**Solutions:**

- Verify you have CLEARING_VALIDATOR_ROLE
- Check operation status is "Pending" (not already approved/rejected)
- Ensure settlement date has not passed
- Verify wallet is connected

### Cannot Execute Operation

**Problem**: Execute button disabled or transaction fails

**Solutions:**

- Verify operation status is "Approved" (not Pending or Rejected)
- Check current date is on or after settlement date
- Ensure buyer still passes KYC and compliance checks
- Verify you have CLEARING_ROLE or CLEARING_VALIDATOR_ROLE
- Check wallet has sufficient HBAR for gas

### Operation Stuck in Pending

**Problem**: Operation not approved or rejected

**Solutions:**

- Contact clearing validator to review
- Check if additional information needed
- Verify validator has CLEARING_VALIDATOR_ROLE
- Check if multi-party approval is required

### Settlement Date Passed

**Problem**: Cannot execute operation after settlement date

**Solutions:**

- Operations can usually be executed after settlement date
- Check operation was approved before expiration
- Verify buyer still passes compliance
- Contact administrator if operation is locked

### Tokens Still Locked After Rejection

**Problem**: Tokens not released after operation cancelled/rejected

**Solutions:**

- Verify rejection transaction was confirmed
- Refresh the page and check operation status
- Check if there are multiple operations locking the same tokens
- Contact technical support if tokens remain locked

### Cannot Reclaim Expired Operation

**Problem**: Reclaim button disabled on expired operation

**Solutions:**

- Verify operation status is "Pending" and past expiration date
- Check you have sufficient HBAR for gas fees
- Ensure wallet is connected
- Try refreshing the page

## Next Steps

- [Hold Operations](./hold-operations.md) - Understanding holds used in clearing
- [Creating Equity Tokens](./creating-equity.md) - Enable clearing mode during creation
- [Creating Bond Tokens](./creating-bond.md) - Enable clearing mode during creation
- [Roles and Permissions](./roles-and-permissions.md) - Understanding clearing roles
- [Token Lifecycle](./token-lifecycle.md) - Complete token management

## Related Resources

- [ERC-1400 Standard Documentation](https://github.com/ethereum/EIPs/issues/1400)
- [Developer Guide: Clearing Operations](../developer-guides/contracts/index.md)
