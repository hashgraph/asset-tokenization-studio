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
3. Select "New Distribution"

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

## Next Steps

- [Managing Payouts](./managing-payouts.md) - Monitor and track distributions
- [Scheduled Payouts](./scheduled-payouts.md) - Learn more about recurring distributions
- [Holders Management](./holders-management.md) - Manage token holders
