// SPDX-License-Identifier: Apache-2.0

/**
 * Register additional facets in existing BLR.
 *
 * This operation enables downstream projects to register custom facets
 * in an existing BusinessLogicResolver by:
 * 1. Querying all currently registered facets
 * 2. Merging them with new facets
 * 3. Calling registerBusinessLogics() with the complete list
 *
 * Works within BLR's constraint that ALL facets must be re-registered.
 *
 * @module infrastructure/operations/registerAdditionalFacets
 */

import { Overrides, Signer } from "ethers";
import {
  debug,
  error as logError,
  extractRevertReason,
  formatGasUsage,
  info,
  section,
  success,
  validateAddress,
  waitForTransaction,
  warn,
  DEFAULT_TRANSACTION_TIMEOUT,
} from "@scripts/infrastructure";
import { BusinessLogicResolver__factory } from "@contract-types";
import type { RegisterFacetsResult, FacetRegistrationData } from "./registerFacets";

/**
 * Options for registering additional facets.
 */
export interface RegisterAdditionalFacetsOptions {
  /** Address of BusinessLogicResolver */
  blrAddress: string;

  /** New facets to register with resolver keys */
  newFacets: FacetRegistrationData[];

  /** Network */
  network?: string;

  /** Transaction overrides */
  overrides?: Overrides;

  /** Whether to allow overwriting existing facets with different addresses */
  allowOverwrite?: boolean;

  /** Maximum number of existing facets to query (default: 1000) */
  maxExistingFacets?: number;
}

/**
 * Internal representation of a facet.
 */
interface FacetEntry {
  name: string;
  key: string;
  address: string;
}

/**
 * Register additional facets in an existing BLR.
 *
 * This operation automatically queries existing facets, merges them with
 * new facets, and registers the complete list. This works around BLR's
 * constraint that ALL previously registered facets must be re-registered.
 *
 * **Note:** Caller must provide resolver keys for new facets.
 *
 * @param signer - Ethers.js signer for transactions
 * @param options - Registration options (includes resolver keys)
 * @returns Registration result
 * @throws Error if registration fails
 *
 * @example
 * ```typescript
 * import { registerAdditionalFacets } from '@scripts/infrastructure'
 * import { customRegistry } from './myRegistry'
 *
 * // Caller looks up resolver keys from registry
 * const newFacetsWithKeys = [
 *   {
 *     name: 'MyCustomComplianceFacet',
 *     address: '0xabc...',
 *     resolverKey: customRegistry.getFacetDefinition('MyCustomComplianceFacet').resolverKey.value
 *   },
 *   {
 *     name: 'MyRewardsFacet',
 *     address: '0xdef...',
 *     resolverKey: customRegistry.getFacetDefinition('MyRewardsFacet').resolverKey.value
 *   }
 * ]
 *
 * // Register additional facets with existing ATS BLR
 * const result = await registerAdditionalFacets(signer, {
 *   blrAddress: '0x123...',
 *   newFacets: newFacetsWithKeys
 * })
 *
 * if (result.success) {
 *   console.log(`Total facets registered: ${result.registered.length}`)
 * }
 * ```
 */
