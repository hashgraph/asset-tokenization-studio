---
id: upgrading-infrastructure
title: Upgrading Infrastructure
sidebar_label: Upgrading infrastructure
---

# Upgrading Infrastructure

How to upgrade the **BLR** and **Factory** implementation contracts — the
**TransparentUpgradeableProxy (TUP)** side of upgrades. This swaps the implementation behind an
infrastructure proxy; it does not touch token contracts.

:::tip Which upgrade is this?
Use **this** workflow only to upgrade BLR / Factory implementations. To roll out new facet versions
to **tokens**, use [Upgrading configurations](./upgrading-configurations.md) instead.
:::

## TUP vs ResolverProxy

ATS upgrades come in two flavours; this page is the left column:

|                   | **TUP (this page)**                   | **ResolverProxy (Diamond)** |
| ----------------- | ------------------------------------- | --------------------------- |
| Applies to        | BLR, Factory                          | Equity / Bond / … tokens    |
| Upgrade mechanism | `ProxyAdmin` swaps the implementation | New configuration version   |
| Controlled by     | `ProxyAdmin` owner                    | Token `DEFAULT_ADMIN_ROLE`  |
| Workflow          | `upgrade:tup:*`                       | `upgrade:configs:*`         |

## When to use it

- You changed the BLR or Factory **implementation** and need the live proxy to point at the new code.
- You're upgrading one or both of them, deploying a fresh implementation or reusing a pre-deployed one.

## Environment variables

Configured in `.env` (the **TUP upgrade** section of `.env.example`):

| Variable                  | Required           | Meaning                                                                 |
| ------------------------- | ------------------ | ----------------------------------------------------------------------- |
| `PROXY_ADMIN_ADDRESS`     | Yes                | The `ProxyAdmin` contract that owns the proxies.                        |
| `BLR_PROXY`               | One of BLR/Factory | BLR proxy address to upgrade.                                           |
| `FACTORY_PROXY`           | One of BLR/Factory | Factory proxy address to upgrade.                                       |
| `DEPLOY_NEW_BLR_IMPL`     | Per proxy          | `true` to deploy a fresh BLR implementation.                            |
| `DEPLOY_NEW_FACTORY_IMPL` | Per proxy          | `true` to deploy a fresh Factory implementation.                        |
| `BLR_IMPLEMENTATION`      | Per proxy          | Existing BLR implementation to upgrade to (when not deploying new).     |
| `FACTORY_IMPLEMENTATION`  | Per proxy          | Existing Factory implementation to upgrade to (when not deploying new). |

For each proxy you upgrade, set **either** `DEPLOY_NEW_*_IMPL=true` **or** the corresponding
`*_IMPLEMENTATION` address — not both.

## Pattern A — deploy a new implementation and upgrade

```bash
# .env
PROXY_ADMIN_ADDRESS=0x5309a85c1fac0344c82B4a71640b18028b2D9Ba8
BLR_PROXY=0x4363684B8a679EaBA17701F421Ddf71D6870A011
DEPLOY_NEW_BLR_IMPL=true
```

```bash
npm run upgrade:tup:hedera:testnet
```

The workflow validates the `ProxyAdmin`, deploys the new implementation, verifies its bytecode,
calls `ProxyAdmin.upgrade()`, and confirms the proxy now points at the new implementation.

## Pattern B — upgrade to an existing implementation

Use a separately-deployed (e.g. pre-tested) implementation:

```bash
# .env
PROXY_ADMIN_ADDRESS=0x5309a85c1fac0344c82B4a71640b18028b2D9Ba8
BLR_PROXY=0x4363684B8a679EaBA17701F421Ddf71D6870A011
BLR_IMPLEMENTATION=0x29fEedc415d79D28b144fD6b4A5FbED6df6D32F4
```

```bash
npm run upgrade:tup:hedera:testnet
```

## Upgrading both BLR and Factory

```bash
# .env
PROXY_ADMIN_ADDRESS=0x...
BLR_PROXY=0x...
FACTORY_PROXY=0x...
DEPLOY_NEW_BLR_IMPL=true
DEPLOY_NEW_FACTORY_IMPL=true
```

```bash
npm run upgrade:tup:hedera:testnet
```

## Multi-network rollout

Run the same workflow per network with that network's `ProxyAdmin` and proxy addresses:

```bash
PROXY_ADMIN_ADDRESS=0xTestnet...   BLR_PROXY=0x... DEPLOY_NEW_BLR_IMPL=true npm run upgrade:tup:hedera:testnet
PROXY_ADMIN_ADDRESS=0xPreviewnet... BLR_PROXY=0x... DEPLOY_NEW_BLR_IMPL=true npm run upgrade:tup:hedera:previewnet
PROXY_ADMIN_ADDRESS=0xMainnet...   BLR_PROXY=0x... DEPLOY_NEW_BLR_IMPL=true npm run upgrade:tup:hedera:mainnet
```

These upgrades are **checkpointed and resumable** — re-run the same command after fixing a failure.
See [Checkpoints & recovery](./checkpoints-and-recovery.md).

## Verify

```js
import { getProxyImplementation } from "@scripts/infrastructure";
const impl = await getProxyImplementation(provider, "<BLR_PROXY>");
console.log(impl); // should equal the new implementation address
```

The workflow writes a result file to `deployments/<network>/<network>-upgrade-tup-<timestamp>.json`
with the old/new implementation addresses, transaction hashes, and gas used.

## Troubleshooting

| Message                                          | Cause / fix                                                                  |
| ------------------------------------------------ | ---------------------------------------------------------------------------- |
| `ProxyAdmin address is required`                 | Set `PROXY_ADMIN_ADDRESS`.                                                   |
| `proxy specified but no implementation provided` | Set `DEPLOY_NEW_*_IMPL=true` or the corresponding `*_IMPLEMENTATION`.        |
| `Insufficient balance`                           | Fund the deployer and retry (resumes via checkpoint).                        |
| `already at target implementation`               | Not an error — no upgrade needed.                                            |
| `Upgrade verification failed`                    | Wait for finality and retry; confirm the `ProxyAdmin` can upgrade the proxy. |

## Related pages

- [Architecture → Two proxy patterns](./architecture.md#two-proxy-patterns)
- [Upgrading configurations](./upgrading-configurations.md) — the token-side upgrades.
- [Checkpoints & recovery](./checkpoints-and-recovery.md)
