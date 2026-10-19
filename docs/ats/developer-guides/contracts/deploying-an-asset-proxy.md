---
id: deploying-an-asset-proxy
title: Deploying a Token
sidebar_label: Deploying a token
---

# Deploying a Token

Tokens are always created by calling the **Factory** — you never deploy a `ResolverProxy` on its own.
Each asset type has its own entry point:

- **Equity, bonds, and deposit tokens** use **typed** Factory methods that deploy the proxy _and_ run
  every facet initialiser (metadata, compliance, corporate actions, …), apply regulation data, and
  mark the token operational.
- **Loans and loans-portfolios** have no typed method, so they're created with the generic
  [`deployProxy`](#the-generic-deployproxy-primitive).

The TypeScript deploy helper for each asset lives in
[`scripts/domain/factory/`](https://github.com/hashgraph/asset-tokenization-studio/tree/main/packages/ats/contracts/scripts/domain/factory)
(`deployEquityToken.ts`, `deployDepositToken.ts`, `deployLoanToken.ts`, `deployLoansPortfolioToken.ts`, …).

## How each asset type is deployed

| Asset                      | Factory method                                                | Config ID                            |
| -------------------------- | ------------------------------------------------------------- | ------------------------------------ |
| **Equity**                 | `deployEquity(EquityData, FactoryRegulationData)`             | `EQUITY_CONFIG_ID` (1)               |
| **Bond** (variable rate)   | `deployBond(BondData, FactoryRegulationData)`                 | `BOND_CONFIG_ID` (2)                 |
| **Bond** (fixed rate)      | `deployBond(BondData, FactoryRegulationData)`                 | `BOND_FIXED_RATE_CONFIG_ID` (3)      |
| **Bond** (KPI-linked rate) | `deployBond(BondData, FactoryRegulationData)`                 | `BOND_KPI_LINKED_RATE_CONFIG_ID` (4) |
| **Deposit token**          | `deployDepositToken(DepositTokenData, FactoryRegulationData)` | `DEPOSIT_TOKEN_CONFIG_ID` (5)        |
| **Loan**                   | `deployProxy(resolver, configKey, version, rbacs, data)`      | `LOAN_CONFIG_ID` (6)                 |
| **Loans portfolio**        | `deployProxy(resolver, configKey, version, rbacs, data)`      | `LOANS_PORTFOLIO_CONFIG_ID` (7)      |

The three **bond variants** share one method (`deployBond`); the variant is selected by the
**configuration ID** you pass in `SecurityData.resolverProxyConfiguration.key` — there is no separate
`deployBondFixedRate` / `deployBondKpiLinkedRate`. All method and struct definitions are in
[`factory/IFactory.sol`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/contracts/factory/IFactory.sol);
the config IDs are in [`scripts/domain/constants.ts`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/domain/constants.ts).

## Typed methods (equity, bonds, deposit token)

Each typed method takes a per-asset data struct plus `FactoryRegulationData`, deploys the proxy, and
**fully initialises** it. The input structs (in `IFactory.sol`) are:

- `EquityData` = `SecurityData` + `EquityDetailsData` (dividend type, voting/information/liquidation/…
  rights, nominal value).
- `BondData` = `SecurityData` + `BondDetailsData` (currency, nominal value, start & maturity dates) +
  proceed recipients.
- `DepositTokenData` = `SecurityData`.

`SecurityData` carries the configuration shared by every asset: the `resolver` (the BLR),
`resolverProxyConfiguration` (config ID + version), ERC-20 metadata, the initial `rbacs`, supply cap,
compliance / identity-registry addresses, external pause/control/KYC lists, and the feature flags
(multi-partition, controllable, whitelist, clearing, …).

```typescript
import { ethers } from "hardhat";

const factory = await ethers.getContractAt("Factory", FACTORY_ADDRESS);

// equityData: IFactory.EquityData, regulationData: IFactory.FactoryRegulationData
// (see scripts/domain/factory/deployEquityToken.ts for a full, populated example)
const tx = await factory.deployEquity(equityData, regulationData);
const receipt = await tx.wait();
// the new token address is in the EquityDeployed event
```

`deployBond` and `deployDepositToken` follow the same shape with their own structs and the
`BondDeployed` / `DepositTokenDeployed` events.

## Loan & loans portfolio (via `deployProxy`)

Loans and loans-portfolios have **no typed Factory method**, so their deploy helpers call the generic
`deployProxy` with `LOAN_CONFIG_ID` / `LOANS_PORTFOLIO_CONFIG_ID`. See
[`deployLoanToken.ts`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/domain/factory/deployLoanToken.ts)
and `deployLoansPortfolioToken.ts` for the full flow.

## The generic `deployProxy` primitive

`deployProxy` deploys a `ResolverProxy` wired to a configuration and seeds its initial roles. It's the
deploy path for loan / loans-portfolio above, and the entry point for **any new configuration that
doesn't yet have a typed method** (see [Creating an asset type](./creating-an-asset-type.md)).

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
| `_configKey` | `bytes32` | ID of the configuration to use.                                                       |
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

### Example

```typescript
import { ethers } from "hardhat";

const factory = await ethers.getContractAt("Factory", FACTORY_ADDRESS);

const rbacs = [
  {
    role: ethers.ZeroHash, // DEFAULT_ADMIN_ROLE
    members: [await deployer.getAddress()],
  },
];

// Loan tokens use deployProxy (no typed method):
const version = await blr.getLatestVersionByConfiguration(LOAN_CONFIG_ID);

const tx = await factory.deployProxy(
  BLR_PROXY_ADDRESS, // resolver
  LOAN_CONFIG_ID, // configKey (bytes32)
  version, // pinned configuration version
  rbacs,
  "0x", // additional init data
);

const receipt = await tx.wait();
// the new proxy address is emitted in the ProxyDeployed event
const event = receipt.logs.find((log) => log.topics[0] === factory.interface.getEvent("ProxyDeployed").topicHash);
const proxyAddress = factory.interface.parseLog(event).args.proxyAddress;
console.log("Token proxy deployed at:", proxyAddress);
```

### Errors

| Error             | Cause                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------- |
| `EmptyResolver`   | `_resolver` is the zero address.                                                      |
| `NoInitialAdmins` | `_rbacs` contains no entry that assigns `DEFAULT_ADMIN_ROLE` to at least one account. |

### Event emitted

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
- [Managing the BLR](./managing-the-blr.md) — create the configuration a token resolves against.
- [Creating an asset type](./creating-an-asset-type.md) — add a new configuration (uses `deployProxy`).
