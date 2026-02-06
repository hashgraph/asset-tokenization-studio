---
id: capabilities-overview
title: Product Capabilities
sidebar_position: 1
---

# ATS Product Capabilities

Asset Tokenization Studio enables you to digitize, issue, and manage securities on the Hedera blockchain. This guide provides a comprehensive overview of what you can accomplish with ATS.

## At a Glance

| Category              | What You Get                                                                      |
| --------------------- | --------------------------------------------------------------------------------- |
| **Security Types**    | Equity tokens (shares, units) and Bond tokens (debt instruments)                  |
| **Compliance**        | Built-in KYC/AML, transfer restrictions, and regulatory controls                  |
| **Corporate Actions** | Dividends, voting, coupons, stock splits, and redemptions                         |
| **Settlement**        | Real-time transfers, holds, escrow, and clearing workflows                        |
| **Access Control**    | Role-based permissions for operations, compliance, and administration             |
| **Integrations**      | Enterprise custody (Dfns, Fireblocks, AWS KMS), WalletConnect, Hedera Mirror Node |

---

## Issuing Digital Securities

### Equity Tokens

Create digital shares that represent ownership in a company, fund, or other entity.

| Feature                           | What It Does                                                                   | Business Benefit                                                     |
| --------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **Configurable Share Classes**    | Issue different classes (Common, Preferred, Series A/B) as separate partitions | Support complex cap table structures with different rights per class |
| **Built-in Voting Rights**        | Attach voting power to tokens with record-date snapshots                       | Run shareholder votes without manual voter list compilation          |
| **Dividend Distribution**         | Configure dividend events with automatic eligibility tracking                  | Pay dividends to the right holders based on record date ownership    |
| **Stock Splits & Consolidations** | Schedule balance adjustments that multiply or divide holdings                  | Execute corporate restructuring without manual recalculations        |
| **Supply Management**             | Set maximum supply caps globally or per share class                            | Prevent over-issuance and maintain accurate capitalization           |

**Common Use Cases:**

- Private equity fund tokenization
- Employee stock ownership plans (ESOP)
- Real estate investment trusts (REITs)
- Venture capital fund units
- Revenue sharing agreements

### Bond Tokens

Create debt instruments with scheduled interest payments and maturity dates.

| Feature                    | What It Does                                               | Business Benefit                                       |
| -------------------------- | ---------------------------------------------------------- | ------------------------------------------------------ |
| **Coupon Configuration**   | Define interest rate, payment frequency, and payment dates | Automate bond economics without manual tracking        |
| **Maturity Management**    | Set maturity date with automatic redemption eligibility    | Ensure timely principal repayment at maturity          |
| **Nominal Value Tracking** | Track face value separately from market price              | Maintain accurate accounting for interest calculations |
| **Multiple Coupon Types**  | Support fixed, floating, or custom rate structures         | Flexibility for different bond structures              |
| **Partial Redemption**     | Allow early redemption of portions of holdings             | Support callable bonds and partial buybacks            |

**Common Use Cases:**

- Corporate bonds
- Municipal bonds
- Green bonds and sustainability-linked debt
- Revenue bonds
- Convertible notes

---

## Managing Investor Compliance

### Identity & KYC Verification

Ensure only verified investors can hold and trade your securities.

| Feature                    | What It Does                                         | Business Benefit                                                       |
| -------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| **On-Chain KYC Registry**  | Store investor verification status directly on-chain | Instant verification checks on every transaction                       |
| **Validity Periods**       | Set expiration dates for KYC approvals               | Ensure ongoing compliance with re-verification requirements            |
| **External KYC Providers** | Connect third-party verification services            | Reuse existing KYC infrastructure and share verification across tokens |
| **Credential Tracking**    | Link verification to specific credential IDs         | Audit trail connecting on-chain status to off-chain documentation      |
| **SSI Integration**        | Support Self-Sovereign Identity with Terminal 3      | Enable decentralized, user-controlled identity verification            |

