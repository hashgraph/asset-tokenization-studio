---
id: deployment-workflows
title: Deployment Workflows
sidebar_label: Deployment workflows
---

# Deployment Workflows

The deployment system exposes four top-level workflows. [Deployment](./deployment.md) walks the
first one (the common case); this page is the map of all four, plus how to drive them from the CLI,
from Hardhat, or programmatically.

## The four workflows

| Workflow                     | CLI entry (`scripts/cli/…`)      | npm script                              | Use when                                                                                                 |
| ---------------------------- | -------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Deploy with new BLR**      | `deploySystemWithNewBlr.ts`      | `deploy:newBlr:*` (alias `deploy:*`)    | Standing up the whole system from scratch.                                                               |
| **Deploy with existing BLR** | `deploySystemWithExistingBlr.ts` | `deploy:existingBlr:*`                  | Reusing a deployed BLR — add a Factory, configurations, or facets.                                       |
| **Upgrade configurations**   | `upgradeConfigurations.ts`       | `upgrade:configs:*` (alias `upgrade:*`) | New facet versions for token configurations. → [Upgrading configurations](./upgrading-configurations.md) |
| **Upgrade TUP proxies**      | `upgradeTupProxies.ts`           | `upgrade:tup:*`                         | New BLR / Factory implementation. → [Upgrading infrastructure](./upgrading-infrastructure.md)            |

Every workflow is **checkpointed** and **resumable** — see [Checkpoints & recovery](./checkpoints-and-recovery.md).

## Deploy with a new BLR

The from-scratch path documented in [Deployment](./deployment.md). It deploys ProxyAdmin → BLR →
libraries → facets → registers facets → configurations → Factory, and writes
`deployments/<network>/newBlr-<timestamp>.json`.

```bash
npm run deploy:hedera:testnet      # alias of deploy:newBlr:hedera:testnet
```

## Deploy with an existing BLR

Reuse an already-deployed BLR (skipping ProxyAdmin + BLR deployment) to add a Factory, create
configurations, or deploy facets against it. This is the basis for **multi-tenant** setups —
several Factories sharing one BLR — and for **downstream projects** that extend ATS with their own
facets.

```bash
BLR_ADDRESS=0x4363684B8a679EaBA17701F421Ddf71D6870A011 \
  npm run deploy:existingBlr:hedera:testnet
```

Provide the existing `BLR_ADDRESS` (see `.env.example` → upgrade-workflow section). The workflow
deploys the requested pieces and wires them to that BLR.

## Driving the workflows

There are three ways to run a workflow; they share the same underlying operations.

### 1. Standalone CLI (recommended)

The `deploy:*` / `upgrade:*` npm scripts set `NETWORK` and run the CLI. The full matrix:

```bash
# Deploy (new BLR)
npm run deploy:local
npm run deploy:hedera:local
npm run deploy:hedera:previewnet
npm run deploy:hedera:testnet
npm run deploy:hedera:mainnet
npm run deploy:newBlr:hedera:hashsphere   # hashsphere only has the newBlr form

# Deploy (existing BLR)
npm run deploy:existingBlr:hedera:testnet      # …:local / :previewnet / :mainnet

# Upgrades
npm run upgrade:configs:hedera:testnet         # token configurations
npm run upgrade:tup:hedera:testnet             # BLR / Factory implementations
```

There is also `npm run deploy:newBlr:local:auto`, which spins up a local Hardhat node, deploys, and
tears the node down — handy for a quick end-to-end smoke test.

### 2. Hardhat task

```bash
npx hardhat deploy-system --network hedera-testnet [--output my-deployment.json]
```

### 3. Programmatically (signer-based API)

The workflows are plain functions that take an `ethers.Signer`, so you can embed them in your own
scripts (this is how downstream projects compose deployments):

```typescript
import { ethers } from "ethers";
import { deploySystemWithNewBlr } from "@scripts/workflows";

const [signer] = await ethers.getSigners(); // Hardhat — or new ethers.Wallet(pk, provider)

const output = await deploySystemWithNewBlr(signer, "hedera-testnet", {
  saveOutput: true, // write deployments/<network>/newBlr-<ts>.json
  batchSize: 15, // facets per transaction
  confirmations: 2, // confirmations to wait per tx
  verifyDeployment: true, // verify deployed bytecode matches expected
});

console.log(output.infrastructure.blr.proxy);
```

For an existing BLR:

```typescript
import { deploySystemWithExistingBlr } from "@scripts/workflows";

const output = await deploySystemWithExistingBlr(signer, "hedera-testnet", existingBlrAddress, {
  deployFacets: true,
  deployFactory: true,
  createConfigurations: true,
  saveOutput: true,
});
```

The API is framework-agnostic (pure ethers — works with Hardhat, a standalone wallet, or a hardware
wallet) and fully typed via TypeChain. See the in-repo
[`scripts/DEVELOPER_GUIDE.md`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/DEVELOPER_GUIDE.md)
for the complete API.

## Common options

| Option (programmatic) / env | Meaning                                                                         |
| --------------------------- | ------------------------------------------------------------------------------- |
| `batchSize` / `BATCH_SIZE`  | Facets deployed (or processed) per transaction. Lower it on congested networks. |
| `confirmations`             | Confirmations to wait after each transaction.                                   |
| `saveOutput`                | Write the deployment JSON under `deployments/<network>/`.                       |
| `verifyDeployment`          | Verify deployed bytecode matches the compiled artifact.                         |
| `USE_TIMETRAVEL`            | Include TimeTravel facet variants (local/testing only).                         |

## Related pages

- [Deployment](./deployment.md) — the standard new-BLR walkthrough.
- [Checkpoints & recovery](./checkpoints-and-recovery.md) — every workflow is resumable.
- [Downstream deployment utilities](./downstream-deployment-utils.md) — reusing the file helpers in your project.
