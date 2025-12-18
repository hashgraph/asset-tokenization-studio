---
id: creating-equity
title: Creating Equity Tokens
sidebar_label: Creating Equity
sidebar_position: 1
---

# Creating Equity Tokens

Learn how to create equity tokens representing company shares using the ATS web application.

## Overview

Equity tokens represent ownership shares in a company. They can include features like:

- Dividend distributions to shareholders
- Voting rights for governance
- Transfer restrictions and compliance rules
- Lock-up periods for insider shares

## Prerequisites

- ATS web application running and accessible
- Hedera wallet connected (HashPack, Blade, or WalletConnect)
- Sufficient HBAR for transaction fees
- Business Logic Resolver and Factory contracts deployed

## Step 1: Navigate to Token Creation

1. Open the ATS web application
2. Click "Create Token" in the navigation menu
3. Select "Equity" as the token type

![ATS Web Application](/img/screenshots/ats/ats-web.png)

## Step 2: Configure Token Details

### Basic Information

**Token Name**: The full name of your security

- Example: "Acme Corporation Common Stock"

**Token Symbol**: A short ticker symbol (2-5 characters)

- Example: "ACME"

**Total Supply**: The number of shares to issue

- Example: 1,000,000 shares

**Decimals**: Number of decimal places (usually 0 for equity)

- Recommended: 0 (whole shares only)

### Company Information

- **Issuer Address**: Your Hedera account ID
- **Company Name**: Legal entity name
- **Jurisdiction**: Country of incorporation
- **Website**: Company website URL (optional)

## Step 3: Configure Compliance Settings

### KYC Requirements

Enable KYC verification for token holders:

- **Require KYC**: Toggle to require identity verification
- **KYC Provider**: Select verification provider
- **Accredited Investor Only**: Restrict to accredited investors

### Transfer Restrictions

Configure who can receive tokens:

- **Allowed Countries**: Whitelist countries for token holders
- **Blocked Countries**: Blacklist specific jurisdictions
- **Transfer Rules**: Custom conditions for transfers

## Step 4: Set Up Corporate Actions

### Dividend Configuration

- **Enable Dividends**: Allow dividend distributions
- **Payment Token**: Token used for dividend payments (e.g., USDC)
- **Record Date**: Snapshot date for eligible shareholders

### Voting Rights

- **Enable Voting**: Grant voting rights to token holders
- **Voting Weight**: Votes per share (usually 1)

## Step 5: Review and Deploy

1. Review all configuration settings
2. Check estimated deployment cost
3. Click "Deploy Token"
4. Approve the transaction in your wallet
5. Wait for transaction confirmation (typically 3-5 seconds)

## Step 6: Verify Deployment

After deployment:

- Token contract address will be displayed
- Token appears in your dashboard
- View token details and holder information

![ATS Dashboard](/img/screenshots/ats/ats-web-dashboard.png)

## Managing Your Equity Token

After creation, you can:

- **Distribute Shares**: Transfer tokens to shareholders
- **Execute Dividends**: Distribute earnings to holders
- **Manage Compliance**: Add/remove approved investors
- **Pause Transfers**: Temporarily freeze token transfers
- **Update Metadata**: Modify token information

## Common Issues

### Transaction Failed

- **Insufficient HBAR**: Ensure wallet has enough HBAR for gas fees
- **Invalid Configuration**: Check all required fields are filled
- **Contract Not Found**: Verify Factory contract address is correct

### KYC Provider Not Available

- Configure KYC provider settings in contract deployment
- Contact provider to enable API access

### Transfer Restrictions Not Working

- Verify compliance rules are properly configured
- Check that transfer restrictions facet is deployed
- Ensure recipient addresses are whitelisted

## Next Steps

- [Execute Corporate Actions](./corporate-actions.md) - Distribute dividends
- [Manage Compliance](./managing-compliance.md) - Add KYC rules
- [Token Lifecycle](./token-lifecycle.md) - Manage token operations

## Related Resources

- [Developer Guide: ATS Contracts](../developer-guides/contracts/index.md)
- [API Reference: Equity Facet](../api/contracts/index.md)
