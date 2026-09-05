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


## Reading the source for a deployed version

The addresses above run **contract version 4.0.0**. Read struct definitions and role
constants from the matching release tag, **not from `main`** — several ABI-affecting
changes have landed since.

`SecurityData` was reordered after `v5.0.0-ats`. The fields and their types are unchanged,
but the order is not, so it is a different tuple and therefore a different selector:

| `deployBond` field order | selector | present in `0.0.7708430` bytecode |
| --- | --- | --- |
| `main` (contracts 8.0.0) | `0x29002951` | no |
| `v3.1.0-ats` … `v5.0.0-ats` (bools first) | `0x5133f0e0` | yes |

Calling the deployed factory with a payload built from `main` fails as `execution reverted`
with **no data and no reason string**, identically for every `configId`, because the proxy
has no matching function to dispatch to. That looks like a bad configuration and is not one,
which makes it expensive to diagnose.

Role hashes moved as well, and that one fails more quietly: `_ISSUER_ROLE` is `0x4be32e88…`
in the deployed version and `0x5eeaf560…` on `main`. A grant made with the `main` constants
lands on a hash the deployed contract never checks, so `hasRole()` returns `true` while every
guarded call still reverts. Only `DEFAULT_ADMIN_ROLE` (`0x00`) is stable across versions.

Note also that `v4.0.0-ats` is not tagged in this repository; the nearest tags are
`v3.1.0-ats` and `v4.1.0-ats`, which share the deployed field order.

## Version History

| Version | BLR Proxy   | Factory Proxy | Release Date |
| ------- | ----------- | ------------- | ------------ |
| 4.0.0   | 0.0.7707874 | 0.0.7708432   | 2026-01-22   |
| 2.0.1   | 0.0.7511642 | 0.0.7512002   | 2024-12-23   |

## Related Resources

- [Contract Architecture](./index.md) - Understanding the diamond pattern
- [Upgrading Contracts](./upgrading.md) - How upgrades work
- [SDK Integration](../sdk-integration.md) - Using these addresses in your code
