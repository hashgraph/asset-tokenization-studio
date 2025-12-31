---
id: creating-bond
title: Creating Bond Tokens
sidebar_label: Creating Bonds
sidebar_position: 2
---

# Creating Bond Tokens

Learn how to create bond tokens representing debt securities with maturity dates and coupon payments using the ATS web application.

## Overview

Bond tokens represent debt securities issued by companies or organizations. They include features like:

- Fixed maturity date for principal redemption
- Periodic coupon (interest) payments to bondholders
- Transfer restrictions and compliance rules
- Configurable payment schedules and terms

## Prerequisites

- ATS web application running and accessible
- Hedera wallet connected (HashPack, Blade, or MetaMask)
- Sufficient HBAR for transaction fees
- Business Logic Resolver and Factory contracts deployed

## Getting Started

1. Open the ATS web application
2. Click "Create Token" in the navigation menu
3. Select "Bond" as the token type

![Create Security Token](../../images/ats-web-create-security.png)

## Step 1: Bond Details

### General Information

**Name**: The full name of your bond security

- Example: "Acme Corporation 5-Year Bond"
- Include issuer name and key terms

**Symbol**: A short ticker symbol (2-8 characters)

- Example: "ACME-BOND" or "ACME5Y"
- Recommended format: `[ISSUER]-[TYPE][TERM]`

**Decimals**: Number of decimal places for bond units

- Typical value: 6 (allows fractional bonds)
- Use 0 for whole bonds only
- Use higher values (6-8) for institutional-grade bonds

**ISIN**: International Securities Identification Number

- Format: 2-letter country code + 9 alphanumeric characters + 1 check digit
- Example: `US9311421039`
- Must follow the ISO 6166 standard format
- Required for regulatory compliance and international trading

### Bond Permissions

Configure administrative permissions for the bond token:

**Controllable**

- **Purpose**: Enable forced transfers and balance adjustments
- **When enabled**: Grants CONTROLLER_ROLE the ability to:
  - Force transfer bonds between accounts (e.g., court orders)
  - Adjust balances for regulatory compliance
  - Execute restructuring operations
- **Use cases**: Debt restructuring, regulatory requirements, lost key recovery
- **Recommendation**: Enable only if required by regulation or corporate policies

**Blocklist (Blacklist)**

- **Purpose**: Block specific addresses from holding bonds
- **How it works**: Addresses on the list cannot receive or hold bond tokens
- **Use cases**: Sanctioned entities, defaulted bondholders, regulatory blacklists
- **When to use**: When you want to block specific addresses but allow everyone else

**Approval list (Whitelist)**

- **Purpose**: Only approved addresses can hold bonds
- **How it works**: Only addresses on the list can receive bond tokens
- **Use cases**: Qualified institutional buyers (QIBs), accredited investors only
- **When to use**: When you want to restrict bond ownership to pre-approved addresses only

> **Important**: You must choose **either** blocklist **or** approval list (whitelist), not both. They are mutually exclusive options.

### Bond Configuration

**Clearing Mode Enabled**

- **Purpose**: Require validator approval for all transfers and redeems
- **What it does**:
  - Users must submit transfer/redeem requests
  - Validators (CLEARING_VALIDATOR_ROLE) must approve before execution
  - Enables regulatory oversight of all token movements
- **When to enable**:
  - Regulatory compliance requires approval workflow
  - Jurisdiction-specific rules need validation
  - Manual review required for transfers
- **Roles activated**: CLEARING_ROLE, CLEARING_VALIDATOR_ROLE

> **Learn more**: See [Clearing Operations](./clearing-operations.md) for complete guide on using clearing mode.

**Internal KYC Activated**

- **Purpose**: Enable/disable internal KYC verification
- **Flag**: Controls whether token uses its own KYC registry
- **When enabled**: Token checks internal KYC registry before allowing transfers
- **When disabled**: Only external KYC lists and SSI are checked
- **Use cases**:
  - Enable: Use token's own bondholder verification database
  - Disable: Rely entirely on external KYC providers or SSI

