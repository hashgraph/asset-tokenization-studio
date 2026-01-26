# Mass Payout Contracts

This package contains the smart contracts for the Mass Payout functionality of the Asset Tokenization Studio, designed to enable efficient batch payout operations on the Hedera network.

## Overview

The Mass Payout contracts provide a framework for executing bulk payment distributions, particularly useful for dividend payments, bond coupon distributions, and other recurring financial obligations to multiple token holders.

## Key Components

- **LifeCycleCashFlow.sol** - Core contract implementing lifecycle-based cash flow management
- **LifeCycleCashFlowStorageWrapper.sol** - Storage wrapper for managing contract state and upgrades
- **Core contracts** - Located in `contracts/core/` directory
- **Interfaces** - Contract interfaces in `contracts/interfaces/` directory
- **Proxies** - Proxy pattern implementations for upgradeable contracts
- **Test contracts** - Mock and test helper contracts

## Features

- Batch payout operations for multiple recipients
- Lifecycle-based cash flow management
- Upgradeable contract architecture using proxy patterns
- Integration with Hedera network capabilities
- Gas-optimized bulk operations

## Development

### Prerequisites

- Node.js v20.19.4 or newer
- npm v10.8.2 or newer
- Hardhat development environment

### Setup

1. Install dependencies from the project root:

   ```bash
   npm ci
   ```

2. Configure environment variables:
   ```bash
   cp .env.sample .env
   # Edit .env with your configuration
   ```

### Building

```bash
# All mass payout modules from project root
npm run build

# Or only contracts module from contracts directory
npx hardhat compile
```

## Testing

```bash
# All mass payout tests from project root
npm run mass-payout:test

# Or run only contracts tests from contracts directory
npx hardhat test
```

## Deployment

The contracts can be deployed using the provided deployment scripts in the `scripts/` directory.

## Architecture

The contracts follow enterprise-grade patterns including:

- **Proxy Pattern** - For contract upgradeability
- **Modular Design** - Separation of concerns across multiple contracts
- **Access Control** - Role-based permissions for operations
- **Event Logging** - Comprehensive event emission for off-chain monitoring

## Integration

These contracts are designed to work with:

- Asset Tokenization Studio (ATS) token contracts
- Mass Payout SDK for programmatic interaction
- Mass Payout frontend and backend applications

---

## 📚 Documentation

For more information about the project, see:

- [Guides](https://github.com/hashgraph/asset-tokenization-studio/tree/main/docs/guides)
- [API Documentation](https://github.com/hashgraph/asset-tokenization-studio/tree/main/docs/api)
- [References](https://github.com/hashgraph/asset-tokenization-studio/tree/main/docs/references)

## License

Apache License 2.0
