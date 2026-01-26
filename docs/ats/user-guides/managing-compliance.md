---
id: managing-compliance
title: Managing KYC and Compliance
sidebar_label: KYC & Compliance
sidebar_position: 3
---

# Managing KYC and Compliance

Learn how to manage Know Your Customer (KYC) verification and compliance for security tokens.

## KYC Management Overview

ATS supports three KYC methods:

- **Internal KYC**: Manage KYC using Verifiable Credentials (VCs) uploaded directly
- **External KYC**: Delegate KYC verification to external smart contracts
- **Both**: Use both internal and external KYC verification

---

## Internal KYC Management

Internal KYC uses Verifiable Credentials to validate investor identities on-chain.

### Step 1: Enable Internal KYC

You can enable internal KYC either during token creation or later from the Management section.

**During Token Creation**

When creating an equity or bond token:

1. In the **Compliance Settings** section
2. Find the **KYC Method** option
3. Select:
   - **Internal**: Use internal KYC with VCs
   - **External**: Use external KYC lists
   - **Both**: Use both methods

**After Token Creation**

1. Navigate to your token from the dashboard
2. Select **Admin View (green)**
3. Go to **Management** → **Danger Zone**
4. Find **"Activate Internal KYC"**
5. Click **"Activate"**
6. Approve the transaction

**Note**: Once activated, internal KYC cannot be deactivated without redeploying the token.

### Step 2: Configure Issuers

Before you can validate KYC, you need to designate accounts as issuers. Issuers have permission to upload Verifiable Credentials.

**Adding an Issuer**

1. Navigate to your token
2. Select **Admin View (green)**
3. Go to **Control** → **SSI Manager**
4. Click **"Add Issuer"**
5. Enter the **account address** (Hedera ID or EVM address) to designate as issuer
6. Click **"Add"**
7. Approve the transaction

**Important**: You are adding an **account address** as an issuer, not Terminal 3 itself. This account will then have permission to upload VCs through Terminal 3 or programmatically.

**Viewing Issuers**

The issuers list shows all accounts authorized to upload VCs for KYC validation.

### Step 3: Grant KYC to an Account

Once you have issuers configured, you can validate KYC for specific accounts by uploading their Verifiable Credentials.

**Uploading a Verifiable Credential**

1. Navigate to your token
2. Select **Admin View (green)**
3. Go to **Control** → **KYC**
4. Click **"Upload VC"** or **"Grant KYC"**
5. Enter the holder's account address
6. Upload or paste the Verifiable Credential data
7. Click **"Submit"**
8. Approve the transaction

**Note**: Only accounts designated as issuers (from Step 2) can upload VCs.

**Getting Test Verifiable Credentials**

For testing purposes, you can generate test VCs using the hardhat command:

```bash
npx hardhat createVC \
  --holder <account_evm_address> \
  --privatekey <issuer_private_key>
```

**For Production**: Use [Terminal 3](https://terminal3.io/) to issue proper Verifiable Credentials that comply with W3C standards.

### Checking KYC Status

To check if an account has internal KYC:

1. Navigate to your token
2. Select **Admin View (green)**
3. Go to **Control** → **KYC**
4. View the list of accounts with their KYC status:
   - **Valid**: KYC verified

You can also enter a specific account address to check its KYC status.

### Revoking KYC

To revoke internal KYC from an account:

1. Navigate to your token
2. Select **Admin View (green)**
3. Go to **Control** → **KYC**
4. Find the account in the list
5. Click the **trash/delete icon** (🗑️) next to the account
6. Approve the transaction

**Effect**: Revoked accounts will no longer be able to receive or transfer tokens.

---

## External KYC Management

External KYC allows you to delegate investor verification to external smart contract lists.

### Viewing External KYC Lists (Token Level)

To see which external KYC lists are associated with your token:

1. Navigate to your token
2. Select **Admin View (green)**
3. Go to **Control** → **External KYC**
4. View the list of external KYC contracts associated with this token

**Note**: This view only shows the lists. To manage (create/edit) external KYC lists, use the External KYC section in the sidebar.

### Managing External KYC Lists (Global)

To create and manage external KYC lists that can be shared across multiple tokens:

1. In the main sidebar, navigate to **External KYC** (outside of any specific token)
2. Here you can:
   - Create new external KYC lists
   - Add/remove addresses to existing lists
   - View all your external KYC lists
   - Share lists across multiple tokens

### Adding an External KYC List to Your Token

Once you've created an external KYC list (from the sidebar), you can associate it with your token:

1. Navigate to your token
2. Go to **Control** → **External KYC**
3. Click **"Add External List"**
4. Enter the smart contract address of the external KYC list
5. Approve the transaction

See [Managing External KYC Lists](./managing-external-kyc-lists.md) for detailed instructions on creating and managing external KYC lists.

---

## KYC Enforcement

Once KYC is enabled, the token will enforce KYC requirements:

- **Transfers**: Both sender and receiver must have valid KYC
- **Token Reception**: Receivers must have valid KYC to receive tokens
- **Corporate Actions**: KYC holders are eligible for dividends and other corporate actions

## Common Issues

### "Account does not have Kyc status: Not Granted"

This error means the target account **already has KYC status** (either granted internally or through an external list). You cannot grant KYC to an account that already has a KYC status.

**Solution**: Check if the account is already in an external KYC list or has been previously granted KYC.

### Cannot Upload VC

**Issue**: "Caller does not have SSI_MANAGER_ROLE"

**Solution**: Make sure the account you're using is designated as an issuer in Step 2 (Control → SSI Manager → Add Issuer).

### KYC Not Enforced

**Issue**: Transfers work without KYC

**Solution**: Verify that internal KYC is activated (Step 1). Check Management → Danger Zone → Internal KYC status.

## Permissions Required

- **SSI_MANAGER_ROLE**: Required to add/remove issuers
- **KYC_ROLE**: Required to grant/revoke KYC (automatically granted to issuers)
- **ISSUER_ROLE** or token creator: Required to activate internal KYC

See [Roles and Permissions](./roles-and-permissions.md) for more details.

## Next Steps

- [SSI Integration](./ssi-integration.md) - Integrate with Terminal 3 for production
- [Managing External KYC Lists](./managing-external-kyc-lists.md) - Using external KYC smart contracts
- [Roles and Permissions](./roles-and-permissions.md) - Managing access control
