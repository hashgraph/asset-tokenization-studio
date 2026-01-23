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
- **Available balance**: 700 tokens (can transfer or create new holds)
- **Held balance**: 300 tokens (locked in hold, controlled by escrow)
- **Total balance**: 1,000 tokens (unchanged)
- **Dividends/coupons**: Paid on all 1,000 tokens (total balance includes held balance)

**Hold States:**

- **Ordered**: Hold created, tokens are held (locked from available balance)
- **Executed**: Hold completed, tokens transferred to destination
- **Released**: Hold cancelled, tokens returned to available balance
- **Expired**: Hold timed out, tokens automatically returned to available balance

## Hold Lifecycle Schema

The following diagram illustrates the complete lifecycle of a hold operation:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INITIAL STATE                                │
│  Token Holder: 1,000 tokens (Available Balance)                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ 1. CREATE HOLD
                             │    Amount: 300 tokens
                             │    Escrow: Account A
                             │    Destination: Account B (optional)
                             │    Expiration: 48 hours
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         HOLD ORDERED                                 │
│  Token Holder:                                                       │
│    - Total Balance: 1,000 tokens (unchanged)                        │
│    - Available Balance: 700 tokens (reduced)                        │
│    - Held Balance: 300 tokens (locked)                              │
│                                                                      │
│  Escrow Control: Account A can Execute or Release                   │
│  Dividends: Paid on all 1,000 tokens                                │
└────────────┬────────────────────────────┬───────────────────────────┘
             │                            │
             │ 2a. EXECUTE                │ 2b. RELEASE
             │    (by Escrow only)        │     (by Escrow only)
             │                            │
             ▼                            ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   HOLD EXECUTED          │    │   HOLD RELEASED          │
│                          │    │                          │
│ 300 tokens transferred   │    │ 300 tokens returned to   │
│ to Destination Account   │    │ Original Account         │
│                          │    │                          │
│ Token Holder:            │    │ Token Holder:            │
│  - Total: 700 tokens     │    │  - Total: 1,000 tokens   │
│  - Available: 700 tokens │    │  - Available: 1,000      │
│  - Held: 0 tokens        │    │  - Held: 0 tokens        │
└──────────────────────────┘    └──────────────────────────┘

             │
             │ 2c. EXPIRATION (if time elapsed)
             │     Anyone can call Reclaim
             ▼
