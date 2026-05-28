// SPDX-License-Identifier: Apache-2.0

/**
 * Facet deployment module.
 *
 * High-level operation for deploying multiple facets with support for
 * TimeTravel variants, layer-based ordering, and dependency management.
 *
 * @module core/operations/facetDeployment
 */

import { BaseContract, ContractFactory, NonceManager, Overrides, Signer } from "ethers";
import {
  DeploymentResult,
  deployContract,
  info,
  section,
  success,
  warn,
  retryTransaction,
  RetryOptions,
  withNonceReset,
  hederaGasOverrides,
  DEFAULT_TRANSACTION_TIMEOUT,
  validateAddress,
  extractRevertReason,
} from "@scripts/infrastructure";
import { shouldFailAtFacet, createTestFailureMessage } from "../testing/failureInjection";

/**
 * Options for deploying facets (all optional).
 */
export interface DeployFacetsOptions {
  /**
   * Number of confirmations to wait for each deployment.
   * Default: 2 (increased for better reliability on Hedera)
   */
  confirmations?: number;

  /**
   * Transaction overrides for all deployments.
   */
  overrides?: Overrides;

  /**
   * Enable retry mechanism for failed deployments.
   * Default: true
   */
  enableRetry?: boolean;

  /**
   * Retry options for deployment failures.
   * Uses Hedera-optimized defaults if not specified.
   */
  retryOptions?: RetryOptions;

  /**
   * Enable post-deployment verification (bytecode checks).
   * Default: true
   */
  verifyDeployment?: boolean;

  /**
   * Submit facet deploy transactions in parallel chunks instead of one-at-a-time.
   * The signer is automatically wrapped in ethers' NonceManager (if not already),
   * so parallel deploys get sequential nonces without races. Intended for pipeline
   * use against nodes the caller does not control (e.g. Besu) where waiting
   * per-block dominates wall time.
   *
   * Forces `enableRetry = false` internally — retries combined with NonceManager
   * leave permanent nonce gaps on failure.
   *
   * Default: false
   */
  parallelFacetDeployment?: boolean;

  /**
   * Max in-flight deploy transactions when `parallelFacetDeployment` is on.
   * Default: 20
   */
  concurrency?: number;

  /**
   * Called immediately after each facet's deploy transaction is sent and the
   * hash is available, before waiting for confirmation. Use this to checkpoint
   * the tx hash so a crash during waitForDeployment is recoverable on resume.
   * Only invoked in sequential mode (parallel mode does not support per-tx callbacks).
   */
  onTransactionSent?: (name: string, txHash: string) => void | Promise<void>;

  /**
   * Called immediately after each facet is successfully deployed.
   * Use this to save per-facet checkpoint data so partial progress survives
   * process termination or unhandled errors before the full batch completes.
   * Only invoked in sequential mode (parallel mode checkpoints are not supported).
   */
  onFacetDeployed?: (name: string, result: DeploymentResult) => void | Promise<void>;
}

/**
 * Result of deploying facets.
 */
export interface DeployFacetsResult {
  /** Whether all deployments succeeded */
  success: boolean;

  /** Successfully deployed facets (name -> result) */
  deployed: Map<string, DeploymentResult>;

  /** Failed facets (name -> error) */
  failed: Map<string, string>;

  /** Skipped facets (name -> reason) */
  skipped: Map<string, string>;
}

/**
 * Deploy multiple facets using provided ContractFactory instances.
 *
 * This operation takes a map of facet names to their ContractFactory instances
 * and deploys each facet. Follows the factory-first pattern established in
 * deployContract.ts.
 *
 * **Note**: Factories already have signers connected. The signer from each
 * factory will be used for deployment.
 *
 * @param facetFactories - Map of facet name to ContractFactory (with signer already connected)
 * @param options - Optional deployment configuration
 * @returns Deployment results
 *
 * @example
 * ```typescript
 * import { ethers } from 'ethers'
 * import {
 *   AccessControlFacet__factory,
 *   KycFacet__factory,
 *   PauseFacet__factory,
 * } from '@contract-types'
 *
 * const signer = provider.getSigner()
 *
 * // Create factories for facets to deploy (signer already connected)
 * const facetFactories = {
 *   'AccessControlFacet': new AccessControlFacet__factory(signer),
 *   'KycFacet': new KycFacet__factory(signer),
 *   'PauseFacet': new PauseFacet__factory(signer),
 * }
 *
 * // Deploy all facets with optional configuration
 * const result = await deployFacets(facetFactories, {
 *   confirmations: 2,
 *   overrides: { gasLimit: 5000000 }
 * })
 *
 * console.log(`Deployed ${result.deployed.size} facets`)
 * console.log(`Failed ${result.failed.size} facets`)
 * ```
 */
