---
id: creating-distributions
title: Creating Distributions
sidebar_label: Creating Distributions
sidebar_position: 2
---

# Creating Distributions

Learn how to create and configure payment distributions for token holders.

## Overview

Mass Payout supports multiple execution types for distributions:

- **Manual**: On-demand, immediate execution with full control
- **Scheduled**: Execute at a specific future date and time
- **Recurring**: Automated recurring distributions (hourly, daily, weekly, monthly)
- **Automatic**: Event-driven distributions triggered by conditions (e.g., token deposits)

This guide covers creating distributions for both equity tokens (dividends) and bond tokens (coupons).

## Prerequisites

- Asset imported into Mass Payout
- Sufficient payment tokens in operator account
- Holder balances synced

## Creating a Distribution

### Step 1: Select Asset

1. Navigate to "Assets" dashboard
2. Click on the asset for distribution
3. Go to the "Distributions" tab
4. **Toggle "Import Corporate Actions"** (optional):
   - **Enabled**: Imports existing corporate actions (dividends, coupon payments) from the token contract into the system
   - **Disabled**: Start fresh without importing historical corporate actions
   - This setting only affects whether historical data is imported, not the creation of new distributions
5. Click "New Distribution" to create a new distribution

### Step 2: Configure Distribution

#### Execution Type

First, select how the distribution will be executed:

**Manual**

- Execute the distribution immediately after creation
- Full control over execution timing
- Use for one-time, on-demand distributions

**Scheduled**

- Execute at a specific date and time
- Requires: **Scheduled execution time\*** (required field)
- System automatically executes at the scheduled time
- Use for planned future distributions

**Recurring**

- Execute automatically on a recurring schedule
- Requires:
  - **Frequency**: Select from hourly, daily, weekly, or monthly
  - **Start time**: When the recurring schedule begins
- System automatically creates and executes distributions
- Use for regular payments (dividends, coupons, or other recurring distributions)

**Automatic**

- Execute based on trigger conditions
- Requires: **Trigger condition**
  - Currently available: "On Deposit" (triggers when tokens are deposited)
- Use for event-driven distributions

#### Distribution Information

**Payout Type**

Select the payout calculation method:

- **Fixed**: Fixed amount per token holder
  - All holders receive the same amount regardless of holdings
  - Example: $100 per holder

- **Percentage**: Proportional to token holdings
  - Amount distributed based on percentage of total supply held
  - Example: 5% of total pool divided proportionally

**Concept** (Optional)

- Descriptive label for the distribution
- Example: "Q4 2024 Dividend", "Monthly Interest Payment"
- Helps identify the purpose in distribution history

#### Payment Configuration

**Total Amount**: Total to distribute

- Enter the total amount to be distributed
- System calculates per-holder amounts based on Payout Type
- Ensure sufficient balance in operator account

**Payment Token**: Token used for payment

- USDC (common for dividends)
- HBAR
- Any supported HTS token

### Step 3: Review Distribution

Preview distribution details:

- Total holders receiving payment
- Payment amount per holder (based on Payout Type)
- Total cost (including fees)
- Estimated transaction count
- Execution schedule (for Scheduled/Recurring distributions)

### Step 4: Create Distribution

Based on your selected Execution Type:

**Manual Distribution**

- Click "Create Distribution"
- The distribution is ready to execute
- Navigate to distribution details to manually trigger execution

**Scheduled Distribution**

- Click "Create Distribution"
- System schedules execution for the specified time
- Monitor in "Distributions" list until execution time
- Email notification sent upon execution (if configured)

**Recurring Distribution**

- Click "Create Distribution"
- System creates the recurring schedule
- First execution occurs at the specified start time
- Subsequent executions happen automatically based on frequency
- View all executions in distribution history

**Automatic Distribution**

- Click "Create Distribution"
- System monitors for trigger conditions
- Automatically executes when trigger condition is met (e.g., on deposit)
- View execution history in distribution details

## Distribution Status

Track distribution lifecycle:

