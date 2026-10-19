---
id: checkpoints-and-recovery
title: Checkpoints & Recovery
sidebar_label: Checkpoints & recovery
---

# Checkpoints & Recovery

Deploying the full system to Hedera is dozens of transactions. Networks hiccup, accounts run low on
HBAR, RPC relays rate-limit. The **checkpoint system** makes every deployment and upgrade workflow
**resumable**: if a run fails or you interrupt it, you fix the cause and re-run the same command —
completed steps are skipped, saving time and gas.

For the full reference, see the in-repo
[`scripts/CHECKPOINT_GUIDE.md`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/CHECKPOINT_GUIDE.md).

## How it works

- After each successful step (ProxyAdmin, BLR, each facet batch, each configuration, Factory), the
  workflow writes its progress to a checkpoint file under
  `deployments/<network>/.checkpoints/`.
- On the next run, the workflow detects a resumable checkpoint, **skips completed steps**, and
  continues from where it stopped.
- On success, the checkpoint is marked complete; you can clean it up afterwards.

```bash
# A run gets interrupted at step 3…
Step 1: Deploy ProxyAdmin... ✅
Step 2: Deploy BLR... ✅
Step 3: Deploy Facets... ❌ ERROR: Transaction failed

# …fix the cause, then just run the same command again:
npm run deploy:hedera:testnet
# ✅ Resumes from step 3, skipping steps 1–2.
```

You do **not** pass any special flag to resume — re-running the deploy command is the resume.

## Recovering from a failed deployment

### 1. See what happened

```bash
# List checkpoints for the network
npm run checkpoint:list -- hedera-testnet

# Show full details of the failed checkpoint (which step, the error, completed/pending steps)
npm run checkpoint:show -- <checkpoint-id>
```

### 2. Fix the root cause

| Error                          | Root cause                       | Fix                                                    |
| ------------------------------ | -------------------------------- | ------------------------------------------------------ |
| `Insufficient gas` / gas limit | Limit too low for a complex step | Lower `BATCH_SIZE`, or raise the gas limit in your env |
| `Nonce too low`                | Pending transactions / mempool   | Wait 1–2 minutes, retry                                |
| `Network unreachable`          | RPC node down or misconfigured   | Check your `*_JSON_RPC_ENDPOINT`                       |
| `Transaction underpriced`      | Gas price too low                | Raise gas price in the network config                  |
| Facet batch failed             | Transient network failure        | Re-run; deployed facets are skipped                    |

### 3. Resume

```bash
# Same command as the original deployment
npm run deploy:hedera:testnet
```

The workflow detects the failed checkpoint, asks you to confirm the resume (showing the failure
details), skips completed steps, retries the failed one, and continues to completion.

### 4. Verify

```bash
cat "$(ls -t deployments/hedera-testnet/newBlr-*.json | head -1)" | jq '.infrastructure'
```

## Checkpoint management CLI

```bash
npm run checkpoint:list    -- <network>          # list checkpoints for a network
npm run checkpoint:show    -- <checkpoint-id>    # show details of a checkpoint
npm run checkpoint:delete  -- <checkpoint-id>    # delete a specific checkpoint
npm run checkpoint:cleanup -- <network> <days>   # delete completed checkpoints older than N days
npm run checkpoint:reset   -- <checkpoint-id>    # reset a failed checkpoint to in-progress
```

Typical maintenance after a successful deployment:

```bash
# Remove old failed attempts, keep recent history
npm run checkpoint:cleanup -- hedera-testnet 7
```

## CI/CD (non-interactive)

In a non-TTY environment the resume prompt can't be answered interactively. Two patterns:

- **Auto-resume** — let the workflow detect and resume the checkpoint automatically (the default in
  non-interactive mode).
- **Fresh start** — delete old checkpoints first, then deploy:

  ```bash
  npm run checkpoint:delete -- <checkpoint-id>
  npm run deploy:hedera:testnet
  ```

## Best practices

- ✅ Review the failure (`checkpoint:show`) **before** resuming — fix the root cause, don't retry blindly.
- ✅ Let the system skip completed steps; don't redeploy by hand.
- ✅ Clean up old checkpoints **after** a successful deployment.
- ❌ Don't hand-edit checkpoint files — it's easy to create inconsistent state and break resume safety.
- ❌ Don't change network configuration between resume attempts.
- ❌ Don't delete a checkpoint immediately after a failure — you'll usually want to resume from it.

## Related pages

- [Deployment](./deployment.md) — where checkpoints are produced.
- [Deployment workflows](./deployment-workflows.md) — all workflows are checkpointed.
- [Upgrading infrastructure](./upgrading-infrastructure.md) — TUP upgrades are resumable too.
