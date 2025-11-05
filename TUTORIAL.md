# Asset Tokenization Studio - Complete Tutorial

A comprehensive guide to using the Asset Tokenization Studio (ATS) for creating and managing tokenized securities on Hedera.

---

## Table of Contents

1. [Prerequisites & Setup](#1-prerequisites--setup)
2. [Initial Configuration](#2-initial-configuration)
3. [Deploying Contracts](#3-deploying-contracts)
4. [Creating Your First Security Token](#4-creating-your-first-security-token)
5. [Understanding Roles](#5-understanding-roles)
6. [Managing Roles](#6-managing-roles)
7. [KYC Management](#7-kyc-management-2-approaches)
8. [Token Operations](#8-token-operations)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites & Setup

### What You Need

1. **Hedera Testnet Account**
   - Create at [Hedera Portal](https://portal.hedera.com/)
   - Fund with testnet HBAR (free from portal)
   - Note your Account ID (e.g., `0.0.xxx`)

2. **MetaMask Wallet**
   - Install [MetaMask](https://metamask.io/)
   - Create an ECDSA account on Hedera Portal
   - Export private key from Hedera Portal
   - Import to MetaMask
   - Add Hedera Testnet network:
     - Network Name: `Hedera Testnet`
     - RPC URL: `https://testnet.hashio.io/api`
     - Chain ID: `296` (or `0x128`)
     - Currency: `HBAR`
     - Block Explorer: `https://hashscan.io/testnet`

3. **Development Environment**
   ```bash
   node >= 18.x
   npm >= 9.x
   ```

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd asset-tokenization-studio

# Install dependencies
npm install

# Navigate to contracts
cd packages/ats/contracts
```

---

## 2. Initial Configuration

### Configure Contract Environment

Chose either mainnet, testnet, previewnet or loca (for 'solo' deployment). To do this, edit `packages/ats/contracts/.env`:

```bash
# Your private key (from Hedera Portal)
TESTNET_PRIVATE_KEY_0='0xYOUR_PRIVATE_KEY_HERE'

# Network endpoints (already configured)
TESTNET_JSON_RPC_ENDPOINT='https://testnet.hashio.io/api'
TESTNET_MIRROR_NODE_ENDPOINT='https://testnet.mirrornode.hedera.com'
```

### Configure Web Application

Edit `apps/ats/web/.env`:

```bash
# Network selection
REACT_APP_NETWORK='testnet'

# Mirror node and RPC
REACT_APP_MIRROR_NODE='https://testnet.mirrornode.hedera.com/api/v1/'
REACT_APP_RPC_NODE='https://testnet.hashio.io/api'

# Will be updated after deployment
REACT_APP_RPC_RESOLVER='0.0.TO_BE_UPDATED'
REACT_APP_RPC_FACTORY='0.0.TO_BE_UPDATED'

# Config IDs (default)
REACT_APP_EQUITY_CONFIG_ID='0x0000000000000000000000000000000000000000000000000000000000000001'
REACT_APP_EQUITY_CONFIG_VERSION='0'
REACT_APP_BOND_CONFIG_ID='0x0000000000000000000000000000000000000000000000000000000000000002'
REACT_APP_BOND_CONFIG_VERSION='0'
```

---

## 3. Deploying Contracts

### Deploy to Testnet

```bash
cd packages/ats/contracts

# Deploy all contracts
npx hardhat deployAll --use-deployed false --network testnet
```

This will:

- Deploy Factory contract
- Deploy Resolver contract
- Deploy all facets (ERC20, KYC, Pause, etc.)
- Create `deployed-contracts.json` file

### Update Web Configuration

After deployment, check `deployed-contracts.json` and update `apps/ats/web/.env`:

```bash
# Find these in deployed-contracts.json
REACT_APP_RPC_RESOLVER='0.0.xxx'  # Business Logic Resolver Proxy contractId
REACT_APP_RPC_FACTORY='0.0.xxx'   # Factory contractId
```

### Start the Web Application

```bash
cd apps/ats/web
npm run dev
```

Access at: `http://localhost:5173`

---

## 4. Creating Your First Security Token

### A. Connect Wallet

1. Open the web app
2. Click "Connect Metamask" or "Connect Wallet Connect"

- If using Wallet Connect, chose HashPack in the Modal.
- If using Metamask, ensure you're on Hedera Testnet in MetaMask

3. Approve connection

### B. Create an Equity Token

1. **Navigate**: Click "Create Security" → "Equity"

2. **Fill Basic Information, eg:**:
   - **Name**: `My Company Stock`
   - **Symbol**: `MCS`
   - **Decimals**: `0` (whole shares) or `18` (fractional), use `6` as standard.
   - **ISIN**: eg `US1234532117`

3. **Digital security permissions** (choose one or more):
   - **Controllable**: Enables admin to force transfer/redeem tokens between any accounts
     - Use case: Regulatory compliance, court orders, emergency recovery
   - Grants `CONTROLLER_ROLE` the ability to move tokens without owner consent
     - Example: Move tokens from compromised account to recovery address
   - **Blocklist**: Deny-list approach - block specific accounts from holding/trading
     - Use case: Sanctioned addresses, fraud prevention
     - Accounts on blocklist cannot send or receive tokens
     - More permissive: everyone allowed except blocked accounts
   - **Approval List**: Allow-list approach - only approved accounts can hold/trade
     - Use case: Highly regulated securities, private placements
     - Only accounts on approval list can participate
     - More restrictive: everyone blocked except approved accounts

       **Recommendation**: For most use cases, choose **Blocklist** for flexibility or **Approval List** for maximum control.

4. **Digital security configuration**:
   - **Clearing Mode** (Default: Unchecked)
     - **What it does**: Enables two-step settlement requiring validator approval
     - **How it works**:
       1. User initiates transfer/redemption/hold → Operation created (pending)
       2. Clearing Validator reviews operation → Approves or Cancels
       3. If approved → Operation executes
       4. If cancelled/expired → User can reclaim tokens

   - **Internal KYC Activated**
     - **What it does**: Simplified KYC system without external dependencies
     - **How it works**:
       - KYC managed directly within the token contract
       - No need for External KYC List contracts
       - SSI Manager grants/revokes KYC
       - Requires VC files for compliance tracking
     - **Impact**: KYC managed in token vs separate contract

     **Note**: You can add Internal KYC later from the token's detail page.

5. **Specific Details** (Equity-specific economic information):
   - **Nominal Value**: Value of each token in the selected currency
     - Example: `10.00` USD per share
     - This is the face value of each equity token

   - **Currency**: Select currency for nominal value
     - Options: USD, EUR, GBP, etc.

   - **Number of Shares**: Total maximum supply of equity
     - Example: `1000000` (1M shares)
     - This sets the supply cap

   - **Total Value**: Auto-calculated
     - `Number of Shares × Nominal Value`
     - Example: 1M shares × $10 = $10M total value

   - **Rights and Privileges** (select applicable rights):
     - ☐ **Voting Rights**: Holders can vote on governance
     - ☐ **Information Rights**: Access to company information
     - ☐ **Liquidation Rights**: Claims in liquidation
     - ☐ **Preferred Dividends Rights**: Priority dividend payments
     - ☐ **Common Dividends Rights**: Standard dividend payments
     - ☐ **Conversion Rights**: Convert to other securities
     - ☐ **Subscription Rights**: Pre-emptive purchase rights
     - ☐ **Redemption Rights**: Can be redeemed by issuer
     - ☐ **Put Rights**: Holder can force issuer to buy back

   - **Dividend Type**:
     - **None**: No dividends
     - **Preferred**: Priority dividends
     - **Common**: Standard dividends

6. **External Lists** (Optional - integrate existing external contracts):

   **What are External Lists?**
   External contracts that you've already deployed to manage KYC, Control, or Pause functionality across multiple tokens.
   - **External KYC List** (Optional):
     - Select previously deployed External KYC contracts
     - Accounts KYC'd in those contracts are automatically KYC'd for this token
     - Use case: Share KYC across multiple securities
     - Can select multiple External KYC contracts
     - **Recommendation**: ⚠️ Skip for now, set up later if needed

   - **External Control List** (Optional):
     - Select External Control contracts (blocklist/approval list)
     - Shares control rules across tokens
     - Can select multiple External Control contracts
     - **Recommendation**: ⚠️ Skip for now, set up later if needed

   - **External Pause List** (Optional):
     - Select External Pause contracts
     - Allows external contract to pause this token
     - Use case: Emergency pause across multiple tokens
     - **Recommendation**: ⚠️ Skip for now, set up later if needed

   **Note**: You can add External Lists later from the token's detail page.

7. **ERC3643** (Optional - T-REX standard compliance):

   **What is ERC3643?**
   T-REX (Token for Regulated EXchanges) is a standard for compliant security tokens with built-in compliance and identity management.
   - **Compliance Contract ID** (Optional):
     - Hedera account ID of compliance contract
     - Handles transfer compliance rules
     - Leave empty to use default compliance
     - **Recommendation**: ⚠️ Skip for standard use cases

   - **Identity Registry Contract ID** (Optional):
     - Hedera account ID of identity registry
     - Manages on-chain identity verification
     - Leave empty to use default identity management
     - **Recommendation**: ⚠️ Skip for standard use cases

   **When to use ERC3643:**
   - ✅ Need ERC-3643 Token Standard
   - ✅ Integrating with T-REX ecosystem
   - ✅ Point to preconfigured registries
   - ❌ Standard security token (use built-in features instead)

8. **Regulation** (Set regulatory framework):

   **Jurisdiction**: United States (default, more jurisdictions coming)

   **Select Regulation Type**:
   - **Regulation S**: Offers made outside the United States
     - International investors
     - No SEC registration required
     - Restrictions on U.S. resales

   - **Regulation D**: Private placements in the United States
     - **506(b)**: Up to 35 non-accredited investors
       - No general solicitation
       - Manual investor verification
       - Unlimited accredited investors
     - **506(c)**: Only accredited investors
       - General solicitation allowed
       - Must verify accredited status
       - No investor limits

   **Country Lists**:
   - **Authorization List** (Allow-list):
     - Select countries whose investors ARE allowed
     - Only these countries can invest
     - Example: Select "United States" for U.S.-only offering

   - **Block List** (Deny-list):
     - Select countries whose investors are NOT allowed
     - All countries except these can invest
     - Example: Block sanctioned countries

9. **Review & Create**:
   - Review all details carefully
   - ⚠️ **Cannot edit most fields after deployment!**
   - Check regulation compliance
   - Verify economic information (nominal value, shares)
   - Confirm external lists (if any)
   - Read and accept disclaimer
   - Click "Create Equity"
   - Sign transaction in wallet
   - Wait for confirmation (~5-10 seconds on testnet)

10. **Success!** You'll be redirected to your token's detail page

### C. Create a Bond Token

Bonds follow a similar creation process to Equity, with some bond-specific sections:

**Steps 1-2**: Same as Equity (Basic Information, Digital Security Permissions & Configuration)

**Bond-Specific Details**:

- **Start Date**: When the bond begins accruing interest
- Example: `2025-01-01`
- Interest calculations start from this date

- **Maturity Date**: When the bond expires and principal is due
- Bondholders receive final payment on this date
- Must be after Start Date

**Step 3: Proceed Recipients** (Bond-specific):

**What are Proceed Recipients?**
Authorized accounts that receive the capital raised from bond sales. When investors buy your bonds, the funds are sent to these designated recipients.

- **Why it's needed**:
  - Ensures bond proceeds go to legitimate recipients
  - Provides transparency about fund distribution
  - Enables multiple recipients (e.g., issuer, underwriters, escrow)

- **How to configure**:
  1. Click **"Add Proceed Recipient"**

  2. **Fill Form**:
     - **Address**: Hedera Account ID that will receive funds
       - Example: `0.0.xxx` (your treasury account)
     - **Data**: Optional metadata (hex format)
       - Example: `0x` (empty) or `0x1234abcd` (custom data)

  **Use Cases**:
  - **Single Recipient**: Send all proceeds to company treasury
  - **Multiple Recipients**: Split proceeds among stakeholders
  - **Escrow Account**: Hold proceeds until conditions met

  **Important Notes**:
  - ⚠️ At least one Proceed Recipient recommended
  - Can be modified after deployment
  - Only accounts with `PROCEED_RECIPIENT_MANAGER_ROLE` can modify
  - Actual fund distribution requires integration with payment system

**Steps 7-10**: Same as Equity (External Lists, ERC3643, Regulation, Review & Create)

---

## 5. Understanding Roles

### Core Roles in ATS

| Role                               | Description         | Key Permissions                           |
| ---------------------------------- | ------------------- | ----------------------------------------- |
| **DEFAULT_ADMIN_ROLE**             | Super admin         | Grant/revoke any role, full control       |
| **MINTER_ROLE**                    | Can mint tokens     | Issue new tokens to addresses             |
| **BURNER_ROLE**                    | Can burn tokens     | Destroy tokens from addresses             |
| **PAUSER_ROLE**                    | Emergency control   | Pause/unpause all operations              |
| **KYC_ROLE**                       | KYC manager         | Grant/revoke KYC status                   |
| **CONTROL_LIST_ROLE**              | Blacklist manager   | Add/remove from control list              |
| **SNAPSHOT_ROLE**                  | Snapshot creator    | Create balance snapshots                  |
| **CORPORATE_ACTION_ROLE**          | Corporate actions   | Create dividends/coupons                  |
| **SSI_MANAGER_ROLE**               | SSI management      | Manage trusted issuers                    |
| **INTERNAL_KYC_MANAGER_ROLE**      | Internal KYC toggle | Activate/deactivate internal KYC          |
| **CLEARING_ROLE**                  | Clearing operations | Manage clearing mode                      |
| **CLEARING_VALIDATOR_ROLE**        | Validate clearing   | Approve/cancel clearing ops               |
| **PROCEED_RECIPIENT_MANAGER_ROLE** | Proceed recipients  | Add/remove/update bond proceed recipients |

### Role Hierarchy

```
DEFAULT_ADMIN_ROLE (you, as creator)
├─ Can grant any role to anyone
├─ Full control over token
└─ Cannot be revoked by others
```

**Important**: As the token creator, you automatically have `DEFAULT_ADMIN_ROLE`.

---

## 6. Managing Roles

### View Current Roles

1. Go to your token's detail page
2. Click **"Roles"** tab
3. See all accounts and their roles

### Grant a Role to an Account

1. **Navigate**: Token Detail → **Roles** tab
2. Click **"Add Role"**
3. **Fill Form**:
   - **Account ID**: `0.0.1234567` (Hedera account to grant role)
   - **Role**: Select from dropdown (e.g., `MINTER_ROLE`)
4. Click **"Grant"**
5. Sign transaction in MetaMask

### Revoke a Role

1. **Navigate**: Token Detail → **Roles** tab
2. Find the account in the list
3. Click **trash icon** next to the role
4. Confirm revocation
5. Sign transaction

### Best Practices

- **Don't give DEFAULT_ADMIN_ROLE** to others unless absolutely necessary
- **Use specific roles** instead of admin (principle of least privilege)
- **Grant KYC_ROLE** to team members who handle KYC
- **Grant CORPORATE_ACTION_ROLE** to finance team for dividends
- **Keep PAUSER_ROLE** for emergency situations

---

## 7. KYC Management (2 Approaches)

You have **three ways** to manage KYC. Choose based on your needs:

### Approach 1: External KYC List

**Best for**: Quick testing, shared KYC across tokens

#### Step 1: Create External KYC Contract

1. Navigate to **"External KYC"** in main menu
2. Click **"Create New External KYC"**
3. Add Account ID (of yourself or other account)
4. Note the contract ID (`0.0.xxx`)

#### Step 2: Grant KYC to Accounts

1. In External KYC page, select your contract
2. Click **"Add Account"**
3. Enter **Account ID of external KYC contract**: `0.0.xxx`
4. Click **"Grant KYC"**
5. Sign transaction

**That's it!** No VC files, no complex setup.

#### Step 3: Link to Your Token

1. Go to your token's detail page
2. Navigate to **"External KYC" tab**
3. Click **"Add External KYC"**
4. Select your external KYC contract
5. Click **"Add"**
6. Sign transaction

Now any account KYC'd in that external contract is KYC'd for your token!

---

### Approach 2: Internal KYC with VC Files

**Best for**: Token-specific KYC, testing SSI features

#### Step 1: Enable Internal KYC (if not already done during Token creation)

1. Go to token detail → **"Danger Zone"**
2. Toggle **"Internal KYC"** to **Active**

#### Step 2: Add Yourself as SSI Issuer

**What is an SSI Manager/Issuer?**

The **SSI Manager** manages the list of **trusted issuers** - entities authorized to sign Verifiable Credentials (VCs) that your token will accept for KYC purposes. Think of it like a whitelist of "trusted KYC providers."

- **SSI Manager Role** (`SSI_MANAGER_ROLE`): Can add/remove trusted issuers
- **Issuer**: An account that signs Verifiable Credentials
  - Can be you (self-issued KYC)
  - Can be a KYC service (Onfido, Jumio, etc.)
  - Can be a financial institution (bank, broker)
  - Can be a regulatory authority

    **Why add yourself as an issuer?**

  - For testing/development, you can issue VCs to yourself and others
  - Acts as your own "KYC authority"
  - In production, you'd add legitimate KYC providers instead

**How to add:**

1. Make sure you have assigned yourself the SSI Role under 'Roles'
2. Go to token detail → **"SSI Manager" tab**
3. Click **"Add Issuer"**
4. Enter your **Hedera Account ID**: `0.0.xxx` (the account that will sign VCs)
5. Click **"Add"**

Now your account is authorized to issue Verifiable Credentials that this token will trust for KYC.

#### Step 3: Generate VC Files

**What is a VC (Verifiable Credential)?**

A **Verifiable Credential (VC)** is a cryptographically signed digital certificate that proves someone has been KYC'd. It's like a digital passport for identity verification.

**VC File Structure:**

```json
{
  "issuer": "did:ethr:0xYOUR_ADDRESS", // Who issued it
  "credentialSubject": {
    "id": "did:ethr:0xHOLDER_ADDRESS", // Who it's for
    "kyc": "passed" // What it proves
  },
  "proof": {
    "proofValue": "0x123abc..." // Cryptographic signature
  },
  "validFrom": "2025-01-01", // Valid period
  "validUntil": "2026-12-31"
}
```

**Why use VC files?**

- **Portable**: Same VC works across multiple tokens
- **Privacy**: No need to store PII on-chain
- **Verifiable**: Cryptographically signed, can't be forged
- **Standard**: Based on W3C Verifiable Credentials standard

**Generating VC Files:**

For each user you want to KYC:

```bash
cd packages/ats/contracts

npx hardhat createVC \
  --holder USER_EVM_ADDRESS \
  --privatekey YOUR_PRIVATE_KEY
```

**Example**:

```bash
npx hardhat createVC \
  --holder 0x64958c5a7eab82xxxxxxxxxx \
  --privatekey 0x0caafdc84d59392c19xxxxxxxxxx
```

This creates: `vc_64958c5a7eab82xxxxxxxx.vc` (in the `/contracts` directory)

#### Step 4: Grant KYC via UI

1. Go to token detail → **"KYC" tab**
2. Click **"Add"** button
3. **Fill Form**:
   - **Account ID**: `0.0.1234567`
   - **VC File**: Upload the `.vc` file you generated
4. Click **"Create"**
5. Sign transaction

---

## 8. Token Operations

### Minting Tokens

**Requirement**: Must have `MINTER_ROLE`

1. Token detail → Operations tab -> Click **"Mint"**
2. **Fill Form**:
   - **To Account**: `0.0.1234567`
   - **Amount**: `1000`
3. Click **"Mint"**
4. Sign transaction

### Force Transfer Tokens

**Requirements**:

- Sender must be KYC'd
- Receiver must be KYC'd
- Token not paused

1. As a token holder, go to token page
2. Operations tab -> Click **"Force Transfer"**
3. **Fill Form**:
   - **Source**: `0.0.xxx`
   - **Destination**: `0.0.xxx`
   - **Amount**: `100`
4. Click **"Transfer"**
5. Sign transaction

### Force Redeem Tokens

1. As a token holder, go to token page
2. Operations tab -> Click **"Force Redeem"**
3. **Fill Form**:
   - **Source**: `0.0.xxx`
   - **Amount**: `100`
4. Click **"Redeem"**
5. Sign transaction

### Pausing Operations

**Requirement**: Must have `PAUSER_ROLE`

1. Token detail → **"Danger Zone"**
2. Toggle **"Pause Security Token"** to **Active**
3. All transfers/operations are now blocked
4. Toggle back to **Inactive** to resume

---

## 9. Corporate Actions

1. Token detail → **"Corporate Actions" tab**
2. See all dividends/coupons
3. View status, dates, and amounts
4. Check holders affected

---

## 10 Troubleshooting

### Common Issues

#### "The selected Account in Metamask is not a Hedera account"

**Problem**: MetaMask account not recognized as Hedera account

**Solution**:

1. Create ECDSA account on [Hedera Portal](https://portal.hedera.com/)
2. Export private key
3. Import to MetaMask
4. Switch MetaMask to Hedera Testnet (Chain ID 296)

#### "Contract Not Found" or "Invalid Contract"

**Problem**: Web app pointing to wrong contract addresses

**Solution**:

1. Check `deployed-contracts.json` for correct addresses: Web App needs Factory Contract (NOT Proxy!) and Resolver Proxy Contract.
2. Update `apps/ats/web/.env`:
   ```bash
   REACT_APP_RPC_RESOLVER='0.0.CORRECT_ID'
   REACT_APP_RPC_FACTORY='0.0.CORRECT_ID'
   ```
3. Restart web app: `npm run dev`

#### "Insufficient HBAR Balance"

**Problem**: Not enough HBAR for gas fees

**Solution**:

1. Go to [Hedera Portal](https://portal.hedera.com/)
2. Request testnet HBAR (free)
3. Wait for funds to arrive (~1 minute)

#### "KYC Not Granted" Error During Transfer

**Problem**: Either sender or receiver not KYC'd

**Solution**:

1. Check KYC status in token's "KYC" tab
2. Grant KYC to both parties
3. Retry transfer

#### Bond/Equity Creation Fails

**Problem**: Multiple possible causes

**Solutions**:

- Ensure sufficient HBAR balance (>$10 HBAR recommended)
- Check all required fields filled
- Verify contract addresses in `.env` are correct
- Check browser console for detailed errors

---

## Quick Reference Commands

### Contract Deployment

```bash
cd packages/ats/contracts
npx hardhat deployAll --use-deployed false --network testnet
```

### Generate VC File

```bash
npx hardhat createVC --holder 0xUSER_ADDRESS --privatekey 0xYOUR_KEY
```

### Start Web App

```bash
cd apps/ats/web
npm run dev
```

### Check Deployed Contracts

```bash
cd packages/ats/contracts
cat deployed-contracts.json | jq
```

---

_Last Updated: 2025-11-05_
