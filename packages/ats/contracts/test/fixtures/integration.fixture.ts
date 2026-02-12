// SPDX-License-Identifier: Apache-2.0

/**
 * Integration test fixtures.
 *
 * Lightweight fixtures for integration tests that don't need the full system.
 * Provides:
 * - BLR deployed and initialized
 * - BLR + Common facets registered
 *
 * Uses Hardhat's loadFixture for snapshot/restore performance.
 */

import { ethers } from "hardhat";
import { BusinessLogicResolver__factory } from "@contract-types";
import type { BusinessLogicResolver } from "@contract-types";
import { deployContract, deployProxy, registerFacets } from "@scripts/infrastructure";
import { atsRegistry } from "@scripts/domain";

/**
 * Deploy and initialize BLR
 */
export async function deployBlrFixture() {
  const [deployer] = await ethers.getSigners();

  // Deploy BLR with proxy
  const implementationFactory = await ethers.getContractFactory("BusinessLogicResolver", deployer);
  const blrResult = await deployProxy(deployer, {
    implementationFactory,
    confirmations: 0, // No confirmations needed for Hardhat
    verifyDeployment: false, // No verification needed for tests
  });

  // Get contract instance and initialize
  const blr = BusinessLogicResolver__factory.connect(blrResult.proxyAddress, deployer) as BusinessLogicResolver;
  await blr.initialize_BusinessLogicResolver();

  return {
    deployer,
    blr,
    blrAddress: blrResult.proxyAddress,
  };
}

/**
 * BLR + Common facets registered (AccessControl, Kyc, Pause)
 */
export async function registerCommonFacetsFixture() {
  const base = await deployBlrFixture();
  const { deployer, blr } = base;

  // Deploy common facets
  const facetNames = ["AccessControlFacet", "KycFacet", "PauseFacet"];
  const facetAddresses: Record<string, string> = {};

  for (const name of facetNames) {
    const factory = await ethers.getContractFactory(name, deployer);
    const result = await deployContract(factory, {
      confirmations: 0, // No confirmations needed for Hardhat
      verifyDeployment: false, // No verification needed for tests
    });
    facetAddresses[name] = result.address!;
  }

  // Prepare facet data with resolver keys
  const facetsWithKeys = facetNames.map((name) => {
    const facetDef = atsRegistry.getFacetDefinition(name);
    if (!facetDef?.resolverKey?.value) {
      throw new Error(`No resolver key found for ${name}`);
    }
    return {
      name,
      address: facetAddresses[name],
      resolverKey: facetDef.resolverKey.value,
    };
  });

  // Register facets
  await registerFacets(blr, {
    facets: facetsWithKeys,
  });

  return {
    ...base,
    facetNames,
    facetAddresses,
    facetsWithKeys,
  };
}

/**
 * BLR + ERC20Facet registered for testing SelectorAlreadyRegistered error.
 *
 * Provides a fixture for testing duplicate selector detection:
 * - BLR with proxy
 * - AccessControlFacet, KycFacet, PauseFacet (common facets)
 * - ERC20Facet (has transfer.selector = 0xa9059cbb)
 *
 * Use this fixture together with DuplicateSelectorFacetTest to verify that
 * the SelectorAlreadyRegistered error is thrown when two facets share the same selector.
 */
export async function registerERC20FacetFixture() {
  const base = await registerCommonFacetsFixture();
  const { deployer, blr, facetAddresses } = base;

  // Deploy ERC20Facet
  const erc20Factory = await ethers.getContractFactory("ERC20Facet", deployer);
  const erc20Result = await deployContract(erc20Factory, {
    confirmations: 0,
    verifyDeployment: false,
  });
  const erc20FacetAddress = erc20Result.address!;

  // Get resolver key for ERC20Facet
  const erc20FacetDef = atsRegistry.getFacetDefinition("ERC20Facet");
  if (!erc20FacetDef?.resolverKey?.value) {
    throw new Error("No resolver key found for ERC20Facet");
  }

  // Register ERC20Facet in BLR
  await registerFacets(blr, {
    facets: [
      {
        name: "ERC20Facet",
        address: erc20FacetAddress,
        resolverKey: erc20FacetDef.resolverKey.value,
      },
    ],
  });

  return {
    ...base,
    facetAddresses: {
      ...facetAddresses,
      ERC20Facet: erc20FacetAddress,
    },
    erc20FacetAddress,
    erc20ResolverKey: erc20FacetDef.resolverKey.value,
  };
}
