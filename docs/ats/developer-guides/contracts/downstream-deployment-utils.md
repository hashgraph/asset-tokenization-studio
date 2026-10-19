---
id: downstream-deployment-utils
title: Downstream Deployment Utilities
sidebar_label: Downstream deployment utils
---

# Downstream Deployment Utilities

The contracts package exports a set of **framework-agnostic deployment-file utilities** that
downstream projects (for example, a Green Bonds Platform built on ATS) can reuse to read and write
deployment records in the standard ATS layout — with no runtime dependency on Hardhat or ethers.

## Install

```bash
npm install @hashgraph/asset-tokenization-contracts
```

```typescript
import {
  saveDeploymentOutput,
  loadDeployment,
  findLatestDeployment,
  isSaveSuccess,
} from "@hashgraph/asset-tokenization-contracts/scripts";
```

## Saving and loading deployments

```typescript
// Save a deployment record
const result = await saveDeploymentOutput({
  network: "hedera-testnet",
  workflow: "newBlr",
  data: deploymentOutput,
});
if (isSaveSuccess(result)) {
  console.log(`Saved to: ${result.filepath}`);
  // deployments/hedera-testnet/newBlr-2026-02-05T12-21-16.json
}

// Load a specific deployment
const deployment = await loadDeployment("hedera-testnet", "newBlr", "2026-02-05T12-21-16");

// Find the most recent deployment for a workflow
const latest = await findLatestDeployment("hedera-testnet", "newBlr");
```

Records are organised by network subdirectory, matching what [Deployment](./deployment.md) produces:

```
deployments/
├── hedera-testnet/
│   ├── newBlr-2026-02-05T12-21-16.json
│   └── upgradeConfigurations-2026-02-06T10-30-12.json
└── hedera-mainnet/
    └── newBlr-…json
```

## Custom workflow types

Downstream projects can extend the ATS workflow types with their own and register a short filename
descriptor:

```typescript
import {
  saveDeploymentOutput,
  registerWorkflowDescriptor,
  type AtsWorkflowType,
} from "@hashgraph/asset-tokenization-contracts/scripts";

type GbpWorkflowType = AtsWorkflowType | "gbpInfrastructure" | "gbpUpgrade";

registerWorkflowDescriptor("gbpInfrastructure", "gbpInfra");

const result = await saveDeploymentOutput({
  network: "hedera-testnet",
  workflow: "gbpInfrastructure",
  data: gbpDeploymentOutput,
});
// → gbpInfra-<timestamp>.json
```

## Available utilities

| Category        | Functions                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Save**        | `saveDeploymentOutput(options)`, `registerWorkflowDescriptor(workflow, descriptor?)`                                                       |
| **Load**        | `loadDeployment(network, workflow, timestamp)`, `findLatestDeployment(network, workflow)`, `listDeploymentsByWorkflow(network, workflow?)` |
| **Paths**       | `getNetworkDeploymentDir(network)`, `generateDeploymentFilename(workflow, timestamp?)`, `getDeploymentsDir()`                              |
| **Type guards** | `isSaveSuccess(result)`, `isSaveFailure(result)`, `isAtsWorkflow(workflow)`                                                                |

All utilities are fully typed (discriminated-union `SaveResult`, `AtsWorkflowType`, etc.) and have
**zero Hardhat/ethers runtime dependencies**, so they're safe to use in any Node.js context.

## Programmatic deployment

To run the actual deployment workflows from your own scripts (not just manage their output files),
use the signer-based workflow API described in [Deployment workflows](./deployment-workflows.md#3-programmatically-signer-based-api).

## Related pages

- [Deployment](./deployment.md) — the records these utilities read and write.
- [Deployment workflows](./deployment-workflows.md) — running the workflows programmatically.
- Package reference: [`scripts/README.md`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/README.md).
