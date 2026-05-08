// SPDX-License-Identifier: Apache-2.0

/**
 * Factory deployment module.
 *
 * Deploys the Factory entry point as a ResolverProxy parameterized with
 * FACTORY_CONFIG_ID. The BLR config MUST be registered before calling this
 * function — use createFactoryConfiguration() first.
 *
 * Off-chain callers continue to interact via the IFactory ABI on the returned
 * proxy address. The proxy mechanism is transparent to consumers.
 *
 * @module domain/factory/deploy
 */

import { Signer } from "ethers";
import { ResolverProxy__factory } from "@contract-types";
import { FACTORY_CONFIG_ID } from "@scripts/domain";
import { info, section, success, error as logError, GAS_LIMIT, hederaGasOverrides } from "@scripts/infrastructure";

/**
 * Options for deploying Factory.
 */
export interface DeployFactoryOptions {
  /** BLR address (required — FactoryProxy uses BLR for resolver dispatch) */
  blrAddress: string;

  /** Factory config version returned by createFactoryConfiguration() (required) */
  factoryVersion: number;

  /** FactoryFacet implementation address from the deployed facets map (required) */
  factoryFacetAddress: string;
}

/**
 * Result of deploying Factory.
 */
export interface DeployFactoryResult {
  /** Whether deployment succeeded */
  success: boolean;

  /** Factory proxy address (ResolverProxy instance) */
  factoryAddress: string;

  /** Factory implementation address (FactoryFacet deployed address) */
  implementationAddress: string;

  /** Error message (only if success=false) */
  error?: string;
}

/**
 * Deploy Factory as a ResolverProxy.
 *
 * Constructs `new ResolverProxy(blrAddress, FACTORY_CONFIG_ID, factoryVersion, [])`.
 * The FactoryProxy constructor validates that the config exists in BLR and reverts
 * if it does not — ensuring deployment order is enforced at the EVM level.
 *
 * PREREQUISITE: createFactoryConfiguration() must be called before this function.
 *
 * @param signer - Ethers.js signer for deploying contracts
 * @param options - Deployment options (blrAddress, factoryVersion, factoryFacetAddress required)
 * @returns Deployment result
 *
 * @example
 * ```typescript
 * const configResult = await createFactoryConfiguration(blr, facetAddresses)
 * const factoryVersion = configResult.data.version
 *
 * const result = await deployFactory(signer, {
 *   blrAddress: '0xBLR...',
 *   factoryVersion,
 *   factoryFacetAddress: facetAddresses['FactoryFacet'],
 * })
 * console.log(`Factory Proxy: ${result.factoryAddress}`)
 * console.log(`Implementation: ${result.implementationAddress}`)
 * ```
 */
export async function deployFactory(signer: Signer, options: DeployFactoryOptions): Promise<DeployFactoryResult> {
  const { blrAddress, factoryVersion, factoryFacetAddress } = options;

  if (!blrAddress) {
    throw new Error("deployFactory: blrAddress is required");
  }
  if (!factoryVersion) {
    throw new Error("deployFactory: factoryVersion is required");
  }
  if (!factoryFacetAddress) {
    throw new Error("deployFactory: factoryFacetAddress is required");
  }

  section("Deploying Factory (ResolverProxy)");

  try {
    info(`Deploying FactoryProxy with BLR=${blrAddress}, configId=${FACTORY_CONFIG_ID}, version=${factoryVersion}...`);

    const resolverProxyFactory = new ResolverProxy__factory(signer);
    const factoryProxy = await resolverProxyFactory.deploy(
      blrAddress,
      FACTORY_CONFIG_ID,
      factoryVersion,
      [], // empty rbacs — Factory is permissionless in v1
      {
        gasLimit: GAS_LIMIT.high,
        ...hederaGasOverrides(),
      },
    );
    await factoryProxy.waitForDeployment();

    const factoryAddress = await factoryProxy.getAddress();

    success("Factory deployment complete");
    info(`  Factory Proxy:    ${factoryAddress}`);
    info(`  Implementation:   ${factoryFacetAddress}`);
    info(`  Config ID:        ${FACTORY_CONFIG_ID}`);
    info(`  Version:          ${factoryVersion}`);

    return {
      success: true,
      factoryAddress,
      implementationAddress: factoryFacetAddress,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logError(`Factory deployment failed: ${errorMessage}`);
    throw new Error(`Factory deployment failed: ${errorMessage}`);
  }
}
