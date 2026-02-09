# Checkpoint System Guide

## Table of Contents

1. [Introduction & Quick Start](#introduction--quick-start)
   - [What are Checkpoints?](#what-are-checkpoints)
   - [Quick Example](#quick-example)
   - [Key Benefits](#key-benefits)
2. [How Checkpoints Work](#how-checkpoints-work)
   - [State Diagram](#state-diagram)
   - [Checkpoint Lifecycle](#checkpoint-lifecycle)
   - [File Structure](#file-structure)
3. [Using Checkpoints - Practical Scenarios](#using-checkpoints---practical-scenarios)
   - [Scenario 1: Normal Deployment (Happy Path)](#scenario-1-normal-deployment-happy-path)
   - [Scenario 2: Deployment Fails (Auto-Resume)](#scenario-2-deployment-fails-auto-resume)
   - [Scenario 3: User Interrupts (Ctrl+C)](#scenario-3-user-interrupts-ctrlc)
   - [Scenario 4: Multiple Checkpoints (Choose One)](#scenario-4-multiple-checkpoints-choose-one)
   - [Scenario 5: CI/CD Non-Interactive Mode](#scenario-5-cicd-non-interactive-mode)
4. [Checkpoint Management CLI](#checkpoint-management-cli)
   - [List Checkpoints](#list-checkpoints)
   - [Show Checkpoint Details](#show-checkpoint-details)
   - [Delete Checkpoint](#delete-checkpoint)
   - [Clean Up Old Checkpoints](#clean-up-old-checkpoints)
   - [Reset Failed Checkpoint](#reset-failed-checkpoint)
5. [Checkpoint File Structure](#checkpoint-file-structure)
   - [Key Fields Explained](#key-fields-explained)
6. [Troubleshooting](#troubleshooting)
   - [No Resumable Checkpoints Found](#problem-no-resumable-checkpoints-found-but-i-know-deployment-failed)
   - [Schema Version Not Supported](#problem-resume-fails-with-checkpoint-schema-version-not-supported)
   - [Stuck in Resume Loop](#problem-stuck-in-loop---keeps-resuming-from-same-failed-step)
   - [Multiple Failed Checkpoints](#problem-multiple-failed-checkpoints-cluttering-the-system)
   - [Want to Skip Failed Step](#problem-want-to-skip-failed-step-and-continue)
7. [Advanced Topics](#advanced-topics)
   - [Checkpoint Storage Location](#checkpoint-storage-location)
   - [Schema Versioning](#schema-versioning)
   - [Non-Interactive Mode (CI/CD)](#non-interactive-mode-cicd)
8. [Best Practices](#best-practices)
9. [Related Documentation](#related-documentation)

---

## Introduction & Quick Start

### What are Checkpoints?

Checkpoints are a **safety net for long-running deployments**. Think of them like save points in a video game - they automatically record your progress so you can resume from where you left off if something goes wrong.

**Why they exist:**

- Network failures happen (connection timeouts, rate limits)
- Transactions can fail (insufficient gas, nonce issues)
- Human errors occur (Ctrl+C pressed accidentally)
- Long deployments shouldn't restart from scratch

### Quick Example

```bash
# Deployment gets interrupted at step 3
npm run deploy:newBlr
# Step 1: Deploy ProxyAdmin... ✅
# Step 2: Deploy BLR... ✅
# Step 3: Deploy Facets... ❌ ERROR: Transaction failed

# Later, just run again - it resumes automatically!
npm run deploy:newBlr
# ✅ Resumes from step 3, skips completed steps 1-2
# Step 3: Deploy Facets... ✅
# Step 4: Register Facets... ✅
# ...
```

### Key Benefits

- ✅ **Automatic resume from failures** - No manual intervention needed
- ✅ **No re-deployment of completed steps** - Saves time and gas costs
- ✅ **Safe interruption** - Ctrl+C anytime, resume later
- ✅ **Multiple resume attempts** - Keep trying until it succeeds
- ✅ **Audit trail** - Full history of what happened and when

---

## How Checkpoints Work

### State Diagram

```
┌─────────────┐
│  No Deploy  │
└──────┬──────┘
       │ npm run deploy:newBlr
       ↓
┌─────────────────────────┐
│  CHECKPOINT CREATED     │
│  Status: in-progress    │
│  Step: 0 → 1 → 2 → 3... │
└─────┬──────────┬────────┘
      │          │
      │          │ ❌ Error / Ctrl+C
      │          ↓
      │     ┌────────────────┐
      │     │ Status: failed │
      │     │ (can resume)   │
      │     └────────┬───────┘
      │              │
      │              │ npm run deploy:newBlr
      │              │ (user confirms)
      │              ↓
      │     ┌────────────────────┐
      │     │ Status: in-progress│
      │     │ (resume from step) │
      │     └────────┬───────────┘
      │              │
      ✅ Success    │
      │              │
      ↓              ↓
┌─────────────────────────┐
│  Status: completed      │
│  Output: deployment.json│
└─────────────────────────┘
```

### Checkpoint Lifecycle

1. **Created** - When deployment starts, checkpoint file created with initial state
2. **Updated** - After each successful step, checkpoint updated with new addresses/hashes
3. **Failed** - If error occurs, checkpoint marked as failed (can resume from this point)
4. **Completed** - Deployment finishes successfully, checkpoint marked complete
5. **Cleaned** - Auto-deleted after 30 days (configurable) to prevent clutter

### File Structure

```
deployments/
├── hedera-testnet/
│   ├── .checkpoints/
│   │   ├── hedera-testnet-1738675200000.json  ← Active checkpoint
│   │   └── hedera-testnet-1738561800000.json  ← Old checkpoint
│   └── newBlr-1738675200000.json  ← Final deployment output
└── local/
    └── .checkpoints/
        └── local-1738675400000.json
```

**Key points:**

- Checkpoints stored in `.checkpoints/` subdirectory per network
- Filename format: `{network}-{timestamp}.json`
- Timestamp ensures unique IDs (Unix milliseconds)
- Final deployment output saved in parent directory

---

## Using Checkpoints - Practical Scenarios

### Scenario 1: Normal Deployment (Happy Path)

**What happens:**

```bash
$ npm run deploy:newBlr
[INFO] Starting deployment to hedera-testnet...
[INFO] No resumable checkpoints found. Starting fresh deployment.
[INFO] Creating checkpoint: hedera-testnet-1738675200000

Step 1/8: Deploy ProxyAdmin... ✅
Step 2/8: Deploy BLR... ✅
Step 3/8: Deploy Facets... ✅
Step 4/8: Register Facets... ✅
Step 5/8: Create Equity Config... ✅
Step 6/8: Create Bond Config... ✅
Step 7/8: Deploy Factory... ✅
Step 8/8: Save Output... ✅

[SUCCESS] Deployment completed!
[INFO] Checkpoint marked as completed.
```

**Behind the scenes:**

- Checkpoint created at start with `status: "in-progress"`
- Updated after each step with deployed addresses
- Marked `status: "completed"` at end
- Available for reference and troubleshooting

---

### Scenario 2: Deployment Fails (Auto-Resume)

**What happens:**

```bash
$ npm run deploy:newBlr
[INFO] Starting deployment to hedera-testnet...

Step 1/8: Deploy ProxyAdmin... ✅
Step 2/8: Deploy BLR... ✅
Step 3/8: Deploy Facets... ❌ FAILED
[ERROR] Transaction failed: nonce too low

[ERROR] Deployment failed at step 3: Facets
[INFO] Checkpoint saved with failure details.
[INFO] You can resume by running the same command again.
```

**Resume deployment:**

```bash
$ npm run deploy:newBlr
[INFO] Found resumable checkpoint: hedera-testnet-1738675200000

⚠️  FOUND FAILED DEPLOYMENT
═══════════════════════════════════════════════════
Checkpoint: hedera-testnet-1738675200000
Started:    2025-02-04T10:00:00Z
Failed at:  Step 3 (Facets)
Error:      Transaction failed: nonce too low
Time:       2025-02-04T10:15:23Z
═══════════════════════════════════════════════════

Resume from this failed checkpoint? [Y/n]: Y

[INFO] Clearing failure status from checkpoint.
[INFO] Resuming from step 3...

Step 3/8: Deploy Facets... ✅
Step 4/8: Register Facets... ✅
Step 5/8: Create Equity Config... ✅
Step 6/8: Create Bond Config... ✅
Step 7/8: Deploy Factory... ✅
Step 8/8: Save Output... ✅

[SUCCESS] Deployment completed!
```

**Key points:**

- ✅ Skips steps 1-2 (already completed)
- ✅ Retries step 3 (the failed step)
- ✅ Continues from step 4 onwards
- ✅ User confirms before resuming (safety check)
- ✅ Failure details logged for debugging

---

### Scenario 3: User Interrupts (Ctrl+C)

**What happens:**

```bash
$ npm run deploy:newBlr
[INFO] Starting deployment to hedera-testnet...

Step 1/8: Deploy ProxyAdmin... ✅
Step 2/8: Deploy BLR... ✅
Step 3/8: Deploy Facets... (in progress)
^C
[WARN] Deployment interrupted by user.
[INFO] Checkpoint saved at step 2. Safe to resume.
```

**Resume later:**

```bash
$ npm run deploy:newBlr
[INFO] Found resumable checkpoint: hedera-testnet-1738675200000

📋 INCOMPLETE DEPLOYMENT FOUND
═══════════════════════════════════════════════════

[1] hedera-testnet-1738675200000
    Status: ⏳ In Progress
    Step:   2 - Deploy BLR
    Started: 2025-02-04T10:00:00Z
    Updated: 2025-02-04T10:03:45Z

[0] Start fresh deployment

═══════════════════════════════════════════════════

Select checkpoint to resume (default: 1): 1

[INFO] Resuming from step 3...
Step 3/8: Deploy Facets... ✅
...
```

**Key points:**

- ✅ Safe to interrupt anytime (checkpoint saves after each step)
- ✅ Resume picks up where you left off
- ✅ Option to start fresh if needed

---

### Scenario 4: Multiple Checkpoints (Choose One)

**When it happens:**

- Multiple incomplete deployments exist
- User started new deployment without finishing previous one
- Different deployment attempts for same network

**What you see:**

```bash
$ npm run deploy:newBlr
[INFO] Found 3 resumable checkpoints for hedera-testnet

📋 MULTIPLE CHECKPOINTS FOUND
═══════════════════════════════════════════════════

[1] hedera-testnet-1738680000000
    Status: ❌ FAILED
    Step:   5 - Create Equity Config
    Error:  Insufficient gas
    Time:   2025-02-04T11:00:00Z

[2] hedera-testnet-1738675200000
    Status: ⏳ In Progress
    Step:   3 - Facets
    Started: 2025-02-04T10:00:00Z
    Updated: 2025-02-04T10:05:30Z

[3] hedera-testnet-1738670000000
    Status: ⏳ In Progress
    Step:   2 - Deploy BLR
    Started: 2025-02-04T09:30:00Z
    Updated: 2025-02-04T09:35:45Z

[0] Start fresh deployment

═══════════════════════════════════════════════════

Select checkpoint to resume (default: 1): 1

⚠️  FOUND FAILED DEPLOYMENT
[Continue with confirmation prompt...]
```

**Recommendations:**

- **Option 1 (newest)**: Resume from most recent failure (recommended - most progress)
- **Option 2**: Resume from earlier checkpoint (if recent ones consistently fail)
- **Option 0**: Start completely fresh (discards all checkpoints - use if network config changed)

**Best practice:** Review failure details before resuming:

```bash
npm run checkpoint:show -- hedera-testnet-1738680000000
```

---

### Scenario 5: CI/CD Non-Interactive Mode

**What happens:**

```bash
# In CI/CD pipeline (non-TTY environment)
$ npm run deploy:newBlr
[INFO] Found resumable checkpoint: hedera-testnet-1738675200000
[WARN] Non-interactive mode detected: auto-resuming from checkpoint
[INFO] Resuming from step 3...

Step 3/8: Deploy Facets... ✅
Step 4/8: Register Facets... ✅
...
```

**Key differences:**

- ✅ No user prompts (auto-resumes automatically)
- ✅ Always selects newest checkpoint
- ✅ Logs all actions for audit trail
- ✅ Safe for automated pipelines
- ✅ Fails loudly if multiple critical issues

**CI/CD best practices:**

```bash
# Option 1: Let checkpoint system auto-resume
npm run deploy:newBlr

# Option 2: Explicit fresh start (delete old checkpoints first)
npm run checkpoint:cleanup -- hedera-testnet 0
npm run deploy:newBlr
```

---

## Checkpoint Management CLI

### List Checkpoints

```bash
$ npm run checkpoint:list -- hedera-testnet

Checkpoints for hedera-testnet (3 total):
═══════════════════════════════════════════════════

✅ hedera-testnet-1738680000000
   Workflow: newBlr
   Status:   completed
   Step:     8
   Started:  2025-02-04T11:00:00Z
   Updated:  2025-02-04T11:15:32Z

❌ hedera-testnet-1738675200000
   Workflow: newBlr
   Status:   failed
   Step:     3
   Started:  2025-02-04T10:00:00Z
   Updated:  2025-02-04T10:15:23Z
   Error:    Transaction failed: nonce too low

⏳ hedera-testnet-1738670000000
   Workflow: existingBlr
   Status:   in-progress
   Step:     2
   Started:  2025-02-04T09:30:00Z
   Updated:  2025-02-04T09:35:45Z

═══════════════════════════════════════════════════
```

**Usage:**

```bash
npm run checkpoint:list -- <network>
```

**Parameters:**

- `<network>`: Network name (e.g., `hedera-testnet`, `hedera-mainnet`, `local`)

---

### Show Checkpoint Details

```bash
$ npm run checkpoint:show -- hedera-testnet-1738675200000

Checkpoint Details:
═══════════════════════════════════════════════════
ID:       hedera-testnet-1738675200000
Network:  hedera-testnet
Status:   failed
Workflow: newBlr
Step:     3 (Facets)
Started:  2025-02-04T10:00:00Z
Updated:  2025-02-04T10:15:23Z

Failure Details:
  Step:  3 (Facets)
  Error: Transaction failed: nonce too low
  Time:  2025-02-04T10:15:23Z

Completed Steps:
  ✅ ProxyAdmin: 0xabc...def
  ✅ BLR Implementation: 0x123...456
  ✅ BLR Proxy: 0x789...abc

Pending Steps:
  ⏳ Facets (43 total)
  ⏳ Register Facets
  ⏳ Create Equity Config
  ⏳ Create Bond Config
  ⏳ Deploy Factory
═══════════════════════════════════════════════════

Full JSON output saved to: /tmp/checkpoint-details.json
```

**Usage:**

```bash
npm run checkpoint:show -- <checkpoint-id>
```

**Parameters:**

- `<checkpoint-id>`: Full checkpoint ID (e.g., `hedera-testnet-1738675200000`)

---

### Delete Checkpoint

```bash
$ npm run checkpoint:delete -- hedera-testnet-1738675200000
✅ Deleted checkpoint: hedera-testnet-1738675200000
```

**Usage:**

```bash
npm run checkpoint:delete -- <checkpoint-id>
```

**When to use:**

- Checkpoint no longer needed
- Want to force fresh deployment
- Cleaning up test checkpoints

**Warning:** Cannot undo deletion. Resuming will not be possible.

---

### Clean Up Old Checkpoints

```bash
$ npm run checkpoint:cleanup -- hedera-testnet 30
[INFO] Searching for completed checkpoints older than 30 days...
✅ Deleted 5 completed checkpoint(s) older than 30 days.

Deleted:
  - hedera-testnet-1736083200000 (45 days old)
  - hedera-testnet-1736169600000 (44 days old)
  - hedera-testnet-1736256000000 (43 days old)
  - hedera-testnet-1736342400000 (42 days old)
  - hedera-testnet-1736428800000 (41 days old)
```

**Usage:**

```bash
npm run checkpoint:cleanup -- <network> <days>
```

**Parameters:**

- `<network>`: Network name
- `<days>`: Delete checkpoints older than N days (default: 30)

**What gets deleted:**

- ✅ Completed checkpoints older than N days
- ❌ Failed checkpoints (kept for debugging)
- ❌ In-progress checkpoints (kept for resume)

**Best practice:** Run periodically to prevent clutter:

```bash
# Weekly cleanup (keep last 7 days)
npm run checkpoint:cleanup -- hedera-testnet 7

# Monthly cleanup (keep last 30 days)
npm run checkpoint:cleanup -- hedera-testnet 30
```

---

### Reset Failed Checkpoint

```bash
$ npm run checkpoint:reset -- hedera-testnet-1738675200000
[INFO] Resetting checkpoint: hedera-testnet-1738675200000

Previous failure details:
  Step:  3 (Facets)
  Error: Transaction failed: nonce too low
  Time:  2025-02-04T10:15:23Z

✅ Reset checkpoint to in-progress: hedera-testnet-1738675200000
   Status changed: failed → in-progress
   Failure details cleared

You can now resume with: npm run deploy:newBlr
```

**Usage:**

```bash
npm run checkpoint:reset -- <checkpoint-id>
```

**When to use:**

- Want to retry failed checkpoint without confirmation prompt
- Automated scripts need to retry deployments
- Testing checkpoint resume logic

**What it does:**

- Changes `status` from `failed` to `in-progress`
- Clears `failure` object (error details removed)
- Keeps all completed steps intact
- Next deployment will resume from failed step

---

## Checkpoint File Structure

**Example checkpoint file:**

```json
{
  "schemaVersion": 2,
  "checkpointId": "hedera-testnet-1738675200000",
  "network": "hedera-testnet",
  "deployer": "0x1234567890123456789012345678901234567890",
  "status": "in-progress",
  "currentStep": 2,
  "workflowType": "newBlr",
  "startTime": "2025-02-04T10:00:00.000Z",
  "lastUpdate": "2025-02-04T10:05:30.123Z",

  "steps": {
    "proxyAdmin": {
      "address": "0xabc123...",
      "deploymentTxHash": "0xdef456...",
      "timestamp": "2025-02-04T10:01:23.456Z"
    },
    "blr": {
      "implementation": {
        "address": "0x123abc...",
        "deploymentTxHash": "0x456def..."
      },
      "proxy": {
        "address": "0x789ghi...",
        "deploymentTxHash": "0xabcjkl..."
      },
      "timestamp": "2025-02-04T10:03:45.678Z"
    },
    "facets": {
      "AccessControlFacet": {
        "address": "0xfff111...",
        "deploymentTxHash": "0xeee222...",
        "key": "0x0000000000000000000000000000000000000000000000000000000000000001"
      }
      // ... more facets
    }
  },

  "options": {
    "confirmations": 2,
    "batchSize": 10,
    "useTimeTravel": false
  },

  "failure": {
    "step": 3,
    "stepName": "Facets",
    "error": "Transaction failed: nonce too low",
    "timestamp": "2025-02-04T10:15:23.789Z"
  }
}
```

### Key Fields Explained

| Field           | Purpose                                    | Example Value                                                         |
| --------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| `schemaVersion` | Checkpoint format version (for migrations) | `2`                                                                   |
| `checkpointId`  | Unique ID: `{network}-{timestamp}`         | `hedera-testnet-1738675200000`                                        |
| `network`       | Target network name                        | `hedera-testnet`, `hedera-mainnet`                                    |
| `deployer`      | Deployer address (from private key)        | `0x1234...7890`                                                       |
| `status`        | Current state                              | `in-progress`, `failed`, `completed`                                  |
| `currentStep`   | Last completed step number (0-indexed)     | `2` (means step 3 is next)                                            |
| `workflowType`  | Which deployment workflow                  | `newBlr`, `existingBlr`, `upgradeConfigurations`, `upgradeTupProxies` |
| `startTime`     | When deployment started                    | ISO 8601 timestamp                                                    |
| `lastUpdate`    | Last checkpoint update time                | ISO 8601 timestamp                                                    |
| `steps`         | Deployed contract addresses and tx hashes  | See JSON structure above                                              |
| `options`       | Deployment configuration                   | `confirmations`, `batchSize`, etc.                                    |
| `failure`       | Error details (only if failed)             | Step number, error message, timestamp                                 |

**Key insights:**

- `currentStep` points to last **completed** step (next resume starts at `currentStep + 1`)
- `steps` object grows as deployment progresses
- `failure` object only exists when `status === "failed"`
- `options` preserved for resume consistency

---

## Troubleshooting

### Problem: "No resumable checkpoints found" but I know deployment failed

**Cause:** Checkpoint wasn't saved properly due to:

- Process killed abruptly (SIGKILL)
- Disk full error
- Permission error writing to `.checkpoints/` directory
- Filesystem corruption

**Solution:**

```bash
# 1. Check if checkpoint file exists
ls -la deployments/hedera-testnet/.checkpoints/

# 2. If exists, verify it's readable
cat deployments/hedera-testnet/.checkpoints/hedera-testnet-*.json

# 3. If corrupted, restore from backup (if available)
# or start fresh deployment
npm run deploy:newBlr

# 4. If permission error, fix permissions
chmod 755 deployments/hedera-testnet/.checkpoints/
chmod 644 deployments/hedera-testnet/.checkpoints/*.json
```

---

### Problem: Resume fails with "checkpoint schema version not supported"

**Cause:** Checkpoint created with newer version of ATS contracts that uses different schema

**Solution:**

```bash
# Option 1: Update ATS contracts package
npm install @hashgraph/asset-tokenization-contracts@latest
npm run ats:contracts:build

# Option 2: Delete old checkpoint and start fresh
npm run checkpoint:delete -- <checkpoint-id>
npm run deploy:newBlr
```

**Prevention:** Keep ATS contracts version consistent across team members

---

### Problem: Stuck in loop - keeps resuming from same failed step

**Cause:** Underlying issue not fixed, so same error occurs repeatedly

**Diagnosis:**

```bash
# 1. Check the error message
npm run checkpoint:show -- <checkpoint-id>
# Look at "failure.error" field for root cause
```

**Common issues and fixes:**

| Error Message                               | Root Cause                            | Solution                             |
| ------------------------------------------- | ------------------------------------- | ------------------------------------ |
| "Insufficient gas"                          | `GAS_LIMIT` too low                   | Increase `GAS_LIMIT` in `.env`       |
| "Nonce too low"                             | Pending transactions or mempool issue | Wait 2-3 minutes, try again          |
| "Network unreachable"                       | RPC node down or misconfigured        | Check `REACT_APP_RPC_NODE` in `.env` |
| "Contract creation code storage out of gas" | Complex contract deployment           | Increase `GAS_LIMIT` significantly   |
| "Transaction underpriced"                   | Gas price too low                     | Increase gas price in network config |

**Solutions:**

```bash
# Fix the issue (e.g., update .env)

# Then retry deployment
npm run deploy:newBlr

# If keeps failing after multiple attempts, start fresh
npm run checkpoint:delete -- <checkpoint-id>
npm run deploy:newBlr
```

---

### Problem: Multiple failed checkpoints cluttering the system

**Solution:**

```bash
# Option 1: Clean up specific failed checkpoints
npm run checkpoint:list -- hedera-testnet
npm run checkpoint:delete -- <checkpoint-id-1>
npm run checkpoint:delete -- <checkpoint-id-2>

# Option 2: Clean up old completed checkpoints (keeps failed ones)
npm run checkpoint:cleanup -- hedera-testnet 7

# Option 3: Nuclear option - delete ALL checkpoints
rm -rf deployments/hedera-testnet/.checkpoints/*
# WARNING: Loses all resume capability
```

**Best practice:** Regular cleanup schedule

```bash
# Weekly: Keep last 7 days of completed checkpoints
npm run checkpoint:cleanup -- hedera-testnet 7

# After successful deployment: Delete old failed attempts
npm run checkpoint:list -- hedera-testnet
# Review list, delete obsolete ones
```

---

### Problem: Want to skip failed step and continue

**Not supported by design.**

**Why:** Checkpoints don't allow skipping steps because:

- Each step depends on previous steps (e.g., can't register facets without deploying them)
- Skipping would result in incomplete/broken deployment
- Missing contracts would cause runtime errors

**Alternative approaches:**

```bash
# Approach 1: Fix the issue and retry
# (Recommended - addresses root cause)
npm run deploy:newBlr

# Approach 2: Delete checkpoint, start fresh
# (Use if network config changed significantly)
npm run checkpoint:delete -- <checkpoint-id>
npm run deploy:newBlr

# Approach 3: Manual deployment + checkpoint editing
# (Advanced - NOT recommended, breaks resume safety)
# Deploy missing step manually using Hardhat
# Edit checkpoint JSON to add step data
# RISKY: Easy to create inconsistent state
```

---

## Advanced Topics

### Checkpoint Storage Location

**Default locations:**

```
deployments/
├── hedera-testnet/.checkpoints/     # Hedera testnet
├── hedera-mainnet/.checkpoints/     # Hedera mainnet
├── test/hardhat/.checkpoints/       # Hardhat local network
└── local/.checkpoints/               # Custom local network
```

**Custom location (programmatic):**

```typescript
import { CheckpointManager } from "@scripts/infrastructure";

// Custom checkpoint directory
const manager = new CheckpointManager("hedera-testnet", "/custom/path/.checkpoints");
```

**Environment variable override (CLI):**

```bash
# Set custom checkpoint directory
export CHECKPOINT_DIR=/custom/path/.checkpoints
npm run deploy:newBlr
```

---

### Schema Versioning

Checkpoints use schema versioning for forward compatibility:

**Schema versions:**

- **v1** (legacy): Pre-2025 checkpoints, basic structure
- **v2** (current): Adds `schemaVersion` field, improves facet tracking, better error details

**Migration behavior:**

```typescript
// Loading v1 checkpoint
const checkpoint = manager.loadCheckpoint("hedera-testnet-1234567890000");
// → Automatically migrated to v2 in-memory

// Saving checkpoint
manager.updateCheckpoint(checkpoint);
// → Always saves as v2 format

// Loading v3 checkpoint (future version)
// → Throws error: "Checkpoint schema version 3 not supported"
```

**Forward compatibility rule:** System rejects checkpoints from newer versions to prevent data corruption

---

### Non-Interactive Mode (CI/CD)

**Detection:**

```typescript
// Automatic detection in workflows
if (!process.stdin.isTTY) {
  // Non-interactive mode
  // Auto-resume without prompts
}
```

**Behavior differences:**

| Scenario                | Interactive (Terminal)             | Non-Interactive (CI/CD)       |
| ----------------------- | ---------------------------------- | ----------------------------- |
| Failed checkpoint found | Prompts user to confirm resume     | Auto-resumes with warning log |
| Multiple checkpoints    | Shows selection menu               | Selects newest automatically  |
| Missing checkpoint      | Starts fresh (user aware)          | Starts fresh (logged)         |
| Ctrl+C                  | Saves checkpoint, exits gracefully | N/A (CI doesn't interrupt)    |

**CI/CD example:**

```yaml
# GitHub Actions workflow
- name: Deploy to Hedera Testnet
  run: npm run deploy:newBlr
  env:
    DEPLOYER_PRIVATE_KEY: ${{ secrets.DEPLOYER_PRIVATE_KEY }}
  # Checkpoint system automatically resumes on retry
```

**Best practices for CI/CD:**

- ✅ Let checkpoint system handle resume automatically
- ✅ Set retry logic in CI pipeline (3-5 attempts)
- ✅ Log all checkpoint operations for audit trail
- ✅ Clean up old checkpoints in post-deploy step

---

## Best Practices

### ✅ DO:

- **Let checkpoints auto-resume failures** - Don't delete immediately after failure
- **Review failure details before resuming** - Use `npm run checkpoint:show` to understand root cause
- **Clean up old checkpoints periodically** - Run `checkpoint:cleanup` weekly/monthly
- **Use checkpoints in CI/CD pipelines** - Enable non-interactive mode for automated retries
- **Keep deployment options consistent** - Don't change options between resume attempts
- **Create backup before major deployments** - Manual checkpoint snapshot if needed

### ❌ DON'T:

- **Manually edit checkpoint JSON files** - Use CLI commands instead (breaks validation)
- **Delete `.checkpoints/` directory** - Breaks resume capability completely
- **Change network configuration mid-deployment** - Causes address mismatches
- **Resume with different deployment options** - May cause inconsistent state
- **Ignore repeated failures** - Investigate root cause instead of retrying blindly
- **Mix workflows** - Don't resume `newBlr` checkpoint with `existingBlr` workflow

### Production Deployment Checklist:

```bash
# 1. Check for existing checkpoints
npm run checkpoint:list -- hedera-mainnet

# 2. Clean up old checkpoints (optional)
npm run checkpoint:cleanup -- hedera-mainnet 30

# 3. Run deployment
npm run deploy:newBlr

# 4. If fails, review error
npm run checkpoint:show -- <checkpoint-id>

# 5. Fix issue, retry
npm run deploy:newBlr

# 6. After success, verify output
ls -la deployments/hedera-mainnet/newBlr-*.json
```

---

## Related Documentation

- **[Scripts README](./README.md)** - Full deployment command reference, all workflows
- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Step-by-step deployment scenarios with examples
- **[Main README](../README.md)** - Project overview, setup instructions, environment configuration
- **[Checkpoint API Documentation](./infrastructure/checkpoint/README.md)** - Internal API details for developers

**Quick links:**

- [How to deploy a new system](./README.md#deployment-workflows)
- [How to upgrade existing contracts](./README.md#upgrade-workflows)
- [Environment setup](../README.md#environment-setup)
- [Troubleshooting common issues](../README.md#troubleshooting)

---

**Need help?** Check the [Troubleshooting](#troubleshooting) section or review real scenarios in the [Developer Guide](./DEVELOPER_GUIDE.md).
