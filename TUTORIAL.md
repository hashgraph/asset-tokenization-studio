# Asset Tokenization Studio - Complete Tutorial

> **A comprehensive guide to creating and managing tokenized securities on Hedera**

Welcome to the Asset Tokenization Studio (ATS)! This tutorial will walk you through everything you need to know to create, deploy, and manage security tokens on the Hedera network.

---

## Quick Links

- **For the full Documentation**: See the [Official ATS Documentation on the Hedera Website](https://docs.hedera.com/hedera/open-source-solutions/asset-tokenization-studio-ats)
- **For a visual quick-start guide**: See the [UI Walkthrough on the Hedera Website](https://docs.hedera.com/hedera/open-source-solutions/asset-tokenization-studio-ats/web-user-interface-ui) (with screenshots)
- **For the Video Tutorial**: See the [ATS UI Tutorial on the Hedera Youtube Channel](https://www.youtube.com/watch?v=U3_Btg663Rs)
- **Need help?** Check the [Troubleshooting](#10-troubleshooting) section

## Table of Contents

1. [Prerequisites & Setup](#1-prerequisites--setup)
2. [Initial Configuration](#2-initial-configuration)
3. [Deploying Contracts](#3-deploying-contracts)
4. [Creating Your First Security Token](#4-creating-your-first-security-token)
5. [Understanding Roles](#5-understanding-roles)
6. [Managing Roles](#6-managing-roles)
7. [KYC Management](#7-kyc-management-2-approaches)
8. [Token Operations](#8-token-operations)
9. [Corporate Actions](#9-corporate-actions)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites & Setup

### What You Need

Before you begin, make sure you have the following:

#### Hedera Testnet Account

- **Create account** at [Hedera Portal](https://portal.hedera.com/)
- **Fund with testnet HBAR** (free from portal)
- **Save your Account ID** (format: `0.0.xxx`)

#### A Wallet (Metamask or HashPack via Wallet Connect)

Follow these steps to set up MetaMask with Hedera:

1. **Install** eg [MetaMask browser extension](https://metamask.io/)
2. **Create an ECDSA account** on Hedera Portal
3. **Export private key** from Hedera Portal
4. **Import to MetaMask** using the private key
5. **Add Hedera Testnet network** with these settings:

   | Setting         | Value                           |
   | --------------- | ------------------------------- |
   | Network Name    | `Hedera Testnet`                |
   | RPC URL         | `https://testnet.hashio.io/api` |
   | Chain ID        | `296` (or `0x128`)              |
   | Currency Symbol | `HBAR`                          |
   | Block Explorer  | `https://hashscan.io/testnet`   |

#### Development Environment

```bash
node >= 20.19.4
npm >= 10.9.0
```

---

### Installation

```bash
# Clone the repository
git clone https://github.com/hashgraph/asset-tokenization-studio.git
cd asset-tokenization-studio

# Install dependencies
npm install

# Navigate to contracts directory
cd packages/ats/contracts
```

---

## 2. Initial Configuration

You'll need to configure two environment files: one for contracts and one for the web application.

### Configure Contract Environment

Choose your network: **mainnet**, **testnet**, **previewnet**, or **local** (for 'solo' deployment).

**Edit:** `packages/ats/contracts/.env`

Example for Testnet:

```bash
# Your private key (from Hedera Portal)
TESTNET_PRIVATE_KEY_0='0xYOUR_PRIVATE_KEY_HERE'

# Network endpoints (already configured)
TESTNET_JSON_RPC_ENDPOINT='https://testnet.hashio.io/api'
TESTNET_MIRROR_NODE_ENDPOINT='https://testnet.mirrornode.hedera.com'
```

---

## 3. Deploying Contracts

### Deploy to Testnet

Navigate to the contracts directory and deploy all necessary contracts:

```bash
cd packages/ats/contracts

# For testing:
npx hardhat deployAll --use-deployed false --network testnet

# For mainnet:
npx hardhat deployAll --use-deployed false --network mainnet
```

**What this does:**

- Deploys Factory contract
- Deploys Resolver contract
- Deploys all facets (ERC20, KYC, Pause, etc.)
- Creates `deployed-contracts.json` file

This typically takes around 5-10 minutes on testnet.

---

### Update Web Configuration

After deployment completes, you need to update the web app with your contract addresses.

1. **Open** `packages/ats/contracts/deployed-contracts.json`
2. **Find** these contract IDs:
   - **Business Logic Resolver Proxy** → `contractId`
   - **Factory** → `contractId`
3. **Update** `apps/ats/web/.env`:

```bash
# Network selection
REACT_APP_NETWORK='testnet'

# Mirror node and RPC
REACT_APP_MIRROR_NODE='https://testnet.mirrornode.hedera.com/api/v1/'
REACT_APP_RPC_NODE='https://testnet.hashio.io/api'

# Update these values from deployed-contracts.json
REACT_APP_RPC_RESOLVER='0.0.xxx'  # Business Logic Resolver Proxy contractId
REACT_APP_RPC_FACTORY='0.0.xxx'   # Factory contractId

# Config IDs (default - no changes needed)
REACT_APP_EQUITY_CONFIG_ID='0x0000000000000000000000000000000000000000000000000000000000000001'
REACT_APP_EQUITY_CONFIG_VERSION='0'
REACT_APP_BOND_CONFIG_ID='0x0000000000000000000000000000000000000000000000000000000000000002'
REACT_APP_BOND_CONFIG_VERSION='0'
```

> **⚠️ Important**: Use the **Factory** contract ID (NOT the Factory Proxy) and the **Resolver Proxy** contract ID.

---

### Start the Web Application

```bash
cd apps/ats/web
npm run dev
```

**Access your app at:** `http://localhost:5173`

You should now see the Asset Tokenization Studio interface.

---

## 4. Creating Your First Security Token

This section walks you through creating both equity and bond tokens.

### A. Connect Your Wallet

1. **Open** the web app at `http://localhost:5173`
2. **Click** one of the connection options:
   - **"Connect Metamask"** - for MetaMask users
   - **"Connect Wallet Connect"** - for other wallets (choose HashPack in the modal)
3. **Ensure** you're on Hedera Testnet in MetaMask (Chain ID: 296)
4. **Approve** the connection request

You should see your account address displayed in the top-right corner.

---

### B. Create an Equity Token

Follow this step-by-step guide to create your first equity token.

#### Step 1: Navigate to Creation Page

**Click:** "Create Security" → "Equity"

#### Step 2: Basic Information

Fill in the fundamental details of your equity token:

| Field        | Example Value      | Description                                                       |
| ------------ | ------------------ | ----------------------------------------------------------------- |
| **Name**     | `My Company Stock` | Full name of the token                                            |
| **Symbol**   | `MCS`              | Ticker symbol (3-5 characters)                                    |
| **Decimals** | `6`                | Standard is `6`, use `0` for whole shares, `18` for max precision |
| **ISIN**     | `US1234532117`     | International Securities Identification Number                    |

#### Step 3: Digital Security Permissions

Choose the control mechanisms for your token (select one or more):

<details>
<summary><strong>Controllable</strong> - Admin control for compliance</summary>

**What it does:** Enables admin to force transfer/redeem tokens between any accounts

**Use cases:**

- Regulatory compliance
- Court orders
- Emergency recovery

**Grants:** `CONTROLLER_ROLE` the ability to move tokens without owner consent

**Example:** Move tokens from compromised account to recovery address

</details>

<details>
<summary><strong>🚫 Blocklist</strong> - Deny-list approach</summary>

**What it does:** Block specific countries from holding/trading

**Use cases:**

- Sanctioned addresses
- Fraud prevention

**Behavior:**

- Accounts on blocklist cannot send or receive tokens
- More permissive: everyone allowed except blocked countries
</details>

<details>
<summary><strong>✅ Approval List</strong> - Allow-list approach</summary>

**What it does:** Only approved countries can hold/trade

**Use cases:**

- Highly regulated securities
- Private placements

**Behavior:**

- Only countries on approval list can participate
- More restrictive: everyone blocked except approved countries
</details>

---

#### Step 4: Digital Security Configuration

<details>
<summary><strong>Clearing Mode</strong> (Default: Unchecked)</summary>

**What it does:** Enables two-step settlement requiring validator approval

**How it works:**

1. User initiates transfer/redemption/hold → Operation created (pending)
2. Clearing Validator reviews operation → Approves or Cancels
3. If approved → Operation executes
4. If cancelled/expired → User can reclaim tokens
</details>

<details>
<summary><strong>Internal KYC Activated</strong></summary>

**What it does:** Simplified KYC system without external dependencies

**How it works:**

- KYC managed directly within the token contract
- No need for External KYC List contracts
- SSI Manager grants/revokes KYC
- Requires VC files for compliance tracking

**Impact:** KYC managed in token vs separate contract

</details>

> **📝 Note**: You can add Internal KYC later from the token's detail page.

---

#### Step 5: Specific Details (Equity Economic Information)

Configure the economic parameters of your equity token:

| Field                | Example   | Description                                               |
| -------------------- | --------- | --------------------------------------------------------- |
| **Nominal Value**    | `10.00`   | Value of each token in the selected currency (face value) |
| **Currency**         | `USD`     | Currency for nominal value (USD, EUR, GBP, etc.)          |
| **Number of Shares** | `1000000` | Total maximum supply of equity (sets the supply cap)      |
| **Total Value**      | `$10M`    | Auto-calculated: `Number of Shares × Nominal Value`       |

**Rights and Privileges** - Select applicable shareholder rights:

- ☐ **Voting Rights** - Holders can vote on governance
- ☐ **Information Rights** - Access to company information
- ☐ **Liquidation Rights** - Claims in liquidation
- ☐ **Preferred Dividends Rights** - Priority dividend payments
- ☐ **Common Dividends Rights** - Standard dividend payments
- ☐ **Conversion Rights** - Convert to other securities
- ☐ **Subscription Rights** - Pre-emptive purchase rights
- ☐ **Redemption Rights** - Can be redeemed by issuer
- ☐ **Put Rights** - Holder can force issuer to buy back

**Dividend Type:**

- **None** - No dividends
- **Preferred** - Priority dividends
- **Common** - Standard dividends

---

#### Step 6: External Lists (Optional)

> **What are External Lists?** External contracts that manage KYC, Control, or Pause functionality across multiple tokens.

<details>
<summary><strong>External KYC List</strong> (Optional)</summary>

- Select previously deployed External KYC contracts
- Accounts KYC'd in those contracts are automatically KYC'd for this token
- **Use case:** Share KYC across multiple securities
- Can select multiple External KYC contracts

</details>

<details>
<summary><strong>🎛️ External Control List</strong> (Optional)</summary>

- Select External Control contracts (blocklist/approval list)
- Shares control rules across tokens
- Can select multiple External Control contracts

</details>

<details>
<summary><strong>⏸️ External Pause List</strong> (Optional)</summary>

- Select External Pause contracts
- Allows external contract to pause this token
- **Use case:** Emergency pause across multiple tokens

</details>

> **📝 Note**: You can add External Lists later from the token's detail page.

---

#### Step 7: ERC3643 (Optional - T-REX Standard)

> **What is ERC3643?** T-REX (Token for Regulated EXchanges) is a standard for compliant security tokens with built-in compliance and identity management.

**Configuration Options:**

| Field                             | Description                                                               | Recommendation                 |
| --------------------------------- | ------------------------------------------------------------------------- | ------------------------------ |
| **Compliance Contract ID**        | Hedera account ID of compliance contract that handles transfer rules      | ⚠️ Skip for standard use cases |
| **Identity Registry Contract ID** | Hedera account ID of identity registry for on-chain identity verification | ⚠️ Skip for standard use cases |

**When to use ERC3643:**

- ✅ You need ERC-3643 Token Standard
- ✅ You're integrating with T-REX ecosystem
- ✅ You want to point to preconfigured registries
- ❌ Standard security token (use built-in features instead)

---

#### Step 8: Regulation (Set Regulatory Framework)

**Jurisdiction:** United States _(more jurisdictions coming soon)_

**Select Regulation Type:**

<details>
<summary><strong>🌍 Regulation S</strong> - International offerings</summary>

Offers made outside the United States

- ✅ International investors
- ✅ No SEC registration required
- ⚠️ Restrictions on U.S. resales
</details>

<details>
<summary><strong>🇺🇸 Regulation D 506(b)</strong> - Limited non-accredited investors</summary>

Private placements in the United States

- Up to 35 non-accredited investors
- No general solicitation
- Manual investor verification
- Unlimited accredited investors
</details>

<details>
<summary><strong>🇺🇸 Regulation D 506(c)</strong> - Accredited investors only</summary>

Private placements in the United States

- Only accredited investors
- General solicitation allowed
- Must verify accredited status
- No investor limits
</details>

**Country Lists:**

| List Type                           | Purpose                                          | Example                                       |
| ----------------------------------- | ------------------------------------------------ | --------------------------------------------- |
| **Authorization List** (Allow-list) | Select countries whose investors ARE allowed     | Select "United States" for U.S.-only offering |
| **Block List** (Deny-list)          | Select countries whose investors are NOT allowed | Block sanctioned countries                    |

---

#### Step 9: Review & Create

Before finalizing your token review all details carefully.

1. Click **"Create Equity"**
2. **Sign transaction** in your wallet
3. **Wait for confirmation** (~5-10 seconds on testnet)

---

#### Step 10: Success!

You'll be redirected to your token's detail page where you can manage your newly created security token.

---

### C. Create a Bond Token

Bonds follow a similar creation process to Equity, with some bond-specific sections.

#### Shared Steps

**Steps 1-2:** Same as Equity

- Basic Information
- Digital Security Permissions
- Digital Security Configuration

#### Bond-Specific Configuration

**Start & Maturity Dates:**

| Field             | Example      | Description                                                           |
| ----------------- | ------------ | --------------------------------------------------------------------- |
| **Start Date**    | `2025-01-01` | When the bond begins accruing interest                                |
| **Maturity Date** | `2026-01-01` | When the bond expires and principal is due (must be after Start Date) |

---

#### Proceed Recipients (Bond-Specific)

> **What are Proceed Recipients?** Authorized accounts that receive the capital raised from bond sales.

**Why it's needed:**

- Ensures bond proceeds go to legitimate recipients
- Provides transparency about fund distribution
- Enables multiple recipients (issuer, underwriters, escrow)

**How to configure:**

1. Click **"Add Proceed Recipient"**
2. Fill in the form:

| Field       | Example              | Description                                                             |
| ----------- | -------------------- | ----------------------------------------------------------------------- |
| **Address** | `0.0.xxx`            | Hedera Account ID that will receive funds (e.g., your treasury account) |
| **Data**    | `0x` or `0x1234abcd` | Optional metadata in hex format                                         |

**Use Cases:**

- **Single Recipient:** Send all proceeds to company treasury
- **Multiple Recipients:** Split proceeds among stakeholders
- **Escrow Account:** Hold proceeds until conditions met

---

**Remaining Steps:** Same as Equity

- Step 7: External Lists
- Step 8: ERC3643
- Step 9: Regulation
- Step 10: Review & Create

---

## 5. Understanding Roles

Roles define permissions and access control for your security token. Understanding these roles is crucial for proper token management.

### Core Roles in ATS

| Role                               | Description         | Key Permissions                           |
| ---------------------------------- | ------------------- | ----------------------------------------- |
| **DEFAULT_ADMIN_ROLE**             | Super admin         | Grant/revoke any role, full control       |
| **MINTER_ROLE**                    | Token minter        | Issue new tokens to addresses             |
| **BURNER_ROLE**                    | Token burner        | Destroy tokens from addresses             |
| **PAUSER_ROLE**                    | ⏸Emergency control | Pause/unpause all operations              |
| **KYC_ROLE**                       | KYC manager         | Grant/revoke KYC status                   |
| **CONTROL_LIST_ROLE**              | Blacklist manager   | Add/remove from control list              |
| **SNAPSHOT_ROLE**                  | Snapshot creator    | Create balance snapshots                  |
| **CORPORATE_ACTION_ROLE**          | Corporate actions   | Create dividends/coupons                  |
| **SSI_MANAGER_ROLE**               | SSI management      | Manage trusted issuers                    |
| **INTERNAL_KYC_MANAGER_ROLE**      | Internal KYC toggle | Activate/deactivate internal KYC          |
| **CLEARING_ROLE**                  | Clearing operations | Manage clearing mode                      |
| **CLEARING_VALIDATOR_ROLE**        | Validate clearing   | Approve/cancel clearing operations        |
| **PROCEED_RECIPIENT_MANAGER_ROLE** | Proceed recipients  | Add/remove/update bond proceed recipients |

---

### 📊 Role Hierarchy

```
DEFAULT_ADMIN_ROLE (you, as token creator)
├─ ✅ Can grant any role to anyone
├─ ✅ Full control over token
└─ 🔒 Cannot be revoked by others
```

As the token creator, you automatically receive `DEFAULT_ADMIN_ROLE`.

---

## 6. Managing Roles

Learn how to grant and revoke roles for your security token.

### View Current Roles

1. Navigate to your token's detail page
2. Click the **"Roles"** tab
3. View all accounts and their assigned roles

---

### Grant a Role to an Account

**Steps:**

1. **Navigate**: Token Detail → **Roles** tab
2. Click **"Add Role"**
3. **Fill in the form**:

   | Field          | Example       | Description                        |
   | -------------- | ------------- | ---------------------------------- |
   | **Account ID** | `0.0.1234567` | Hedera account to receive the role |
   | **Role**       | `MINTER_ROLE` | Select from dropdown menu          |

4. Click **"Grant"**
5. **Sign transaction** in MetaMask

---

### Revoke a Role

**Steps:**

1. **Navigate**: Token Detail → **Roles** tab
2. Find the account in the roles list
3. Remove the role
4. Confirm revocation in the modal
5. **Sign transaction** in MetaMask

---

### Best Practices

Follow these guidelines for secure role management:

| Practice                         | Recommendation                                   |
| -------------------------------- | ------------------------------------------------ |
| **DEFAULT_ADMIN_ROLE**           | Don't give to others unless absolutely necessary |
| **Principle of Least Privilege** | Use specific roles instead of admin              |
| **KYC_ROLE**                     | Grant to team members who handle KYC             |
| **CORPORATE_ACTION_ROLE**        | Grant to finance team for dividends              |
| **PAUSER_ROLE**                  | Keep for emergency situations only               |

---

## 7. KYC Management

Know Your Customer (KYC) is essential for regulatory compliance. ATS offers two flexible approaches for KYC management.

### External KYC List

#### Step 1: Create External KYC Contract

1. Navigate to **"External KYC"** in the main menu
2. Click **"Create New External KYC"**
3. Add your Account ID (or another account's ID)
4. **Save the contract ID** (format: `0.0.xxx`)

---

#### Step 2: Grant KYC to Accounts

1. In the External KYC page, select your contract
2. Click **"Add Account"**
3. Enter the **Account ID** of the account to KYC: `0.0.xxx`
4. Click **"Grant KYC"**
5. **Sign transaction** in your wallet

---

#### Step 3: Link to Your Token

1. Go to your token's detail page
2. Navigate to the **"External KYC"** tab
3. Click **"Add External KYC"**
4. Select your external KYC contract from the dropdown
5. Click **"Add"**
6. **Sign transaction**

> **🎉 Success!** Any account KYC'd in that external contract is now KYC'd for your token.

---

### Internal KYC with VC Files

#### Step 1: Enable Internal KYC

If you didn't enable Internal KYC during token creation:

1. Go to token detail → **"Danger Zone"** tab
2. Toggle **"Internal KYC"** to **Active**
3. Sign the transaction

---

#### Step 2: Add Yourself as SSI Issuer

<details>
<summary><strong>📚 What is an SSI Manager/Issuer?</strong></summary>

The **SSI Manager** manages a list of **trusted issuers** - entities authorized to sign Verifiable Credentials (VCs) that your token accepts for KYC. Think of it as a whitelist of "trusted KYC providers."

**Roles:**

- **SSI Manager Role** (`SSI_MANAGER_ROLE`): Can add/remove trusted issuers
- **Issuer**: An account that signs Verifiable Credentials

**Who can be an issuer?**

- You (self-issued KYC for testing)
- KYC service providers (Onfido, Jumio, etc.)
- Financial institutions (banks, brokers)
- Regulatory authorities

**Why add yourself as an issuer?**

- For testing/development, you can issue VCs to yourself and others
- Acts as your own "KYC authority"
- In production, you'd add legitimate KYC providers instead
</details>

**How to add yourself as an issuer:**

1. Ensure you have **SSI_MANAGER_ROLE** (assign under **'Roles'** tab)
2. Go to token detail → **"SSI Manager"** tab
3. Click **"Add Issuer"**
4. Enter your **Hedera Account ID**: `0.0.xxx` (the account that will sign VCs)
5. Click **"Add"** and sign transaction

---

#### Step 3: Generate VC Files

<details>
<summary><strong>📚 What is a VC (Verifiable Credential)?</strong></summary>

A **Verifiable Credential (VC)** is a cryptographically signed digital certificate that proves someone has been KYC'd. Think of it as a digital passport for identity verification.

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
  "validFrom": "2025-01-01", // Valid period start
  "validUntil": "2026-12-31" // Valid period end
}
```

**Generate VC files for each user:**

```bash
cd packages/ats/contracts

npx hardhat createVC \
  --holder USER_EVM_ADDRESS \
  --privatekey YOUR_PRIVATE_KEY
```

**Example:**

```bash
npx hardhat createVC \
  --holder 0x64958c5a7eab82xxxxxxxxxx \
  --privatekey 0x0caafdc84d59392c19xxxxxxxxxx
```

**Output:** Creates `vc_64958c5a7eab82xxxxxxxx.vc` in the `/contracts` directory

---

#### Step 4: Grant KYC via UI

1. Go to token detail → **"KYC"** tab
2. Click **"Add"** button
3. **Fill in the form**:

   | Field          | Example       | Description                  |
   | -------------- | ------------- | ---------------------------- |
   | **Account ID** | `0.0.1234567` | Hedera account to grant KYC  |
   | **VC File**    | Upload file   | The `.vc` file you generated |

4. Click **"Create"**
5. **Sign transaction**

The account is now KYC'd for your token.

---

## 8. Token Operations

Perform common operations on your security token.

### Minting Tokens

> **Requirement**: Must have `MINTER_ROLE`

**Steps:**

1. Token detail → **Operations** tab → Click **"Mint"**
2. **Fill in the form**:

   | Field          | Example       | Description                      |
   | -------------- | ------------- | -------------------------------- |
   | **To Account** | `0.0.1234567` | Hedera account to receive tokens |
   | **Amount**     | `1000`        | Number of tokens to mint         |

3. Click **"Mint"**
4. **Sign transaction**

---

### Force Transfer Tokens

> **Requirements**: Sender and receiver must be KYC'd, token not paused, must have `CONTROLLER_ROLE`

**Steps:**

1. Go to token detail page
2. **Operations** tab → Click **"Force Transfer"**
3. **Fill in the form**:

   | Field           | Example   | Description                  |
   | --------------- | --------- | ---------------------------- |
   | **Source**      | `0.0.xxx` | Account to transfer from     |
   | **Destination** | `0.0.xxx` | Account to transfer to       |
   | **Amount**      | `100`     | Number of tokens to transfer |

4. Click **"Transfer"**
5. **Sign transaction**

---

### Force Redeem Tokens

> **Requirement**: Must have `CONTROLLER_ROLE`

**Steps:**

1. Go to token detail page
2. **Operations** tab → Click **"Force Redeem"**
3. **Fill in the form**:

   | Field      | Example   | Description                   |
   | ---------- | --------- | ----------------------------- |
   | **Source** | `0.0.xxx` | Account to redeem tokens from |
   | **Amount** | `100`     | Number of tokens to redeem    |

4. Click **"Redeem"**
5. **Sign transaction**

---

### Pausing Operations

> **Requirement**: Must have `PAUSER_ROLE`

**Emergency pause all token operations:**

1. Token detail → **"Danger Zone"** tab
2. Toggle **"Pause Security Token"** to **Active**
3. **Sign transaction**

> **⚠️ Warning**: All transfers and operations are now blocked.

**To resume operations:**

1. Toggle back to **Inactive**
2. **Sign transaction**

---

## 9. Corporate Actions

View and manage dividends and coupons for your security token.

### View Corporate Actions

1. Navigate to token detail → **"Corporate Actions"** tab
2. **See all corporate actions** including:
   - Dividends (for equity tokens)
   - Coupons (for bond tokens)
3. **View details** for each action:
   - Status (pending, executed, cancelled)
   - Payment dates
   - Distribution amounts
   - Number of holders affected

---

## 10. Troubleshooting

Common issues and their solutions.

### Common Issues

---

#### "The selected Account in Metamask is not a Hedera account"

**Problem:** MetaMask account not recognized as Hedera account

**Solution:**

1. Create an **ECDSA account** on [Hedera Portal](https://portal.hedera.com/)
2. **Export private key** from Hedera Portal
3. **Import to MetaMask** using the private key
4. **Switch to Hedera Testnet** network (Chain ID: 296)

---

#### "Contract Not Found" or "Invalid Contract"

**Problem:** Web app pointing to wrong contract addresses

**Solution:**

1. **Check** `packages/ats/contracts/deployed-contracts.json` for correct addresses
   - Web app needs: **Factory Contract** (NOT Proxy!) and **Resolver Proxy Contract**
2. **Update** `apps/ats/web/.env`:
   ```bash
   REACT_APP_RPC_RESOLVER='0.0.CORRECT_ID'
   REACT_APP_RPC_FACTORY='0.0.CORRECT_ID'
   ```
3. **Restart** web app:
   ```bash
   cd apps/ats/web
   npm run dev
   ```

---

#### "Insufficient HBAR Balance"

**Problem:** Not enough HBAR for gas fees

**Solution:**

1. Go to [Hedera Portal](https://portal.hedera.com/)
2. **Request testnet HBAR** (free)
3. **Wait** for funds to arrive (~1 minute)

---

#### "KYC Not Granted" Error During Transfer

**Problem:** Either sender or receiver not KYC'd

**Solution:**

1. **Check KYC status** in token's **"KYC"** tab
2. **Grant KYC** to both sender and receiver
3. **Retry transfer**

---

## 📌 Quick Reference Commands

Handy commands for common tasks.

### Contract Deployment

```bash
cd packages/ats/contracts
npx hardhat deployAll --use-deployed false --network testnet
```

---

### Generate VC File

```bash
cd packages/ats/contracts
npx hardhat createVC --holder 0xUSER_ADDRESS --privatekey 0xYOUR_KEY
```

---

### Start Web App

```bash
cd apps/ats/web
npm run dev
```

---

### Check Deployed Contracts

```bash
cd packages/ats/contracts
cat deployed-contracts.json | jq
```

---

### Additional Resources

- [Official ATS Documentation](https://docs.hedera.com/hedera/open-source-solutions/asset-tokenization-studio-ats/web-user-interface-ui)
- [Hedera Portal](https://portal.hedera.com/)
- [Hedera Testnet Explorer](https://hashscan.io/testnet)

---

_Last Updated: 2025-11-06_
