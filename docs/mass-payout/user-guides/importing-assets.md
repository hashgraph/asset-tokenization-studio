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

### Asset Imported But Shows Zero Holders

**Cause**: In ATS, creating accounts or "holder records" in the system doesn't make them actual on-chain token holders. An address only becomes a holder after tokens are minted to it.

**Important**: When you create a security token in ATS, even if you set up holder accounts, they won't appear as holders in Mass Payout until you mint tokens to their addresses.

**Solution**:

1. **Mint Tokens in ATS**:
   - Go to ATS web application
   - Navigate to your token
   - Use the mint function to issue tokens to holder addresses
   - Confirm at least one address has a non-zero balance

2. **Verify in ATS**:
   - Check token details page in ATS
   - View holder list and balances
   - Ensure holders appear with balances > 0

3. **Re-sync in Mass Payout**:
   - Navigate to asset details in Mass Payout
   - Click "Sync Holders"
   - Holder count should update to reflect on-chain balances

4. **Create Distribution**:
   - Now you can create distributions
   - Payments will only go to addresses with actual token balances

**Note**: This is a common issue when first setting up ATS tokens. Always mint tokens before attempting to create distributions in Mass Payout.

## Next Steps

- [Create Distributions](./creating-distributions.md) - Set up payouts for imported assets
