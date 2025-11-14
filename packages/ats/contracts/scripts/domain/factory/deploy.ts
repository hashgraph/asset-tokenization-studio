// SPDX-License-Identifier: Apache-2.0

/**
 * Factory deployment module.
 *
 * High-level module for deploying Factory contract with proxy and
 * initialization.
 *
 * @module domain/factory/deploy
 */

import { Signer } from "ethers";
import { Factory__factory, ProxyAdmin } from "@contract-types";
import { DeployProxyResult, deployProxy, info, section, success, error as logError } from "@scripts/infrastructure";

/**
 * Options for deploying Factory.
 */
export interface DeployFactoryOptions {
  /** BLR address (required for Factory initialization) */
  blrAddress?: string;

  /** Existing ProxyAdmin contract instance (optional, will deploy new one if not provided) */
  existingProxyAdmin?: ProxyAdmin;

  /** Whether to initialize after deployment */
  initialize?: boolean;
}

/**
 * Result of deploying Factory.
 */
export interface DeployFactoryResult {
  /** Whether deployment succeeded */
  success: boolean;

  /** Proxy deployment result */
  proxyResult: DeployProxyResult;

  /** Factory proxy address */
  factoryAddress: string;

  /** Factory implementation address */
  implementationAddress: string;

  /** ProxyAdmin address */
  proxyAdminAddress: string;

  /** Whether Factory was initialized */
  initialized: boolean;

  /** Error message (only if success=false) */
  error?: string;
}

/**
 * Deploy Factory with proxy.
 *
 * This module handles the complete deployment of Factory contract
 * including proxy setup and optional initialization.
 *
 * @param signer - Ethers.js signer for deploying contracts
 * @param options - Deployment options
 * @returns Deployment result
 *
 * @example
 * ```typescript
 * import { ethers } from 'ethers'
 *
 * const signer = provider.getSigner()
 * const result = await deployFactory(signer, {
 *   blrAddress: '0x123...',
 *   initialize: true
 * })
 * console.log(`Factory deployed at ${result.factoryAddress}`)
 * ```
 */
export async function deployFactory(signer: Signer, options: DeployFactoryOptions = {}): Promise<DeployFactoryResult> {
  const { existingProxyAdmin } = options;

  section("Deploying Factory");

  try {
    // Deploy Factory with proxy
    info("Deploying Factory implementation and proxy...");

    // Create factory for implementation deployment
    const implementationFactory = new Factory__factory(signer);

    const proxyResult = await deployProxy(signer, {
      implementationFactory,
      implementationArgs: [],
      existingProxyAdmin,
      initData: "0x", // Factory is stateless, no initialization needed
    });

    const factoryAddress = proxyResult.proxyAddress;
    const implementationAddress = proxyResult.implementationAddress;
    const adminAddress = proxyResult.proxyAdminAddress;

    // Factory contract is stateless and doesn't require initialization
    // The BLR address is passed as a parameter when deploying tokens
    const initialized = false;

    success("Factory deployment complete");
    info(`  Factory Proxy: ${factoryAddress}`);
    info(`  Implementation: ${implementationAddress}`);
    info(`  ProxyAdmin: ${adminAddress}`);

    return {
      success: true,
      proxyResult,
      factoryAddress,
      implementationAddress,
      proxyAdminAddress: adminAddress,
      initialized,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logError(`Factory deployment failed: ${errorMessage}`);

    throw new Error(`Factory deployment failed: ${errorMessage}`);
  }
}

/**
 * Deploy Factory with existing ProxyAdmin.
 *
 * Convenience function for deploying Factory using an already deployed
 * ProxyAdmin (e.g., shared with BLR).
 *
 * @param signer - Ethers.js signer for deploying contracts
 * @param blrAddress - BLR address for initialization
 * @param existingProxyAdmin - Existing ProxyAdmin contract instance
 * @returns Deployment result
 *
 * @example
 * ```typescript
 * import { ethers } from 'ethers'
 * import { ProxyAdmin__factory } from '@contract-types'
 *
 * const signer = provider.getSigner()
 * const proxyAdmin = ProxyAdmin__factory.connect('0xProxyAdmin...', signer)
 * const result = await deployFactoryWithProxyAdmin(
 *   signer,
 *   '0xBLR...',
 *   proxyAdmin
 * )
 * ```
 */
export async function deployFactoryWithProxyAdmin(
  signer: Signer,
  blrAddress: string,
  existingProxyAdmin: ProxyAdmin,
): Promise<DeployFactoryResult> {
  return deployFactory(signer, {
    blrAddress,
    existingProxyAdmin,
    initialize: true,
  });
}

/**
 * Get Factory deployment summary.
 *
 * @param result - Deployment result
 * @returns Summary object
 */
export function getFactoryDeploymentSummary(result: DeployFactoryResult): {
  factoryAddress: string;
  implementationAddress: string;
  proxyAdminAddress: string;
  initialized: boolean;
} {
  return {
    factoryAddress: result.factoryAddress,
    implementationAddress: result.implementationAddress,
    proxyAdminAddress: result.proxyAdminAddress,
    initialized: result.initialized,
  };
}
