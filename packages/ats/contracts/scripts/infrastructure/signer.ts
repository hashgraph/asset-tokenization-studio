// SPDX-License-Identifier: Apache-2.0

/**
 * Network signer utilities for the infrastructure layer.
 *
 * This is the INFRASTRUCTURE LAYER - provides low-level signer creation
 * when the network name is already known and validated.
 *
 * For CLI entry points that need to read NETWORK from environment variables
 * and validate it with user-friendly error messages, use cli/shared/network.ts
 * which wraps these utilities with CLI-friendly patterns.
 *
 * @example
 * ```typescript
 * // Infrastructure: use when network is already known
 * import { createNetworkSigner } from "@scripts/infrastructure";
 * const { signer, address } = await createNetworkSigner("hedera-testnet");
 *
 * // CLI: use when reading from environment
 * import { requireNetworkSigner } from "./cli/shared";
 * const { network, signer, address } = await requireNetworkSigner();
 * ```
 *
 * @module infrastructure/signer
 */

import { Wallet, JsonRpcProvider, NonceManager, Signer, FetchRequest } from "ethers";
import { getNetworkConfig, getPrivateKey } from "./config";
import { error, warn } from "./utils/logging";

const PROVIDER_RETRY_ATTEMPTS = 5;
const PROVIDER_RETRY_BASE_DELAY_MS = 2_000;
const PROVIDER_RETRY_MAX_DELAY_MS = 30_000;

/**
 * Creates a JsonRpcProvider whose HTTP layer retries 5xx gateway errors.
 *
 * Without this, transient 502/503 responses from hashio.io propagate into
 * ethers' internal polling loop as unhandled promise rejections, crashing
 * Node.js before the application-level retry logic in retryTransaction() can run.
 *
 * FetchRequest.retryFunc intercepts the raw HTTP response before ethers
 * processes it, so 5xx errors are retried silently at the network layer and
 * never reach application code.
 */
function createProvider(jsonRpcUrl: string): JsonRpcProvider {
  const fetchRequest = new FetchRequest(jsonRpcUrl);

  fetchRequest.retryFunc = async (_request, response, attempt) => {
    if (attempt >= PROVIDER_RETRY_ATTEMPTS) return false;
    if (response && response.statusCode >= 500 && response.statusCode < 600) {
      const delay = Math.min(PROVIDER_RETRY_BASE_DELAY_MS * Math.pow(2, attempt), PROVIDER_RETRY_MAX_DELAY_MS);
      warn(
        `Provider HTTP ${response.statusCode} — retrying in ${delay}ms (attempt ${attempt + 1}/${PROVIDER_RETRY_ATTEMPTS})`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return true;
    }
    return false;
  };

  return new JsonRpcProvider(fetchRequest);
}

/**
 * Result of creating a network signer.
 */
export interface NetworkSignerResult {
  /** The ethers.js Signer instance */
  signer: Signer;
  /** The signer's address (resolved) */
  address: string;
}

/**
 * Creates a signer for a specific network using configuration and environment variables.
 *
 * Uses:
 * - `getNetworkConfig(network)` to get RPC URL from Configuration.ts
 * - `getPrivateKey(network, index)` to get private key from environment
 *
 * @param network - Network identifier (e.g., 'hedera-testnet', 'local')
 * @param keyIndex - Private key index (default: 0)
 * @returns Promise resolving to signer and address
 * @throws Exits process with code 1 if private key not found
 *
 * @example
 * ```typescript
 * import { createNetworkSigner } from "@scripts/infrastructure";
 *
 * const network = process.env.NETWORK || "hedera-testnet";
 * const { signer, address } = await createNetworkSigner(network);
 *
 * console.log(`Deployer: ${address}`);
 * ```
 *
 * @example
 * ```typescript
 * // Using a different key index
 * const { signer, address } = await createNetworkSigner("hedera-testnet", 1);
 * // Uses HEDERA_TESTNET_PRIVATE_KEY_1
 * ```
 */
export async function createNetworkSigner(network: string, keyIndex: number = 0): Promise<NetworkSignerResult> {
  // Get network config (RPC URL)
  const networkConfig = getNetworkConfig(network);

  // Get private key from environment
  const privateKey = getPrivateKey(network, keyIndex);

  if (!privateKey) {
    const envVarName = `${network.toUpperCase().replace(/-/g, "_")}_PRIVATE_KEY_${keyIndex}`;
    error(`❌ Missing private key. Set ${envVarName} in .env file.`);
    process.exit(1);
  }

  // Create provider and signer with NonceManager to prevent nonce caching
  // issues when deploying multiple contracts via JSON-RPC
  const provider = createProvider(networkConfig.jsonRpcUrl);
  const wallet = new Wallet(privateKey, provider);
  const signer = new NonceManager(wallet);
  const address = await signer.getAddress();

  return { signer, address };
}
