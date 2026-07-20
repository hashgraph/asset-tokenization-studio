// SPDX-License-Identifier: Apache-2.0

/**
 * Create configurations in BusinessLogicResolver (BLR) that define which
 * facets compose each token type. Generic over configuration ID and facet
 * set; domain-specific configurations (equity, bond, ...) call into this file.
 *
 * Imports come from leaf modules (constants, utils) rather than the barrel:
 * the barrel re-exports files that pull in the full typechain graph, which
 * costs a measured 4x+ slowdown per worker in parallel tests.
 */

import { BusinessLogicResolver } from "@contract-types";
import { DEFAULT_BATCH_SIZE, DEFAULT_TRANSACTION_TIMEOUT } from "./constants";
import {
  isInstantMiningNetwork,
  gasLimitOverride,
  retryTransaction,
  waitForTransaction,
  withNonceReset,
} from "./utils/transaction";
import { validateBytes32 } from "./utils/validation";
import type { ConfigurationData, FacetConfigurationData } from "./types";

export interface CreateBatchConfigurationOptions {
  configurationId: string;

  facets: FacetConfigurationData[];

  /**
   * Optional map of facet name -> explicit BLR version to pin in the
   * configuration. When provided, every facet in `facets` must have an entry,
   * and these versions are used instead of `getLatestVersions`. This is the
   * escape hatch for test fixtures (notably InitializeMock) that need a
   * configuration referencing earlier facet versions rather than the latest.
   */
  facetVersions?: Record<string, number>;
}

/**
 * Create a batch configuration in the BLR and return its resulting data.
 *
 * Reads the latest version of every facet key from the chain (unless pinned
 * via `facetVersions`), cancels any uncommitted draft left by a crashed run,
 * and sends the facet list in batches. Throws on any failure.
 */
export async function createBatchConfiguration(
  blrContract: BusinessLogicResolver,
  options: CreateBatchConfigurationOptions,
): Promise<ConfigurationData> {
  const { configurationId, facets, facetVersions } = options;

  if (facets.length === 0) {
    throw new Error("At least one facet is required for configuration");
  }
  validateBytes32(configurationId, "configuration ID");

  const facetKeys = facets.map((facet) => ({
    facetName: facet.facetName,
    key: facet.resolverKey,
    address: facet.address,
  }));
  const facetIdList = facetKeys.map((f) => f.key);

  let versions: number[];
  if (facetVersions) {
    // Caller pinned explicit per-facet versions — every facet in the
    // configuration must have a corresponding entry. We do not fall back to
    // the latest version, otherwise a typo in the map would silently end up
    // pinning whichever version happens to be latest in the BLR.
    versions = facetKeys.map((f) => {
      const pinned = facetVersions[f.facetName];
      if (pinned === undefined) {
        throw new Error(
          `facetVersions provided to createBatchConfiguration but missing entry for facet: ${f.facetName}`,
        );
      }
      return pinned;
    });
  } else {
    versions = (await blrContract.getLatestVersions(facetIdList)).map((v) => Number(v));
  }

  // Guard: version=0 means the facet was never registered in the BLR.
  // Passing version=0 to createBatchConfiguration causes an arithmetic
  // underflow panic in _resolveBusinessLogicByVersion (_version - 1 on
  // uint256(0)), which surfaces only as a silent status=0 revert.
  const unregistered = facetKeys.filter((_, i) => versions[i] === 0);
  if (unregistered.length > 0) {
    throw new Error(
      `Cannot create configuration: ${unregistered.length} facet(s) have version 0 ` +
        `(not registered in BLR): ${unregistered.map((f) => f.facetName).join(", ")}`,
    );
  }

  // Recover from a partial batch left by a previous crashed run.
  // A non-zero batchVersion is detectable by querying version currentVersion+1:
  // _resolveVersion returns explicit versions as-is, so if any facets were
  // written to that slot the array will be non-empty.
  const currentVersion = Number(await blrContract.getLatestVersionByConfiguration(configurationId));
  const ongoingBatchFacets = await blrContract.getFacetIdsByConfigurationIdAndVersion(
    configurationId,
    currentVersion + 1,
    0,
    1,
  );
  if (ongoingBatchFacets.length > 0) {
    const cancelTx = await blrContract.cancelBatchConfiguration(configurationId, gasLimitOverride());
    await cancelTx.wait(1);
  }

  await sendBatches(blrContract, configurationId, facetIdList, versions);

  const version = Number(await blrContract.getLatestVersionByConfiguration(configurationId));
  return { configurationId, version, facetKeys };
}

/** Send the facet list in batches; the last batch of the configuration is marked final. */
async function sendBatches(
  blrContract: BusinessLogicResolver,
  configId: string,
  facetIdList: string[],
  facetVersionList: number[],
): Promise<void> {
  let networkName = "unknown";
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const hre = require("hardhat");
    networkName = hre?.network?.name || "unknown";
  } catch {
    // Not running inside Hardhat
  }

  // On instant-mining networks, use larger batches but cap at 20 to avoid gas
  // limit issues; on real networks, use the default batch size.
  const MAX_INSTANT_BATCH_SIZE = 20;
  const chunkSize = isInstantMiningNetwork(networkName)
    ? Math.min(facetIdList.length, MAX_INSTANT_BATCH_SIZE)
    : DEFAULT_BATCH_SIZE;

  const retryOpts = withNonceReset(blrContract.runner);
  const baseVersion = Number(await blrContract.getLatestVersionByConfiguration(configId));

  for (let i = 0; i < facetIdList.length; i += chunkSize) {
    // Delay between batches to prevent RPC node overload (skip first batch and instant networks)
    if (i > 0 && !isInstantMiningNetwork(networkName)) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const batch = facetIdList.slice(i, i + chunkSize).map((id, j) => ({ id, version: facetVersionList[i + j] }));
    const isFinalBatch = i + chunkSize >= facetIdList.length;

    try {
      await retryTransaction(async () => {
        // A previous attempt of this batch may have been mined even though its
        // wait failed client-side (timeout, RPC glitch); re-sending it would
        // revert with DuplicatedFacetInConfiguration. Skip if the chain already
        // contains this batch: the config committed (final batch) or the draft
        // at baseVersion+1 already grew past it. Batches are atomic, so the
        // draft length is always a batch boundary.
        if (Number(await blrContract.getLatestVersionByConfiguration(configId)) > baseVersion) return;
        const draftLength = Number(
          await blrContract.getFacetsLengthByConfigurationIdAndVersion(configId, baseVersion + 1),
        );
        if (draftLength >= i + batch.length) return;

        const tx = await blrContract.createBatchConfiguration(configId, batch, isFinalBatch, "0x", {
          ...gasLimitOverride(),
        });
        await waitForTransaction(tx, DEFAULT_TRANSACTION_TIMEOUT);
      }, retryOpts);
    } catch (err) {
      // Re-simulate with staticCall to surface the decoded revert reason (custom
      // errors, panic codes, etc.) that status=0 receipts don't carry.
      try {
        await blrContract.createBatchConfiguration.staticCall(configId, batch, isFinalBatch, "0x");
      } catch (simErr) {
        throw new Error(simErr instanceof Error ? simErr.message : String(simErr));
      }
      throw err;
    }
  }
}
