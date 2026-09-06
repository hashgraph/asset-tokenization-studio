---
id: deployed-addresses
title: Deployed Contract Addresses
sidebar_label: Deployed Addresses
sidebar_position: 1
---

# Deployed Contract Addresses

Latest deployed smart contract addresses for Asset Tokenization Studio.

## Hedera Testnet

**Smart Contract Version:** 8.0.0

### Infrastructure Contracts

| Contract               | Contract ID | EVM Address                                | HashScan                                                             |
| ---------------------- | ----------- | ------------------------------------------ | -------------------------------------------------------------------- |
| ProxyAdmin             | 0.0.9212218 | 0x92664e864200b8fa891195ceec93880f5bfa6f22 | [View on HashScan](https://hashscan.io/testnet/contract/0.0.9212218) |
| BLR Proxy              | 0.0.9212226 | 0xBA2D5FC2083A0b8f164c50e65d782087fBA18E0a | [View on HashScan](https://hashscan.io/testnet/contract/0.0.9212226) |
| BLR Implementation     | 0.0.9212222 | 0x86ba690fa76625162501ec1e773056870e56a06d | [View on HashScan](https://hashscan.io/testnet/contract/0.0.9212222) |
| Factory Proxy          | 0.0.9213391 | 0xd1F118A40f3b02883D35909eF2517e7EDd78379d | [View on HashScan](https://hashscan.io/testnet/contract/0.0.9213391) |

The BLR Proxy and Factory Proxy addresses are the two an integrator configures,
and they match `apps/ats/web/.env.example` in this repository
(`REACT_APP_RPC_RESOLVER` and `REACT_APP_RPC_FACTORY`).

> The Factory Implementation row has been left out rather than carried over. The
> factory proxy does not expose its implementation through the EIP-1967 slot or
> a public view, so it could not be verified the way the others were, and a
> stale address is worse than an absent one. A maintainer with the deployment
> output can restore the row.

## Version History

| Version | BLR Proxy   | Factory Proxy | Release Date |
| ------- | ----------- | ------------- | ------------ |
| 8.0.0   | 0.0.9212226 | 0.0.9213391   | 2026-06-12   |
| 4.0.0   | 0.0.7707874 | 0.0.7708432   | 2026-01-22   |
| 2.0.1   | 0.0.7511642 | 0.0.7512002   | 2024-12-23   |

## Related Resources

- [Contract Architecture](./index.md) - Understanding the diamond pattern
- [Upgrading Contracts](./upgrading.md) - How upgrades work
- [SDK Integration](../sdk-integration.md) - Using these addresses in your code