- **Pending**: Awaiting execution
- **Processing**: Payments being sent
- **Completed**: All payments successful
- **Partial**: Some payments failed
- **Failed**: Distribution failed

## Failed Payments

Handle payment failures:

- View failed transactions
- Retry individual payments
- Retry all failed payments
- Cancel remaining payments

## Viewing Distribution History

Access past distributions:

1. Navigate to asset details
2. Select "Distributions" tab
3. View complete history
4. Filter by type, status, date

## Best Practices

### Choosing Execution Type

**Use Manual** when:

- You need immediate, one-time distributions
- You want full control over execution timing
- Testing or debugging distributions

**Use Scheduled** when:

- You have a specific distribution date (e.g., quarterly dividends)
- You want to prepare distributions in advance
- You need to coordinate with external events

**Use Recurring** when:

- You have regular, predictable distributions (e.g., monthly dividends)
- You want to automate routine payments
- You need consistent timing for compliance

**Use Automatic** when:

- Distributions should trigger based on events (e.g., new deposits)
- You want real-time, event-driven distributions
- You're implementing dynamic payout strategies

### Payout Type Selection

**Use Fixed** when:

- All holders should receive the same amount
- Distribution is not based on holdings percentage
- Example: Airdrop of $100 to each holder

**Use Percentage** when:

- Distribution should be proportional to holdings
- Standard dividend or profit-sharing
- Example: 5% dividend on token value

### Amount Calculation

- Verify total amount available in operator account
- Include gas fees in calculations (approximately 0.01 HBAR per transaction)
- Account for minimum balance requirements
- For Percentage payouts, ensure calculation matches expectations

### Holder Management

- Sync holder balances before creating distribution
- Verify holder list is up-to-date
- Review excluded addresses (if any)
- For Recurring distributions, ensure holder list is refreshed regularly

## Troubleshooting

### Manual Payment Fails with Role Error

**Error**: "The account trying to perform the operation doesn't have the needed role (0x3fbb44760c0954eea3f6cb9f1f210568f5ae959dcbbef66e72f749dbaa7cc2da)"

**Cause**: When executing manual payments that require balance snapshots, the Mass Payout operator account (DFNS account configured in backend) needs the `SNAPSHOT_ROLE` in the ATS token contract.

**Solution**:

1. Navigate to the ATS web application
2. Go to token **Settings** → **Roles**
3. Grant `SNAPSHOT_ROLE` to the DFNS account address configured in Mass Payout backend
4. The role hash is: `0x3fbb44760c0954eea3f6cb9f1f210568f5ae959dcbbef66e72f749dbaa7cc2da`
5. Confirm the transaction

For more details on roles, see [ATS Roles and Permissions](/ats/user-guides/roles-and-permissions#snapshot_role).

### No Holders Found or Payment Fails

**Error**: Distribution fails because the security token has no holders

**Cause**: In ATS, creating a "holder" record in the system doesn't make them an actual on-chain token holder. Holders only become real holders after tokens are minted to their addresses.

**Solution**:

1. Verify tokens have been minted to holder addresses in ATS
2. In ATS web application, go to token details and check holder balances
3. Ensure at least one address has a non-zero token balance
4. Re-sync holder information in Mass Payout: Asset Details → "Sync Holders"
5. Verify holder count is updated before creating distribution

### Distribution Preview Shows Zero Holders

- Sync holder balances from blockchain
- Check that tokens have been minted in ATS
- Verify token contract address is correct
- Review backend logs for sync errors

### Payment Transactions Failing

- Verify operator account has sufficient payment token balance
- Check gas (HBAR) balance for transaction fees
- Ensure payment token contract is valid
- Review holder addresses are valid Hedera accounts

## Next Steps

- [Managing Payouts](./index.md#managing-payouts) - Monitor and track distributions
- [Importing Assets](./importing-assets.md) - Import and manage token holders
- [Developer Guides](../developer-guides/index.md) - Technical documentation and integration guides
