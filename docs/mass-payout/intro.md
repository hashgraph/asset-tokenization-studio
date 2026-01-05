---
id: intro
title: Mass Payout
sidebar_position: 0
slug: /
---

# Mass Payout

Manage large-scale payment distributions for tokenized securities with automated batch processing and scheduling capabilities.

## Overview

Mass Payout is a comprehensive payment distribution system designed for tokenized securities. It enables issuers to efficiently distribute dividends, coupon payments, and other recurring obligations to large numbers of token holders on the Hedera network.

### Key Features

- **Batch Payment Processing**: Efficiently distribute payments to thousands of token holders
- **Asset Import**: Automatically sync token holders and balances from ATS tokens
- **Multiple Distribution Types**: Support for dividends, coupon payments, and custom distributions
- **Scheduled Payouts**: Set up recurring distributions with cron-like scheduling
- **Real-time Tracking**: Monitor payout status and transaction history
- **Failure Recovery**: Automatic retry mechanism for failed payments
- **REST API**: Complete backend API for integration

## Architecture

Mass Payout consists of four main components working together:

```mermaid
graph TB
    subgraph "Frontend (React)"
        UI[Admin Panel]
        UI_Assets[Asset Management]
        UI_Dist[Distribution UI]
    end

    subgraph "Backend (NestJS)"
        API[REST API]
        UC[Use Cases]
        DS[Domain Services]
        Repos[Repositories]
        Cron[Scheduled Jobs]
        Listener[Event Listener]
    end

    subgraph "SDK Layer"
        SDK[Mass Payout SDK]
        Adapters[Transaction Adapters]
        Queries[Query Adapters]
    end

    subgraph "Smart Contracts"
        LCC[LifeCycle CashFlow]
        ATS_Contract[ATS Token Contract]
    end

    subgraph "Infrastructure"
        DB[(PostgreSQL)]
        Mirror[Mirror Node]
        HTS[Hedera Network]
    end

    UI --> API
    API --> UC
    UC --> DS
    DS --> Repos
    DS --> SDK
    Repos --> DB
    SDK --> Adapters
    SDK --> Queries
    Adapters --> LCC
    Queries --> Mirror
    LCC --> HTS
    Listener --> Mirror
    Listener --> DB
    Cron --> DS
    LCC -.Import.-> ATS_Contract

    style UI fill:#e1f5ff
    style API fill:#fff4e1
    style SDK fill:#ffe1f5
    style LCC fill:#e1ffe1
    style DB fill:#f3e5f5
```

Mass Payout consists of four main components:

### Smart Contracts

The **LifeCycle Cash Flow** contract manages all on-chain operations:

- **Distribution Execution**: Batch transfer payments to multiple recipients
- **Bond Cash-Out**: Handle bond maturity redemptions
- **Snapshot Management**: Capture holder balances at specific points in time
- **Role-Based Access**: Granular permissions for different operations
- **Upgradeable**: Proxy pattern for contract upgrades

[Learn more about contracts →](./developer-guides/contracts/index.md)

### SDK

TypeScript SDK for blockchain interactions:

- **Command/Query Pattern**: Separation of write and read operations
- **Transaction Adapters**: Support for DFNS, RPC, and other signers
- **Value Objects**: Type-safe representation of blockchain entities
- **Mirror Node Integration**: Query historical data and events

[Learn more about SDK integration →](./developer-guides/sdk-integration.md)

### Backend (NestJS)

Domain-driven backend API with PostgreSQL:

- **Domain Services**: Business logic for asset import, payout execution, and synchronization
- **Event-Driven Sync**: Automatic blockchain event polling and processing
- **Use Cases**: 22 use cases covering all operations
- **Repositories**: TypeORM for data persistence
- **Scheduled Jobs**: Cron-based automatic payout execution

[Learn more about backend →](./developer-guides/backend/index.md)

### Frontend (React)

Admin panel for managing distributions:

- **Asset Management**: Import assets and view holder information
- **Distribution Creation**: Configure and execute payouts
- **Real-time Monitoring**: Track payout status and history
- **Chakra UI**: Modern, accessible component library
- **React Query**: Efficient data fetching and caching

![Mass Payout Web Interface](../images/mp-web.png)

[Try the web app →](./getting-started/quick-start.md)

## Use Cases