export async function deployFacets(
  facetFactories: Record<string, ContractFactory>,
  options: DeployFacetsOptions = {},
): Promise<DeployFacetsResult> {
  const {
    confirmations = 2, // Increased default for Hedera reliability
    overrides = {},
    enableRetry: rawEnableRetry = true,
    retryOptions = {},
    verifyDeployment = true,
    parallelFacetDeployment = false,
    concurrency = 20,
    onTransactionSent,
    onFacetDeployed,
  } = options;

  // Retries with NonceManager leave permanent nonce gaps on failure when txs
  // are in-flight in parallel — fail fast instead.
  const enableRetry = parallelFacetDeployment ? false : rawEnableRetry;

  section("Deploying Facets");

  const deployed = new Map<string, DeploymentResult>();
  const failed = new Map<string, string>();
  const skipped = new Map<string, string>();

  try {
    const facetNames = Object.keys(facetFactories);

    if (facetNames.length === 0) {
      warn("No facets to deploy");
      return {
        success: true,
        deployed,
        failed,
        skipped,
      };
    }

    info(`Total facets to deploy: ${facetNames.length}`);

    const deployOne = async (facetName: string): Promise<DeploymentResult> => {
      const factory = facetFactories[facetName];
      const result = await deployContract(factory, {
        confirmations,
        overrides,
        verifyDeployment,
        onTransactionSent: onTransactionSent ? (txHash) => onTransactionSent(facetName, txHash) : undefined,
      });
      if (!result.success) {
        throw new Error(result.error || "Deployment failed");
      }
      return result;
    };

    if (parallelFacetDeployment) {
      // Ensure all factories share one NonceManager so parallel deploys get
      // sequential nonces without racing getTransactionCount('pending').
      const firstRunner = facetFactories[facetNames[0]]?.runner;
      if (firstRunner && !(firstRunner instanceof NonceManager)) {
        const nonceMgr = new NonceManager(firstRunner as Signer);
        facetFactories = Object.fromEntries(
          Object.entries(facetFactories).map(([name, factory]) => [name, factory.connect(nonceMgr)]),
        );
      }

      info(`Parallel mode: concurrency=${concurrency}, retries disabled`);

      // Process in chunks so we cap in-flight txs without losing the
      // NonceManager's sequential-nonce guarantee within each chunk.
      for (let chunkStart = 0; chunkStart < facetNames.length; chunkStart += concurrency) {
        const chunk = facetNames.slice(chunkStart, chunkStart + concurrency);

        // Phase 1: submit transactions sequentially so the relay receives them
        // in strict nonce order. factory.deploy() resolves when the relay accepts
        // the tx (hash is available) — not when the block is mined — so this adds
        // only relay round-trip latency per tx (~ms), not block time.
        type PendingEntry =
          | { ok: true; name: string; contract: BaseContract }
          | { ok: false; name: string; error: string };

        const pending: PendingEntry[] = [];
        for (const name of chunk) {
          const factory = facetFactories[name];
          try {
            const deployOverrides: Overrides = { ...hederaGasOverrides(), ...overrides };
            const contract = await factory.deploy(deployOverrides);
            const txHash = contract.deploymentTransaction()?.hash;
            if (txHash) info(`Transaction sent: ${txHash}`);
            pending.push({ ok: true, name, contract });
          } catch (err) {
            const errMsg = extractRevertReason(err);
            warn(`Failed to send ${name}: ${errMsg}`);
            pending.push({ ok: false, name, error: errMsg });
          }
        }

        // Phase 2: wait for confirmations in parallel now that all txs are
        // in the relay's mempool in the correct nonce order.
        const settled = await Promise.allSettled(
          pending.map(async (entry): Promise<DeploymentResult> => {
            if (!entry.ok) throw new Error(entry.error);
            const { name, contract } = entry;
            const deployTimeout = DEFAULT_TRANSACTION_TIMEOUT * 3;
            await Promise.race([
              contract.waitForDeployment(),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error(`waitForDeployment timed out for ${name}`)), deployTimeout),
              ),
            ]);
            const address = await contract.getAddress();
            validateAddress(address, `deployed contract address for ${name}`);
            const tx = contract.deploymentTransaction();
            const receipt = tx ? await tx.wait(confirmations) : null;
            success(`${name} deployed at ${address}`);
            return {
              success: true,
              address,
              transactionHash: receipt?.hash,
              blockNumber: receipt?.blockNumber,
              gasUsed: receipt ? Number(receipt.gasUsed) : undefined,
            };
          }),
        );

        settled.forEach((outcome, i) => {
          const facetName = pending[i].name;
          const globalIndex = chunkStart + i;
          if (outcome.status === "fulfilled" && outcome.value.address) {
            deployed.set(facetName, outcome.value);
            info(`[${globalIndex + 1}/${facetNames.length}] ✓ ${facetName}`);
          } else {
            const reason =
              outcome.status === "rejected" ? String(outcome.reason?.message ?? outcome.reason) : "Unknown error";
            failed.set(facetName, reason);
            warn(`[${globalIndex + 1}/${facetNames.length}] ✗ ${facetName}: ${reason}`);
          }
        });

        // Testing hook: failure injection keyed on input position rather than
        // dynamic deployed.size so behavior is deterministic under parallelism.
        for (let i = 0; i < chunk.length; i++) {
          const facetName = chunk[i];
          const globalIndex = chunkStart + i;
          if (shouldFailAtFacet(globalIndex + 1, facetName)) {
            const testError = createTestFailureMessage("facet", globalIndex + 1, facetName);
            failed.set("__TEST_FAILURE__", testError);
            warn(testError);
            return { success: false, deployed, failed, skipped };
          }
        }
      }
    } else {
      // In sequential mode the signer may be a NonceManager (injected by createNetworkSigner).
      // After a 502 the NonceManager's internal delta is already incremented even though
      // Hedera never received the tx — the next attempt would use nonce N+1 while Hedera
      // still expects N.  Reset before each retry so the network nonce is re-fetched.
      const effectiveRetryOptions: RetryOptions = withNonceReset(
        Object.values(facetFactories)[0]?.runner,
        retryOptions,
      );

      // Deploy each facet using its factory
      for (let i = 0; i < facetNames.length; i++) {
        const facetName = facetNames[i];
        const progress = `[${i + 1}/${facetNames.length}]`;

        try {
          info(`${progress} Deploying ${facetName}...`);

          // Deploy with retry if enabled
          // retryTransaction will catch exceptions and retry up to maxRetries times
          const result = enableRetry
            ? await retryTransaction(() => deployOne(facetName), effectiveRetryOptions)
            : await deployOne(facetName);

          // If we get here, deployment succeeded (either first try or after retries)
          if (result.success && result.address) {
            deployed.set(facetName, result);
            info(`${progress} ✓ ${facetName} deployed successfully`);
            await onFacetDeployed?.(facetName, result);
          } else {
            // This should not happen now, but keep for safety
            failed.set(facetName, result.error || "Unknown error");
          }
        } catch (err) {
          // Deployment failed after all retry attempts
          const errorMessage = err instanceof Error ? err.message : String(err);
          failed.set(facetName, `Failed after retries: ${errorMessage}`);
        }

        // Testing hook: Allow intentional failure for checkpoint testing
        // Returns partial result instead of throwing to preserve deployed facets in checkpoint
        // Supports both:
        // - Legacy FAIL_AT_FACET=N (numeric)
        // - New CHECKPOINT_TEST_FAIL_AT=facet:N or facet:FacetName
        if (shouldFailAtFacet(deployed.size, facetName)) {
          const testError = createTestFailureMessage("facet", deployed.size, facetName);
          failed.set("__TEST_FAILURE__", testError);
          warn(testError);
          // Return partial result - workflow will save checkpoint before failing
          return {
            success: false,
            deployed,
            failed,
            skipped,
          };
        }
      }
    }

    const allSucceeded = failed.size === 0;

    if (allSucceeded) {
      success(`Successfully deployed ${deployed.size} facets${skipped.size > 0 ? ` (${skipped.size} skipped)` : ""}`);
    } else {
      warn(`Deployed ${deployed.size} facets, ${failed.size} failed`);
    }

    return {
      success: allSucceeded,
      deployed,
      failed,
      skipped,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(`Facet deployment failed: ${errorMessage}`);
  }
}

/**
 * Get deployment summary for facets.
 *
 * @param result - Deployment result
 * @returns Summary object
 */
export function getFacetDeploymentSummary(result: DeployFacetsResult): {
  deployed: string[];
  failed: string[];
  skipped: string[];
  addresses: Record<string, string>;
} {
  return {
    deployed: Array.from(result.deployed.keys()),
    failed: Array.from(result.failed.keys()),
    skipped: Array.from(result.skipped.keys()),
    addresses: Object.fromEntries(
      Array.from(result.deployed.entries())
        .filter(([_, r]) => r.address)
        .map(([name, r]) => [name, r.address!]),
    ),
  };
}
