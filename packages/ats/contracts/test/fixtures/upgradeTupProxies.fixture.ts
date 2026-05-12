// SPDX-License-Identifier: Apache-2.0

/**
 * TUP Proxy Upgrade workflow test fixtures.
 *
 * Provides test fixtures for testing the upgradeTupProxies workflow:
 * - Deploy ProxyAdmin, BLR V1, Factory V1 with TUP pattern
 * - Deploy V2 implementations for testing upgrades
 * - Minimal fixtures for testing specific upgrade patterns
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import { configureLogger, LogLevel, deployContract } from "@scripts/infrastructure";
import { deployAtsInfrastructureFixture } from "./infrastructure.fixture";
import { BusinessLogicResolver__factory, Factory__factory } from "@contract-types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { ProxyAdmin, BusinessLogicResolver, IFactory } from "@contract-types";

/**
 * Result of deploying the TUP upgrade test environment.
 */
export interface TupUpgradeTestFixture {
  // Signers
  deployer: HardhatEthersSigner;
  otherSigner: HardhatEthersSigner;

  // Infrastructure - ProxyAdmin
  proxyAdmin: ProxyAdmin;
  proxyAdminAddress: string;

  // BLR - V1 Implementation and Proxy
  blrV1Implementation: BusinessLogicResolver;
  blrV1ImplementationAddress: string;
  blrProxy: BusinessLogicResolver;
  blrProxyAddress: string;
}

/**
 * Minimal fixture with only ProxyAdmin deployed.
 * Used for testing "upgrade with provided implementations" pattern.
 */
export interface TupInfrastructureOnlyFixture {
  deployer: HardhatEthersSigner;
  proxyAdminAddress: string;
  proxyAdmin: ProxyAdmin;
}

/**
 * V2 Implementation result for upgrade testing.
 */
export interface V2ImplementationResult {
  address: string;
  transactionHash: string;
  gasUsed?: number;
}

/**
 * Deploy complete infrastructure for BLR TUP proxy upgrade testing.
 *
 * Creates a test environment with:
 * 1. Full ATS infrastructure (ProxyAdmin, BLR V1 proxy)
 * 2. BLR deployed via TransparentUpgradeableProxy pattern
 * 3. Ready for testing upgrade patterns
 *
 * Note: Factory is a ResolverProxy (Diamond pattern), not a TUP. Factory upgrades use different
 * mechanisms and are tested separately.
 *
 * @returns Complete TUP test fixture with BLR infrastructure
 */
export async function deployTupUpgradeTestFixture(): Promise<TupUpgradeTestFixture> {
  // Configure logger to SILENT for tests
  configureLogger({ level: LogLevel.SILENT });

  // Deploy full ATS infrastructure (provides BLR proxy)
  const infrastructure = await deployAtsInfrastructureFixture(true, false);

  const { deployer, unknownSigner, proxyAdmin, blr } = infrastructure;

  // Get the ProxyAdmin address
  const proxyAdminAddress = await proxyAdmin.getAddress();

  // Get BLR proxy address
  const blrProxyAddress = await blr.getAddress();

  // Get BLR implementation address from proxy storage
  // BLR is a TUP, so get implementation from ProxyAdmin
  const blrImplAddress = await proxyAdmin.getProxyImplementation(blrProxyAddress);

  // Connect to BLR implementation
  const blrV1Implementation = BusinessLogicResolver__factory.connect(blrImplAddress, deployer);

  return {
    deployer,
    otherSigner: unknownSigner,
    proxyAdmin,
    proxyAdminAddress,
    blrV1Implementation,
    blrV1ImplementationAddress: blrImplAddress,
    blrProxy: blr,
    blrProxyAddress,
  };
}

/**
 * Deploy minimal fixture with only ProxyAdmin.
 *
 * Useful for testing "upgrade to provided implementation" pattern
 * where implementations are already deployed elsewhere.
 *
 * @returns Minimal fixture with ProxyAdmin only
 */
export async function deployTupInfrastructureOnlyFixture(): Promise<TupInfrastructureOnlyFixture> {
  configureLogger({ level: LogLevel.SILENT });

  const infrastructure = await deployAtsInfrastructureFixture(true, false);
  const { deployer, proxyAdmin } = infrastructure;

  return {
    deployer,
    proxyAdminAddress: await proxyAdmin.getAddress(),
    proxyAdmin,
  };
}

/**
 * Deploy a mock BusinessLogicResolver V2 implementation for testing.
 *
 * @param signer - Signer to deploy with
 * @returns Deployed V2 implementation address and details
 */
export async function deployBlrV2Implementation(signer: HardhatEthersSigner): Promise<V2ImplementationResult> {
  configureLogger({ level: LogLevel.SILENT });

  const factory = new BusinessLogicResolver__factory(signer);
  const result = await deployContract(factory, {
    confirmations: 0,
  });

  if (!result.success || !result.address || !result.transactionHash) {
    throw new Error(`BLR V2 deployment failed: ${result.error || "Unknown error"}`);
  }

  return {
    address: result.address,
    transactionHash: result.transactionHash,
    gasUsed: result.gasUsed,
  };
}

/**
 * Create a minimal mock implementation contract for testing.
 *
 * @param signer - Signer to deploy with
 * @returns Mock contract address
 */
export async function createMockImplementation(signer: HardhatEthersSigner): Promise<string> {
  configureLogger({ level: LogLevel.SILENT });

  // Deploy a minimal contract that can serve as an implementation
  const factory = new BusinessLogicResolver__factory(signer);
  const result = await deployContract(factory, { confirmations: 0 });

  if (!result.success || !result.address) {
    throw new Error(`Mock implementation deployment failed: ${result.error || "Unknown error"}`);
  }

  return result.address;
}
