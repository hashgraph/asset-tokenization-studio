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

  // Factory - V1 Implementation and Proxy
  factoryV1Implementation: IFactory;
  factoryV1ImplementationAddress: string;
  factoryProxy: IFactory;
  factoryProxyAddress: string;
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
 * Deploy complete infrastructure for TUP proxy upgrade testing.
 *
 * Creates a test environment with:
 * 1. Full ATS infrastructure (ProxyAdmin, BLR V1 proxy, Factory V1 proxy)
 * 2. All components deployed via TransparentUpgradeableProxy pattern
 * 3. Ready for testing upgrade patterns
 *
 * @returns Complete TUP test fixture with infrastructure and proxies
 */
export async function deployTupUpgradeTestFixture(): Promise<TupUpgradeTestFixture> {
  // Configure logger to SILENT for tests
  configureLogger({ level: LogLevel.SILENT });

  // Deploy full ATS infrastructure (provides BLR and Factory proxies)
  const infrastructure = await deployAtsInfrastructureFixture(true, false);

  const { deployer, unknownSigner, proxyAdmin, blr, factory } = infrastructure;

  // Get the ProxyAdmin address
  const proxyAdminAddress = await proxyAdmin.getAddress();

  // Get proxy addresses
  const blrProxyAddress = await blr.getAddress();
  const factoryProxyAddress = await factory.getAddress();

  // Get implementation addresses from proxy storage
  const blrImplAddress = await proxyAdmin.getProxyImplementation(blrProxyAddress);
  const factoryImplAddress = await proxyAdmin.getProxyImplementation(factoryProxyAddress);

  // Connect to implementations
  const blrV1Implementation = BusinessLogicResolver__factory.connect(blrImplAddress, deployer);
  const factoryV1Implementation = Factory__factory.connect(factoryImplAddress, deployer);

  return {
    deployer,
    otherSigner: unknownSigner,
    proxyAdmin,
    proxyAdminAddress,
    blrV1Implementation,
    blrV1ImplementationAddress: blrImplAddress,
    blrProxy: blr,
    blrProxyAddress,
    factoryV1Implementation,
    factoryV1ImplementationAddress: factoryImplAddress,
    factoryProxy: factory,
    factoryProxyAddress,
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
 * Deploy a mock Factory V2 implementation for testing.
 *
 * @param signer - Signer to deploy with
 * @returns Deployed V2 implementation address and details
 */
export async function deployFactoryV2Implementation(signer: HardhatEthersSigner): Promise<V2ImplementationResult> {
  configureLogger({ level: LogLevel.SILENT });

  const factory = new Factory__factory(signer);
  const result = await deployContract(factory, {
    confirmations: 0,
  });

  if (!result.success || !result.address || !result.transactionHash) {
    throw new Error(`Factory V2 deployment failed: ${result.error || "Unknown error"}`);
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
