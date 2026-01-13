---
id: deployed-addresses
title: Deployed Contract Addresses
sidebar_label: Deployed Addresses
sidebar_position: 1
---

# Deployed Contract Addresses

Latest deployed smart contract addresses for Asset Tokenization Studio.

## Hedera Testnet

**Smart Contract Version:** 2.0.1

| Contract      | Contract ID | EVM Address                                | HashScan                                                             |
| ------------- | ----------- | ------------------------------------------ | -------------------------------------------------------------------- |
| BLR Proxy     | 0.0.7511642 | 0x000000000000000000000000000000000072a39a | [View on HashScan](https://hashscan.io/testnet/contract/0.0.7511642) |
| Factory Proxy | 0.0.7512002 | 0x000000000000000000000000000000000072a4b2 | [View on HashScan](https://hashscan.io/testnet/contract/0.0.7512002) |
| ProxyAdmin    | 0.0.7511641 | 0x0000000000000000000000000000000000729399 | [View on HashScan](https://hashscan.io/testnet/contract/0.0.7511641) |

## Usage in Web App

Configure these addresses in your `.env.local` file:

```bash
# Smart Contract Version: 2.0.1
REACT_APP_RPC_RESOLVER='0.0.7511642'
REACT_APP_RPC_FACTORY='0.0.7512002'
```

See the complete `.env.sample` in `apps/ats/web/.env.sample` for all required environment variables.

## Usage in SDK

When initializing the SDK, provide these addresses in the configuration:

```typescript
import { Network, InitializationRequest } from "@hashgraph/asset-tokenization-sdk";

const initRequest = new InitializationRequest({
  network: "testnet",
  configuration: {
    resolverAddress: "0.0.7511642",
    factoryAddress: "0.0.7512002",
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

## Version History

| Version | BLR Proxy   | Factory Proxy | Release Date |
| ------- | ----------- | ------------- | ------------ |
| 2.0.1   | 0.0.7511642 | 0.0.7512002   | 2024-12-23   |

## Related Resources

- [Contract Architecture](./index.md) - Understanding the diamond pattern
- [Upgrading Contracts](./upgrading.md) - How upgrades work
- [SDK Integration](../sdk-integration.md) - Using these addresses in your code
