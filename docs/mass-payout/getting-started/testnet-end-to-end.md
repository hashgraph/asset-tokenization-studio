---
id: testnet-end-to-end
title: End-to-End Testnet Walkthrough
sidebar_label: Testnet Walkthrough
sidebar_position: 3
---

# End-to-End Testnet Walkthrough

This guide walks you through a complete end-to-end flow: building all components from scratch, running the full stack locally, and executing a real distribution on Hedera Testnet using a test asset and USDC test funds.

## Prerequisites

- All [Full Development Setup](./full-setup.md) steps completed
- Docker running (for PostgreSQL)
- A Hedera Testnet account with HBAR
- Access to the ATS staging environment (see [Step 3](#step-3-create-a-test-asset-in-ats-staging))

---

## Step 1: Build All Components in Order

Mass Payout depends on the ATS contracts and SDK. Build everything in the correct dependency order:

```bash
# 1. ATS contracts first (MP contracts depend on these ABIs)
npm run ats:contracts:build

# 2. Mass Payout contracts
npm run mass-payout:contracts:build

# 3. Mass Payout SDK (depends on MP contracts)
npm run mass-payout:sdk:build

# 4. Mass Payout backend (depends on MP SDK)
npm run mass-payout:backend:build

# 5. ATS SDK last (depends on ATS contracts)
npm run ats:sdk:build
```

:::caution Build order matters
Building `mass-payout:contracts` before `ats:contracts` will fail. Always start with ATS contracts.
:::

---

## Step 2: Start the Local Stack

### 2.1 Start the Database

```bash
cd apps/mass-payout/backend
docker compose up -d
```

### 2.2 Start the Backend

From the backend directory (required to load `.env` correctly):

```bash
cd apps/mass-payout/backend
npm run start:debug
```

The backend API will be available at **http://localhost:3000**.

> **Tip**: Use `start:debug` instead of `start:dev` to have the Node.js debugger available on port 9229, useful for stepping through distribution execution.

### 2.3 Start the Frontend

In a new terminal, from the monorepo root:

```bash
npm run mass-payout:frontend:dev
```

The frontend will be available at **http://localhost:5173**.

---

## Step 3: Create a Test Asset in ATS Staging

You need a token deployed on Hedera Testnet to import into Mass Payout. Use the ATS staging environment:

1. Go to the ATS staging app: **https://asset-tokenization-studio-iobuilders.netlify.app/**
   - Password: Ask for it
2. Connect your Hedera Testnet wallet
3. Create a new security token (bond or equity)
4. **Mint tokens** to at least one holder address

:::info Why mint tokens?
An address only becomes a token holder after tokens are minted to it. If you skip minting, Mass Payout will import the asset but show zero holders — no distribution can be executed. See [Asset Imported But Shows Zero Holders](../user-guides/importing-assets.md#asset-imported-but-shows-zero-holders) for details.
:::

---

## Step 4: Import the Asset into Mass Payout

1. Open the local frontend at **http://localhost:5173**
2. Click **Import Asset**
3. On the asset row, click the import button on the right side
4. Follow the next steps to confirm the import

After import, the asset will appear in the dashboard with holder count and balances synced from the blockchain.

---

## Step 5: Fund the Distributions Contract with Test USDC

Each imported asset has a **Distributions SC** address — the smart contract that will hold the funds to be distributed.

### 5.1 Find the Distributions SC Address

In the Mass Payout frontend:

1. Navigate to the asset row
2. Copy the **Distributions SC** address (format: `0.0.XXXXXXXX`)

### 5.2 Get Test USDC from Circle Faucet

1. Go to **https://faucet.circle.com/**
2. Select **Hedera Testnet** as the network
3. Paste the **Distributions SC** address as the recipient
4. Request test USDC

### 5.3 Verify the Balance on Hashscan

1. Go to **https://hashscan.io/testnet/**
2. Search for the **Distributions SC** address
3. Navigate to **Associated Contract → Assets**
4. Confirm the USDC balance appears

Once the contract has funds, Mass Payout can execute a distribution to all token holders.

---

## Step 6: Create and Execute a Distribution

1. In the frontend, select the imported asset
2. Click **New Distribution**
3. Set the distribution amount and payment token (USDC)
4. Review the list of holders and their proportional amounts
5. Click **Execute Payout**

The backend will batch the payments via the Distributions contract and submit transactions to Hedera Testnet. You can monitor progress in the backend logs and verify transactions on Hashscan.

---

## Troubleshooting

### Backend fails to start after rebuilding contracts

The backend depends on generated ABIs from the contracts build. If you change contracts, rebuild in the correct order (Step 1) before restarting the backend.

### Distribution SC shows no balance after faucet

- Confirm the faucet transaction was on **Hedera Testnet** (not another network)
- Wait ~10 seconds for Mirror Node indexing, then refresh Hashscan
- Ensure you used the **Distributions SC** address, not the token contract address

### Holders not appearing after import

Tokens must be minted to holder addresses in ATS before importing. Re-mint in ATS, then click **Sync Holders** in the Mass Payout asset details page.
