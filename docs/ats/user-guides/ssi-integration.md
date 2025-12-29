---
id: ssi-integration
title: SSI Integration with Terminal 3
sidebar_label: SSI Integration
sidebar_position: 6
---

# SSI Integration with Terminal 3

Learn how to integrate Self-Sovereign Identity (SSI) with Terminal 3 for decentralized KYC verification.

## Overview

Self-Sovereign Identity (SSI) is an **optional** advanced feature that enables decentralized identity verification using verifiable credentials. Terminal 3 integration allows investors to control their own identity data while maintaining regulatory compliance.

> **Note**: SSI integration is **optional**. You can use Internal KYC or External KYC Lists instead. See [Managing External KYC Lists](./managing-external-kyc-lists.md) for alternatives.

## What is SSI?

SSI provides:

- **User-controlled identity**: Investors own and manage their credentials
- **Privacy-preserving**: Selective disclosure of identity attributes
- **Interoperable**: Credentials work across multiple platforms
- **Verifiable**: Cryptographically signed by trusted issuers

## Terminal 3 Integration

Terminal 3 is a compliance platform that issues verifiable credentials for:

- KYC verification
- Accredited investor status
- Jurisdiction eligibility
- Regulatory compliance

## Prerequisites

- ATS web application running
- Security token deployed
- **SSI_MANAGER_ROLE** assigned to your account
- Terminal 3 account and API credentials

## Architecture

```
┌─────────────────┐
│   Investor      │
│   (Holder)      │
└────────┬────────┘
         │ Presents Credential
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Security Token │◄─────│ Revocation       │
│  (ATS)          │      │ Registry         │
└────────┬────────┘      └──────────────────┘
         │ Verifies
         ▼
┌─────────────────┐      ┌──────────────────┐
│ Issuer List     │◄─────│ Terminal 3       │
│ (On-chain)      │      │ (Credential      │
└─────────────────┘      │  Issuer)         │
                         └──────────────────┘
```

## Step 1: Configure SSI Module

### Open SSI Manager

1. Navigate to your security token in the dashboard
2. In the left menu, go to **Control** → **SSI Manager**
3. The SSI Manager lets you configure the **Revocation Registry Address** and manage credential **Issuers**
4. Ensure your account has **SSI_MANAGER_ROLE** to make changes

### Set Revocation Registry

The revocation registry tracks invalidated credentials:

1. In **Control** → **SSI Manager**, click **"Set Revocation Registry"**
2. Enter the revocation registry contract address (provided by Terminal 3)
3. Confirm the transaction

> **Important**: The revocation registry address is provided by your SSI provider (Terminal 3). Contact them to obtain the correct address for your network (testnet/mainnet).

## Step 2: Add an Account as Issuer

### Designate Issuer Accounts

You need to add accounts that have permission to upload Verifiable Credentials:

1. From **Control** → **SSI Manager**, click **"Add Issuer"**
2. Enter the **account address** (Hedera ID or EVM address) that will act as issuer
3. Confirm the transaction

**Important**: You are adding an **account address** as an issuer, not Terminal 3 itself. This account can then use Terminal 3 or other methods to issue and upload Verifiable Credentials for KYC validation.

### View Issuer List

To see all trusted issuers:

1. Go to **Control** → **SSI Manager**
2. View list of approved credential issuers
3. Each issuer shows:
   - Address
   - Date added
   - Status (active/inactive)

### Remove an Issuer

If you need to revoke trust from an issuer:

1. Go to **Control** → **SSI Manager** and find the issuer in the list
2. Click **"Remove"**
3. Confirm the transaction

## Step 3: Investor Verification Flow

### For Investors

1. **Obtain Credential from Terminal 3**:
   - Sign up on Terminal 3 platform
   - Complete KYC verification
   - Receive verifiable credential

2. **Present Credential to Token**:
   - Connect wallet to ATS web app
   - Navigate to token details
   - Click **"Verify Identity"**
   - Present credential from Terminal 3

3. **Credential Verification**:
   - Token contract checks:
     - ✓ Credential signed by trusted issuer
     - ✓ Credential not revoked
     - ✓ Credential claims match requirements
   - If valid, investor is marked as verified

### For Token Administrators

Monitor verified investors:

1. Navigate to **"Holders"** tab
2. View **"Verification Method"** column:
   - **SSI**: Verified via Terminal 3 credential
   - **External List**: Verified via external KYC list
   - **Internal**: Verified via internal KYC

## Step 4: Credential Revocation

### How Revocation Works

When an investor's KYC status changes:

1. Terminal 3 updates the revocation registry
2. Token contract checks registry during transfers
3. Revoked credentials are automatically invalid

### Manual Status Check

To verify an investor's current status:

1. From **"Holders"** tab, select the investor
2. Click **"Check SSI Status"**
3. View verification details:
   - Issuer address
   - Credential validity
   - Revocation status

### What the Contracts Store

- The smart contracts **do not store or parse the full VC**—they only keep:
  - `issuer` address (must be on the issuer list)
  - `vcId` (string identifier from the credential)
  - Validity period (`validFrom`/`validTo`)
