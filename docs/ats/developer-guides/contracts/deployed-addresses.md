---
id: deployed-addresses
title: Deployed Contract Addresses
sidebar_label: Deployed Addresses
sidebar_position: 1
---

# Deployed Contract Addresses

Latest deployed smart contract addresses for Asset Tokenization Studio.

## Hedera Testnet

**Smart Contract Version:** 4.0.0

### Infrastructure Contracts

| Contract               | Contract ID | EVM Address                                | HashScan                                                             |
| ---------------------- | ----------- | ------------------------------------------ | -------------------------------------------------------------------- |
| ProxyAdmin             | 0.0.7707872 | 0x76220dAa89df1d0be4C6997Dc401FCB98A586F6a | [View on HashScan](https://hashscan.io/testnet/contract/0.0.7707872) |
| BLR Proxy              | 0.0.7707874 | 0xEFEF4CAe9642631Cfc6d997D6207Ee48fa78fe42 | [View on HashScan](https://hashscan.io/testnet/contract/0.0.7707874) |
| BLR Implementation     | 0.0.7707873 | 0xd53A586C1b11a5E7c34912a466e97c02Ad2d5786 | [View on HashScan](https://hashscan.io/testnet/contract/0.0.7707873) |
| Factory Proxy          | 0.0.7708432 | 0x5fA65CA30d1984701F10476664327f97c864A9D3 | [View on HashScan](https://hashscan.io/testnet/contract/0.0.7708432) |
| Factory Implementation | 0.0.7708430 | 0x3803219f13E23998FdDCa67AdA60EeB8E62eEEA8 | [View on HashScan](https://hashscan.io/testnet/contract/0.0.7708430) |

### Token Configurations

| Configuration                               | Config ID | Version | Facet Count |
| ------------------------------------------- | --------- | ------- | ----------- |
| Equity                                      | 0x01      | 1       | 44          |
| Bond (Standard)                             | 0x02      | 1       | 47          |
| Bond Fixed Rate                             | 0x03      | 1       | 48          |
| Bond KPI Linked Rate                        | 0x04      | 1       | 48          |
| Bond Sustainability Performance Target Rate | 0x05      | 1       | 49          |

> **Note**: v4.0.0 introduces four bond types with different interest rate mechanisms. See [Creating Bonds](../../user-guides/creating-bond.md) for details on each bond type.

## Usage in Web App

Configure these addresses in your `.env.local` file:

```bash
# Smart Contract Version: 4.0.0
REACT_APP_RPC_RESOLVER='0.0.7707874'
REACT_APP_RPC_FACTORY='0.0.7708432'
```

See the complete `.env.sample` in `apps/ats/web/.env.sample` for all required environment variables.

## Usage in SDK

When initializing the SDK, provide these addresses in the configuration:

```typescript
import { Network, InitializationRequest } from "@hashgraph/asset-tokenization-sdk";

const initRequest = new InitializationRequest({
  network: "testnet",
  configuration: {
    resolverAddress: "0.0.7707874",
    factoryAddress: "0.0.7708432",
  },
  // ... other configuration
});

await Network.init(initRequest);
```

See the [SDK Integration Guide](../sdk-integration.md) for complete initialization examples.

## Contract Information

### Business Logic Resolver (BLR) Proxy

The BLR acts as a central registry that maps Business Logic Keys (BLK) to versioned facet implementations. Tokens query the resolver to determine which logic version to execute.

### Factory Proxy

The Factory contract deploys new security tokens using the Diamond Pattern. It creates the token proxy and links it to the appropriate configuration in the Business Logic Resolver.

### ProxyAdmin

Manages upgrade permissions for both the BLR Proxy and Factory Proxy contracts.

## Deployment Statistics

| Metric                | Value      |
| --------------------- | ---------- |
| Total Facets Deployed | 192        |
| Configurations        | 5          |
| Deployment Date       | 2026-01-22 |

## Version History

| Version | BLR Proxy   | Factory Proxy | Release Date |
| ------- | ----------- | ------------- | ------------ |
| 4.0.0   | 0.0.7707874 | 0.0.7708432   | 2026-01-22   |
| 2.0.1   | 0.0.7511642 | 0.0.7512002   | 2024-12-23   |

## Deployment Files

Complete deployment outputs including all facet addresses are stored in the repository:

```
packages/ats/contracts/deployments/
├── hedera-testnet/
│   ├── newBlr-2026-01-22T11-09-49.json   # Latest v4.0.0 deployment
│   └── ...                                # Previous deployments
└── hedera-mainnet/
    └── ...
```

Each deployment file contains:

- Infrastructure contract addresses (ProxyAdmin, BLR, Factory)
- All facet addresses with their resolver keys
- Configuration details for each token type
- Hedera Contract IDs and EVM addresses

**Example**: To get all facet addresses from a deployment:

```bash
# View the deployment file
cat packages/ats/contracts/deployments/hedera-testnet/newBlr-2026-01-22T11-09-49.json

# Extract specific facet address using jq
jq '.facets[] | select(.name == "BondUSAFacet")' \
  packages/ats/contracts/deployments/hedera-testnet/newBlr-2026-01-22T11-09-49.json
```

## Related Resources

- [Contract Architecture](./index.md) - Understanding the diamond pattern
- [Upgrading Contracts](./upgrading.md) - How upgrades work
- [SDK Integration](../sdk-integration.md) - Using these addresses in your code