### Transfer Restrictions

Control who can send, receive, and hold your tokens.

| Feature                    | What It Does                                             | Business Benefit                                             |
| -------------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| **Allowlists**             | Only approved addresses can receive tokens               | Restrict ownership to verified investors                     |
| **Blocklists**             | Prevent specific addresses from receiving tokens         | Block sanctioned entities or non-compliant jurisdictions     |
| **Automatic Validation**   | Every transfer is checked against rules before execution | Impossible to accidentally transfer to non-compliant holders |
| **External Control Lists** | Connect to third-party compliance providers              | Integrate with existing compliance infrastructure            |
| **Jurisdictional Rules**   | Apply country-specific regulations (USA supported)       | Meet local regulatory requirements automatically             |

---

## Running Corporate Actions

### For Equity Tokens

| Action                    | What It Does                                                      | When to Use It                                |
| ------------------------- | ----------------------------------------------------------------- | --------------------------------------------- |
| **Dividend Distribution** | Calculate and record dividend entitlements based on record date   | Quarterly/annual profit distributions         |
| **Shareholder Voting**    | Create voting events with eligibility based on ownership snapshot | Board elections, M&A approvals, bylaw changes |
| **Stock Split**           | Multiply all holder balances by a ratio (e.g., 2:1)               | Increase liquidity, adjust share price        |
| **Reverse Split**         | Divide all holder balances by a ratio (e.g., 1:10)                | Consolidate shares, meet listing requirements |
| **Balance Snapshot**      | Record all holder balances at a point in time                     | Record dates, regulatory reporting, audits    |

### For Bond Tokens

| Action                  | What It Does                                         | When to Use It                                                |
| ----------------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| **Coupon Payment**      | Record interest payment entitlements for all holders | Scheduled interest payments (monthly, quarterly, semi-annual) |
| **Maturity Redemption** | Allow holders to redeem principal at maturity        | Bond maturity date                                            |
| **Early Redemption**    | Enable partial or full redemption before maturity    | Callable bonds, investor buybacks                             |
| **Rate Adjustment**     | Update coupon rate for floating-rate instruments     | Rate reset dates for variable bonds                           |

---

## Controlling Token Operations

### Emergency Controls

React quickly to regulatory requests or security incidents.

| Control            | Scope                                            | Use Case                                            |
| ------------------ | ------------------------------------------------ | --------------------------------------------------- |
| **Pause Token**    | Stops ALL operations for the entire token        | Regulatory halt, security breach, major incident    |
| **Freeze Account** | Blocks a specific investor from all operations   | Legal hold, dispute resolution, suspicious activity |
| **Partial Freeze** | Locks a specific amount in an investor's account | Collateral lock, pending investigation, escrow      |
| **External Pause** | Third-party systems can trigger pauses           | Integration with external compliance monitoring     |

### Operational Controls

| Control               | What It Does                                            | Business Benefit                                   |
| --------------------- | ------------------------------------------------------- | -------------------------------------------------- |
| **Forced Transfer**   | Move tokens between accounts without holder consent     | Court orders, estate transfers, error correction   |
| **Forced Redemption** | Remove tokens from circulation without holder consent   | Regulatory requirements, squeeze-out procedures    |
| **Batch Operations**  | Process thousands of operations in a single transaction | Efficient bulk issuance, transfers, or redemptions |

---

## Settlement & Clearing

### Hold Operations (Escrow)

Secure tokens during settlement without transferring ownership.

| Stage            | What Happens                                        | Example                                         |
| ---------------- | --------------------------------------------------- | ----------------------------------------------- |
| **Create Hold**  | Tokens are locked with a beneficiary and expiration | Buyer places order, tokens held pending payment |
| **Execute Hold** | Tokens transfer to beneficiary upon settlement      | Payment confirmed, tokens released to buyer     |
| **Release Hold** | Hold cancelled, tokens return to original holder    | Deal falls through, tokens returned             |
| **Reclaim Hold** | Holder reclaims tokens after expiration             | Settlement deadline passed                      |

