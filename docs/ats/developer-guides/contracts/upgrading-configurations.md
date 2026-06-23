---
id: upgrading-configurations
title: Upgrading Configurations
sidebar_label: Upgrading configurations
---

# Upgrading Configurations

How to roll out new facet versions to token configurations — the **ResolverProxy (Diamond)** side of
upgrades. This is what changes a token's behaviour without redeploying it.

:::tip Which upgrade is this?
This page covers upgrading **token configurations** (Equity, Bond, …). To upgrade the **BLR or
Factory implementation** behind their proxies, see [Upgrading infrastructure](./upgrading-infrastructure.md).
The [Architecture](./architecture.md#two-proxy-patterns) page explains why these are different.
:::

## The model

Recall the [three-level versioning](./core-concepts.md#versioning):

1. Deploy improved facet(s).
2. `registerBusinessLogics` in the BLR — this bumps the **shared latest version** so all facets stay
   mutually consistent.
3. Create a **new configuration version** for the asset type, referencing the new facets.
4. Move tokens onto the new version (pinned), or let auto-update tokens pick it up.

No token is ever redeployed — a token's proxy bytecode never changes. Only the configuration version
it resolves against changes.

### Resolution modes

- **Pinned (recommended for production):** a token is fixed to a specific configuration version and
  only moves on an explicit transaction. Predictable and auditable.
- **Auto-update (dev/testing):** a token tracks the latest version and adopts new versions on the
  next call.

## Running an upgrade

The `upgrade:configs` workflow ([`scripts/cli/upgradeConfigurations.ts`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/cli/upgradeConfigurations.ts))
deploys the new facets, registers them, and creates new configuration versions.

```bash
BLR_ADDRESS=0x4363684B8a679EaBA17701F421Ddf71D6870A011 \
  npm run upgrade:configs:hedera:testnet
```

Aliases exist per network (`upgrade:configs:local`, `:hedera:previewnet`, `:hedera:mainnet`), and
`npm run upgrade:testnet` is shorthand for `upgrade:configs:hedera:testnet`.

### Environment variables

Configured in `.env` (see the **Upgrade workflow** section of `.env.example`):

| Variable          | Required | Meaning                                                                                                                        |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `BLR_ADDRESS`     | Yes      | The existing BusinessLogicResolver to upgrade.                                                                                 |
| `PROXY_ADDRESSES` | No       | Comma-separated ResolverProxy token addresses to move to the new version. Empty = create the version but don't move any token. |
| `CONFIGURATIONS`  | No       | Which configurations to (re)create: `equity`, `bond`, or `both` (default).                                                     |
| `USE_TIMETRAVEL`  | No       | Include TimeTravel facet variants (testing only).                                                                              |
| `BATCH_SIZE`      | No       | Facets processed per transaction.                                                                                              |

### Selective upgrades

Upgrade only equities, leaving bonds untouched:

```bash
BLR_ADDRESS=0x... CONFIGURATIONS=equity npm run upgrade:configs:hedera:testnet
```

### Multi-environment rollout

Each environment keeps its own configuration versions. Roll out in order, validating between stages:

```bash
BLR_ADDRESS=0xTestnetBLR...    npm run upgrade:configs:hedera:testnet
BLR_ADDRESS=0xPreviewnetBLR... npm run upgrade:configs:hedera:previewnet
BLR_ADDRESS=0xMainnetBLR...    npm run upgrade:configs:hedera:mainnet
```

Upgrades are checkpointed and resumable — see [Checkpoints & recovery](./checkpoints-and-recovery.md).

## Verify

Confirm a token now resolves against the new version:

```js
const proxy = await ethers.getContractAt("ResolverProxy", "<TOKEN_ADDRESS>");
// Inspect the proxy's configuration id/version getters, or call an upgraded function
// and confirm the new behaviour.
```

You can also confirm the BLR's latest version advanced:

```js
const blr = await ethers.getContractAt("BusinessLogicResolver", "<BLR_PROXY_ADDRESS>");
await blr.getLatestVersion("<resolver key>"); // should reflect the new version
```

## Rollback

Because previous configuration versions remain registered, rollback is "move pinned tokens back to
the previous version" rather than a redeploy. For auto-update tokens, registering a corrected
version forward is usually preferable to moving the latest pointer backwards. Always validate on
testnet before touching production.

## Pre-upgrade checklist

- [ ] New facets compiled, registry and hashes regenerated (`npm run ats:contracts:build`).
- [ ] Storage changes are **append-only** (see [Repository structure](./repository-structure.md#storage-erc-7201-one-namespace-per-feature)).
- [ ] Upgrade tested end-to-end on testnet with a freshly deployed token.
- [ ] `BLR_ADDRESS` (and `PROXY_ADDRESSES` if moving tokens) confirmed for the target network.
- [ ] Admin role on affected tokens held by the intended multisig/governance account.

## Related pages

- [Core concepts → Versioning](./core-concepts.md#versioning)
- [Managing the BLR](./managing-the-blr.md) — the underlying register/configuration operations.
- [Upgrading infrastructure](./upgrading-infrastructure.md) — the TUP (BLR/Factory) side.
