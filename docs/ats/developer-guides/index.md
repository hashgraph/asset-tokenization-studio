---
id: index
title: Developer Guides
sidebar_position: 4
---

# Developer Guides

Technical guides for developers building with or extending Asset Tokenization Studio.

## Architecture Overview

ATS uses a modular, layered architecture designed for flexibility and upgradeability.

```mermaid
graph TB
    subgraph "Web Application"
        UI[React dApp]
    end

    subgraph "SDK Layer"
        Services[SDK Services]
        Bus[Command/Query Bus]
        Handlers[Domain Handlers]
        Adapters[Transaction Adapters]
    end

    subgraph "Smart Contracts"
        Proxy[Diamond Proxy]
        Resolver[Business Logic Resolver]

        subgraph "Facets (Layers)"
            L0[Layer 0: Storage]
            L1[Layer 1: Core Logic]
            L2[Layer 2: Features]
            L3[Layer 3: Jurisdiction]
        end
    end

    subgraph "Hedera Network"
        HTS[Hedera Token Service]
        Mirror[Mirror Node]
    end

    UI --> Services
    Services --> Bus
    Bus --> Handlers
    Handlers --> Adapters
    Adapters --> Proxy
    Proxy --> Resolver
    Resolver --> L0
    L0 --> L1
    L1 --> L2
    L2 --> L3
    L3 --> HTS
    Adapters -.Query.-> Mirror

    style UI fill:#e1f5ff
    style Services fill:#fff4e1
    style Proxy fill:#ffe1f5
    style HTS fill:#e1ffe1
```

| Component     | Technology                           | Purpose                               |
| ------------- | ------------------------------------ | ------------------------------------- |
| **Web App**   | React 18, Zustand, Material-UI       | User interface for token management   |
| **SDK**       | TypeScript, tsyringe, CQRS           | Programmatic access to all operations |
| **Contracts** | Solidity, Diamond Pattern (EIP-2535) | On-chain token logic and compliance   |
| **Hedera**    | HTS, Mirror Node, RPC                | Blockchain infrastructure             |

---

## Available Guides

### Smart Contracts

<div className="card-grid card-grid-2">
  <div className="card-box">
    <h4>Contract Architecture</h4>
    <p>Deep dive into the Diamond Pattern and 4-layer design</p>
    <a href="./contracts/overview">View Guide →</a>
  </div>

  <div className="card-box">
    <h4>Deployed Addresses</h4>
    <p>Current contract addresses for testnet and mainnet</p>
    <a href="./contracts/deployed-addresses">View Addresses →</a>
  </div>

  <div className="card-box">
    <h4>Deployment</h4>
    <p>Deploy the ATS contract system</p>
    <a href="./contracts/deployment">View Guide →</a>
  </div>

  <div className="card-box">
    <h4>Adding Facets</h4>
    <p>Create and integrate new facets</p>
    <a href="./contracts/adding-facets">View Guide →</a>
  </div>

  <div className="card-box">
    <h4>Upgrading Facets</h4>
    <p>Safely upgrade facets in production</p>
    <a href="./contracts/upgrading">View Guide →</a>
  </div>

  <div className="card-box">
    <h4>Documenting Contracts</h4>
    <p>Write contract documentation with NatSpec</p>
    <a href="./contracts/documenting-contracts">View Guide →</a>
  </div>
</div>

### SDK Integration

<div className="card-grid card-grid-2">
  <div className="card-box">
    <h4>SDK Integration</h4>
    <p>Quick guide to integrate the ATS SDK in your project</p>
    <a href="./sdk-integration">View Guide →</a>
  </div>

  <div className="card-box">
    <h4>SDK Overview</h4>
    <p>Detailed overview of SDK architecture and available operations</p>
    <a href="./sdk-overview">View Guide →</a>
  </div>
</div>

### Web Application

_Coming soon_ - Learn how to customize and extend the ATS web application.

---

## Key Architectural Patterns

| Pattern                        | Where Used      | Purpose                                                 |
| ------------------------------ | --------------- | ------------------------------------------------------- |
| **Diamond Pattern (EIP-2535)** | Smart Contracts | Modular, upgradeable contracts without size limits      |
| **CQRS**                       | SDK             | Separate read (queries) and write (commands) operations |
| **Hexagonal Architecture**     | SDK             | Decouple business logic from infrastructure (adapters)  |
| **Dependency Injection**       | SDK             | Testable, loosely coupled components via tsyringe       |

## Quick Links

- [API Documentation](../api/index.md) - Technical reference
- [User Guides](../user-guides/index.md) - Application usage
- [GitHub Repository](https://github.com/hashgraph/asset-tokenization-studio)
