// SPDX-License-Identifier: Apache-2.0

/**
 * Test-only full-asset deployment helpers.
 *
 * Provides a test-only function that deploys the complete ATS infrastructure
 * via `deploySystemWithNewBlr` and then registers the ASSET_MOCK_CONFIG_ID
 * on top, so shared-fixture tests can deploy a single diamond exposing every
 * IAsset facet function.
 *
 * The production `deploySystemWithNewBlr` is kept clean of any assetMock
 * references — this module is the sole place where the mock configuration is
 * created outside the per-test inline path.
 *
 * @see openspec/changes/test-optimization-shared-fixtures
 */

import { Signer } from "ethers";
import { ethers } from "hardhat";
import {
  deploySystemWithNewBlr,
  configureLogger,
  LogLevel,
  DEFAULT_BATCH_SIZE,
  type DeploySystemWithNewBlrOptions,
  type DeploymentOutputType,
  type ConfigurationMetadata,
  type FacetMetadata,
} from "../../../scripts";
import { createAssetMockConfiguration } from "./assetMockConfiguration";
import { ALL_ASSET_FACETS, buildFacetList } from "@scripts/domain";
import { BusinessLogicResolver__factory, IMockFactory__factory, ProxyAdmin__factory } from "@contract-types";

/**
 * Augmented deployment type that includes the AssetMock configuration.
 * Runtime extension of DeploymentOutputType — the assetMock fields are only
 * present when created by deploySystemWithNewBlrFullAsset.
 */
type DeploymentWithAssetMock = DeploymentOutputType & {
  configurations: DeploymentOutputType["configurations"] & {
    assetMock: ConfigurationMetadata;
  };
  helpers: DeploymentOutputType["helpers"] & {
    getAssetMockFacets(): FacetMetadata[];
  };
};

// ============================================================================
// deploySystemWithNewBlrFullAsset
// ============================================================================

/**
 * Deploy complete ATS infrastructure *with* the AssetMock configuration.
 *
 * 1. Calls `deploySystemWithNewBlr` (no assetMock — 8 production configs
 *    + InitializeMock in test mode = 9 configs).
 * 2. Registers `ASSET_MOCK_CONFIG_ID` in the BLR (full IAsset facet union).
 * 3. Augments the deployment output with assetMock config metadata.
 *
 * Test-only. Not exported from the production scripts barrel.
 *
 * @param signer  Ethers signer for deploying contracts.
 * @param network Network name (e.g. "hardhat").
 * @param options Optional deployment options (passed through to deploySystemWithNewBlr).
 * @returns Deployment output with assetMock added to configurations and helpers.
 */
export async function deploySystemWithNewBlrFullAsset(
  signer: Signer,
  network: string,
  options: DeploySystemWithNewBlrOptions = {},
): Promise<DeploymentWithAssetMock> {
  // 1. Deploy base infrastructure (no assetMock). `useTimeTravel` defaults to
  // `true` so the Factory configuration is built from `MockFactoryFacet`
  // (which exposes `deployAssetMock`) instead of the production `FactoryFacet`.
  const deployment = await deploySystemWithNewBlr(signer, network, { useTimeTravel: true, ...options });

  // 2. Build facetAddresses map from deployment facet list
  const facetAddresses: Record<string, string> = {};
  for (const facet of deployment.facets) {
    facetAddresses[facet.name] = facet.address;
  }

  // 3. Resolve the full IAsset facet union from the compile-checked ALL_ASSET_FACETS
  //    constant, then run it through buildFacetList — the same helper every production
  //    config uses — which (in test mode) appends TimeTravelFacet, MockDiamondCutHelpers,
  //    and the test-only EvmAccessorsFacet. No hardcoded facet names live here any more.
  const allFacetNames = buildFacetList(ALL_ASSET_FACETS, true);

  // 4. Connect to BLR and create assetMock configuration
  const blrContract = BusinessLogicResolver__factory.connect(deployment.infrastructure.blr.proxy, signer);
  const assetMockConfig = await createAssetMockConfiguration(blrContract, allFacetNames, facetAddresses);

  if (!assetMockConfig.success) {
    throw new Error(`AssetMock config creation failed: ${assetMockConfig.error} - ${assetMockConfig.message}`);
  }

  // 5. Augment deployment with assetMock info
  return {
    ...deployment,
    configurations: {
      ...deployment.configurations,
      assetMock: {
        configId: assetMockConfig.data.configurationId,
        version: assetMockConfig.data.version,
        facetCount: assetMockConfig.data.facetKeys.length,
        facets: assetMockConfig.data.facetKeys,
      },
    },
    helpers: {
      ...deployment.helpers,
      getAssetMockFacets() {
        const assetMockKeys = new Set(assetMockConfig.data.facetKeys.map((f) => f.key));
        const filtered = deployment.facets.filter((f) => assetMockKeys.has(f.key));
        return Array.from(new Map(filtered.map((f) => [f.key, f])).values());
      },
    },
    summary: {
      ...deployment.summary,
      totalConfigurations: deployment.summary.totalConfigurations + 1,
    },
  };
}

