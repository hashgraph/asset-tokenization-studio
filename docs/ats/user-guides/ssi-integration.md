---
id: ssi-integration
title: SSI Integration with Terminal 3
sidebar_label: SSI Integration
sidebar_position: 6
---

# SSI Integration

Learn how to configure Self-Sovereign Identity (SSI) for your security token.

## Overview

Self-Sovereign Identity (SSI) is an **optional** advanced feature that enables decentralized identity verification using verifiable credentials (VCs). SSI allows investors to control their own identity data while maintaining regulatory compliance.

> **Note**: SSI integration is **optional**. You can use Internal KYC or External KYC Lists instead. See [Managing Compliance](./managing-compliance.md) for alternatives.

## What is SSI Configuration?

From **Control → SSI Manager**, you can configure two things:

1. **Revocation Registry Address**: Contract address that tracks revoked credentials
2. **Issuers**: Accounts authorized to issue Verifiable Credentials for KYC approval

## Prerequisites

- Security token deployed
- **SSI_MANAGER_ROLE** assigned to your account
- Revocation registry address (from your SSI provider)

## Accessing SSI Manager

1. Navigate to your security token in the dashboard
2. Select **Admin View (green)**
3. Go to **Control** → **SSI Manager**

## Step 1: Set Revocation Registry Address

The revocation registry (also known as **Identity Registry** in ERC-3643) is a smart contract that verifies investor eligibility and tracks which credentials have been invalidated.

### What is the Identity Registry?

The Identity Registry is part of the **ERC-3643 standard** (T-REX protocol). It provides:

- **Identity verification**: Checks if an investor's identity is valid
- **Credential revocation**: Tracks invalidated credentials
- **Eligibility checks**: Verifies investor meets compliance requirements

During token transfers and mints, the smart contract calls `isVerified(address)` on this registry to check investor eligibility.

### When to Configure

You have two options:

**Option 1: During token creation** (recommended)

- Configure the Identity Registry address when creating your equity or bond token
- See [Creating Equity](./creating-equity.md) or [Creating Bond](./creating-bond.md) guides

**Option 2: After token creation**

- If you didn't configure it during creation, you can set it here from **Control → SSI Manager**

### How to Configure

1. In **Control** → **SSI Manager**, look for **"Revocation Registry"** or **"Identity Registry"** section
2. Click **"Set Revocation Registry"** or **"Configure"**
3. Enter the Identity Registry contract address
4. Confirm the transaction

**Where to get the address:**

- Provided by your SSI provider (e.g., Terminal 3)
- Different addresses for testnet and mainnet
- For Hedera Testnet: `0x77Fb69B24e4C659CE03fB129c19Ad591374C349e` (example)

> **Important**: The Identity Registry address is provided by your SSI provider. Contact them to obtain the correct address for your network.

> **Note**: Only accounts with **T_REX_OWNER** or **SSI_MANAGER_ROLE** can configure the Identity Registry.

## Step 2: Manage Issuers

Issuers are accounts authorized to issue Verifiable Credentials that grant internal KYC approval.

### Add an Issuer

1. From **Control** → **SSI Manager**, locate the **"Issuers"** section
2. Click **"Add Issuer"**
3. Enter the **account address** (Hedera ID or EVM address)
4. Confirm the transaction

**Important**: You are adding an **account address** as an issuer. This account will have permission to upload Verifiable Credentials to grant KYC.

### View Issuers

In the **Control → SSI Manager** section, you can view:

- List of all configured issuers
- Account addresses
- When they were added

### Remove an Issuer

1. In **Control** → SSI Manager\*\*, find the issuer in the list
2. Click **"Remove"** or the delete icon
3. Confirm the transaction

## How SSI KYC Works

Once you've configured the revocation registry and issuers:

1. **Issuers can grant KYC** by uploading Verifiable Credentials from **Control → KYC** (same as internal KYC)
2. **Token checks credentials**: During transfers, the token verifies the credential against:
   - Issuer is on the approved issuer list (configured in SSI Manager)
   - Credential is not revoked (checked against revocation registry)
3. **If valid**: Transfer proceeds
4. **If revoked or invalid**: Transfer is blocked

## Relationship with Internal KYC

SSI configuration works with the internal KYC system:

- **Issuers configured here** can upload Verifiable Credentials to grant internal KYC
- **Revocation registry** is checked to validate those credentials haven't been revoked
- **KYC granting** still happens from **Control → KYC** (see [Managing Compliance](./managing-compliance.md))

## Required Roles

- **SSI_MANAGER_ROLE**: Required to configure revocation registry and manage issuers

See [Roles and Permissions](./roles-and-permissions.md) for more details.

## Troubleshooting

### Cannot Set Revocation Registry

**Problem**: Transaction fails when setting revocation registry

**Solutions**:

- Verify you have **SSI_MANAGER_ROLE**
- Check the contract address is valid
- Ensure sufficient HBAR for transaction

### Cannot Add Issuer

**Problem**: Transaction fails when adding issuer

**Solutions**:

- Verify you have **SSI_MANAGER_ROLE**
- Check the account address format is correct
- Ensure the address is not already an issuer

## Test Addresses (Hedera Testnet)

For testing SSI configuration on Hedera Testnet:

- **Revocation Registry**: `0x77Fb69B24e4C659CE03fB129c19Ad591374C349e`
- **DID Registry**: `0x312C15922c22B60f5557bAa1A85F2CdA4891C39a`

> **Note**: For production, obtain the correct revocation registry address from your SSI provider (e.g., Terminal 3).

## Next Steps

- [Managing Compliance](./managing-compliance.md) - Learn about internal KYC management
- [Roles and Permissions](./roles-and-permissions.md) - Understand SSI_MANAGER_ROLE

---

> **Remember**: SSI is **optional**. For simpler KYC management, see [Managing Compliance](./managing-compliance.md) for internal and external KYC options.
