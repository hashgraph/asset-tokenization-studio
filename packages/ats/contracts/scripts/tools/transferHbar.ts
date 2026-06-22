// SPDX-License-Identifier: Apache-2.0

/**
 * Transfers HBAR from an operator account to any destination (Hedera ID or
 * EVM address) on the demo-sphere private Hedera network.
 *
 * Supports both ECDSA and ED25519 operator keys:
 *   ECDSA   — sends via the JSON-RPC relay (ethers sendTransaction)
 *   ED25519 — sends via the Hedera SDK TransferTransaction over gRPC
 *
 * Usage:
 *   KEY_TYPE=ED25519 FROM_ACCOUNT_ID=0.0.2 TO=0x1c3d... AMOUNT=100 \
 *     npx ts-node -r tsconfig-paths/register scripts/tools/transferHbar.ts
 *
 * Environment variables:
 *   OPERATOR_PRIVATE_KEY   Operator private key — raw hex or 0x-prefixed
 *                          (default: HEDERA_HASHSPHERE_PRIVATE_KEY_0 from .env)
 *   FROM_ACCOUNT_ID        Hedera account ID of the sender (e.g. 0.0.2)
 *                          Required for ED25519. Falls back to
 *                          HEDERA_HASHSPHERE_ACCOUNT_ID_0 from .env
 *   TO                     Destination — Hedera ID (0.0.X) or EVM address (0x...)
 *   AMOUNT                 Amount in HBAR (default: 10)
 *   KEY_TYPE               "ECDSA" (default) or "ED25519"
 *   JSON_RPC_URL           JSON-RPC relay URL (ECDSA only)
 *   CONSENSUS_NODE         Consensus node host:port (ED25519 only)
 */

import dotenv from "dotenv";
import { JsonRpcProvider, Wallet, parseEther, formatEther } from "ethers";
import { PrivateKey, Client, AccountId, TransferTransaction, Hbar, AccountBalanceQuery } from "@hashgraph/sdk";

dotenv.config();

const DEFAULT_JSON_RPC_URL = "http://jrpc-relay.int.asseto.cecabank.internal:7546";
const DEFAULT_CONSENSUS_NODE = "sphere-node01.int.asseto.cecabank.internal:50211";
const DEFAULT_AMOUNT = 10;

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildEcdsaWallet(raw: string, provider: JsonRpcProvider): Wallet {
  const stripped = raw.replace(/^0x/, "");
  try {
    const rawHex = PrivateKey.fromStringECDSA(stripped).toStringRaw();
    return new Wallet(`0x${rawHex}`, provider);
  } catch {
    const rawHex = PrivateKey.fromStringDer(stripped).toStringRaw();
    return new Wallet(`0x${rawHex}`, provider);
  }
}

// ─── ECDSA transfer ───────────────────────────────────────────────────────────

async function transferEcdsa(operatorKeyRaw: string, to: string, amount: number, jsonRpcUrl: string): Promise<void> {
  const provider = new JsonRpcProvider(jsonRpcUrl);
  const operator = buildEcdsaWallet(operatorKeyRaw, provider);
  const operatorAddress = await operator.getAddress();

  console.log(`👤 From (EVM):  ${operatorAddress}`);
  console.log(`📬 To:          ${to}`);

  const balance = await provider.getBalance(operatorAddress);
  const transferAmount = parseEther(amount.toString());
  if (balance < transferAmount) {
    console.error(`❌  Balance too low: have ${formatEther(balance)} HBAR, need ${amount} HBAR`);
    process.exit(1);
  }
  console.log(`🏦 Balance:     ${formatEther(balance)} HBAR`);

  console.log(`\n📤 Sending ${amount} HBAR...`);
  const tx = await operator.sendTransaction({ to, value: transferAmount });
  console.log(`   Transaction hash: ${tx.hash}`);
  console.log("⏳ Waiting for confirmation...");

  const receipt = await tx.wait(1);
  if (!receipt || receipt.status !== 1) {
    console.error("❌  Transaction failed");
    process.exit(1);
  }
  console.log(`✅ Confirmed in block ${receipt.blockNumber}`);
}

// ─── ED25519 transfer ─────────────────────────────────────────────────────────

