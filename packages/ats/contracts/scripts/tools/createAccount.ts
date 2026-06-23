// SPDX-License-Identifier: Apache-2.0

/**
 * Creates a new ECDSA account on the demo-sphere private Hedera network and
 * funds it with an initial balance of 10 HBAR.
 *
 * Two strategies are supported depending on the operator key type:
 *
 *   ECDSA operator  — sends HBAR via the JSON-RPC relay.  Hedera auto-creates
 *                     a hollow account for any EVM address that receives HBAR.
 *
 *   ED25519 operator — uses the Hedera SDK TransferTransaction submitted
 *                      directly to the consensus node over gRPC.  No JSON-RPC
 *                      relay interaction is needed for the transfer.
 *
 * In both cases the mirror node REST API is polled afterwards to resolve the
 * Hedera account ID.
 *
 * Network endpoints (defaults from .env, overridable via env vars):
 *   JSON-RPC relay:   http://jrpc-relay.int.asseto.cecabank.internal:7546
 *   Mirror node:      http://mirror-api.int.asseto.cecabank.internal
 *   Consensus node:   sphere-node01.int.asseto.cecabank.internal:50211
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/tools/createAccountDemo.ts
 *
 *   # Override operator key or initial balance
 *   OPERATOR_PRIVATE_KEY=<hex> INITIAL_BALANCE=5000 \
 *     npx ts-node -r tsconfig-paths/register scripts/tools/createAccountDemo.ts
 *
 * Environment variables:
 *   OPERATOR_PRIVATE_KEY   Operator private key — raw hex or 0x-prefixed
 *                          (default: HEDERA_HASHSPHERE_PRIVATE_KEY_0 from .env)
 *   OPERATOR_ACCOUNT_ID    Hedera account ID of the operator (e.g. 0.0.1234)
 *                          Required when using an ED25519 operator key.
 *                          (default: HEDERA_HASHSPHERE_ACCOUNT_ID_0 from .env)
 *   KEY_TYPE               "ECDSA" (default) or "ED25519"
 *   INITIAL_BALANCE        Initial HBAR balance for the new account (default: 10)
 *   JSON_RPC_URL           JSON-RPC relay URL
 *   MIRROR_NODE_URL        Mirror node REST base URL
 *   CONSENSUS_NODE         Consensus node endpoint (host:port)
 *                          (default: HEDERA_HASHSPHERE_GRPC_NODE_ENDPOINT from .env)
 */

import dotenv from "dotenv";
import { JsonRpcProvider, Wallet, parseEther, formatEther } from "ethers";
import { PrivateKey, Client, AccountId, TransferTransaction, Hbar, AccountBalanceQuery } from "@hashgraph/sdk";

dotenv.config();

const DEFAULT_JSON_RPC_URL = "http://jrpc-relay.int.asseto.cecabank.internal:7546";
const DEFAULT_MIRROR_URL = "http://mirror-api.int.asseto.cecabank.internal";
const DEFAULT_CONSENSUS_NODE = "sphere-node01.int.asseto.cecabank.internal:50211";
const DEFAULT_INITIAL_BALANCE = 10;

// ─── helpers ──────────────────────────────────────────────────────────────────

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

/** Build an ethers Wallet from a raw or DER-encoded ECDSA private key. */
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

interface MirrorAccount {
  account?: string;
  evm_address?: string;
  balance?: { balance?: number };
}