> **Tip**: You can use Internal KYC + External KYC Lists + SSI simultaneously. Any method granting KYC allows the transfer.

## Step 2: Bond Configuration

### Bond Terms

**Currency**

- **Value**: USD (US Dollar)
- **Purpose**: Currency for bond denomination and payments
- **Note**: Currently fixed to USD, cannot be changed. All coupon payments and redemptions use USD

**Number of Bond Units**

- **Definition**: Total number of bond units to issue
- **Example**: 10,000 bonds
- **Considerations**:
  - Smaller issuances: 100-1,000 bonds
  - Medium issuances: 1,000-100,000 bonds
  - Large issuances: 100,000+ bonds
- **Note**: With decimals enabled, each unit can be fractional

**Nominal Value (Face Value)**

- **Definition**: Par value of each bond unit
- **Example**: $1,000 per bond (standard corporate bond)
- **Common values**:
  - Corporate bonds: $1,000 or $5,000
  - Government bonds: $1,000, $5,000, $10,000
  - Institutional bonds: $100,000 or $1,000,000
- **Use**: Determines principal amount paid at maturity

**Total Value**

- **Calculation**: Automatically computed
- **Formula**: Number of Bond Units × Nominal Value
- **Example**: 10,000 bonds × $1,000 = $10,000,000 total value
- **Note**: This is the total principal amount to be raised

### Bond Dates

**Starting Date (Mint Date)**

- **Definition**: Date when bonds are issued and start accruing interest
- **Also called**: Issue date, settlement date
- **Considerations**:
  - Must be present or future date
  - First coupon period starts from this date
- **Use**: Determines when bondholders can start trading

**Maturity Date**

- **Definition**: Date when bond principal is redeemed
- **Requirements**: Must be after starting date
- **Considerations**:
  - Short-term: 1-3 years
  - Medium-term: 3-10 years
  - Long-term: 10+ years
- **Use**: Determines when ISSUER must repay principal to bondholders

> **Important**: Coupon payment schedule is configured separately through the Corporate Actions interface after deployment.

## Step 3: Proceed Recipients

Proceed recipients are addresses that receive funds when bonds are issued or sold. This is optional but commonly used for treasury management.

### What are Proceed Recipients?

- **Purpose**: Automatically distribute bond proceeds to designated addresses
- **Use cases**:
  - Treasury wallet receives proceeds
  - Multi-signature wallets for corporate governance
  - Split proceeds between operating and reserve accounts
  - Escrow arrangements

### Adding Recipients

**Address**

- **Format**: Hedera Account ID (`0.0.xxxxxxx`) or EVM address (`0x...`)
- **Example**: `0.0.1234567` or `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`
- **Validation**: Must be valid Hedera account or EVM address

**Data**

- **Purpose**: Optional field for notes or reference information
- **Format**: Free text field
- **Example**: `Treasury wallet`, `Operating account`, `Reserve fund`
- **Note**: This is for informational purposes only

### Proceed Recipients Table

After adding recipients, they appear in a table:

| Address     | Data              | Actions |
| ----------- | ----------------- | ------- |
| 0.0.1234567 | Treasury wallet   | Remove  |
| 0.0.7654321 | Operating account | Remove  |

**Actions Available:**

- **Remove**: Delete a recipient from the list

> **Tip**: You can add multiple recipients to receive bond proceeds.

## Step 4: ERC-3643 Integration (Optional)

For advanced compliance features, integrate ERC-3643 (T-REX) contracts. This step is **optional** but provides enhanced regulatory compliance capabilities for bond offerings.

> **Note**: Bond tokens created by ATS are **already compatible** with ERC-3643 operations by default. ATS implements **partial ERC-3643 (T-REX) compliance** as part of its core architecture. This integration step is only required if you need **full ERC-3643 standard compatibility** with advanced T-REX features like custom Compliance Modules and Identity Registries. See [Developer Guide: ATS Contracts](../developer-guides/contracts/index.md) for architecture details.

