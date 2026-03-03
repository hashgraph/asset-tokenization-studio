// SPDX-License-Identifier: Apache-2.0

/**
 * Bond configuration shims for backward compatibility.
 *
 * These functions provide backward compatibility for code that expects
 * separate configuration functions for each bond rate type.
 *
 * Since the Bond Domain Unification (ADR-BOND-DOMAIN-UNIFICATION),
 * all bond rate types (Variable, Fixed, KpiLinked, SPT) use the same
 * configuration via createBondConfiguration().
 *
 * These shims call createBondConfiguration internally but maintain
 * the same API surface for existing code.
 */

import { BusinessLogicResolver } from "@contract-types";
import {
  createBondConfiguration,
  type OperationResult,
  type ConfigurationData,
  type ConfigurationError,
} from "./createConfiguration";

/**
 * Create Bond Fixed Rate configuration.
 *
 * @deprecated Use createBondConfiguration directly - all rate types now use unified config
 */
export async function createBondFixedRateConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  partialBatchDeploy: boolean = false,
  batchSize: number = 10,
  confirmations: number = 0,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  return createBondConfiguration(
    blrContract,
    facetAddresses,
    useTimeTravel,
    partialBatchDeploy,
    batchSize,
    confirmations,
  );
}

/**
 * Create Bond KPI Linked Rate configuration.
 *
 * @deprecated Use createBondConfiguration directly - all rate types now use unified config
 */
export async function createBondKpiLinkedRateConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  partialBatchDeploy: boolean = false,
  batchSize: number = 10,
  confirmations: number = 0,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  return createBondConfiguration(
    blrContract,
    facetAddresses,
    useTimeTravel,
    partialBatchDeploy,
    batchSize,
    confirmations,
  );
}

/**
 * Create Bond Sustainability Performance Target Rate configuration.
 *
 * @deprecated Use createBondConfiguration directly - all rate types now use unified config
 */
export async function createBondSustainabilityPerformanceTargetRateConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  partialBatchDeploy: boolean = false,
  batchSize: number = 10,
  confirmations: number = 0,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  return createBondConfiguration(
    blrContract,
    facetAddresses,
    useTimeTravel,
    partialBatchDeploy,
    batchSize,
    confirmations,
  );
}