async function pollMirrorForAccount(
  mirrorUrl: string,
  evmAddress: string,
  maxAttempts = 15,
  delayMs = 3_000,
): Promise<MirrorAccount> {
  const base = mirrorUrl.replace(/\/$/, "");
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(`${base}/api/v1/accounts/${evmAddress}`);
    if (res.ok) return (await res.json()) as MirrorAccount;
    if (res.status !== 404) throw new Error(`Mirror node error: ${res.status} ${res.statusText}`);
    process.stdout.write(`⏳ Waiting for mirror node to index account (attempt ${attempt}/${maxAttempts})...\r`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error("Mirror node did not index the new account within the timeout. Try again shortly.");
}

function formatTinybarsAsHbar(tinybars: number): string {
  const TINYBARS_PER_HBAR = 100_000_000;
  const whole = Math.floor(tinybars / TINYBARS_PER_HBAR);
  const frac = tinybars % TINYBARS_PER_HBAR;
  if (frac === 0) return `${whole} HBAR`;
  return `${whole}.${String(frac).padStart(8, "0").replace(/0+$/, "")} HBAR`;
}

// ─── ECDSA strategy ───────────────────────────────────────────────────────────

async function transferViaJsonRpc(
  operatorKeyRaw: string,
  evmAddress: string,
  initialBalance: number,
  jsonRpcUrl: string,
): Promise<void> {
  const provider = new JsonRpcProvider(jsonRpcUrl);
  const operator = buildEcdsaWallet(operatorKeyRaw, provider);
  const operatorAddress = await operator.getAddress();

  console.log(`👤 Operator:        ${operatorAddress}`);

  const operatorBalance = await provider.getBalance(operatorAddress);
  const transferAmount = parseEther(initialBalance.toString());
  if (operatorBalance < transferAmount) {
    console.error(
      `❌  Operator balance too low: have ${formatEther(operatorBalance)} HBAR, need ${initialBalance} HBAR`,
    );
    process.exit(1);
  }
  console.log(`🏦 Operator balance: ${formatEther(operatorBalance)} HBAR`);

  console.log(`\n📤 Sending ${initialBalance} HBAR to ${evmAddress}...`);
  const tx = await operator.sendTransaction({ to: evmAddress, value: transferAmount });
  console.log(`   Transaction hash: ${tx.hash}`);
  console.log("⏳ Waiting for confirmation...");

  const receipt = await tx.wait(1);
  if (!receipt || receipt.status !== 1) {
    console.error("❌  Transaction failed");
    process.exit(1);
  }
  console.log(`✅ Confirmed in block ${receipt.blockNumber}`);
}

// ─── ED25519 strategy ─────────────────────────────────────────────────────────

async function transferViaHederaSdk(
  operatorKeyRaw: string,
  operatorAccountId: string,
  evmAddress: string,
  initialBalance: number,
  consensusNode: string,
): Promise<void> {
  const stripped = operatorKeyRaw.replace(/^0x/, "");
  const operatorKey = PrivateKey.fromStringED25519(stripped);

  // Build a minimal client pointed at the private network.
  // The node account ID 0.0.3 is the standard first consensus node on any
  // Hedera network (local, testnet, or private).
  const client = Client.forNetwork({ [consensusNode]: new AccountId(3) });
  client.setOperator(AccountId.fromString(operatorAccountId), operatorKey);

  console.log(`👤 Operator:        ${operatorAccountId}`);

  const balanceQuery = await new AccountBalanceQuery()
    .setAccountId(AccountId.fromString(operatorAccountId))
    .execute(client);
  const operatorHbar = balanceQuery.hbars.toBigNumber().toNumber();
  if (operatorHbar < initialBalance) {
    console.error(`❌  Operator balance too low: have ${operatorHbar} HBAR, need ${initialBalance} HBAR`);
    process.exit(1);
  }
  console.log(`🏦 Operator balance: ${operatorHbar} HBAR`);

  console.log(`\n📤 Sending ${initialBalance} HBAR to ${evmAddress}...`);
  const receipt = await new TransferTransaction()
    .addHbarTransfer(AccountId.fromString(operatorAccountId), new Hbar(-initialBalance))
    .addHbarTransfer(evmAddress, new Hbar(initialBalance))
    .execute(client)
    .then((tx) => tx.getReceipt(client));

  console.log(`✅ Status: ${receipt.status.toString()}`);
  client.close();
}

// ─── main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const jsonRpcUrl = optionalEnv("JSON_RPC_URL", DEFAULT_JSON_RPC_URL);
  const mirrorUrl = optionalEnv("MIRROR_NODE_URL", DEFAULT_MIRROR_URL);
  const consensusNode = optionalEnv(
    "CONSENSUS_NODE",
    optionalEnv("HEDERA_HASHSPHERE_GRPC_NODE_ENDPOINT", DEFAULT_CONSENSUS_NODE),
  );
  const initialBalance = parseInt(optionalEnv("INITIAL_BALANCE", String(DEFAULT_INITIAL_BALANCE)), 10);
  const keyType = (process.env.KEY_TYPE ?? "ECDSA").toUpperCase();

  if (isNaN(initialBalance) || initialBalance <= 0) {
    console.error(`❌  INITIAL_BALANCE must be a positive integer, got: ${process.env.INITIAL_BALANCE}`);
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

  if (keyType === "ED25519") {
    const operatorAccountId = process.env.OPERATOR_ACCOUNT_ID || process.env.HEDERA_HASHSPHERE_ACCOUNT_ID_0 || "";
    if (!operatorAccountId) {
      console.error(
        "❌  ED25519 mode requires an operator account ID. Set OPERATOR_ACCOUNT_ID or HEDERA_HASHSPHERE_ACCOUNT_ID_0 in .env",
      );
      process.exit(1);
    }
  }

  console.log("─────────────────────────────────────────────────────");
  console.log("🌐 Network:         demo-sphere (private Hedera)");
  console.log(`📡 JSON-RPC relay:  ${jsonRpcUrl}`);
  console.log(`🪞 Mirror node:     ${mirrorUrl}`);
  console.log(`🔗 Consensus node:  ${consensusNode}`);
  console.log(`🔑 Key type:        ${keyType}`);
  console.log(`💰 Initial balance: ${initialBalance} HBAR`);
  console.log("─────────────────────────────────────────────────────");

  // Generate a fresh ECDSA keypair for the new account
  const newKey = PrivateKey.generateECDSA();
  const newPublicKey = newKey.publicKey;
  const evmAddress = `0x${newPublicKey.toEvmAddress()}`;

  console.log("\n🔑 Generated new ECDSA keypair");
  console.log(`   Private key: ${newKey.toStringRaw()}`);
  console.log(`   Public key:  ${newPublicKey.toStringRaw()}`);
  console.log(`   EVM address: ${evmAddress}`);
  console.log();

  if (keyType === "ED25519") {
    const operatorAccountId = process.env.OPERATOR_ACCOUNT_ID || process.env.HEDERA_HASHSPHERE_ACCOUNT_ID_0 || "";
    await transferViaHederaSdk(operatorKeyRaw, operatorAccountId, evmAddress, initialBalance, consensusNode);
  } else {
    await transferViaJsonRpc(operatorKeyRaw, evmAddress, initialBalance, jsonRpcUrl);
  }

  // Poll the mirror node REST API to resolve the Hedera account ID
  console.log("\n🔍 Resolving Hedera account ID from mirror node...");
  const mirrorAccount = await pollMirrorForAccount(mirrorUrl, evmAddress);
  process.stdout.write("\n");

  const hederaId = mirrorAccount.account ?? "unknown";
  const balance =
    mirrorAccount.balance?.balance !== undefined
      ? formatTinybarsAsHbar(mirrorAccount.balance.balance)
      : `${initialBalance} HBAR (unconfirmed)`;

  console.log("\n═════════════════════════════════════════════════════");
  console.log("  NEW ACCOUNT");
  console.log("═════════════════════════════════════════════════════");
  console.log(`  Hedera ID:   ${hederaId}`);
  console.log(`  EVM address: ${evmAddress}`);
  console.log(`  Public key:  ${newPublicKey.toStringRaw()}`);
  console.log(`  Private key: ${newKey.toStringRaw()}`);
  console.log(`  Balance:     ${balance}`);
  console.log("═════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("❌  Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
