---
id: creating-an-asset-type
title: Creating an Asset Type
sidebar_label: Creating an asset type
---

# Creating an Asset Type

How to define a brand-new **configuration** — what this guide also calls an _asset type_ (e.g. a
Fund): a `configurationId` with its own facet set. ("Asset type" and "configuration" refer to the
same thing here; the on-chain object is a _configuration_.) This builds on
[Adding a facet](./adding-a-facet.md) (for any custom logic) and
[Managing the BLR](./managing-the-blr.md) (for the on-chain registration).

:::info Two kinds of "new asset type"

- **New configuration only** (this guide's main path): a new facet set + configuration ID,
  deployed against the existing Factory via the generic
  [`deployProxy`](./deploying-an-asset-proxy.md). **No Solidity contract changes** to the Factory.
- **New typed Factory entry point** (e.g. a dedicated `deployFund`): also requires editing the
  Factory contract (`factory/Factory.sol`, `IFactory.sol`) and redeploying it. Only do this if you
  need bespoke on-chain initialisation beyond what `deployProxy` provides.
  :::

## Prerequisites

- You know which facets the asset needs (start from the shared tiers in
  [`scripts/domain/facetSets.ts`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/domain/facetSets.ts)).
- Any asset-specific facets are implemented and the registry/hashes are regenerated
  (`npm run ats:contracts:build`). See [Adding a facet](./adding-a-facet.md).

## Step 1 — Define the configuration ID

Add the new ID to
[`scripts/domain/constants.ts`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/domain/constants.ts),
following the `bytes32(uint256(N))` scheme. IDs **1–7** are the current asset types and **8–9** are
reserved (`FACTORY`, `INITIALIZE_MOCK`), so the next free value for a new asset type is `10`:

```typescript
/**
 * Fund configuration ID — bytes32(uint256(10)).
 */
export const FUND_CONFIG_ID = "0x000000000000000000000000000000000000000000000000000000000000000a";
```

## Step 2 — Compose the facet list

Create `scripts/domain/fund/createConfiguration.ts`. Compose the list from the shared, compile-checked
tiers in `facetSets.ts` plus a small fund-specific delta — do **not** hand-maintain a flat
~90-entry array:

```typescript
import { COMMON_TOKEN_FACETS, EXTENDED_TOKEN_FACETS } from "@scripts/domain/facetSets";
import type { FacetName } from "@scripts/domain/atsRegistry";

const FUND_FACETS = [
  ...COMMON_TOKEN_FACETS,
  ...EXTENDED_TOKEN_FACETS,
  // Fund-specific additions:
  "FundManagementFacet",
] as const satisfies readonly FacetName[];
```

Because every entry is checked against the generated `FacetName` union, a typo or a renamed facet is
a **compile error**, not a runtime lookup miss. Wrap this in a `createFundConfiguration(...)` that
calls the generic batch-configuration operation with `FUND_CONFIG_ID` and `FUND_FACETS`, mirroring
the existing `equity` / `bond` modules.

## Step 3 — Wire it into the domain and workflows

- **Export** `createFundConfiguration` and `FUND_CONFIG_ID` from
  [`scripts/domain/index.ts`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/domain/index.ts).
- **(Optional) deploy helper** — add a factory helper under `scripts/domain/factory/` if you want a
  one-call deploy for the new asset.
- **Include it in the full deployment** — add the configuration to the workflows in
  `scripts/workflows/deploySystemWithNewBlr.ts` and `deploySystemWithExistingBlr.ts`, and register
  it in the checkpoint types (`scripts/infrastructure/checkpoint/…`) so the step is tracked and
  resumable.
- **(Testing)** add a token fixture under `test/fixtures/…` and export it from the fixtures index.

> The in-repo [`scripts/DEVELOPER_GUIDE.md`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/DEVELOPER_GUIDE.md)
> (Scenario 2) keeps the canonical, file-by-file checklist for this step.

## Step 4 — Register facets and create the configuration

With the BLR deployed, register any new facets and create the first version of the configuration.
These are the same operations described in [Managing the BLR](./managing-the-blr.md):

1. **Register** the facets (`registerBusinessLogics`) so their resolver keys map to deployed
   addresses. (Already-registered common facets are safely re-registered.)
2. **Create** the configuration version with `createConfiguration` (or `createBatchConfiguration`
   for large facet sets), passing `FUND_CONFIG_ID` and the `FacetConfiguration[]` (each facet's
   resolver key pinned to its version).

The deployment scripts do this for you when the new configuration is wired into the workflow
(Step 3) — re-run the appropriate [deployment workflow](./deployment-workflows.md).

## Step 5 — Deploy a token and verify

Deploy a token against the new configuration with the generic
[`deployProxy`](./deploying-an-asset-proxy.md), passing `FUND_CONFIG_ID`:

```js
const version = await blr.getLatestVersionByConfiguration(FUND_CONFIG_ID);
await factory.deployProxy(BLR_PROXY, FUND_CONFIG_ID, version, rbacs, "0x");
```

Verify the configuration was created:

```js
const v = await blr.getLatestVersionByConfiguration(FUND_CONFIG_ID); // > 0
const n = await blr.getFacetsLengthByConfigurationIdAndVersion(FUND_CONFIG_ID, v);
console.log(`Fund config v${v} with ${n} facets`);
```

## File checklist

- [ ] `scripts/domain/constants.ts` — add `FUND_CONFIG_ID`.
- [ ] `scripts/domain/fund/createConfiguration.ts` — compose `FUND_FACETS` from `facetSets.ts`.
- [ ] `scripts/domain/index.ts` — export the new module and ID.
- [ ] `scripts/domain/factory/…` — (optional) deploy helper.
- [ ] `scripts/workflows/deploySystemWith{New,Existing}Blr.ts` — include the configuration.
- [ ] `scripts/infrastructure/checkpoint/…` — register the new step type.
- [ ] `test/fixtures/…` — (testing) add a fixture.
- [ ] `contracts/facets/…` — any asset-specific facets (see [Adding a facet](./adding-a-facet.md)).

## Related pages

- [Adding a facet](./adding-a-facet.md) — build the custom logic a new asset needs.
- [Managing the BLR](./managing-the-blr.md) — register facets and create configurations.
- [Deploying a token](./deploying-an-asset-proxy.md) — deploy a token against the configuration.
- [Core concepts → Configurations](./core-concepts.md#configurations)
