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
export { deployBlrFixture, registerCommonFacetsFixture } from "./integration.fixture";

// TUP proxy fixtures (TransparentUpgradeableProxy testing)
export { deployTupProxyFixture, deployTupProxyWithV2Fixture, TUP_VERSIONS } from "./tupProxy.fixture";
export type { TupProxyFixtureResult } from "./tupProxy.fixture";

// Token fixtures
export { deployEquityTokenFixture, DEFAULT_EQUITY_PARAMS, getEquityDetails } from "./tokens/equity.fixture";

export { deployBondTokenFixture, DEFAULT_BOND_PARAMS, getBondDetails } from "./tokens/bond.fixture";

// Common token utilities
export {
  MAX_UINT256,
  TEST_PARTITIONS,
  TEST_AMOUNTS,
  executeRbac,
  getSecurityData,
  getRegulationData,
} from "./tokens/common.fixture";

// T-REX fixtures (legacy support)
export {
  deployIdentityProxy,
  deployFullSuiteFixture,
  deploySuiteWithModularCompliancesFixture,
} from "./trex/fullSuite.fixture";
