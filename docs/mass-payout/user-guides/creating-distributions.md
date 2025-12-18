---
id: creating-distributions
title: Creating Distributions
sidebar_label: Creating Distributions
sidebar_position: 2
---

# Creating Distributions

Learn how to create and configure payment distributions for token holders.

## Overview

Create distributions for:

- Dividend payments (equity tokens)
- Coupon payments (bond tokens)
- Airdrops and rewards
- Custom distributions

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

#### Basic Information

**Distribution Name**: Descriptive name

- Example: "Q4 2024 Dividend"

**Distribution Type**: Select type

- Dividend (for equity)
- Coupon (for bonds)
- Custom

**Record Date**: Balance snapshot date

- Holders on this date receive payment
- Past date = use existing snapshot
- Future date = create snapshot on date

#### Payment Configuration

**Total Amount**: Total to distribute

- Or specify per-token amount
- System calculates based on holder balances

**Payment Token**: Token used for payment

- USDC (common for dividends)
- HBAR
- Custom token

**Payment Method**: Distribution strategy

- Proportional: Based on token holdings
- Fixed: Same amount to all holders
- Custom: Specify amounts per holder

### Step 3: Review Distribution

Preview distribution details:

- Total holders receiving payment
- Payment amount per holder
- Total cost (including fees)
- Estimated transaction count

### Step 4: Execute or Schedule

**Execute Now**: Immediate distribution

- Click "Execute Distribution"
- Approve transaction
- Monitor real-time progress

**Schedule for Later**: Future execution

- Set execution date and time
- System automatically executes
- Email notification (if configured)

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

### Timing

- Execute distributions during low network activity
- Allow buffer time before critical deadlines
- Test with small distributions first

### Amount Calculation

- Verify total amount available in operator account
- Include gas fees in calculations
- Account for minimum balance requirements

### Holder Management

- Sync holder balances before creating distribution
- Verify record date snapshot is current
- Review holder list for accuracy

## Next Steps

- [Managing Payouts](./managing-payouts.md) - Monitor and track distributions
- [Scheduled Payouts](./scheduled-payouts.md) - Set up recurring distributions

_This guide is under development. More detailed content coming soon._
