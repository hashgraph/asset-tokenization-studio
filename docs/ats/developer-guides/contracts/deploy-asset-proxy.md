---
id: deploy-asset-proxy
title: How to Deploy an Asset Proxy
sidebar_label: Deploy Asset Proxy
---

# How to Deploy an Asset Proxy

## Table of Contents

- [Method signature](#method-signature)
  - [The `Rbac` struct](#the-rbac-struct)
- [Minimal example](#minimal-example)
- [Common configuration IDs](#common-configuration-ids)
- [Errors](#errors)
- [Event emitted](#event-emitted)

Every ATS token is a **ResolverProxy** — a lightweight proxy contract that delegates all calls to the facets registered in the BLR for a given configuration. The `deployProxy` method on the Factory contract is the generic entry point for creating one.

## Method signature

```solidity
function deployProxy(
  IBusinessLogicResolver _resolver,
  bytes32 _configKey,
  uint256 _version,
  IResolverProxy.Rbac[] calldata _rbacs
) external returns (address proxyAddress_);
```

| Parameter    | Type      | Description                                                                  |
| ------------ | --------- | ---------------------------------------------------------------------------- |
| `_resolver`  | `address` | Address of the BLR proxy. Must not be zero.                                  |
| `_configKey` | `bytes32` | ID of the configuration to use (e.g. Equity, Bond).                          |
| `_version`   | `uint256` | Configuration version.                                                       |
| `_rbacs`     | `Rbac[]`  | Initial role assignments for the token. At least one admin must be included. |

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

const tx = await factory.deployProxy(
  BLR_PROXY_ADDRESS, // resolver
  EQUITY_CONFIG_ID, // configKey  (bytes32)
  0, // version 0 = always latest
  rbacs,
);

const receipt = await tx.wait();

// The new proxy address is emitted in the ProxyDeployed event
const event = receipt.logs.find((log) => log.topics[0] === factory.interface.getEvent("ProxyDeployed").topicHash);
const proxyAddress = factory.interface.parseLog(event).args.proxyAddress;

console.log("Token proxy deployed at:", proxyAddress);
```

## Common configuration IDs

These are the standard `_configKey` values defined in ATS:

| Token type                        | Config ID             |
| --------------------------------- | --------------------- |
| Equity                            | `bytes32(uint256(1))` |
| Bond (variable rate)              | `bytes32(uint256(2))` |
| Bond (fixed rate)                 | `bytes32(uint256(3))` |
| Bond (KPI-linked rate)            | `bytes32(uint256(4))` |
| Bond (sustainability target rate) | `bytes32(uint256(5))` |
| Loan                              | `bytes32(uint256(6))` |
| Loans Portfolio                   | `bytes32(uint256(7))` |

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
  IResolverProxy.Rbac[] rbac
);
```