async function transferEd25519(
  operatorKeyRaw: string,
  fromAccountId: string,
  to: string,
  amount: number,
  consensusNode: string,
): Promise<void> {
  const stripped = operatorKeyRaw.replace(/^0x/, "");
  const operatorKey = PrivateKey.fromStringED25519(stripped);

  const client = Client.forNetwork({ [consensusNode]: new AccountId(3) });
  client.setOperator(AccountId.fromString(fromAccountId), operatorKey);

  console.log(`👤 From:        ${fromAccountId}`);
  console.log(`📬 To:          ${to}`);

  const balanceQuery = await new AccountBalanceQuery()
    .setAccountId(AccountId.fromString(fromAccountId))
    .execute(client);
  const hbarBalance = balanceQuery.hbars.toBigNumber().toNumber();
  if (hbarBalance < amount) {
    console.error(`❌  Balance too low: have ${hbarBalance} HBAR, need ${amount} HBAR`);
    client.close();
    process.exit(1);
  }
  console.log(`🏦 Balance:     ${hbarBalance} HBAR`);

  // Destination can be a Hedera ID (0.0.X) or an EVM address (0x...)
  const toAccountId = to.startsWith("0x") ? to : AccountId.fromString(to);

  console.log(`\n📤 Sending ${amount} HBAR...`);
  const txResponse = await new TransferTransaction()
    .addHbarTransfer(AccountId.fromString(fromAccountId), new Hbar(-amount))
    .addHbarTransfer(toAccountId, new Hbar(amount))
    .execute(client);

  const receipt = await txResponse.getReceipt(client);
  console.log(`✅ Status: ${receipt.status.toString()}`);
  console.log(`   Transaction ID: ${txResponse.transactionId.toString()}`);

  client.close();
}

// ─── main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const keyType = (process.env.KEY_TYPE ?? "ECDSA").toUpperCase();
  const to = process.env.TO ?? "";
  const amount = parseInt(process.env.AMOUNT ?? String(DEFAULT_AMOUNT), 10);
  const jsonRpcUrl = process.env.JSON_RPC_URL ?? DEFAULT_JSON_RPC_URL;
  const consensusNode =
    process.env.CONSENSUS_NODE || process.env.HEDERA_HASHSPHERE_GRPC_NODE_ENDPOINT || DEFAULT_CONSENSUS_NODE;

  if (!to) {
    console.error("❌  Missing destination. Set the TO env var (Hedera ID or EVM address).");
    process.exit(1);
  }
  if (isNaN(amount) || amount <= 0) {
    console.error(`❌  AMOUNT must be a positive integer, got: ${process.env.AMOUNT}`);
    process.exit(1);
  }
  if (keyType !== "ECDSA" && keyType !== "ED25519") {
    console.error(`❌  KEY_TYPE must be "ECDSA" or "ED25519", got: ${process.env.KEY_TYPE}`);
    process.exit(1);
  }

  const operatorKeyRaw = process.env.OPERATOR_PRIVATE_KEY || process.env.HEDERA_HASHSPHERE_PRIVATE_KEY_0 || "";
  if (!operatorKeyRaw) {
    console.error("❌  No operator key found. Set OPERATOR_PRIVATE_KEY or HEDERA_HASHSPHERE_PRIVATE_KEY_0 in .env");
    process.exit(1);
  }

  console.log("─────────────────────────────────────────────────────");
  console.log("🌐 Network:     demo-sphere (private Hedera)");
  console.log(`🔑 Key type:    ${keyType}`);
  console.log("─────────────────────────────────────────────────────");

  if (keyType === "ED25519") {
    const fromAccountId = process.env.FROM_ACCOUNT_ID || process.env.HEDERA_HASHSPHERE_ACCOUNT_ID_0 || "";
    if (!fromAccountId) {
      console.error("❌  ED25519 mode requires FROM_ACCOUNT_ID or HEDERA_HASHSPHERE_ACCOUNT_ID_0 in .env");
      process.exit(1);
    }
    await transferEd25519(operatorKeyRaw, fromAccountId, to, amount, consensusNode);
  } else {
    await transferEcdsa(operatorKeyRaw, to, amount, jsonRpcUrl);
  }
}

main().catch((err) => {
  console.error("❌  Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
