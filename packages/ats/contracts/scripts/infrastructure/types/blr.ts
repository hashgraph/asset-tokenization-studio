// SPDX-License-Identifier: Apache-2.0

/**
 * BLR (Business Logic Resolver) configuration types.
 *
 * Types for creating and managing configurations in the BusinessLogicResolver
 * that define which facets are used for different token types.
 *
 * @module infrastructure/types/blr
 */

/**
 * Facet configuration for BLR.
 */
export interface FacetConfiguration {
  /** Facet name */
  facetName: string;

  /** Function selectors this facet handles */
  selectors: string[];
}

/**
 * Batch facet configuration structure for contract calls.
 * This matches the IDiamondCutManager.FacetConfigurationStruct interface.
 */
export interface BatchFacetConfiguration {
  /** Facet ID (keccak256 hash of facet name) */
  id: string;

  /** Facet version */
  version: number;
}

/**
 * Result of BLR configuration.
 *
 * Used by the deployBlrWithFacets workflow helper.
 */
export interface CreateBlrConfigurationResult {
  /** Whether configuration succeeded */
  success: boolean;

  /** BLR address */
  blrAddress: string;

  /** Configuration ID */
  configurationId: string;

  /** Configuration version created */
  version?: number;

  /** Number of facets configured */
  facetCount: number;

  /** Transaction hash (only if success=true) */
  transactionHash?: string;

  /** Block number (only if success=true) */
  blockNumber?: number;

  /** Gas used (only if success=true) */
  gasUsed?: number;

  /** Error message (only if success=false) */
  error?: string;
}

/**
 * Error types for configuration operations.
 */
export type ConfigurationError =
  | "EMPTY_FACET_LIST"
  | "INVALID_ADDRESS"
  | "INVALID_CONFIG_ID"
  | "FACET_NOT_FOUND"
  | "TRANSACTION_FAILED"
  | "EVENT_PARSE_FAILED";

/**
 * Configuration data returned on success.
 */
export interface ConfigurationData {
  /** Configuration ID */
  configurationId: string;

  /** Configuration version */
  version: number;

  /** Facet keys and addresses */
  facetKeys: Array<{
    facetName: string;
    key: string;
    address: string;
  }>;

  /** Transaction hash */
  transactionHash: string;

  /** Block number */
  blockNumber: number;
}

/**
 * Facet data for configuration creation.
 */
export interface FacetConfigurationData {
  /** Base facet name (e.g., 'AccessControlFacet') */
  facetName: string;

  /** Resolver key (bytes32) for the facet */
  resolverKey: string;

  /** Deployed facet address */
  address: string;
}
