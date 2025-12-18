---
id: corporate-actions
title: Executing Corporate Actions
sidebar_label: Corporate Actions
sidebar_position: 4
---

# Executing Corporate Actions

Learn how to execute dividends, coupon payments, and other corporate actions.

## Overview

Corporate actions include:

- **Dividends**: Distribute earnings to equity holders
- **Coupon Payments**: Pay interest to bondholders
- **Stock Splits**: Adjust share quantities
- **Rights Issues**: Offer additional shares to existing holders

## Executing Dividends

### For Equity Tokens

1. Navigate to token dashboard
2. Select "Corporate Actions" → "Dividend"
3. Configure dividend parameters:
   - **Amount per Share**: Dividend amount
   - **Payment Token**: USDC, HBAR, or other
   - **Record Date**: Snapshot for eligible shareholders
   - **Payment Date**: When dividend is distributed
4. Review total amount required
5. Approve and execute transaction

### Snapshot Management

Capture holder balances at specific point in time:

- Automatic snapshot on record date
- Manual snapshot option available
- View historical snapshots

## Executing Coupon Payments

### For Bond Tokens

1. Select bond token from dashboard
2. Navigate to "Coupon Payments"
3. Configure payment:
   - **Period**: Which coupon period
   - **Amount**: Total or per-bond amount
   - **Payment Token**: Token for distribution
4. Execute payment to all bondholders

### Scheduled Payments

Set up automatic recurring coupon payments:

- Configure payment schedule
- Automatic execution on due dates
- Failure handling and retries

## Maturity Redemption

Handle bond maturity:

1. Navigate to bond details
2. Select "Maturity Redemption"
3. Specify principal amount
4. Execute redemption to all bondholders
5. Burn redeemed bond tokens

## Payment Distribution

Payments are distributed using:

- **Direct Transfer**: For small holder counts (< 100)
- **Mass Payout Integration**: For large holder counts
- **Batch Processing**: Automatic chunking for large distributions

Integration with Mass Payout recommended for > 100 holders.

## Next Steps

- [Mass Payout Documentation](/mass-payout/) - Large-scale distribution system
- [Token Lifecycle](./token-lifecycle.md) - Other token operations

_This guide is under development. More detailed content coming soon._
