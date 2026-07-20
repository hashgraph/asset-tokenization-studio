// SPDX-License-Identifier: Apache-2.0

/** Shared type definitions for the operations layer. */

/**
 * Metadata definition for a facet contract.
 */
export interface FacetDefinition {
  /** Facet name - used for registry key and factory lookup */
  name: string;

  /** Resolver key imported or defined by this facet */
  resolverKey?: {
    /** Resolver key name (e.g., _ACCESS_CONTROL) */
    name: string;
    /** Resolver key bytes32 value (e.g., 0x011768a41...) */
    value: string;
  };
}

/**
 * Registry provider interface: how a facet registry exposes its definitions.
 */
export interface RegistryProvider {
  getFacetDefinition(name: string): FacetDefinition | undefined;

  getAllFacets(): FacetDefinition[];
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Facet metadata in a deployment.
 */
export interface FacetMetadata {
  name: string;
  address: string;
  contractId?: string;
  key: string;
  version?: number;
}

/**
 * Configuration metadata in a deployment.
 */
export interface ConfigurationMetadata {
  configId: string;
  version: number;
  facetCount: number;
  facets?: Array<{
    facetName: string;
    key: string;
    address: string;
  }>;
}

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