<div className="card-grid card-grid-2">
  <div className="card-box card-tip">
    <h3>💵 Dividend Distributions</h3>
    <p>Distribute earnings to equity token holders</p>
    <ul>
      <li>Import equity tokens from ATS</li>
      <li>Calculate amounts per share</li>
      <li>Execute batch payments</li>
      <li>Track history and reporting</li>
    </ul>
    <a href="./user-guides/creating-distributions" className="card-link">Learn more</a>
  </div>

  <div className="card-box card-tip">
    <h3>📅 Coupon Payments</h3>
    <p>Automate periodic bond interest payments</p>
    <ul>
      <li>Import bond tokens from ATS</li>
      <li>Schedule periodic payments</li>
      <li>Auto-execute on schedule</li>
      <li>Handle proration</li>
    </ul>
    <a href="./user-guides/scheduled-payouts" className="card-link">Learn more</a>
  </div>

  <div className="card-box card-tip">
    <h3>🔄 Recurring Distributions</h3>
    <p>Set up automated recurring payouts</p>
    <ul>
      <li>Cron-based schedules</li>
      <li>Auto snapshot capturing</li>
      <li>Automatic retry on failure</li>
      <li>Email notifications</li>
    </ul>
    <a href="./user-guides/scheduled-payouts" className="card-link">Learn more</a>
  </div>

  <div className="card-box card-tip">
    <h3>📊 Large-Scale Payouts</h3>
    <p>Process payments to thousands of holders</p>
    <ul>
      <li>Efficient batch processing</li>
      <li>Pagination support</li>
      <li>Real-time progress tracking</li>
      <li>Detailed transaction logs</li>
    </ul>
    <a href="./user-guides/managing-payouts" className="card-link">Learn more</a>
  </div>
</div>

## Integration with ATS

Mass Payout is designed to work seamlessly with Asset Tokenization Studio:

```mermaid
graph LR
    A[Create Token<br/>in ATS] --> B[Import Asset<br/>to Mass Payout]
    B --> C[Sync Holders<br/>& Balances]
    C --> D[Create<br/>Distribution]
    D --> E[Execute<br/>Payout]
    E --> F[Monitor<br/>Status]
    F -.Recurring.-> D

    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#ffe1f5
    style D fill:#e1ffe1
    style E fill:#f3e5f5
    style F fill:#e8f5e9
```

1. **Create tokens in ATS**: Issue equity or bond tokens
2. **Import to Mass Payout**: Sync token holder information
3. **Configure distributions**: Set up payment parameters
4. **Execute payouts**: Distribute payments to holders

You can use Mass Payout independently if you have existing tokens on Hedera.

## Getting Started

<div className="card-grid card-grid-2">
  <div className="card-box card-info">
    <h3>👤 For End Users</h3>
    <p>Try the Mass Payout web application</p>
    <ul>
      <li>Quick start in minutes</li>
      <li>Import assets from ATS</li>
      <li>Create and manage distributions</li>
      <li>Monitor payout status</li>
    </ul>
    <a href="./getting-started/quick-start" className="card-link">Quick Start Guide</a>
  </div>

  <div className="card-box card-info">
    <h3>👨‍💻 For Developers</h3>
    <p>Integrate Mass Payout or contribute</p>
    <ul>
      <li>Full development environment</li>
      <li>Backend + Frontend setup</li>
      <li>SDK integration</li>
      <li>Contract deployment</li>
    </ul>
    <a href="./getting-started/full-setup" className="card-link">Full Development Setup</a>
  </div>
</div>

## Documentation

<div className="card-grid card-grid-3">
  <div className="card-box">
    <h3>📚 User Guides</h3>
    <p>Step-by-step guides for the application</p>
    <ul>
      <li>Importing assets</li>
      <li>Creating distributions</li>
      <li>Managing payouts</li>
      <li>Scheduled distributions</li>
    </ul>
    <a href="./user-guides/" className="card-link">View Guides</a>
  </div>

  <div className="card-box">
    <h3>🛠️ Developer Guides</h3>
    <p>Technical guides for developers</p>
    <ul>
      <li>Smart contract deployment</li>
      <li>SDK integration</li>
      <li>Backend API extension</li>
      <li>Frontend customization</li>
    </ul>
    <a href="./developer-guides/" className="card-link">View Guides</a>
  </div>

  <div className="card-box">
    <h3>📖 API Documentation</h3>
    <p>Technical reference documentation</p>
    <ul>
      <li>Smart contract functions</li>
      <li>SDK methods</li>
      <li>REST API endpoints</li>
      <li>WebSocket events</li>
    </ul>
    <a href="./api/" className="card-link">View API Docs</a>
  </div>
</div>

## Technical Stack

### Backend

- **NestJS**: TypeScript Node.js framework
- **PostgreSQL**: Relational database for persistence
- **TypeORM**: Object-relational mapping
- **Domain-Driven Design**: Clean architecture patterns

### Frontend

- **React 18**: Modern UI framework
- **Chakra UI**: Component library
- **React Query**: Data fetching and caching
- **Zustand**: State management

### Blockchain

- **Hedera Network**: DLT platform
- **Solidity**: Smart contract language
- **Hardhat**: Development environment

## System Requirements

- **Node.js**: v24.0.0 or newer
- **PostgreSQL**: 12 or newer
- **npm**: v10.9.0 or newer
- **Hedera Account**: With HBAR for transactions

## Support and Resources

- [GitHub Repository](https://github.com/hashgraph/asset-tokenization-studio)
- [Report Issues](https://github.com/hashgraph/asset-tokenization-studio/issues)
- [Hedera Documentation](https://docs.hedera.com)
- [Hedera Discord](https://hedera.com/discord)

## License

Licensed under Apache License 2.0. See [LICENSE](https://github.com/hashgraph/asset-tokenization-studio/blob/main/LICENSE) for details.
