// SPDX-License-Identifier: Apache-2.0

/**
 * Operations layer: generic operations against deployed contracts and the
 * transaction/validation utilities they share. No ATS-specific knowledge here
 * (that lives in `lib/domain`).
 *
 * Every operation follows the same shape: a small options object in, plain
 * data out, and an `Error` thrown on failure.
 */

// Types
export type {
  RegistryProvider,
  FacetDefinition,
  DeepPartial,
  FacetMetadata,
  ConfigurationMetadata,
  ConfigurationData,
  FacetConfigurationData,
} from "./types";

// Constants
export {
  DEFAULT_TRANSACTION_TIMEOUT,
  DEFAULT_BATCH_SIZE,
  DEFAULT_PARTITION,
  ADDRESS_ZERO,
  ZERO,
  EMPTY_STRING,
  EMPTY_HEX_BYTES,
  EIP1066_CODES,
  TIME_PERIODS_S,
} from "./constants";

// Operations (one verb per file)
export { deployContract, type DeployedContract } from "./deployContract";
export { deployProxy, getProxyImplementation } from "./deployProxy";
export type { DeployProxyOptions, DeployProxyResult } from "./deployProxy";
export { deployProxyAdmin } from "./deployProxyAdmin";
export { upgradeProxy, proxyNeedsUpgrade, prepareUpgrade } from "./upgradeProxy";
export type { UpgradeProxyOptions, UpgradeProxyResult } from "./upgradeProxy";
export { registerFacets } from "./registerFacets";
export type { RegisterFacetsOptions, RegisterFacetsResult, FacetRegistrationData } from "./registerFacets";
export { registerAdditionalFacets, type RegisterAdditionalFacetsOptions } from "./registerAdditionalFacets";
export { createBatchConfiguration, type CreateBatchConfigurationOptions } from "./createBatchConfiguration";
export {
  deployResolverProxy,
  type DeployResolverProxyOptions,
  type DeployResolverProxyResult,
  type ResolverProxyRbac,
} from "./deployResolverProxy";
export {
  updateResolverProxyVersion,
  updateResolverProxyConfig,
  updateResolverProxyResolver,
  getResolverProxyConfigInfo,
  type ResolverProxyUpdateOptions,
  type ResolverProxyUpdateResult,
  type ResolverProxyConfigInfo,
} from "./updateResolverProxyConfig";

// Utils
export { validateAddress, validateBytes32 } from "./utils/validation";
export {
  waitForTransaction,
  gasLimitOverride,
  extractRevertReason,
  retryTransaction,
  withNonceReset,
  isNetworkError,
  isInstantMiningNetwork,
  type RetryOptions,
} from "./utils/transaction";
export { getSelector } from "./utils/selector";
export { decodeEvent } from "./utils/decodeEvent";
export { dateToUnixTimestamp } from "./utils/time";
