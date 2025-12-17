---
sidebar_position: 1
slug: /
---

# Welcome to Asset Tokenization Studio

Welcome to the **Asset Tokenization Studio (ATS) Documentation Hub**. This comprehensive documentation site provides everything you need to understand, develop, and contribute to the ATS ecosystem.

## What is Asset Tokenization Studio?

The **Asset Tokenization Studio Monorepo** provides tools for tokenizing financial assets on the Hedera network and managing large-scale payout distributions. It consists of two main systems:

### Asset Tokenization Studio (ATS)

Security tokens (equities and bonds) compliant with **ERC-1400** and partial **ERC-3643 (T-REX)** standards. ATS enables:

- **Tokenized Equities**: Digital shares with dividend distribution, voting rights, and corporate actions
- **Tokenized Bonds**: Digital bonds with coupon payments, maturity redemption, and lifecycle management
- **Compliance**: Built-in KYC/AML, transfer restrictions, and regulatory compliance features
- **Diamond Pattern**: Upgradeable smart contracts using EIP-2535 for modular, future-proof architecture

### Scheduler Payment Distribution (Mass Payout)

Batch payment infrastructure for dividends, coupons, and recurring obligations. Mass Payout provides:

- **Automated Distributions**: Schedule and execute batch payments to token holders
- **Snapshot Management**: Capture token holder balances at specific points in time
- **Payment Tracking**: Monitor distribution status and handle failures
- **Integration**: Seamless integration with ATS tokens and custom payment tokens

## Documentation Structure

This documentation is organized into several key sections:

### 📚 Documentation

Core technical documentation covering:

- **Getting Started**: Setup guides, prerequisites, and quick start tutorials
- **Architecture**: System design, patterns, and technical decisions
- **API Reference**: Auto-generated documentation for SDKs and smart contracts
- **User Manuals**: End-user guides for operators and administrators

### 🔧 Developer Guides

Step-by-step cookbooks for common development tasks:

- Adding new smart contract facets
- Integrating custodial wallets
- Writing tests and debugging
- Deployment procedures

### 📋 Architecture Decision Records (ADRs)

Historical records of significant architectural decisions. ADRs document:

- **Context**: What problem was being solved?
- **Decision**: What solution was chosen?
- **Consequences**: What are the trade-offs?

ADRs provide valuable context for understanding why the system is designed the way it is.

### 💡 Enhancement Proposals (EPs)

Proposals for new features or significant changes. EPs enable:

- **Community Input**: Discuss designs before implementation
- **Design Review**: Evaluate alternatives and trade-offs
- **Transparency**: Understand the project roadmap and direction

EPs are inspired by industry standards like Kubernetes KEPs, Ethereum EIPs, and Hedera HIPs.

## Quick Links

### For Users

- [ATS Quick Start](./ats/quick-start) _(coming soon)_
- [Mass Payout Quick Start](./mass-payout/quick-start) _(coming soon)_
- [FAQ](./faq) _(coming soon)_

### For Developers

- [Development Setup](./development/setup) _(coming soon)_
- [Contributing Guide](https://github.com/hashgraph/asset-tokenization-studio/blob/main/CONTRIBUTING.md)
- [Developer Guides](./guides)
- [Architecture Overview](./architecture/overview) _(coming soon)_

### For Contributors

- [How to Create an ADR](./adr)
- [How to Submit an EP](./proposals)
- [Code Review Guidelines](./development/code-review) _(coming soon)_

## Project Overview

### Monorepo Structure

The project uses **npm workspaces** with the following structure:

```
packages/
├── ats/
│   ├── contracts     # Solidity smart contracts (Diamond pattern)
│   └── sdk           # TypeScript SDK (CQRS + hexagonal architecture)
└── mass-payout/
    ├── contracts     # Solidity payout contracts
    └── sdk           # TypeScript SDK
apps/
├── ats/
│   └── web           # React dApp for asset management
├── mass-payout/
│   ├── backend       # NestJS API + PostgreSQL
│   └── frontend      # React admin panel
└── docs              # This documentation site
```

### Key Technologies

- **Blockchain**: Hedera Hashgraph
- **Smart Contracts**: Solidity (EIP-2535 Diamond Pattern)
- **Backend**: TypeScript, Node.js, NestJS
- **Frontend**: React, Material-UI, Chakra UI
- **Database**: PostgreSQL
- **Testing**: Hardhat, Jest, Vitest
- **Documentation**: Docusaurus, TypeDoc, Solidity Docgen

## Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/hashgraph/asset-tokenization-studio/issues)
- **Contributing**: Read our [CONTRIBUTING.md](https://github.com/hashgraph/asset-tokenization-studio/blob/main/CONTRIBUTING.md)
- **Hedera Community**: Join the [Hedera Discord](https://hedera.com/discord)

## License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](https://github.com/hashgraph/asset-tokenization-studio/blob/main/LICENSE) file for details.

## Next Steps

Ready to dive in? Here are some suggested paths:

- **New Users**: Start with the [ATS Quick Start](./ats/quick-start) to deploy your first security token
- **Developers**: Check out the [Development Setup](./development/setup) guide and explore the [Architecture Overview](./architecture/overview)
- **Contributors**: Read the [Contributing Guide](https://github.com/hashgraph/asset-tokenization-studio/blob/main/CONTRIBUTING.md) and browse existing [Enhancement Proposals](./proposals)

Welcome to the ATS community!
