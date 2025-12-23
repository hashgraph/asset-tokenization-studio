---
id: hold-operations
title: Hold Operations
sidebar_label: Hold Operations
sidebar_position: 7
---

# Hold Operations

Learn how to create and manage holds on security tokens for escrow, pending transfers, and settlement operations.

## Overview

Hold operations allow you to temporarily "freeze" tokens under the control of a third-party escrow without transferring ownership. This is essential for various scenarios:

### Common Hold Scenarios

**Secondary Market Trading**

- When placing a sell order, the marketplace needs ability to transfer your tokens to a buyer
- Tokens are held in escrow until the order is matched
- If order is cancelled or expires, tokens return to you

**Regulatory Requirements**

- Authorities may require temporary freezing of assets during investigations
- Assets held pending decisions about their disposition
- Compliance with legal or regulatory orders

**Escrow Arrangements**

- Lock tokens pending fulfillment of contractual conditions
- Third-party escrow manages release or execution
- Automatic return to owner if conditions aren't met by deadline

**Settlement Operations**

- Hold tokens during T+2 or T+3 settlement periods
- Guarantee tokens are available for final settlement
- Coordinate with clearing houses

### Key Concepts

**Hold**: A temporary lock on a specific amount of tokens in an account

**What happens when tokens are held:**

- Tokens remain in your account (not transferred)
- Tokens are subtracted from your **available balance**
- Tokens are added to your **held balance**
- Your **total balance** remains unchanged
- You continue to receive dividends/coupons on held tokens
- Only the escrow can execute or release the hold
- Holds can expire automatically, returning tokens to you

**Balance Calculation:**

```
Total Balance = Available Balance + Locked Balance + Held Balance
```

**Example:**

- You own 1,000 tokens (total balance)
- You create a hold for 300 tokens
- Available balance: 700 tokens (can transfer)
- Held balance: 300 tokens (locked in hold)
- Total balance: 1,000 tokens (unchanged)
- Dividends paid on all 1,000 tokens

**Hold States:**

- **Ordered**: Hold created, tokens are held (locked from available balance)
- **Executed**: Hold completed, tokens transferred to destination
- **Released**: Hold cancelled, tokens returned to available balance
- **Expired**: Hold timed out, tokens automatically returned to available balance

### Important Hold Properties

**Holds Don't Affect:**

- Total token supply (remains constant)
- Your total balance (still own the tokens)
- Dividend/coupon payments (calculated on total balance)
- Corporate action eligibility (based on total balance)

**Holds Do Affect:**

- Available balance (reduced by held amount)
- Your ability to transfer held tokens
- Token availability for new trades or holds

## Prerequisites

- Security token deployed with ERC-1400 support
- Sufficient token balance to create holds
- Appropriate roles for hold operations
- Understanding of your settlement requirements

## Accessing Hold Operations

1. Navigate to your **security token** from the dashboard
2. Go to the **"Operations"** tab
3. Select **"ERC1400"** (securities are compatible with both ERC-20 and ERC-1400 standards)
4. Select **"Hold"** from the submenu

From this interface, you can:

- **View holds**: See all active, executed, and released holds
- **Create hold**: Create a new hold operation
- **Manage holds**: Execute or release existing holds

## Creating a Hold

### Step 1: Navigate to Create Hold

From the Hold Operations interface:

1. Click **"Create Hold"** button
2. Fill in the hold details form

### Step 2: Configure Hold Details

**From Account**

- **Format**: Hedera account ID (0.0.xxxxx) or EVM address (0x...)
- **Purpose**: The account from which tokens will be held
- **Validation**: Must have sufficient balance

**To Account** (Optional but Recommended)

- **Format**: Hedera account ID (0.0.xxxxx) or EVM address (0x...)
- **Purpose**: The account that will receive tokens if hold is executed
- **If specified**: Escrow can **only** transfer tokens to this specific account
- **If left empty**: Escrow can transfer tokens to **any** account (more flexible but less secure)
- **Recommendation**: Always specify for known transactions
- **Use cases**:
  - Specify: Known buyer in marketplace, specific recipient
  - Leave empty: Escrow needs flexibility, recipient unknown at creation time

**Notary** (Optional)

- **Format**: Hedera account ID (0.0.xxxxx) or EVM address (0x...)
- **Purpose**: Third-party that can execute or release the hold
- **Use case**: Escrow agent, clearinghouse, settlement system
- **Leave empty**: If only hold creator can manage it

**Amount**

- **Format**: Number of tokens to hold
- **Validation**: Must not exceed available balance (balance - existing holds)
- **Decimals**: Respect token decimals configuration

**Expiration Time** (Optional)

- **Format**: Date and time (future)
- **Purpose**: Automatic release if hold is not executed by this time
- **Recommendation**: Set reasonable expiration (e.g., 24-72 hours)
- **Leave empty**: For holds without expiration

**Lock Hash** (Optional)

- **Format**: 32-byte hash (0x...)
- **Purpose**: Secret that must be revealed to execute the hold
- **Use case**: Conditional transfers, atomic swaps
- **Advanced feature**: Leave empty for standard holds

