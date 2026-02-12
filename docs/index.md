# Asset Tokenization Studio Documentation

Welcome to the Asset Tokenization Studio documentation. This monorepo provides two complementary products for tokenizing and managing financial assets on the Hedera network.

---

## Platform Overview

| Capability                  | ATS                                                    | Mass Payout                                        |
| --------------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| **Token Issuance**          | Create equity and bond tokens                          | —                                                  |
| **Compliance Management**   | KYC/AML, allowlists, blocklists, transfer restrictions | —                                                  |
| **Corporate Actions**       | Dividends, voting, coupons, stock splits               | —                                                  |
| **Token Operations**        | Mint, transfer, redeem, freeze, pause                  | —                                                  |
| **Settlement & Clearing**   | Holds, escrow, DVP, clearing workflows                 | —                                                  |
| **Batch Payments**          | —                                                      | Distribute to thousands of holders at once         |
| **Scheduled Distributions** | —                                                      | Automate recurring payouts (monthly, quarterly)    |
| **Multi-Currency Payouts**  | —                                                      | Pay in HBAR or any HTS token                       |
| **Payment Tracking**        | —                                                      | Real-time monitoring, audit trails, retry handling |
| **Role-Based Access**       | Minter, Burner, Compliance, Controller, etc.           | Payout, Cashout, Pauser, etc.                      |
| **Custody Integration**     | Dfns, Fireblocks, AWS KMS                              | Dfns                                               |
| **Web Application**         | Token management dApp                                  | Distribution admin panel                           |
| **TypeScript SDK**          | Full programmatic access                               | Full programmatic access                           |
| **REST API**                | —                                                      | Complete backend API                               |

---

## Asset Tokenization Studio (ATS)

**Digitize and manage securities on the blockchain with enterprise-grade compliance.**

ATS enables you to create and manage tokenized securities - equity tokens (shares, fund units) and bond tokens (debt instruments) - with built-in compliance, corporate actions, and institutional-grade features.

| What You Can Do          | Description                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| Issue digital securities | Create equity and bond tokens with built-in compliance             |
| Automate compliance      | KYC/AML verification, transfer restrictions, allowlists/blocklists |
| Run corporate actions    | Dividends, voting, coupons, stock splits, redemptions              |
| Control operations       | Freeze accounts, pause tokens, forced transfers                    |
| Settle trades            | Holds, escrow, clearing workflows, DVP support                     |

**[Explore ATS Capabilities →](ats/getting-started/capabilities-overview.md)**

### Quick Links

| Getting Started                                                      | User Guides                                                   | Developer Guides                                                    |
| -------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| [Product Capabilities](ats/getting-started/capabilities-overview.md) | [Creating Equities](ats/user-guides/creating-equity.md)       | [SDK Integration](ats/developer-guides/sdk-integration.md)          |
| [Quick Start](ats/getting-started/quick-start.md)                    | [Creating Bonds](ats/user-guides/creating-bond.md)            | [Contract Architecture](ats/developer-guides/contracts/overview.md) |
| [Full Setup](ats/getting-started/full-setup.md)                      | [Managing Compliance](ats/user-guides/managing-compliance.md) | [API Reference](ats/api/index.md)                                   |

---

## Mass Payout

**Distribute payments to thousands of token holders efficiently and reliably.**

Mass Payout enables you to execute dividend distributions, coupon payments, and recurring obligations to large numbers of token holders with automated batch processing and scheduling.

| What You Can Do     | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| Pay at scale        | Distribute to thousands of holders in a single operation    |
| Automate payments   | Schedule recurring distributions (monthly, quarterly, etc.) |
| Multiple currencies | Pay in HBAR or any HTS token (USDC, custom tokens)          |
| Track everything    | Real-time monitoring, audit trails, failure recovery        |
| Integrate with ATS  | Import tokens and holders automatically                     |

**[Explore Mass Payout Capabilities →](mass-payout/getting-started/capabilities-overview.md)**

### Quick Links

| Getting Started                                                              | User Guides                                                                 | Developer Guides                                                             |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [Product Capabilities](mass-payout/getting-started/capabilities-overview.md) | [Importing Assets](mass-payout/user-guides/importing-assets.md)             | [Backend Architecture](mass-payout/developer-guides/backend/architecture.md) |
| [Quick Start](mass-payout/getting-started/quick-start.md)                    | [Creating Distributions](mass-payout/user-guides/creating-distributions.md) | [SDK Integration](mass-payout/developer-guides/sdk-integration.md)           |
| [Full Setup](mass-payout/getting-started/full-setup.md)                      |                                                                             | [REST API Reference](mass-payout/api/rest-api/index.md)                      |

---

## How They Work Together

ATS and Mass Payout are designed to work seamlessly together:

| Step | Product         | What Happens                     |
| ---- | --------------- | -------------------------------- |
| 1    | **ATS**         | Create equity or bond tokens     |
| 2    | **ATS**         | Mint tokens to investors         |
| 3    | **Mass Payout** | Import token and sync holders    |
| 4    | **Mass Payout** | Create and schedule distribution |
| 5    | **Mass Payout** | Execute payments to all holders  |

You can also use each product independently - ATS for token management without payouts, or Mass Payout with any existing HTS token.

---

## References

Cross-product documentation and guides.

- [CI/CD Workflows](references/guides/ci-cd-workflows.md)
- [Monorepo Migration Guide](references/guides/monorepo-migration.md)

---

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/hashgraph/asset-tokenization-studio/issues)
- **Hedera Documentation**: [https://docs.hedera.com](https://docs.hedera.com)
- **Hedera Discord**: [https://hedera.com/discord](https://hedera.com/discord)
