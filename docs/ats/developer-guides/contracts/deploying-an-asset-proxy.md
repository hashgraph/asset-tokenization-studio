---
id: deploying-an-asset-proxy
title: Deploying an Asset Proxy
sidebar_label: Deploying an asset proxy
---

# Deploying an Asset Proxy

## Table of Contents

- [Method signature](#method-signature)
  - [The `Rbac` struct](#the-rbac-struct)
- [Minimal example](#minimal-example)
- [Common configuration IDs](#common-configuration-ids)
- [Errors](#errors)
- [Event emitted](#event-emitted)

Every ATS token is a **ResolverProxy** — a lightweight proxy contract that delegates all calls to the facets registered in the BLR for a given configuration. The `deployProxy` method on the Factory contract is the generic entry point for creating one.

:::tip Typed vs generic entry points
For equities, bonds, and deposit tokens the Factory also exposes typed helpers — `deployEquity`,
`deployBond`, `deployDepositToken` — that take the full asset configuration and apply regulation
data. `deployProxy` is the lower-level, generic path used for any configuration ID (including bond
variants and loans). See [Architecture → The Factory](./architecture.md#the-factory).
:::

## Method signature

```solidity
function deployProxy(
  IBusinessLogicResolver _resolver,
  bytes32 _configKey,
  uint256 _version,
  IResolverProxy.Rbac[] memory _rbacs,
  bytes calldata _data
) external returns (address proxyAddress_);
```

| Parameter    | Type      | Description                                                                           |
| ------------ | --------- | ------------------------------------------------------------------------------------- |
| `_resolver`  | `address` | Address of the BLR proxy. Must not be zero.                                           |
| `_configKey` | `bytes32` | ID of the configuration to use (e.g. Equity, Bond).                                   |
| `_version`   | `uint256` | Configuration version to pin (read the latest via `getLatestVersionByConfiguration`). |
| `_rbacs`     | `Rbac[]`  | Initial role assignments for the token. At least one admin must be included.          |
| `_data`      | `bytes`   | Additional initialisation data forwarded to the proxy (`"0x"` if unused).             |

### The `Rbac` struct

```solidity
struct Rbac {
  bytes32 role; // Role identifier (e.g. DEFAULT_ADMIN_ROLE)
  address[] members; // Accounts to assign the role to
}
```

## Minimal example

```typescript
import { ethers } from "hardhat";

const factory = await ethers.getContractAt("Factory", FACTORY_ADDRESS);

const rbacs = [
  {
    role: ethers.ZeroHash, // DEFAULT_ADMIN_ROLE
    members: [await deployer.getAddress()],
  },
];

// Pin an explicit configuration version in production:
const version = await blr.getLatestVersionByConfiguration(EQUITY_CONFIG_ID);

const tx = await factory.deployProxy(
  BLR_PROXY_ADDRESS, // resolver
  EQUITY_CONFIG_ID, // configKey (bytes32)
  version, // pinned configuration version
  rbacs,
  "0x", // additional init data
);

const receipt = await tx.wait();

// The new proxy address is emitted in the ProxyDeployed event
const event = receipt.logs.find((log) => log.topics[0] === factory.interface.getEvent("ProxyDeployed").topicHash);
const proxyAddress = factory.interface.parseLog(event).args.proxyAddress;

console.log("Token proxy deployed at:", proxyAddress);
```

## Common configuration IDs

These are the standard `_configKey` values defined in ATS:

| Token type             | Config ID             |
| ---------------------- | --------------------- |
| Equity                 | `bytes32(uint256(1))` |
| Bond (variable rate)   | `bytes32(uint256(2))` |
| Bond (fixed rate)      | `bytes32(uint256(3))` |
| Bond (KPI-linked rate) | `bytes32(uint256(4))` |
| Deposit token          | `bytes32(uint256(5))` |
| Loan                   | `bytes32(uint256(6))` |
| Loans portfolio        | `bytes32(uint256(7))` |

These constants are defined in
[`scripts/domain/constants.ts`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/domain/constants.ts).
See [Core concepts → Configurations](./core-concepts.md#configurations).

## Errors

| Error             | Cause                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------- |
| `EmptyResolver`   | `_resolver` is the zero address.                                                      |
| `NoInitialAdmins` | `_rbacs` contains no entry that assigns `DEFAULT_ADMIN_ROLE` to at least one account. |

## Event emitted

```solidity
event ProxyDeployed(
  address indexed proxyAddress,
  IBusinessLogicResolver resolver,
  bytes32 configKey,
  uint256 version,
  IResolverProxy.Rbac[] rbac,
  bytes data
);
```

## Related pages

- [Architecture → The Factory](./architecture.md#the-factory)
- [Core concepts → Configurations](./core-concepts.md#configurations)
- [Managing the BLR](./managing-the-blr.md) — create the configuration this proxy resolves against.
- [Creating an asset type](./creating-an-asset-type.md)