// ============================================================================
// loadFixture-compatible fixture — full ATS infrastructure + AssetMock
// ============================================================================

/**
 * Fixture: deploy full ATS infrastructure *with* AssetMock configuration.
 *
 * Matches the return shape of `deployAtsInfrastructureFixture` from the base
 * infrastructure module, but uses `deploySystemWithNewBlrFullAsset` so the
 * deployment output includes the assetMock config.
 *
 * Use this in tests that need to interact with assets deployed via
 * `ASSET_MOCK_CONFIG_ID` — e.g. `assetMockCtx.test.ts` and
 * `assetMockConfiguration.test.ts`.
 *
 * Zero-param named function required for `loadFixture` caching.
 */
export async function deployAtsInfrastructureFullAssetFixture(
  partialBatchDeploy = false,
  batchSize = DEFAULT_BATCH_SIZE,
) {
  configureLogger({ level: LogLevel.SILENT });

  const signers = await ethers.getSigners();
  const [deployer, user1, user2, user3, user4, user5] = signers;
  const unknownSigner = signers.at(-1)!;

  const deployment = await deploySystemWithNewBlrFullAsset(deployer, "hardhat", {
    saveOutput: false,
    partialBatchDeploy,
    batchSize,
    ignoreCheckpoint: true,
  });

  const factory = IMockFactory__factory.connect(deployment.infrastructure.factory.proxy, deployer);

  const blr = BusinessLogicResolver__factory.connect(deployment.infrastructure.blr.proxy, deployer);

  const proxyAdmin = ProxyAdmin__factory.connect(deployment.infrastructure.proxyAdmin.address, deployer);

  return {
    signers,
    deployer,
    user1,
    user2,
    user3,
    user4,
    user5,
    unknownSigner,

    factory,
    blr,
    proxyAdmin,
    deployment,

    facetKeys: deployment.facets.reduce(
      (acc, f) => {
        acc[f.name] = f.key;
        return acc;
      },
      {} as Record<string, string>,
    ),
    equityFacetKeys: deployment.helpers.getEquityFacets().reduce(
      (acc, f) => {
        acc[f.name] = f.key;
        return acc;
      },
      {} as Record<string, string>,
    ),
    bondFacetKeys: deployment.helpers.getBondFacets().reduce(
      (acc, f) => {
        acc[f.name] = f.key;
        return acc;
      },
      {} as Record<string, string>,
    ),
    depositTokenFacetKeys: deployment.helpers.getDepositTokenFacets().reduce(
      (acc, f) => {
        acc[f.name] = f.key;
        return acc;
      },
      {} as Record<string, string>,
    ),
    factoryFacetKeys: deployment.helpers.getFactoryFacets().reduce(
      (acc, f) => {
        acc[f.name] = f.key;
        return acc;
      },
      {} as Record<string, string>,
    ),

    // AssetMock config metadata (populated from the augmented deployment)
    assetMockConfigId: deployment.configurations.assetMock.configId,
    assetMockFacets: deployment.helpers.getAssetMockFacets(),
  };
}
