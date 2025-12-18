---
id: importing-assets
title: Importing Assets
sidebar_label: Importing Assets
sidebar_position: 1
---

# Importing Assets

Learn how to import token contracts into Mass Payout for distribution management.

## Overview

Import assets from:

- Asset Tokenization Studio (ATS) tokens
- Existing Hedera tokens
- Custom token contracts

The import process automatically:

- Syncs token holder information
- Captures holder balances
- Creates asset record in database
- Sets up for distributions

## Prerequisites

- Mass Payout application running
- Backend API accessible
- Operator account configured
- Token contract deployed on Hedera

## Importing from ATS

### Step 1: Get Token Contract ID

From the ATS web application:

1. Navigate to your token dashboard
2. Copy the token contract ID (format: `0.0.XXXXXXXX`)

### Step 2: Import in Mass Payout

1. Open Mass Payout frontend
2. Click "Import Asset"
3. Enter token contract ID
4. Click "Import"

### Step 3: Sync Holder Information

The system automatically:

- Queries token contract for holder list
- Retrieves current balances
- Stores holder information in database
- Displays asset summary

## Importing Custom Tokens

For non-ATS tokens:

1. Ensure token is deployed on Hedera
2. Token must be compatible with Hedera Token Service (HTS)
3. Enter contract ID in import form
4. System attempts to sync holder data

**Note**: Some token formats may not be fully compatible.

## Viewing Imported Assets

After import:

- Asset appears in dashboard
- View holder count and total supply
- See distribution history
- Access asset details

## Managing Assets

### Update Holder Information

Refresh holder data:

1. Navigate to asset details
2. Click "Sync Holders"
3. Latest balances updated from blockchain

### Asset Details

View comprehensive information:

- Token name, symbol, supply
- Contract addresses
- Holder count and distribution
- Sync status and last update

## Troubleshooting

### Import Failed

**Contract Not Found**:

- Verify contract ID is correct
- Ensure contract is deployed on configured network (testnet/mainnet)

**Sync Error**:

- Check operator account has query permissions
- Verify Mirror Node URL is accessible
- Ensure token contract is HTS-compatible

### Holder Data Not Syncing

- Check blockchain event listener is running
- Verify Mirror Node connection
- Review backend logs for errors

## Next Steps

- [Create Distributions](./creating-distributions.md) - Set up payouts for imported assets
- [Manage Holders](./holders-management.md) - View and manage holder information

_This guide is under development. More detailed content coming soon._