- Each transfer checks `revoked(issuer, vcId)` against the configured **Revocation Registry**. If revoked (or issuer not listed / dates expired), the holder is treated as **NOT KYC verified**.
- The actual credential file lives off-chain with the investor or your SSI provider.

## Combining SSI with Other Methods

SSI can work alongside other KYC methods:

### SSI + Internal KYC

- Investors can be verified via SSI **or** internal KYC
- Useful during transition period

### SSI + External Lists

- SSI provides primary verification
- External lists serve as fallback or override
- Example: Blacklist overrides SSI verification

### Verification Priority

When multiple methods are enabled:

1. **Blacklist check**: If investor is blacklisted, transfer fails
2. **Any verification succeeds**: SSI **OR** External List **OR** Internal
3. **All methods can be used**: Maximum flexibility for compliance

## Required Roles

To manage SSI integration:

- **SSI_MANAGER_ROLE**: Configure revocation registry and issuer list
- **DEFAULT_ADMIN_ROLE**: Full administrative access

See the [Roles and Permissions Guide](./roles-and-permissions.md) for details.

## Security Considerations

### Credential Storage

- **Never store credentials on-chain**: Only verification status is recorded
- **Investor privacy**: Credentials remain with the investor
- **Selective disclosure**: Only required claims are verified

### Issuer Trust

- **Vet issuers carefully**: Only add trusted credential issuers
- **Regular audits**: Review issuer list periodically
- **Revocation monitoring**: Monitor revocation registry for updates

### Smart Contract Security

- **Immutable issuer list**: Changes require transaction
- **On-chain verification**: All credential checks happen on-chain
- **Revocation registry**: External contract managed by Terminal 3

## Troubleshooting

### "Account does not have Kyc status: Not Granted"

This error means the target account **already has KYC status** (either granted internally or through an external list). You cannot grant KYC to an account that already has a KYC status.

**Solution**: Check if the account is already in an external KYC list or has been previously granted KYC internally.

### Credential Not Recognized

If an investor's credential is rejected:

- **Issuer not authorized**: Verify the issuer account is in the issuer list (Control → SSI Manager)
- **Credential revoked**: Check revocation registry status
- **Wrong network**: Ensure credential is for the correct network (testnet/mainnet)

### Revocation Registry Errors

- **Invalid address**: Verify revocation registry address from Terminal 3
- **Registry unreachable**: Check network connectivity
- **Permission denied**: Ensure you have SSI_MANAGER_ROLE

### Transfer Still Blocked

Even with valid SSI credential:

- **Blacklist override**: Check if investor is on control list blacklist
- **Other restrictions**: Review transfer rules and compliance settings
- **Gas limit**: Ensure sufficient HBAR for verification transaction

## Creating Test Credentials (Development)

For **development/testing only**, you can generate a sample Verifiable Credential (VC) with the Hardhat task below. This helps you populate a `vcId` and exercise the revocation lookup in a testnet flow. Production credentials must come from your SSI provider (e.g., Terminal 3).

```bash
cd packages/ats/contracts

npx hardhat createVC \
  --holder <investor_evm_address> \
  --privatekey <issuer_private_key_hex>
```

**Parameters:**

- `--holder`: The EVM address of the investor receiving the credential
- `--privatekey`: The issuer's private key in hexadecimal format (without 0x prefix)

**Output:**

- Generates a `.vc` file with the signed credential (stored locally; not sent on-chain)
- File format: `vc_<holder_address>_<timestamp>.vc`
- Contains KYC claim: `{ "kyc": "passed" }`
- The `id` inside the `.vc` file is the `vcId` you pass to `grantKyc` (via UI/API)

**Example:**

```bash
npx hardhat createVC \
  --holder 0x742d35Cc6634C0532925a3b844Bc454e4438f44e \
  --privatekey abc123def456...
```

**Test Addresses (Hedera Testnet):**

- **Revocation Registry**: `0x77Fb69B24e4C659CE03fB129c19Ad591374C349e`
- **DID Registry**: `0x312C15922c22B60f5557bAa1A85F2CdA4891C39a`

> **Warning**: This is for testing only. For production, obtain credentials from Terminal 3 directly.

## Terminal 3 Resources

- **Terminal 3 Documentation**: [https://terminal3.io/docs](https://terminal3.io/docs)
- **Credential Issuance**: Contact Terminal 3 support for issuer addresses
- **Revocation Registry**: Obtain contract addresses from Terminal 3

## Next Steps

- [Managing External KYC Lists](./managing-external-kyc-lists.md) - Alternative KYC method
- [Roles and Permissions](./roles-and-permissions.md) - Understand access control
- [Managing Compliance](./managing-compliance.md) - Overall compliance strategy

## Related Resources

- [Developer Guide: SSI Integration](../developer-guides/contracts/ssi.md)
- [API Reference: ISsiManagement](../../references/index.md)

---

> **Remember**: SSI integration is **optional**. If you prefer simpler KYC management, use Internal KYC or External KYC Lists instead.
