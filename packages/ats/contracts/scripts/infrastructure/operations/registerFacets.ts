// SPDX-License-Identifier: Apache-2.0

/**
 * Register facets operation.
 *
 * Atomic operation for registering facets in BusinessLogicResolver (BLR)
 * for diamond pattern upgrades.
 *
 * @module core/operations/registerFacets
 */

import { Overrides } from "ethers";
import { BusinessLogicResolver } from "@contract-types";
import {
  DEFAULT_TRANSACTION_TIMEOUT,
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
  GAS_LIMIT,
} from "@scripts/infrastructure";
import { FACET_REGISTRATION_BATCH_SIZE } from "../../domain/constants";

/**
 * Facet data for registration in BLR.
 */
export interface FacetRegistrationData {
  /** Facet name (for logging/error messages) */
  name: string;

  /** Deployed facet address */
  address: string;

  /** Resolver key (bytes32) for the facet */
  resolverKey: string;
}

/**
 * Options for registering facets in BLR.
 */
export interface RegisterFacetsOptions {
  /** Facets to register with their resolver keys */
  facets: FacetRegistrationData[];

  /** Transaction overrides */
  overrides?: Overrides;

  /** Whether to verify facets exist before registration */
  verify?: boolean;
}

/**
 * Result of registering facets.
 */
export interface RegisterFacetsResult {
  /** Whether registration succeeded */
  success: boolean;

  /** BLR address */
  blrAddress: string;

  /** Successfully registered facets */
  registered: string[];

  /** Failed facets */
  failed: string[];

  /** Transaction hash (only if success=true) */
  transactionHashes?: string[];

  /** Block number (only if success=true) */
  blockNumbers?: number[];

  /** Gas used (only if success=true) */
  transactionGas?: number[];

  /** Error message (only if success=false) */
  error?: string;
}

/**
 * Register facets in BusinessLogicResolver.
 *
 * This operation registers deployed facet contracts with the BLR,
 * making them available for use in diamond pattern upgrades.
 *
 * **Note:** Caller is responsible for looking up resolver keys from the registry
 * and passing them to this function. This function does not depend on the registry.
 *
 * @param blr - Typed BusinessLogicResolver contract instance
 * @param options - Registration options (includes resolver keys)
 * @returns Registration result
 * @throws Error if registration fails
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@contract-types'
 * import { atsRegistry } from '@scripts/domain'
 *
 * const blr = BusinessLogicResolver__factory.connect('0x123...', signer)
 *
 * // Caller looks up resolver keys from registry
 * const facetsToRegister = [
 *   {
 *     name: 'AccessControlFacet',
 *     address: '0xabc...',
 *     resolverKey: atsRegistry.getFacetDefinition('AccessControlFacet').resolverKey.value
 *   },
 *   {
 *     name: 'KycFacet',
 *     address: '0xdef...',
 *     resolverKey: atsRegistry.getFacetDefinition('KycFacet').resolverKey.value
 *   }
 * ]
 *
 * const result = await registerFacets(blr, {
 *   facets: facetsToRegister
 * })
 * console.log(`Registered ${result.registered.length} facets`)
 * ```
 */
export async function registerFacets(
  blr: BusinessLogicResolver,
  options: RegisterFacetsOptions,
): Promise<RegisterFacetsResult> {
  const { facets, overrides = {}, verify = true } = options;

  // Get BLR address from contract instance
  const blrAddress = blr.address;

  const registered: string[] = [];
  const failed: string[] = [];

  try {
    section(`Registering Facets in BLR`);

    // Get provider from BLR contract
    if (!blr.provider) {
      throw new Error(
        "BusinessLogicResolver must be connected to a signer with a provider. " +
          "Use BusinessLogicResolver__factory.connect(address, signer) where signer has a provider.",
      );
    }

    const provider = blr.provider;

    // Validate BLR address
    validateAddress(blrAddress, "BusinessLogicResolver address");

    if (verify) {
      const blrCode = await provider.getCode(blrAddress);
      if (blrCode === "0x") {
        throw new Error(`No contract found at BLR address ${blrAddress}`);
      }
    }

    info(`BLR Address: ${blrAddress}`);
    info(`Facets to register: ${facets.length}`);

    // Handle empty facet registration
    if (facets.length === 0) {
      success("No facets to register");
      return {
        success: true,
        blrAddress,
        registered: [],
        failed: [],
      };
    }

    // Validate all facets before registering
    for (const facet of facets) {
      try {
        validateAddress(facet.address, `${facet.name} address`);

        if (verify) {
          const facetCode = await provider.getCode(facet.address);
          if (facetCode === "0x") {
            warn(`No contract found at ${facet.name} address ${facet.address}`);
            failed.push(facet.name);
            continue;
          }
        }

        debug(`${facet.name}: ${facet.address}`);
      } catch (err) {
        const errorMessage = extractRevertReason(err);
        warn(`Validation failed for ${facet.name}: ${errorMessage}`);
        failed.push(facet.name);
      }
    }

    // Stop if all facets failed validation
    if (failed.length === facets.length) {
      throw new Error("All facets failed validation");
    }

    // Filter out failed facets
    const validFacets = facets.filter((facet) => !failed.includes(facet.name));

    // Register facets
    info(`Registering ${validFacets.length} facets...`);

    // Prepare BusinessLogicRegistryData array using provided resolver keys
    const businessLogics = validFacets.map((facet) => ({
      businessLogicKey: facet.resolverKey,
      businessLogicAddress: facet.address,
      businessLogicName: facet.name,
    }));

    const iterations = businessLogics.length / FACET_REGISTRATION_BATCH_SIZE;
    const transactionHashes = [];
    const blockNumbers = [];
    const transactionGas = [];

    for (let i = 0; i <= iterations; i++) {
      const businessLogicsSlice = businessLogics.slice(
        i * FACET_REGISTRATION_BATCH_SIZE,
        (i + 1) * FACET_REGISTRATION_BATCH_SIZE,
      );
      const tx = await blr.registerBusinessLogics(businessLogicsSlice, { gasLimit: GAS_LIMIT.high, ...overrides });

      info(`Registration transaction sent: ${tx.hash}`);

      const receipt = await waitForTransaction(tx, 1, DEFAULT_TRANSACTION_TIMEOUT);
      transactionHashes.push(receipt.transactionHash);
      blockNumbers.push(receipt.blockNumber);
      transactionGas.push(receipt.gasUsed.toNumber());

      const gasUsed = formatGasUsage(receipt, tx.gasLimit);
      debug(gasUsed);

      const registeredSlice = businessLogicsSlice.map((f) => f.businessLogicName);

      registered.push(...registeredSlice);

      success(`Successfully registered ${registeredSlice.length} facets`);
      for (const facetName of registeredSlice) {
        info(`  ✓ ${facetName}`);
      }
    }

    if (failed.length > 0) {
      warn(`Failed to register ${failed.length} facets:`);
      for (const facetName of failed) {
        warn(`  ✗ ${facetName}`);
      }
    }

    return {
      success: true,
      blrAddress,
      registered,
      failed,
      transactionHashes,
      blockNumbers,
      transactionGas,
    };
  } catch (err) {
    const errorMessage = extractRevertReason(err);
    logError(`Facet registration failed: ${errorMessage}`);

    return {
      success: false,
      blrAddress,
      registered,
      failed: facets.map((f) => f.name).filter((name) => !registered.includes(name)),
      error: errorMessage,
    };
  }
}
