// SPDX-License-Identifier: Apache-2.0

/**
 * Register facets in a BusinessLogicResolver.
 *
 * Facets that fail validation (bad address, no bytecode on-chain) are skipped
 * and reported in `failed`; the rest are registered in batches. Throws if the
 * BLR is missing, every facet fails validation, or a transaction fails.
 */

import { Overrides, Provider } from "ethers";
import { BusinessLogicResolver } from "@contract-types";
import { DEFAULT_TRANSACTION_TIMEOUT, FACET_REGISTRATION_BATCH_SIZE } from "./constants";
import {
  gasLimitOverride,
  isNetworkError,
  retryTransaction,
  waitForTransaction,
  withNonceReset,
} from "./utils/transaction";
import { validateAddress } from "./utils/validation";

export interface FacetRegistrationData {
  /** Facet name (for error messages and the `registered`/`failed` report) */
  name: string;

  /** Deployed facet address */
  address: string;

  /** Resolver key (bytes32) for the facet */
  resolverKey: string;
}

export interface RegisterFacetsOptions {
  facets: FacetRegistrationData[];

  overrides?: Overrides;
}

export interface RegisterFacetsResult {
  blrAddress: string;

  /** Facets registered on-chain */
  registered: string[];

  /** Facets skipped because their address failed validation */
  failed: string[];
}

export async function registerFacets(
  blr: BusinessLogicResolver,
  options: RegisterFacetsOptions,
): Promise<RegisterFacetsResult> {
  const { facets, overrides = {} } = options;

  const provider = blr.runner?.provider as Provider | undefined;
  if (!provider) {
    throw new Error(
      "BusinessLogicResolver must be connected to a signer with a provider. " +
        "Use BusinessLogicResolver__factory.connect(address, signer) where signer has a provider.",
    );
  }

  const blrAddress = await blr.getAddress();
  if ((await provider.getCode(blrAddress)) === "0x") {
    throw new Error(`No contract found at BLR address ${blrAddress}`);
  }

  const registered: string[] = [];
  const failed: string[] = [];
  if (facets.length === 0) {
    return { blrAddress, registered, failed };
  }

  // Validate every facet up-front; invalid ones are skipped and reported in
  // `failed`. A network error during the bytecode check does NOT exclude the
  // facet — it was typically just deployed, so it exists on-chain.
  const valid: FacetRegistrationData[] = [];
  for (const facet of facets) {
    try {
      validateAddress(facet.address, `${facet.name} address`);
      const code = await retryTransaction(() => provider.getCode(facet.address));
      if (code === "0x") {
        failed.push(facet.name);
        continue;
      }
      valid.push(facet);
    } catch (err) {
      if (isNetworkError(err)) {
        valid.push(facet);
        continue;
      }
      failed.push(facet.name);
    }
  }
  if (valid.length === 0) {
    throw new Error("All facets failed validation");
  }

  // After a 502 the NonceManager's internal delta is already incremented even
  // though Hedera never received the tx — reset before each retry so the next
  // attempt re-fetches the confirmed nonce from the network.
  const effectiveRetryOptions = withNonceReset(blr.runner);

  for (let i = 0; i < valid.length; i += FACET_REGISTRATION_BATCH_SIZE) {
    const batch = valid.slice(i, i + FACET_REGISTRATION_BATCH_SIZE);
    // Only the send step is retried: once Hedera accepts the tx, the BLR
    // version counter is committed on success — re-submitting would register
    // the same facets a second time and bump every version again.
    const tx = await retryTransaction(
      () =>
        blr.registerBusinessLogics(
          batch.map((f) => ({ businessLogicKey: f.resolverKey, businessLogicAddress: f.address })),
          { ...gasLimitOverride(), ...overrides },
        ),
      effectiveRetryOptions,
    );
    await waitForTransaction(tx, DEFAULT_TRANSACTION_TIMEOUT);
    registered.push(...batch.map((f) => f.name));
  }

  return { blrAddress, registered, failed };
}