### Step 3: Review and Create

1. Verify all hold details are correct
2. Check that "from" account has sufficient balance
3. Click **"Create Hold"**
4. Approve the transaction in your wallet
5. Hold is created and tokens are locked

## Viewing Holds

### Hold List View

The Hold Operations interface displays all holds in a table:

**Table Columns:**

- **Hold ID**: Unique identifier for the hold
- **From**: Account with locked tokens
- **To**: Recipient account if executed
- **Amount**: Number of tokens held
- **Status**: Ordered, Executed, Released, or Expired
- **Expiration**: Expiration date/time (if set)
- **Actions**: Execute or Release buttons

**Filters:**

- **By Status**: Show only Ordered, Executed, Released, or Expired holds
- **By Account**: Filter holds for specific accounts
- **By Date**: Show holds created in a date range

### Hold Details

Click on a hold to view complete details:

- Hold ID
- Creator account
- From account
- To account
- Notary (if set)
- Amount held
- Current status
- Creation timestamp
- Expiration time (if set)
- Execution/Release timestamp (if applicable)
- Transaction history

## Managing Holds

### Execute a Hold

Transfer the held tokens to a recipient account.

**Prerequisites:**

- Hold must be in "Ordered" status
- Must be authorized to execute (typically the notary/escrow)
- Hold must not be expired
- Recipient must pass KYC and compliance checks

**Important: Destination Account Behavior**

**If "To Account" was specified when creating the hold:**

- Tokens can **only** be transferred to that specific account
- Execute button transfers to the predefined account
- Cannot change destination during execution

**If "To Account" was left empty:**

- Escrow can transfer tokens to **any** account
- Must specify destination account when executing
- Provides flexibility but requires trust in escrow

**Steps:**

1. Navigate to the hold in the list
2. Click **"Execute"** button
3. **If no "To Account" was set**: Enter the destination account address
4. If lock hash was set, provide the secret/preimage
5. Verify recipient passes compliance checks
6. Confirm the transaction
7. Approve in your wallet
8. Tokens are transferred from "from" to destination account
9. Hold status changes to "Executed"

> **Security Note**: Holds with predefined "To Account" are more secure as they prevent the escrow from transferring to unintended recipients.

### Release a Hold

Cancel the hold and unlock the tokens (no transfer occurs).

**Prerequisites:**

- Hold must be in "Ordered" status
- Must be authorized to release:
  - Hold creator, OR
  - Notary (if set), OR
  - From account owner

**Steps:**

1. Navigate to the hold in the list
2. Click **"Release"** button
3. Confirm the release action
4. Approve in your wallet
5. Tokens are unlocked and available again
6. Hold status changes to "Released"

### Automatic Expiration

Holds with an expiration time are automatically released when expired:

- No manual action needed
- Tokens are automatically unlocked
- Hold status changes to "Expired"
- Check expired holds to confirm tokens are available

> **Note**: Expired holds cannot be executed. You must create a new hold if needed.

### Reclaim Hold

Manually reclaim tokens from an expired hold back to the original account.

**When to use:**

- Hold has expired but tokens haven't been automatically released
- Want to explicitly return held tokens to original owner
- Cleanup of old expired holds

**Who can reclaim:**

- **Anyone** can execute reclaim on expired holds
- Does not require special permissions
- Helps maintain system hygiene

**Prerequisites:**

- Hold must be in "Ordered" status
- Current date/time must be **after** the expiration time
- Hold has not been executed or released already

**Steps:**

1. Navigate to an expired hold in the list
2. Click **"Reclaim"** button
3. Confirm the reclaim action
4. Approve in your wallet
5. All remaining held tokens are returned to the original "from" account
6. Hold status changes to "Expired"

> **Tip**: Use reclaim if automatic expiration didn't process or you want to explicitly clear expired holds.

## Common Use Cases

### Escrow for Asset Purchase

**Scenario**: Buyer wants to purchase shares, seller wants guarantee of payment

**Solution:**

1. Buyer creates hold with:
   - From: Buyer's account
   - To: Seller's account
   - Notary: Escrow agent
   - Amount: Agreed shares
   - Expiration: 72 hours
2. Seller verifies hold exists and delivers consideration
3. Escrow agent verifies conditions are met
4. Escrow agent executes hold → tokens transfer to seller

### Pending Transfer Approval

**Scenario**: Transfer requires compliance approval before execution

**Solution:**

1. Sender creates hold with:
   - From: Sender's account
   - To: Recipient's account
   - Notary: Compliance officer
   - Amount: Transfer amount
   - Expiration: 24 hours
2. Compliance officer reviews the transfer
3. If approved: Compliance officer executes hold
4. If rejected: Hold expires or is released manually

### Payment vs Delivery (DvP)

**Scenario**: Atomic swap of tokens for payment

**Solution:**

1. Token seller creates hold with lock hash
2. Payment is made by buyer
3. Seller reveals hash secret
4. Hold is executed using the secret
5. Tokens transfer atomically

### Dividend Payment Holds

