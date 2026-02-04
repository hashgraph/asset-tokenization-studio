---
id: intro
title: Mass Payout
sidebar_position: 0
slug: /
---

# Mass Payout

Distribute payments to thousands of token holders efficiently and reliably on the Hedera network.

## What is Mass Payout?

Mass Payout is a payment distribution system designed for tokenized securities. It enables you to distribute dividends, coupon payments, and other recurring obligations to large numbers of token holders with automated batch processing.

### Key Benefits

| Benefit                   | Description                                              |
| ------------------------- | -------------------------------------------------------- |
| **Pay at Scale**          | Distribute to thousands of holders in a single operation |
| **Automate Everything**   | Schedule recurring payments that run automatically       |
| **Multiple Currencies**   | Pay in HBAR or any HTS token (USDC, custom tokens)       |
| **Track Every Payment**   | Full audit trail with real-time status monitoring        |
| **Recover from Failures** | Automatic retry and partial success handling             |

## What Can You Do?

<div className="card-grid card-grid-3">
  <div className="card-box card-tip">
    <h3>Dividend Distributions</h3>
    <p>Share profits with equity token holders</p>
    <ul>
      <li>Import tokens from ATS</li>
      <li>Calculate per-share amounts</li>
      <li>Execute batch payments</li>
      <li>Track payment history</li>
    </ul>
  </div>

  <div className="card-box card-tip">
    <h3>Coupon Payments</h3>
    <p>Automate bond interest payments</p>
    <ul>
      <li>Schedule periodic payments</li>
      <li>Auto-execute on schedule</li>
      <li>Handle proration</li>
      <li>Multiple payment frequencies</li>
    </ul>
  </div>

  <div className="card-box card-tip">
    <h3>Recurring Distributions</h3>
    <p>Set up automated payouts</p>
    <ul>
      <li>Cron-based scheduling</li>
      <li>Auto snapshot capture</li>
      <li>Automatic retry on failure</li>
      <li>Real-time progress tracking</li>
    </ul>
  </div>
</div>

[See all capabilities →](./getting-started/capabilities-overview.md)

## Who Is This For?

<div className="card-grid card-grid-2">
  <div className="card-box card-info">
    <h3>Business Users</h3>
    <p>Manage distributions without coding</p>
    <ul>
      <li>Import assets through the web app</li>
      <li>Create and schedule distributions</li>
      <li>Monitor payout status</li>
      <li>View reports and history</li>
    </ul>
    <a href="./getting-started/quick-start" className="card-link">Get Started →</a>
  </div>

  <div className="card-box card-info">
    <h3>Developers</h3>
    <p>Integrate payment distribution into your systems</p>
    <ul>
      <li>REST API for all operations</li>
      <li>TypeScript SDK for blockchain</li>
      <li>Webhook notifications</li>
      <li>Custom integrations</li>
    </ul>
    <a href="./getting-started/full-setup" className="card-link">Developer Setup →</a>
  </div>
</div>

## Integration with ATS

Mass Payout works seamlessly with Asset Tokenization Studio:

| Step                         | Description                                   |
| ---------------------------- | --------------------------------------------- |
| **1. Create tokens in ATS**  | Issue equity or bond tokens to your investors |
| **2. Import to Mass Payout** | Sync token holders and balances automatically |
| **3. Create distribution**   | Configure payment amount and schedule         |
| **4. Execute payout**        | Payments distributed to all holders           |

You can also use Mass Payout independently with any existing HTS token on Hedera.

## Platform Components

| Component           | Description                            | For Who        |
| ------------------- | -------------------------------------- | -------------- |
| **Web Application** | Admin panel for managing distributions | Business users |
| **REST API**        | Complete backend API for integration   | Developers     |
| **TypeScript SDK**  | Direct blockchain interaction          | Developers     |
| **Smart Contracts** | On-chain payment logic                 | Developers     |

## Documentation

<div className="card-grid card-grid-3">
  <div className="card-box">
    <h3>Getting Started</h3>
    <p>Set up and explore capabilities</p>
    <ul>
      <li><a href="./getting-started/capabilities-overview">Product Capabilities</a></li>
      <li><a href="./getting-started/quick-start">Quick Start</a></li>
      <li><a href="./getting-started/full-setup">Full Setup</a></li>
    </ul>
  </div>

  <div className="card-box">
    <h3>User Guides</h3>
    <p>Step-by-step guides</p>
    <ul>
      <li><a href="./user-guides/importing-assets">Importing Assets</a></li>
      <li><a href="./user-guides/creating-distributions">Creating Distributions</a></li>
    </ul>
  </div>

  <div className="card-box">
    <h3>Developer Guides</h3>
    <p>Technical documentation</p>
    <ul>
      <li><a href="./developer-guides/sdk-integration">SDK Integration</a></li>
      <li><a href="./developer-guides/backend/architecture">Backend Architecture</a></li>
      <li><a href="./api/">API Reference</a></li>
    </ul>
  </div>
</div>

## System Requirements

- **Node.js**: v24.0.0 or newer
- **PostgreSQL**: 12 or newer
- **Hedera Account**: With HBAR for transactions

## Support

- [GitHub Repository](https://github.com/hashgraph/asset-tokenization-studio)
- [Report Issues](https://github.com/hashgraph/asset-tokenization-studio/issues)
- [Hedera Documentation](https://docs.hedera.com)
- [Hedera Discord](https://hedera.com/discord)

## License

Licensed under Apache License 2.0. See [LICENSE](https://github.com/hashgraph/asset-tokenization-studio/blob/main/LICENSE) for details.