### Clearing Workflows

Two-phase settlement for complex transactions.

| Phase        | What Happens                                      | Example                               |
| ------------ | ------------------------------------------------- | ------------------------------------- |
| **Initiate** | Create pending operation (transfer or redemption) | Trade matched, awaiting settlement    |
| **Approve**  | Counterparty or clearing house approves           | Settlement conditions met             |
| **Execute**  | Operation completes                               | Tokens transfer, trade settled        |
| **Cancel**   | Operation rejected and reversed                   | Settlement failed, positions restored |

**Supported Workflows:**

- Delivery vs Payment (DVP)
- Trade settlement with clearing house approval
- Multi-party transactions with escrow
- Collateral management

---

## Access Control & Permissions

### Role-Based Security

Separate duties across your organization with granular permissions.

| Role                  | What They Can Do                   | Typical Assignment                |
| --------------------- | ---------------------------------- | --------------------------------- |
| **Admin**             | Manage roles and permissions       | C-suite, board members            |
| **Minter**            | Issue new tokens                   | Treasury, issuance team           |
| **Burner**            | Redeem/burn tokens                 | Treasury, redemption team         |
| **Controller**        | Force transfers and redemptions    | Legal, compliance (emergency use) |
| **Pauser**            | Pause/unpause all operations       | Compliance, security team         |
| **Freezer**           | Freeze/unfreeze specific accounts  | Compliance, legal                 |
| **Compliance**        | Manage KYC, allowlists, blocklists | Compliance team                   |
| **Corporate Actions** | Set up dividends, voting, coupons  | Finance, corporate secretary      |
| **Clearing**          | Manage settlement workflows        | Operations, back office           |
| **Snapshot**          | Create balance snapshots           | Finance, reporting                |

### Best Practices

- **Segregation of Duties**: Don't give one person both Minter and Burner roles
- **Principle of Least Privilege**: Only assign roles that are needed
- **Multi-Sig for Critical Actions**: Require multiple approvals for high-risk operations
- **Regular Access Reviews**: Audit role assignments periodically

---

## Integration Options

### For Developers

| Integration             | What It Provides                           | Use Case                                      |
| ----------------------- | ------------------------------------------ | --------------------------------------------- |
| **TypeScript SDK**      | Full programmatic access to all operations | Build custom applications, automate workflows |
| **Smart Contract APIs** | Direct contract interaction                | Advanced integrations, custom logic           |
| **Event Subscriptions** | Real-time notifications of on-chain events | Sync external systems, trigger workflows      |

### For Enterprises

| Integration       | What It Provides               | Use Case                     |
| ----------------- | ------------------------------ | ---------------------------- |
| **Dfns**          | Enterprise key management      | Institutional-grade custody  |
| **Fireblocks**    | Institutional custody platform | Large-scale asset management |
| **AWS KMS**       | Cloud-based key management     | Cloud-native deployments     |
| **WalletConnect** | Connect any compatible wallet  | End-user wallet integration  |

### For Data & Reporting

| Integration            | What It Provides             | Use Case                           |
| ---------------------- | ---------------------------- | ---------------------------------- |
| **Hedera Mirror Node** | Historical transaction data  | Reporting, analytics, audit        |
| **Balance Snapshots**  | Point-in-time holder records | Regulatory reporting, record dates |
| **Event Logs**         | Complete operation history   | Compliance audit, reconciliation   |

---

## Next Steps

Ready to get started? Choose your path:

- **[Quick Start](./quick-start.md)** - Try the web application
- **[Full Setup](./full-setup.md)** - Set up development environment

Or dive into specific guides:

- **[Creating Equity Tokens](../user-guides/creating-equity.md)** - Issue your first equity token
- **[Creating Bond Tokens](../user-guides/creating-bond.md)** - Issue your first bond token
- **[Managing Compliance](../user-guides/managing-compliance.md)** - Configure KYC and transfer restrictions