**Scenario**: Lock shares to ensure dividend eligibility

**Solution:**

1. Company creates holds on all shareholder accounts before record date
2. Shareholders cannot sell shares during hold period
3. Dividend is calculated based on held amounts
4. After record date, holds are released
5. Shareholders receive dividends and can trade again

## Required Roles and Permissions

Hold operations require specific roles depending on the action:

### Creating Holds

**Standard Hold Creation (by token holder):**

- Any token holder can create holds on their own tokens
- Must pass all transfer restrictions (KYC, control lists, pause status)
- Most common type of hold creation

**Hold Creation on Behalf of Others:**

**Authorized Accounts (ERC-20 standard):**

- If you've authorized an account to manage your tokens
- Authorized account can create holds on your behalf
- Example: Wallet apps, automated trading systems

**Operators (ERC-1410 standard):**

- Accounts with operator permissions for specific partitions
- Can create holds on behalf of token holders
- Example: Custodians, fund managers

**Controllers (CONTROLLER_ROLE):**

- Accounts with CONTROLLER_ROLE can create holds on any account
- **Special privilege**: Bypasses control list restrictions
- Use cases: Regulatory holds, legal freezes, compliance actions
- Most powerful hold creation permission

> **Important**: Controller-created holds do **not** require the "from" account to pass control list checks. This allows authorities to freeze assets even if they would normally be restricted.

### Executing Holds

Who can execute a hold (transfer tokens to destination):

- Hold creator
- Notary/escrow (if specified in the hold)
- Accounts with HOLD_EXECUTOR_ROLE (if configured)

### Releasing Holds

Who can release a hold (return tokens to original account):

- Hold creator
- Notary/escrow (if specified in the hold)
- Original "from" account owner
- Accounts with HOLD_RELEASER_ROLE (if configured)

### Reclaiming Expired Holds

Who can reclaim an expired hold:

- **Anyone** (no special role required)
- Only works after expiration time has passed

See [Roles and Permissions](./roles-and-permissions.md) for complete role details.

## Best Practices

### Setting Expiration Times

**Always set expiration for:**

- Escrow arrangements (typical: 24-72 hours)
- Pending approvals (typical: 24 hours)
- Settlement holds (typical: T+2 or T+3)

**Avoid expiration for:**

- Long-term locks with manual release
- Corporate actions with no deadline

### Using Notaries

**Use notary for:**

- Third-party escrow agents
- Compliance approvals
- Settlement systems
- Automated execution by external systems

**Skip notary when:**

- Simple self-holds
- Direct peer-to-peer holds
- Creator will manage execution/release

### Lock Hash Usage

**Use lock hash for:**

- Atomic swaps
- Conditional transfers
- Hash time-locked contracts (HTLCs)
- Cross-chain operations

**Skip lock hash for:**

- Standard escrow
- Simple holds
- Compliance-based holds

### Monitoring Holds

**Regular checks:**

- Review expiring holds daily
- Monitor stuck holds (ordered but not executed)
- Track executed vs released ratios
- Audit hold creation patterns

## Common Issues

### Cannot Create Hold

**Problem**: Transaction fails when creating hold

**Solutions:**

- Verify "from" account has sufficient available balance
- Check that available balance = total balance - existing holds
- Ensure token is not paused
- Verify KYC and compliance checks pass for both accounts

### Cannot Execute Hold

**Problem**: Execute button disabled or transaction fails

**Solutions:**

- Check hold status is "Ordered" (not Executed, Released, or Expired)
- Verify you have authorization (creator, notary, or executor role)
- If lock hash was set, ensure you provide the correct secret
- Check that recipient ("to" account) passes KYC and compliance checks
- Verify hold has not expired

### Cannot Release Hold

**Problem**: Release button disabled or transaction fails

**Solutions:**

- Check hold status is "Ordered"
- Verify you have authorization (creator, notary, from account, or releaser role)
- Ensure wallet is connected and has sufficient HBAR for gas

### Hold Expired Unexpectedly

**Problem**: Hold expired before execution

**Solutions:**

- Check expiration time was set correctly (timezone, date format)
- Set longer expiration periods for complex processes
- Monitor holds approaching expiration
- Create new hold if original expired

### Tokens Still Locked

**Problem**: Tokens not available after release/expiration

**Solutions:**

- Verify hold status changed to "Released" or "Expired"
- Refresh the page and check hold list
- Check transaction was confirmed on-chain
- Verify no other holds are locking the same tokens

## Next Steps

- [Clearing Operations](./clearing-operations.md) - Settlement and clearing with holds
- [Creating Equity Tokens](./creating-equity.md) - Enable clearing mode for holds
- [Creating Bond Tokens](./creating-bond.md) - Enable clearing mode for holds
- [Roles and Permissions](./roles-and-permissions.md) - Understanding hold-related roles
- [Token Lifecycle](./token-lifecycle.md) - Complete token management

## Related Resources

- [ERC-1400 Standard Documentation](https://github.com/ethereum/EIPs/issues/1400)
- [Developer Guide: Hold Operations](../developer-guides/contracts/index.md)
