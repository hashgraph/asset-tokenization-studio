// SPDX-License-Identifier: Apache-2.0

/**
 * BLR deployment module.
 *
 * High-level operation for deploying and configuring BusinessLogicResolver
 * with proxy, facets, and configurations using TypeChain.
 *
 * @module core/operations/blrDeployment
 */

import { Signer } from "ethers";
import { BusinessLogicResolver__factory, ProxyAdmin } from "@contract-types";
import {
  DeployProxyResult,
  deployProxy,
  error as logError,
  info,
  section,
  success,
  GAS_LIMIT,
} from "@scripts/infrastructure";

/**
 * Options for deploying BLR.
 */
export interface DeployBlrOptions {
  /** Existing ProxyAdmin contract instance (optional, will deploy new one if not provided) */
  existingProxyAdmin?: ProxyAdmin;

  /** Whether to initialize after deployment */
  initialize?: boolean;
}

/**
 * Result of deploying BLR.
 */
export interface DeployBlrResult {
  /** Whether deployment succeeded */
  success: boolean;

  /** Proxy deployment result */
  proxyResult: DeployProxyResult;

  /** BLR proxy address */
  blrAddress: string;

  /** BLR implementation address */
  implementationAddress: string;

  /** ProxyAdmin address */
  proxyAdminAddress: string;

  /** Whether BLR was initialized */
  initialized: boolean;

  /** Error message (only if success=false) */
  error?: string;
}

/**
 * Deploy BLR with proxy.
 *
 * This module handles the complete deployment of BusinessLogicResolver
 * including proxy setup and optional initialization.
 *
 * @param signer - Ethers.js signer
 * @param options - Deployment options
 * @returns Deployment result
 *
 * @example
 * ```typescript
 * import { ethers } from 'hardhat'
 *
 * const signer = (await ethers.getSigners())[0]
 * const result = await deployBlr(signer, {
 *   initialize: true
 * })
 * console.log(`BLR deployed at ${result.blrAddress}`)
 * ```
 */
export async function deployBlr(signer: Signer, options: DeployBlrOptions = {}): Promise<DeployBlrResult> {
  const { existingProxyAdmin, initialize = true } = options;

  section("Deploying BusinessLogicResolver");

  try {
    // Deploy BLR with proxy
    info("Deploying BLR implementation and proxy...");

    // Create factory for implementation deployment
    const implementationFactory = new BusinessLogicResolver__factory(signer);

    const proxyResult = await deployProxy(signer, {
      implementationFactory,
      implementationArgs: [],
      existingProxyAdmin,
      initData: "0x",
      overrides: {
        gasLimit: GAS_LIMIT.high,
      },
    });

    const blrAddress = proxyResult.proxyAddress;
    const implementationAddress = proxyResult.implementationAddress;
    const adminAddress = proxyResult.proxyAdminAddress;

    let initialized = false;

    // Initialize if requested
    if (initialize) {
      info("Initializing BLR...");

      try {
        const blr = BusinessLogicResolver__factory.connect(blrAddress, signer);

        const initTx = await blr.initialize_BusinessLogicResolver({
          gasLimit: GAS_LIMIT.initialize.businessLogicResolver,
        });
        await initTx.wait();

        initialized = true;
        success("BLR initialized");
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logError(`BLR initialization failed: ${errorMsg}`);
        // Don't fail deployment if initialization fails
      }
    }

    success("BLR deployment complete");
    info(`  BLR Proxy: ${blrAddress}`);
    info(`  Implementation: ${implementationAddress}`);
    info(`  ProxyAdmin: ${adminAddress}`);

    return {
      success: true,
      proxyResult,
      blrAddress,
      implementationAddress,
      proxyAdminAddress: adminAddress,
      initialized,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logError(`BLR deployment failed: ${errorMessage}`);

    throw new Error(`BLR deployment failed: ${errorMessage}`);
  }
}
