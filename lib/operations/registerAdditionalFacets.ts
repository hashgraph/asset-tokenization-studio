// SPDX-License-Identifier: Apache-2.0

/**
 * Register additional facets in an existing BusinessLogicResolver (BLR), which
 * requires that ALL previously registered facets be re-registered together.
 *
 * Queries the existing facets from the chain, merges them with the new ones
 * and registers the complete list. New facets that fail validation are skipped
 * and reported in `failed`. Throws if the BLR is missing, a facet conflicts
 * with an existing registration (unless `allowOverwrite`), every new facet
 * fails validation, or a transaction fails.
 */

import { Overrides, Signer } from "ethers";
import { BusinessLogicResolver__factory } from "@contract-types";
import { DEFAULT_TRANSACTION_TIMEOUT, FACET_REGISTRATION_BATCH_SIZE } from "./constants";
import { retryTransaction, waitForTransaction, withNonceReset } from "./utils/transaction";
import { validateAddress } from "./utils/validation";
import type { FacetRegistrationData, RegisterFacetsResult } from "./registerFacets";

export interface RegisterAdditionalFacetsOptions {
  /** Address of BusinessLogicResolver */
  blrAddress: string;

  /** New facets to register with resolver keys */
  newFacets: FacetRegistrationData[];

  overrides?: Overrides;

  /** Whether to allow overwriting existing facets with different addresses */
  allowOverwrite?: boolean;
}

/** Page size for querying existing facet keys from the BLR. */
const QUERY_BATCH_SIZE = 100;

export async function registerAdditionalFacets(
  signer: Signer,
  options: RegisterAdditionalFacetsOptions,
): Promise<RegisterFacetsResult> {
  const { blrAddress, newFacets, overrides = {}, allowOverwrite = false } = options;

  validateAddress(blrAddress, "BusinessLogicResolver address");

  const registered: string[] = [];
  const failed: string[] = [];
  if (newFacets.length === 0) {
    return { blrAddress, registered, failed };
  }

  const blr = BusinessLogicResolver__factory.connect(blrAddress, signer);
  if ((await signer.provider!.getCode(blrAddress)) === "0x") {
    throw new Error(`No contract found at BLR address ${blrAddress}`);
  }

  // Query every existing facet (key → address), paginated.
  const existing = new Map<string, string>();
  const facetCount = Number(await blr.getBusinessLogicCount());
  for (let batch = 0; batch * QUERY_BATCH_SIZE < facetCount; batch++) {
    const keys = await blr.getBusinessLogicKeys(batch, QUERY_BATCH_SIZE);
    for (const key of keys) {
      existing.set(key, await blr.resolveLatestBusinessLogic(key));
    }
  }

  // Validate the new facets; invalid ones are skipped and reported in `failed`.
  const conflicts: string[] = [];
  const accepted = new Map<string, FacetRegistrationData>();
  for (const facet of newFacets) {
    try {
      validateAddress(facet.address, `${facet.name} address`);
      if ((await signer.provider!.getCode(facet.address)) === "0x") {
        failed.push(facet.name);
        continue;
      }
      const existingAddress = existing.get(facet.resolverKey);
      if (
        existingAddress !== undefined &&
        existingAddress.toLowerCase() !== facet.address.toLowerCase() &&
        !allowOverwrite
      ) {
        conflicts.push(facet.name);
        failed.push(facet.name);
        continue;
      }
      accepted.set(facet.resolverKey, facet);
    } catch {
      failed.push(facet.name);
    }
  }

  if (conflicts.length > 0) {
    throw new Error(
      `Cannot register: ${conflicts.length} facet(s) already exist with different addresses ` +
        `(${conflicts.join(", ")}). Use allowOverwrite=true to force update.`,
    );
  }
  if (accepted.size === 0) {
    throw new Error(`All new facets failed validation: ${failed.join(", ")}`);
  }

  // Merge: every existing facet re-registered as-is, new facets added/updated.
  const merged = [
    ...[...existing.entries()]
      .filter(([key]) => !accepted.has(key))
      .map(([key, address]) => ({ name: "", resolverKey: key, address })),
    ...accepted.values(),
  ];

  // After a 502 the NonceManager's internal delta is already incremented even
  // though Hedera never received the tx — reset before each retry so the next
  // attempt re-fetches the confirmed nonce from the network.
  const effectiveRetryOptions = withNonceReset(signer);

  for (let i = 0; i < merged.length; i += FACET_REGISTRATION_BATCH_SIZE) {
    const batch = merged.slice(i, i + FACET_REGISTRATION_BATCH_SIZE);
    // Only the send step is retried — once a tx hash is returned the BLR
    // version counter is committed; re-submitting would register the same
    // facets twice.
    const tx = await retryTransaction(
      () =>
        blr.registerBusinessLogics(
          batch.map((f) => ({ businessLogicKey: f.resolverKey, businessLogicAddress: f.address })),
          overrides,
        ),
      effectiveRetryOptions,
    );
    await waitForTransaction(tx, DEFAULT_TRANSACTION_TIMEOUT);
    registered.push(...batch.map((f) => f.name).filter(Boolean));
  }

  return { blrAddress, registered, failed };
}