export async function registerAdditionalFacets(
  signer: Signer,
  options: RegisterAdditionalFacetsOptions,
): Promise<RegisterFacetsResult> {
  const {
    blrAddress,
    newFacets,
    network: _network,
    overrides = {},
    allowOverwrite = false,
    maxExistingFacets = 1000,
  } = options;

  const registered: string[] = [];
  const failed: string[] = [];

  try {
    section(`Registering Additional Facets in BLR`);

    // Validate BLR address
    validateAddress(blrAddress, "BusinessLogicResolver address");

    info(`BLR Address: ${blrAddress}`);
    info(`New facets to register: ${newFacets.length}`);

    // Validate that we have at least one new facet
    if (newFacets.length === 0) {
      warn("No new facets to register");
      return {
        success: true,
        blrAddress,
        registered: [],
        failed: [],
      };
    }

    // Get BLR contract instance using TypeChain
    const blr = BusinessLogicResolver__factory.connect(blrAddress, signer);

    // Verify BLR contract exists
    const blrCode = await signer.provider!.getCode(blrAddress);
    if (blrCode === "0x") {
      throw new Error(`No contract found at BLR address ${blrAddress}`);
    }

    // ========================================
    // STEP 1: Query existing facets from BLR
    // ========================================
    info("\n📋 Querying existing facets from BLR...");

    const existingFacetsMap = new Map<string, FacetEntry>();

    // Get total count of registered facets
    const facetCountBN = await blr.getBusinessLogicCount();
    const facetCount = facetCountBN.toNumber();
    info(`   Found ${facetCount} existing facets in BLR`);

    if (facetCount > maxExistingFacets) {
      warn(`   Warning: BLR has ${facetCount} facets, but maxExistingFacets is ${maxExistingFacets}`);
      warn(`   Only first ${maxExistingFacets} facets will be queried`);
    }

    // Query facet keys in batches (pagination)
    const batchSize = 100;
    const totalToQuery = Math.min(facetCount, maxExistingFacets);
    const numBatches = Math.ceil(totalToQuery / batchSize);

    for (let batch = 0; batch < numBatches; batch++) {
      const facetKeys = await blr.getBusinessLogicKeys(batch, batchSize);

      // Resolve address for each facet key
      for (const facetKey of facetKeys) {
        try {
          const facetAddress = await blr.resolveLatestBusinessLogic(facetKey);

          // Store with key as identifier
          existingFacetsMap.set(facetKey, {
            name: "", // Name unknown (only have key)
            key: facetKey,
            address: facetAddress,
          });
        } catch (err) {
          debug(`   Failed to resolve facet ${facetKey}: ${err}`);
        }
      }
    }

    info(`   Successfully queried ${existingFacetsMap.size} existing facets`);

    // ========================================
    // STEP 2: Process new facets
    // ========================================
    info("\n📦 Processing new facets...");

    const newFacetsMap = new Map<string, FacetEntry>();
    const conflicts: string[] = [];

    for (const facet of newFacets) {
      try {
        validateAddress(facet.address, `${facet.name} address`);

        // Verify facet contract exists
        const facetCode = await signer.provider!.getCode(facet.address);
        if (facetCode === "0x") {
          warn(`   ✗ ${facet.name}: No contract at address ${facet.address}`);
          failed.push(facet.name);
          continue;
        }

        // Use provided resolver key
        const facetKey = facet.resolverKey;

        // Check for conflicts with existing facets
        if (existingFacetsMap.has(facetKey)) {
          const existing = existingFacetsMap.get(facetKey)!;
          if (existing.address.toLowerCase() !== facet.address.toLowerCase()) {
            if (!allowOverwrite) {
              conflicts.push(facet.name);
              logError(
                `   ✗ ${facet.name}: Already registered at ${existing.address}, ` +
                  `cannot overwrite with ${facet.address}`,
              );
              failed.push(facet.name);
              continue;
            } else {
              warn(`   ⚠️  ${facet.name}: Overwriting ${existing.address} → ${facet.address}`);
            }
          } else {
            info(`   ℹ️  ${facet.name}: Already registered at same address, updating`);
          }
        }

        newFacetsMap.set(facetKey, {
          name: facet.name,
          key: facetKey,
          address: facet.address,
        });

        info(`   ✓ ${facet.name}: ${facet.address}`);
      } catch (err) {
        const errorMessage = extractRevertReason(err);
        warn(`   Validation failed for ${facet.name}: ${errorMessage}`);
        failed.push(facet.name);
      }
    }

    if (conflicts.length > 0 && !allowOverwrite) {
      throw new Error(
        `Cannot register: ${conflicts.length} facet(s) already exist with different addresses. ` +
          `Use allowOverwrite=true to force update.`,
      );
    }

    // Check if we have any valid new facets to register
    if (newFacetsMap.size === 0) {
      if (failed.length > 0) {
        throw new Error("All new facets failed validation");
      } else {
        success("No new facets to register (all already registered)");
        return {
          success: true,
          blrAddress,
          registered: [],
          failed: [],
        };
      }
    }

    // ========================================
    // STEP 3: Merge existing + new facets
    // ========================================
    info("\n🔀 Merging existing and new facets...");

    // Start with all existing facets
    const mergedFacetsMap = new Map(existingFacetsMap);

    // Add/update with new facets
    for (const [key, facet] of newFacetsMap) {
      mergedFacetsMap.set(key, facet);
    }

    const totalFacets = mergedFacetsMap.size;
    const existingCount = existingFacetsMap.size;
    const newCount = newFacetsMap.size;

    info(`   Existing facets: ${existingCount}`);
    info(`   New facets: ${newCount}`);
    info(`   Total facets to register: ${totalFacets}`);

    // ========================================
    // STEP 4: Register all facets in BLR
    // ========================================
    info("\n📝 Registering all facets in BLR...");

    // Prepare BusinessLogicRegistryData array
    const businessLogics = Array.from(mergedFacetsMap.values()).map((facet) => ({
      businessLogicKey: facet.key,
      businessLogicAddress: facet.address,
    }));

    const tx = await blr.registerBusinessLogics(businessLogics, overrides);

    info(`   Registration transaction sent: ${tx.hash}`);

    const receipt = await waitForTransaction(tx, 1, DEFAULT_TRANSACTION_TIMEOUT);

    const gasUsed = formatGasUsage(receipt, tx.gasLimit);
    debug(`   ${gasUsed}`);

    // Track registered facets
    for (const facet of mergedFacetsMap.values()) {
      if (facet.name) {
        registered.push(facet.name);
      }
    }

    // ========================================
    // Success summary
    // ========================================
    success(`\n✅ Successfully registered ${totalFacets} facets`);
    info(`   • Existing facets re-registered: ${existingCount}`);
    info(`   • New facets added: ${newCount}`);

    if (newCount > 0) {
      info("\n   New facets:");
      for (const facet of newFacetsMap.values()) {
        info(`     • ${facet.name}`);
      }
    }

    if (failed.length > 0) {
      warn(`\n   ⚠️  Failed to register ${failed.length} facets:`);
      for (const facetName of failed) {
        warn(`     • ${facetName}`);
      }
    }

    return {
      success: true,
      blrAddress,
      registered,
      failed,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toNumber(),
    };
  } catch (err) {
    const errorMessage = extractRevertReason(err);
    logError(`\n❌ Additional facet registration failed: ${errorMessage}`);

    return {
      success: false,
      blrAddress,
      registered,
      failed: newFacets.map((f) => f.name).filter((name) => !registered.includes(name)),
      error: errorMessage,
    };
  }
}
