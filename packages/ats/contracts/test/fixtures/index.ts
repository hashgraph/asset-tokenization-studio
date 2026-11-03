// SPDX-License-Identifier: Apache-2.0

/**
 * Shared test fixtures for ATS contracts.
 *
 * Uses Hardhat Network Helpers loadFixture pattern for efficient test setup.
 * Each fixture is executed once and snapshotted, subsequent calls restore state.
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

// Infrastructure fixtures (core deployment)
export { deployAtsInfrastructureFixture } from "./infrastructure.fixture";

// Integration test fixtures (lighter weight)
export { deployBlrFixture, registerCommonFacetsFixture, registerTransferFacetFixture } from "./integration.fixture";

// TUP proxy fixtures (TransparentUpgradeableProxy testing)
export { deployTupProxyFixture, deployTupProxyWithV2Fixture, TUP_VERSIONS } from "./tupProxy.fixture";
export type { TupProxyFixtureResult } from "./tupProxy.fixture";

// Token fixtures
export { deployEquityTokenFixture, DEFAULT_EQUITY_PARAMS, makeEquityDetailsData } from "./tokens/equity.fixture";

export {
  deployBondTokenFixture,
  DEFAULT_BOND_PARAMS,
  makeBondDetailsData as getBondDetails,
} from "./tokens/bond.fixture";

// Common token utilities
export {
  MAX_UINT256,
  MAX_UINT8,
  TEST_PARTITIONS,
  TEST_AMOUNTS,
  executeRbac,
  getSecurityData,
  getRegulationData,
} from "./tokens/common.fixture";

// ResolverProxy fixtures
export {
  deployResolverProxyFixture,
  deployResolverProxyWithAltConfigFixture,
  TEST_CONFIG_ID,
  ALT_CONFIG_ID,
  MAX_TEST_VERSION,
  type ResolverProxyFixtureResult,
} from "./resolverProxy.fixture";

// TUP upgrade fixtures
export {
  deployTupUpgradeTestFixture,
  deployTupInfrastructureOnlyFixture,
  deployBlrV2Implementation,
  createMockImplementation,
  type TupUpgradeTestFixture,
  type TupInfrastructureOnlyFixture,
  type V2ImplementationResult,
} from "./upgradeTupProxies.fixture";

// Full-asset infrastructure fixture (test-only, includes AssetMock config)
export { deploySystemWithNewBlrFullAsset, deployAtsInfrastructureFullAssetFixture } from "./deploy/fullAsset";

// AssetMock context fixture (shared fixture for migrated integration suites)
export { AssetMockCtx, deployAssetMockCtx, buildAssetMockCtx, assertHandlesBound } from "./ctx/assetCtx";

// Hardhat-dependent test helpers (RBAC, timestamps)
export { grantRoleAndPauseToken, getDltTimestamp } from "./hardhatHelpers";
