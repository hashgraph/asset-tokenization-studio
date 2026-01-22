---
id: token-lifecycle
title: Token Lifecycle Management
sidebar_label: Token Lifecycle
sidebar_position: 5
---

# Token Lifecycle Management

Learn how to manage token operations including transfers, pausing, freezing, and redemption.

## Overview

Token lifecycle operations:

- **Transfer**: Move tokens between addresses
- **Pause**: Temporarily halt all transfers
- **Freeze**: Freeze specific addresses
- **Burn/Redeem**: Remove tokens from circulation
- **Mint**: Issue additional tokens (if configured)

![ATS Dashboard](../../images/ats-web-dashboard.png)

## Token Transfers

### Manual Transfer

Execute transfers from issuer account:

1. Navigate to token dashboard
2. Select "Transfer Tokens"
3. Enter recipient address and amount
4. Approve transaction

### Transfer Restrictions

Transfers are subject to:

- Compliance rules (KYC, country restrictions)
- Token pause status
- Account freeze status
- Custom transfer rules

## Pausing Tokens

Temporarily halt all token transfers:

1. Navigate to token settings
2. Select "Pause Token"
3. Confirm action
4. All transfers blocked until unpaused

Use cases:

- Emergency situations
- System maintenance
- Regulatory compliance
- Security incidents

## Freezing Accounts

Freeze specific addresses:

1. Go to "Holder Management"
2. Select address to freeze
3. Click "Freeze Account"
4. Frozen account cannot send or receive tokens

Use cases:

- Suspicious activity
- Regulatory requirements
- Dispute resolution
- Lost key recovery

## Burning / Redemption

Remove tokens from circulation:

### Full Redemption

1. Select "Redeem Tokens"
2. Enter amount to burn
3. Tokens permanently removed

### Full Redeem at Maturity (Bonds)

For bond tokens that have reached maturity, you can redeem all tokens for a specific holder at once:

1. Navigate to your bond token
2. Select **Admin View (green)**
3. Go to **Force Redeem** section
4. Enable **"Full Redeem at Maturity"** checkbox (only available when maturity date has passed)
5. Select the holder account
6. Click **"Redeem All"**
7. Approve the transaction

This operation redeems all tokens held by the specified account across all partitions.

### Partial Redemption

For bonds or special circumstances:

1. Specify redemption amount per holder
2. Execute pro-rata redemption
3. Remaining tokens stay in circulation

### Redeem at Maturity by Partition

For multi-partition bonds, redeem tokens from a specific partition:

1. Navigate to your bond token
2. Select the partition to redeem from
3. Specify the amount and holder
4. Execute the redemption

## Minting Additional Tokens

If mintable supply configured:

1. Navigate to "Mint Tokens"
2. Enter amount to mint
3. Specify recipient or add to issuer balance
4. Approve transaction

⚠️ **Note**: Many regulatory frameworks restrict additional issuance.

## Token Information Updates

Update token metadata:

- Company information
- Contact details
- Documentation URLs
- Logo and branding

Cannot change:

- Token name and symbol
- Total supply (unless mintable)
- Contract address

## Monitoring and Reports

View token activity:

- Transfer history
- Holder distribution
- Corporate action history
- Compliance events

Export reports for:

- Cap table management
- Regulatory filings
- Investor communications
- Audit purposes

## Next Steps

- [Corporate Actions](./corporate-actions.md) - Execute dividends and coupons
- [Managing Compliance](./managing-compliance.md) - KYC and restrictions
- [Developer Guide](../developer-guides/index.md) - Technical details

_This guide is under development. More detailed content coming soon._
