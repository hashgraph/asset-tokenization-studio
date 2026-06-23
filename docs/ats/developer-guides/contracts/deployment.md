---
id: deployment
title: Deployment
sidebar_label: Deployment
---

# Deployment

Deploy the full ATS smart-contract system to a Hedera network. This page covers the standard
"deploy everything from scratch" path. For the variations (reusing an existing BLR, options,
programmatic use) see [Deployment workflows](./deployment-workflows.md); for resuming a failed run
see [Checkpoints & recovery](./checkpoints-and-recovery.md).

:::info
Examples use **Hedera Testnet**. Swap the network suffix (`:hedera:mainnet`, `:hedera:previewnet`,
`:local`, …) for your target. All commands run from `packages/ats/contracts/`.
:::

## Prerequisites

- **Node.js** ≥ 20.19.4 and **npm** ≥ 10.9.0 (see `.nvmrc`).
- A funded **Hedera account** on your target network.
  - Testnet: fund via the [Hedera Portal](https://portal.hedera.com/).
  - Mainnet: ensure adequate HBAR for the full deployment (hundreds of contract creations).

## 1. Install and build

From the monorepo root:

```bash
npm ci
npm run ats:contracts:build
```

`ats:contracts:build` compiles the contracts, generates the TypeChain types, and regenerates the
contract registry and hash constants — all of which deployment depends on.

## 2. Configure the environment

From `packages/ats/contracts/`:

```bash
cp .env.example .env
```

Edit `.env` and **uncomment only the network you are targeting**. For testnet you need a deployer
key and the endpoints:

```bash
# Deployer account (RAW hex private key, KEY_0 is the deployer)
HEDERA_TESTNET_PRIVATE_KEY_0='0x...'

# Network endpoints
HEDERA_TESTNET_JSON_RPC_ENDPOINT='https://testnet.hashio.io/api'
HEDERA_TESTNET_MIRROR_NODE_ENDPOINT='https://testnet.mirrornode.hedera.com'
```

:::warning Uncomment only the network you use
Hardhat validates **every** private key in `.env` at startup, even for networks you aren't
targeting. A stray uncommented key with the wrong format fails with `HH8: Invalid account`. All keys
are commented out in `.env.example` — uncomment only what you need.
:::

Optional knobs (sensible defaults otherwise): `BATCH_SIZE` (facets deployed per batch),
`CONTRACT_SIZER_RUN_ON_COMPILE`, `REPORT_GAS`. See `.env.example` for the complete list, including
the upgrade-workflow variables.

## 3. Deploy

### Standalone CLI (recommended)

Each network has a ready-made script that sets `NETWORK` for you:

```bash
npm run deploy:hedera:testnet     # Hedera Testnet
npm run deploy:hedera:mainnet     # Hedera Mainnet
npm run deploy:hedera:previewnet  # Hedera Previewnet
npm run deploy:local              # Local Hardhat node
```

These are aliases for `deploy:newBlr:*`, which run `scripts/cli/deploySystemWithNewBlr.ts`.

:::note
Bare `npm run deploy` requires a `NETWORK` environment variable. The network-specific scripts above
set it automatically and are the recommended entry points.
:::

### Hardhat task

Equivalent deployment through Hardhat (useful inside a Hardhat script context):

```bash
npx hardhat deploy-system --network hedera-testnet

# Optional: custom output file
npx hardhat deploy-system --network hedera-testnet --output my-deployment.json
```

The `deploy-system` task takes a single optional `--output` parameter. (There is no `--timetravel`
flag — TimeTravel facets are enabled with the `USE_TIMETRAVEL=true` environment variable, intended
for local/testing networks only.)

## What gets deployed

The workflow runs these phases in order, checkpointing after each:

1. **ProxyAdmin** — owns and upgrades the infrastructure proxies.
2. **Business Logic Resolver** — implementation + `TransparentUpgradeableProxy`, then initialised.
3. **Orchestrator libraries** — shared logic libraries linked by the facets.
4. **Facets** — every facet, deployed in batches.
5. **Facet registration** — `registerBusinessLogics` records each facet in the BLR.
6. **Configurations** — the asset configurations are created (Equity and the Bond variants).
7. **Factory** — implementation + `TransparentUpgradeableProxy`, wired to the BLR.

For the architecture behind these pieces, see [Architecture](./architecture.md).

## Expected output

On success the workflow prints a summary and writes a JSON record to
`deployments/<network>/newBlr-<timestamp>.json`:

```
✅ Deployment complete!
  ProxyAdmin: 0x5309a85c1fac0344c82B4a71640b18028b2D9Ba8
  BLR:        0x4363684B8a679EaBA17701F421Ddf71D6870A011
  Factory:    0xCEdDa6D199AEB2391739E39d014177beb5157FA0
  Output:     deployments/hedera-testnet/newBlr-2026-02-05T12-21-16.json
```

Each output file contains the infrastructure addresses (with Hedera contract IDs), every facet
address and resolver key, and the configuration versions. The newest file per network is the source
of truth for [deployed addresses](./deployed-addresses.md).

## Verify the deployment

Inspect the JSON output:

```bash
# Newest testnet deployment
cat "$(ls -t deployments/hedera-testnet/newBlr-*.json | head -1)" | jq '.infrastructure'

# A specific facet's address
jq '.facets[] | select(.name == "CapFacet")' deployments/hedera-testnet/newBlr-*.json
```

Check the BLR on-chain via the Hardhat console:

```bash
npx hardhat console --network hedera-testnet
```

```js
const blr = await ethers.getContractAt("BusinessLogicResolver", "<BLR_PROXY_ADDRESS>");
await blr.getBusinessLogicCount(); // > 0 once facets are registered
await blr.getLatestVersions([
  /* resolver keys */
]); // shared latest version per key
```

## Troubleshooting

| Symptom                                       | Cause & fix                                                                                             |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `HH8: Invalid account: private key too short` | A non-target network's key is uncommented in `.env`. Comment out everything except your target network. |
| `insufficient funds`                          | Deployer lacks HBAR. Fund the account and re-run (completed steps are skipped).                         |
| `nonce too low`                               | Pending/queued transactions. Wait 1–2 minutes and re-run.                                               |
| `timeout waiting for transaction`             | Slow network. Re-run — the checkpoint resumes.                                                          |
| Configuration creation hits the gas limit     | Lower `BATCH_SIZE` in `.env` (e.g. `BATCH_SIZE=5`) and re-run.                                          |
| Some facets failed mid-batch                  | Re-run the same command; successful facets are skipped via the checkpoint.                              |

A failed or interrupted deployment is **resumable** — just re-run the same command. See
[Checkpoints & recovery](./checkpoints-and-recovery.md) for the details and the management CLI.

## Related pages

- [Deployment workflows](./deployment-workflows.md) — new-BLR vs existing-BLR, options, programmatic use.
- [Checkpoints & recovery](./checkpoints-and-recovery.md) — resuming failed deployments.
- [Deployed addresses](./deployed-addresses.md) — reference addresses per network.
- [Upgrading configurations](./upgrading-configurations.md) / [Upgrading infrastructure](./upgrading-infrastructure.md).
