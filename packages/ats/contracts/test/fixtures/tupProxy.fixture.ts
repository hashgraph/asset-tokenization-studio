// SPDX-License-Identifier: Apache-2.0

/**
 * TransparentUpgradeableProxy (TUP) test fixtures.
 *
 * Lightweight fixtures for testing TUP upgrade operations.
 * Provides minimal deployment for testing upgradeProxy operations.
 *
 * **TUP Architecture Note:**
 * TransparentUpgradeableProxy uses the EIP-1967 standard with a ProxyAdmin
 * that controls upgrades. The proxy delegates all calls to the implementation
 * contract, and upgrades change the implementation address.
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import { ethers } from "hardhat";
import { deployContract, deployProxyAdmin } from "@scripts/infrastructure";
import {
  MockImplementation__factory,
  MockImplementationV2__factory,
  TransparentUpgradeableProxy__factory,
} from "@contract-types";
import type { ProxyAdmin, MockImplementation, MockImplementationV2 } from "@contract-types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type { Contract } from "ethers";

/**
 * Test implementation version numbers.
 */
export const TUP_VERSIONS = {
  V1: 1,
  V2: 2,
};

/**
 * Fixture result for TUP deployment.
 */
export interface TupProxyFixtureResult {
  /** Deployer signer (ProxyAdmin owner) */
  deployer: SignerWithAddress;
  /** Unknown signer without any roles (for access control tests) */
  unknownSigner: SignerWithAddress;
  /** ProxyAdmin contract instance */
  proxyAdmin: ProxyAdmin;
  /** ProxyAdmin address */
  proxyAdminAddress: string;
  /** TransparentUpgradeableProxy contract instance */
  proxy: Contract;
  /** Proxy address */
  proxyAddress: string;
  /** Implementation V1 contract instance */
  implementationV1: Contract;
  /** Implementation V1 address */
  implementationV1Address: string;
}

/**
 * Deploy ProxyAdmin + Implementation V1 + TUP.
 *
 * Creates a lightweight test environment for TUP upgrade operations:
 * - Deploys ProxyAdmin
 * - Deploys MockImplementation (V1)
 * - Deploys TransparentUpgradeableProxy pointing to V1
 *
 * @returns Fixture with deployed contracts and test utilities
 */
export async function deployTupProxyFixture(): Promise<TupProxyFixtureResult> {
  // Get signers
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const unknownSigner = signers.at(-1)!;

  // Step 1: Deploy ProxyAdmin
  const proxyAdmin = await deployProxyAdmin(deployer);
  const proxyAdminAddress = proxyAdmin.address;

  // Step 2: Deploy MockImplementation (V1)
  const implV1Result = await deployContract(new MockImplementation__factory(deployer), {
    confirmations: 0,
    verifyDeployment: false,
  });

  if (!implV1Result.success || !implV1Result.address) {
    throw new Error(`Implementation V1 deployment failed: ${implV1Result.error || "Unknown error"}`);
  }

  const implementationV1 = MockImplementation__factory.connect(implV1Result.address, deployer);
  const implementationV1Address = implV1Result.address;

  // Step 3: Deploy TransparentUpgradeableProxy
  const initData = "0x";
  const proxy = await new TransparentUpgradeableProxy__factory(deployer).deploy(
    implementationV1Address,
    proxyAdminAddress,
    initData,
  );
  await proxy.deployed();

  return {
    deployer,
    unknownSigner,
    proxyAdmin,
    proxyAdminAddress,
    proxy,
    proxyAddress: proxy.address,
    implementationV1,
    implementationV1Address,
  };
}

/**
 * Deploy TUP fixture with V2 implementation pre-deployed.
 *
 * Extends the base fixture by deploying MockImplementationV2,
 * which can be used for testing upgrade operations.
 *
 * @returns Fixture with both V1 (active) and V2 (ready for upgrade) implementations
 */
export async function deployTupProxyWithV2Fixture(): Promise<
  TupProxyFixtureResult & { implementationV2: Contract; implementationV2Address: string }
> {
  const base = await deployTupProxyFixture();
  const { deployer } = base;

  // Deploy MockImplementationV2 (ready for upgrade)
  const implV2Result = await deployContract(new MockImplementationV2__factory(deployer), {
    confirmations: 0,
    verifyDeployment: false,
  });

  if (!implV2Result.success || !implV2Result.address) {
    throw new Error(`Implementation V2 deployment failed: ${implV2Result.error || "Unknown error"}`);
  }

  const implementationV2 = MockImplementationV2__factory.connect(implV2Result.address, deployer);
  const implementationV2Address = implV2Result.address;

  return {
    ...base,
    implementationV2,
    implementationV2Address,
  };
}
