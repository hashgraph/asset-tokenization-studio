---
id: corporate-actions
title: Corporate Actions
sidebar_label: Corporate Actions
sidebar_position: 4
---

# Corporate Actions

Learn how to execute dividends, coupon payments, balance adjustments, and voting rights for security tokens.

## Corporate Actions for Equity Tokens

### Dividend Distributions

Distribute earnings to equity token holders.

#### Accessing Dividends

1. Navigate to your equity token from the dashboard
2. Select **Admin View (green)**
3. Click on **Corporate Actions** tab
4. Select **Dividends**

#### Viewing All Dividends

The dividends table displays:

| ID  | Record Date | Execution Date | Dividend Amount | Snapshot |
| --- | ----------- | -------------- | --------------- | -------- |
| 1   | 2024-12-20  | 2024-12-27     | $5.00           | View     |
| 2   | 2025-01-20  | 2025-01-27     | $5.50           | View     |

- **ID**: Unique dividend identifier
- **Record Date**: Snapshot date to determine eligible holders
- **Execution Date**: When dividend payment is distributed
- **Dividend Amount**: Amount per token
- **Snapshot**: View holders eligible for this dividend

#### Programming a New Dividend

1. Click **"New Dividend"** or **"Add Dividend"**
2. Fill in the dividend details:
   - **Dividend Amount**: Amount per token (e.g., `5.00`)
   - **Record Date**: Select date using date picker
   - **Execution Date**: Select date using date picker (must be after record date)
3. Click **"Create"** or **"Schedule Dividend"**
4. Approve the transaction in your wallet

**Important**: The execution date must be after the record date.

#### Viewing Dividend Details

Click on a specific dividend to view:

- Dividend parameters (amount, dates)
- Total dividend amount to distribute
- List of eligible holders and their dividend amounts
- Payment status

#### Viewing Dividend Holders

Click **"Snapshot"** or **"View Holders"** to see:

- Account addresses of eligible holders
- Balance at record date
- Dividend amount each holder will receive
- Payment status

### Balance Adjustments (Stock Splits)

Adjust token balances for all holders (e.g., 2-for-1 stock split or 1-for-2 reverse split).

#### Accessing Balance Adjustments

1. Navigate to your equity token
2. Select **Admin View (green)**
3. Go to **Corporate Actions** → **Balance Adjustments**

#### Programming a Balance Adjustment

1. Click **"New Balance Adjustment"**
2. Fill in the details:
   - **Execution Date**: Select date using date picker
   - **Factor**: Adjustment multiplier
     - For 2:1 split, enter `2`
     - For 1:2 reverse split, enter `0.5`
3. Click **"Schedule"**
4. Approve the transaction

**Example**: If a holder has 100 tokens and you apply a factor of `2`, they will have 200 tokens after execution.

### Voting Rights

Program voting events for equity holders.

#### Accessing Voting Rights

1. Navigate to your equity token
2. Select **Admin View (green)**
3. Go to **Corporate Actions** → **Voting Rights**

#### Creating a Voting Event

1. Click **"New Voting Event"**
2. Fill in the details:
   - **Name**: Voting event name (e.g., "Annual Shareholder Meeting 2025")
   - **Execution Date**: Select voting date using date picker
3. Click **"Create"**
4. Approve the transaction

#### Viewing Voting Events

The voting rights table displays scheduled voting events with their execution dates.

---

## Executing Coupon Payments

For bond tokens, execute periodic interest payments to bondholders.

### Accessing Coupons

1. Navigate to your bond token from the dashboard
2. Select **Admin View (green)**
3. Click on **Corporate Actions** tab
4. Select **Coupons**

### Viewing All Coupons

The coupons table displays:

| ID  | Record Date | Execution Date | Coupon Rate | Period  | Snapshot |
| --- | ----------- | -------------- | ----------- | ------- | -------- |
| 1   | 2024-12-15  | 2024-12-22     | 5.0%        | 90 days | View     |
| 2   | 2025-03-15  | 2025-03-22     | 5.0%        | 90 days | View     |

- **ID**: Unique coupon identifier
- **Record Date**: Snapshot date for eligible bondholders
- **Execution Date**: Payment distribution date
- **Coupon Rate**: Interest rate for the period
- **Period**: Duration of the coupon period
- **Snapshot**: View eligible bondholders

### Programming a New Coupon

1. Click **"New Coupon"** or **"Add Coupon"**
2. Fill in the coupon details:
   - **Coupon Rate**: Interest rate (e.g., `5.0` for 5%)
   - **Record Date**: Select date using date picker
   - **Execution Date**: Select date using date picker (must be after record date)
   - **Period**: Select from dropdown:
     - 1 day
     - 1 week
     - 1 month
     - 3 months (90 days)
     - 1 year
3. Click **"Create"** or **"Schedule Coupon"**
4. Approve the transaction in your wallet

**Important**: The execution date must be after the record date.

### Viewing Coupon Details

Click on a specific coupon to view:

- Coupon parameters (rate, period, dates)
- Total coupon amount to distribute
- List of eligible bondholders and their coupon amounts
- Payment status

### Viewing Coupon Holders

Click **"Snapshot"** or **"View Holders"** to see:

- Account addresses of eligible bondholders
- Bond balance at record date
- Coupon amount each holder will receive
- Payment status

---

## Payment Distribution

Corporate action payments can be distributed using:

- **Direct Transfer**: For small holder counts (< 100)
- **Mass Payout Integration**: For large holder counts (recommended for > 100 holders)
- **Batch Processing**: Automatic chunking for large distributions

For large-scale distributions, consider using the [Mass Payout system](/mass-payout/).

## Permissions Required

To execute corporate actions, you need:

- **CORPORATE_ACTION_ROLE** or **ISSUER_ROLE** for scheduling dividends, coupons, splits, and voting
- **PAYMENT_PROCESSOR_ROLE** for executing payments (if applicable)

See [Roles and Permissions](./roles-and-permissions.md) for more details.

## Next Steps

- [Mass Payout Documentation](/mass-payout/) - Large-scale payment distribution
- [Token Operations](./token-operations.md) - Other token operations
- [Roles and Permissions](./roles-and-permissions.md) - Managing access control