### Compliance Module

**Purpose**: Enforces transfer rules and regulatory requirements

- **What it does**: Validates all bond transfers against compliance rules
- **Use cases**:
  - Complex regulatory requirements for cross-border bonds
  - Multi-jurisdiction debt offerings
  - Institutional-grade compliance
- **Configuration**: Requires deploying a Compliance Module contract

### Identity Registry

**Purpose**: Manages verified bondholder identities

- **What it does**: Maintains on-chain registry of verified bondholder identities
- **Use cases**:
  - Enhanced KYC management for bondholders
  - Investor identity verification
  - Regulatory reporting requirements
- **Configuration**: Requires deploying an Identity Registry contract

> **Important**: Both Compliance Module and Identity Registry must be deployed before token creation. See [Deployment Guide](../developer-guides/contracts/deployment.md) for instructions.

### When to Use ERC-3643

Use this step only if you need **full compatibility with the [ERC-3643 standard](https://www.erc3643.org/)**:

- **Standard compliance**: Need to ensure full compatibility with ERC-3643 (T-REX) specification
- **Interoperability**: Bond token must work with other ERC-3643 compliant systems
- **Third-party integrations**: Integration with platforms that require ERC-3643 compliance
- **Ecosystem compatibility**: Participating in ERC-3643 token ecosystems

### When to Skip

- **Most use cases**: ATS already provides partial ERC-3643 compliance for typical bond token operations
- **Custom compliance**: If you just need complex compliance, use ATS's built-in features (Internal KYC, External KYC Lists, Control Lists, Clearing Mode, etc.)
- **Testing/Development**: Prototyping bond structures without standard requirements

## Step 5: External Lists Configuration

In this step, you can link previously created external lists to your bond token. These are optional but recommended for multi-token issuers.

### External Pause Lists

External pause contracts allow coordinated pausing across multiple bonds:

- **What are they**: On-chain smart contracts that can pause all linked bonds
- **Where to configure**: Sidebar menu → External Pause
- **Use cases**: Platform-wide emergency stops, coordinated system upgrades, crisis management
- **How it works**: If any linked pause contract returns `isPaused() = true`, bond is paused
- **Link**: [Managing External Pause Lists](./managing-external-pause-lists.md)

**How to link:**

1. **Select from dropdown**: All your created pause contracts appear
2. **Add to token**: Click to link pause mechanism
3. **View linked**: See all currently linked pause contracts
4. **Remove**: Unlink if no longer needed

### External Control Lists

External control lists are reusable whitelists/blacklists shared across multiple bonds:

- **What are they**: On-chain smart contracts managing approved/blocked addresses
- **Where to configure**: Sidebar menu → Control Lists
- **Use cases**: Shared regulatory blacklists, multi-bond whitelists for institutional investors
- **Link**: [Managing External Control Lists](./managing-external-control-lists.md)

**How to link:**

1. **Select from dropdown**: All your created control lists appear
2. **Add to token**: Click to link whitelist or blacklist
3. **View linked**: See all currently linked control lists
4. **Remove**: Unlink if no longer needed

### External KYC Lists

External KYC lists verify bondholder identity across multiple bonds:

- **What are they**: On-chain smart contracts managing KYC-verified investors
- **Where to configure**: Sidebar menu → External KYC
- **Use cases**: Shared bondholder verification, third-party KYC providers, institutional investor registries
- **Link**: [Managing External KYC Lists](./managing-external-kyc-lists.md)

**How to link:**

1. **Select from dropdown**: All your created KYC lists appear
2. **Add to token**: Click to link KYC verification list
3. **View linked**: See all currently linked KYC lists
4. **Remove**: Unlink if no longer needed

> **Tip**: You can create external lists from the sidebar before or after bond creation.

## Step 6: Regulation

> **Important**: Consult your legal and financial advisor for regulations applicable to your bond offering.

### Jurisdiction

The primary jurisdiction for your bond offering:

- **United States**

### Select Regulation

Choose the regulatory framework for your bond offering:

#### Regulation S

**Purpose**: Debt offerings outside the United States to non-U.S. persons

**Restrictions and Rules**:

| Rule                             | Details                                                 |
| -------------------------------- | ------------------------------------------------------- |
| **Deal size**                    | Can raise unlimited capital                             |
| **Accredited investors**         | Accreditation required                                  |
| **Max non-accredited investors** | Unlimited                                               |
| **Manual investor verification** | Verification of investors' financial documents required |
| **International investors**      | Allowed                                                 |
| **Resale hold period**           | Not applicable                                          |

**Use cases**:

- International bond offerings
- Eurobonds and global bonds
- Non-U.S. bondholder base
- Cross-border debt financing

#### Regulation D 506(b)

**Purpose**: Private debt placement in the United States

**Restrictions and Rules**:

| Rule                             | Details                                                 |
| -------------------------------- | ------------------------------------------------------- |
| **Deal size**                    | Can raise unlimited capital                             |
| **Accredited investors**         | Accreditation required                                  |
| **Max non-accredited investors** | 35 maximum                                              |
| **Manual investor verification** | Verification of investors' financial documents required |
| **International investors**      | Not allowed                                             |
| **Resale hold period**           | Applicable from 6 months to 1 year                      |

**Use cases**:

- U.S.-based private bond placements
- Qualified institutional buyers (QIBs)
- Accredited investor bond offerings
- Limited retail bondholder participation

> **Warning**: Read the restrictions carefully. These details cannot be altered once the bond is deployed.

### Geographic Block List

**Purpose**: Specify countries whose residents cannot purchase bonds

**How it works**:

- Based on selected regulation
- Can add additional blocked countries beyond regulatory requirements
- Enforced via compliance checks during bond transfers

**Common restrictions**:

- OFAC sanctioned countries
- High-risk jurisdictions for money laundering
- Countries with conflicting securities regulations

**Example**: Block sanctioned countries or jurisdictions with capital controls

## Step 7: Review and Deploy

### Review Configuration

Before deploying, verify all bond configuration details:

1. **Bond details**: Name, symbol, decimals, ISIN
2. **Permissions**: Controllable, blocklist, approval list settings
3. **Configuration**: Clearing mode, internal KYC status
4. **Bond terms**: Currency, bond units, nominal value, total value
5. **Bond dates**: Starting date (mint date), maturity date
6. **Proceed recipients**: All recipients added with correct percentages (totaling 100%)
7. **External lists**: Correct lists linked (if any)
8. **ERC-3643**: Compliance Module and Identity Registry addresses (if used)
9. **Regulation**: Proper regulation selected, geographic block list configured

### Deployment Cost

- View estimated HBAR cost for deployment
- Includes: Factory contract call, proxy deployment, initial configuration
- Typical cost: 50-200 HBAR (varies by network congestion)
- **Note**: Bond deployment may cost slightly more than equity due to additional bond-specific features

### Deploy Bond

1. Click **"Deploy Bond"** button
2. Approve transaction in your wallet
3. Wait for confirmation (typically 3-5 seconds on Hedera)
4. Contract address will be displayed on success

### Verify Deployment

After successful deployment:

**Bond Information**

- **Contract Address**: EVM address of deployed bond (0x...)
- **Contract ID**: Hedera contract ID (0.0.xxxxx)
- **Factory**: Factory contract that deployed the bond
- **Deployment Time**: Timestamp of deployment

**View in Dashboard**

1. Bond appears in your **"My Tokens"** list
2. Click to view bond details
3. Available tabs (based on your role):
   - **Overview**: Bond info, supply, bondholders, maturity countdown
   - **Holders**: List of bondholders and balances
   - **Transfers**: Transfer history
   - **Corporate Actions**: Coupon payment management, maturity redemption
   - **Compliance**: KYC, control lists
   - **Settings**: Bond configuration

![ATS Dashboard](../../images/ats-web-tabs.png)

> **Note**: Available tabs depend on your assigned roles. See [Roles and Permissions](./roles-and-permissions.md).

## Managing Your Bond Token

After creation, you can manage your bond from the dashboard. Select **Admin View (green)** to access administrative operations or **Holder View (blue)** to view balances and transfer tokens.

Common bond lifecycle management operations:

### Distribute Bonds

- **How**: Transfer tab or issue function
- **Requirements**: ISSUER_ROLE
- **Recipients**: Must pass KYC and control list checks
- **Use cases**: Initial bond distribution to underwriters, direct sales to investors

### Execute Coupon Payments

- **How**: Corporate Actions tab → Create Coupon Payment
- **Requirements**: CORPORATE_ACTION_ROLE
- **Process**:
  1. Create snapshot of bondholders at record date
  2. Specify coupon amount (interest payment)
  3. Execute distribution to all bondholders
- **Frequency**: Based on bond terms (monthly, quarterly, semi-annually, annually)

### Handle Maturity Redemption

- **How**: Corporate Actions tab → Maturity Redemption
- **Requirements**: CORPORATE_ACTION_ROLE
- **Process**:
  1. At maturity date, create final snapshot
  2. Calculate principal + final coupon
  3. Execute redemption to all bondholders
  4. Bond tokens are burned upon redemption

### Manage Compliance

- **KYC**: Grant/revoke KYC status for bondholders
- **Control Lists**: Add/remove addresses from whitelist/blacklist
- **Freeze**: Freeze specific bondholder accounts if needed (regulatory requirements)

### Pause Transfers

- **How**: Settings → Emergency pause
- **Requirements**: PAUSER_ROLE
- **Effect**: All bond transfers blocked until unpause
- **Use cases**: Security incidents, regulatory investigations, system maintenance

## Common Issues

### Transaction Failed

- **Insufficient HBAR**: Ensure wallet has enough HBAR for gas fees (check estimated cost)
- **Invalid Configuration**: Verify all required fields are filled correctly
- **Contract Not Found**: Check Factory contract address in your .env configuration
- **Invalid Dates**: Ensure maturity date is after starting date

### Proceed Recipients Errors

- **Percentages don't add to 100%**: Verify all recipient allocations sum to 100%
- **Invalid Address**: Check that addresses are valid Hedera IDs or EVM addresses
- **Duplicate Recipients**: Remove duplicate addresses before deployment

### KYC Errors

- **KYC check fails**: Verify bondholder is KYC-verified (internal, external, or SSI)
- **External list not found**: Ensure external KYC list address is correct
- **SSI not configured**: If using SSI, verify revocation registry and issuers are set

### Transfer Restrictions

- **Blocklist blocking**: Check if recipient is on blocklist (internal or external)
- **Approval list missing**: If approval list enabled, ensure recipient is approved
- **Regulation block**: Verify recipient's jurisdiction is not blocked

### Control List Issues

- **Internal vs External**: Remember both internal and external lists are checked
- **Wrong list type**: Verify you're using control lists (not KYC lists) for transfer control

### Bond Lifecycle Issues

- **Coupon payment failed**: Ensure sufficient funds in payment token contract
- **Maturity date misconfigured**: Verify maturity date is set correctly during creation
- **Missing CORPORATE_ACTION_ROLE**: Grant role to accounts responsible for coupon payments

## Next Steps

- [Token Operations](./token-operations.md) - Learn about all available operations for your bond
- [Corporate Actions](./corporate-actions.md) - Execute coupon payments and maturity redemption
- [Managing KYC & Compliance](./managing-compliance.md) - Set up bondholder verification
- [Roles and Permissions](./roles-and-permissions.md) - Grant roles to team members
- [SSI Integration](./ssi-integration.md) - Decentralized identity verification with Terminal 3
- [Managing External KYC Lists](./managing-external-kyc-lists.md) - Configure external verification
- [Managing External Control Lists](./managing-external-control-lists.md) - Configure transfer restrictions

## Related Resources

- [Developer Guide: ATS Contracts](../developer-guides/contracts/index.md)
- [API Documentation](../api/index.md)