┌──────────────────────────────────────────────────────────┐
│                    HOLD EXPIRED                           │
│                                                           │
│  Automatic or manual reclaim returns tokens:             │
│    - Total Balance: 1,000 tokens                         │
│    - Available Balance: 1,000 tokens                     │
│    - Held Balance: 0 tokens                              │
└──────────────────────────────────────────────────────────┘
```

**Key Points:**

1. **Total balance never changes** during hold lifecycle (you always own the tokens)
2. **Held tokens are locked** but still eligible for dividends/coupons
3. **Only escrow account** can execute or release (exclusive control)
4. **Anyone can reclaim** expired holds to return tokens to original holder
5. **Destination account** (if specified) restricts where tokens can be transferred

### Important Hold Properties

**Holds Don't Affect:**

- **Total token supply**: Remains constant (no tokens are created or destroyed)
- **Your total balance**: You still own the tokens (total balance unchanged)
- **Dividend/coupon payments**: Calculated on total balance, which includes held tokens
- **Corporate action eligibility**: Based on total balance (including held tokens)
- **Snapshots**: Held balance is included in snapshot totals

**Holds Do Affect:**

- **Available balance**: Reduced by held amount
- **Your ability to transfer**: Held tokens cannot be transferred by you
- **Creating new holds**: Can only create holds with available balance
- **Control by escrow**: Escrow account has exclusive control to execute or release

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
- **Force hold**: Create a hold on behalf of another account (requires CONTROLLER_ROLE)
- **Manage holds**: Execute or release existing holds

## Creating a Hold

### Step 1: Navigate to Create Hold

From the Hold Operations interface:

1. Click **"Create Hold"** button
2. Fill in the hold details form

### Step 2: Fill Hold Details

**Original Account\***

- **Auto-filled**: Your connected wallet address
- **Purpose**: The account from which tokens will be held
- **Note**: This field is automatically populated and cannot be changed

**Destination Account**

- **Format**: Hedera account ID (0.0.xxxxx) or EVM address (0x...)
- **Purpose**: The account that will receive tokens if hold is executed
- **Optional but recommended**: Specify the recipient if known
- **If specified**: Escrow can **only** transfer tokens to this specific account
- **If left empty**: Escrow can transfer tokens to **any** account during execution

**Escrow Account\***

- **Format**: Hedera account ID (0.0.xxxxx) or EVM address (0x...)
- **Purpose**: Third-party that can execute or release the hold
- **Required**: Must specify an escrow agent
- **Use cases**: Marketplace escrow, clearinghouse, settlement system, compliance officer

**Expiration Date\***

- **Format**: Date and time (future)
- **Purpose**: Automatic release if hold is not executed by this time
- **Required**: Must set an expiration date
- **Recommendation**: Set reasonable timeframe (e.g., 24-72 hours for trades)

**Amount\***

- **Format**: Number of tokens to hold
- **Validation**: Must not exceed available balance (total balance - existing holds)
- **Required**: Must specify amount to hold

### Step 3: Review and Create

1. Verify all hold details are correct
2. Check that you have sufficient available balance
3. Ensure you pass all transfer restrictions:
   - KYC verification (if enabled)
   - Control list checks (whitelist/blacklist)
   - Token not paused
   - Other compliance requirements
4. Click **"Create Hold"** or **"Submit"**
5. Approve the transaction in your wallet
6. Hold is created and tokens are locked from your available balance

> **Important**: Holds can only be created if all transfer restrictions are met, just like regular transfers. The escrow and destination accounts must also pass all compliance checks.

## Force Hold (Controller Only)

Force hold allows accounts with **CONTROLLER_ROLE** to create holds on behalf of other accounts.

### When to Use Force Hold

- **Regulatory holds**: Freeze assets during investigations
- **Legal orders**: Court-mandated asset freezes
- **Compliance actions**: Emergency freezes for regulatory compliance

### Key Difference from Regular Hold

The only difference is:

- **Original Account** field is **editable** (not auto-filled)
- You can specify any account to create a hold on their tokens
- **Control list restrictions do NOT apply** for controller-created holds
- All other fields and requirements are identical to Create Hold

### How to Create a Force Hold

1. Click **"Force Hold"** button
2. Fill in the same form as Create Hold, but now you can edit:
   - **Original Account\***: Enter the account address to create hold on their tokens
3. All other fields are the same:
   - Destination Account (optional)
   - Escrow Account\* (required)
   - Expiration Date\* (required)
   - Amount\* (required)
4. Click **"Submit"**
5. Approve the transaction

> **Important**: Requires **CONTROLLER_ROLE**. Force holds bypass control list restrictions but the target account must still have sufficient available balance.

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

## Managing Holds

### Execute a Hold

Transfer the held tokens to a recipient account.

**Prerequisites:**

- Hold must be in "Ordered" status
- **Must be the escrow account** specified in the hold
- Hold must not be expired
- Recipient must pass KYC and compliance checks

> **Important**: Only the escrow account can execute a hold. No other account has this permission.

**Execute Hold Form Fields:**

**Hold ID\***

- **Format**: Unique identifier for the hold
- **Purpose**: Identifies which hold to execute
- **Required**: Must specify the hold ID

**Original Account**

- **Display only**: Shows the account that created the hold
- **Cannot edit**: Read-only field for reference

**Destination Account**

- **Display only**: Shows the destination account (if specified during creation)
- **Cannot edit**: Read-only field for reference
- **Note**: Tokens will be transferred to this account

**Amount\***

- **Format**: Number of tokens to transfer
- **Required**: Must specify amount
- **Validation**: Cannot exceed the amount held

**Steps:**

1. Navigate to the hold in the list
2. Click **"Execute"** button
3. The form shows:
   - Hold ID (auto-filled)
   - Original Account (read-only)
   - Destination Account (read-only, if specified during creation)
   - Amount (enter amount to execute)
4. Enter the amount to execute
5. Confirm the transaction
6. Approve in your wallet
7. Tokens are transferred to the destination account
8. Hold status changes to "Executed"

> **Note**: If a Destination Account was specified when creating the hold, tokens can only be transferred to that account.

### Release a Hold

Cancel the hold and return the tokens to the original account (no transfer to destination).

**Prerequisites:**

- Hold must be in "Ordered" status
- **Must be the escrow account** specified in the hold

> **Important**: Only the escrow account can release a hold. No other account has this permission.

**Release Hold Form Fields:**

**Hold ID\***

- **Format**: Unique identifier for the hold
- **Purpose**: Identifies which hold to release
- **Required**: Must specify the hold ID

**Destination Account**

- **Format**: Account address
- **Purpose**: Shows destination account (if specified)
- **Note**: For reference only

**Amount\***

- **Format**: Number of tokens to release
- **Required**: Must specify amount
- **Validation**: Cannot exceed the amount held

**Steps:**

1. Navigate to the hold in the list
2. Click **"Release"** button
3. The form shows:
   - Hold ID (auto-filled)
   - Destination Account (if specified, for reference)
   - Amount (enter amount to release)
4. Enter the amount to release
5. Confirm the release action
6. Approve in your wallet
7. Tokens are unlocked and returned to available balance
8. Hold status changes to "Released"

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

- **Only the escrow account** specified in the hold

No other accounts can execute a hold, including the hold creator or original account owner.

### Releasing Holds

Who can release a hold (return tokens to original account):

- **Only the escrow account** specified in the hold

No other accounts can release a hold, including the hold creator or original account owner.

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
