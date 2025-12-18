---
id: creating-bond
title: Creating Bond Tokens
sidebar_label: Creating Bonds
sidebar_position: 2
---

# Creating Bond Tokens

Learn how to create bond tokens with maturity dates and coupon payments.

## Overview

Bond tokens represent debt securities with:

- Fixed maturity date
- Periodic coupon payments
- Principal redemption at maturity
- Transfer restrictions and compliance

## Prerequisites

- ATS web application running
- Hedera wallet connected
- Sufficient HBAR for transaction fees
- Factory contract deployed

## Creating a Bond

### Basic Configuration

1. Navigate to "Create Token" → "Bond"

![ATS Web Application](/img/screenshots/ats/ats-web.png)

2. Fill in token details:
   - **Name**: Bond name (e.g., "Acme Corp 5-Year Bond")
   - **Symbol**: Ticker (e.g., "ACME-BOND")
   - **Supply**: Number of bonds to issue
   - **Face Value**: Par value per bond

### Bond Terms

Configure bond-specific parameters:

- **Maturity Date**: When the bond matures
- **Coupon Rate**: Annual interest rate (e.g., 5%)
- **Coupon Frequency**: Payment schedule (monthly, quarterly, annually)
- **First Coupon Date**: Date of first interest payment

### Compliance

Set transfer restrictions and KYC requirements similar to equity tokens.

## Managing Bond Tokens

After creation:

- Execute coupon payments on schedule
- Handle maturity redemption
- Manage bondholder registry
- Track payment history

## Next Steps

- [Corporate Actions Guide](./corporate-actions.md) - Execute coupon payments
- [Token Lifecycle](./token-lifecycle.md) - Manage bond operations

_This guide is under development. More detailed content coming soon._
