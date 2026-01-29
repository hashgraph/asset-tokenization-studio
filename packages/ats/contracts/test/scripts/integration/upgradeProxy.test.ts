// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for upgradeProxy operation.
 *
 * Tests the full end-to-end functionality of upgrading TransparentUpgradeableProxy including:
 * - Basic upgrades (deploy new implementation and upgrade)
 * - Upgrades with pre-deployed implementations
 * - Upgrades with initialization (upgradeAndCall)
 * - Already at target implementation scenarios
 * - Access control enforcement (ProxyAdmin ownership)
 * - Error handling
 * - State verification
 * - Gas usage reporting
 *
 * @module test/scripts/integration/upgradeProxy.test
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  upgradeProxy,
  getProxyImplementation,
  proxyNeedsUpgrade,
  prepareUpgrade,
  configureLogger,
  LogLevel,
} from "@scripts/infrastructure";
import { TUP_VERSIONS, deployTupProxyFixture, deployTupProxyWithV2Fixture, TEST_ADDRESSES, TEST_VALUES } from "@test";
import { MockImplementation__factory, MockImplementationV2__factory, ProxyAdmin__factory } from "@contract-types";

/**
 * Test constants for upgradeProxy integration tests.
 * Combines TEST_VALUES from @test with test-specific constants.
 */
const TEST_CONSTANTS = {
  /** Test value for V2 initialization (basic test) - use centralized constant */
  TEST_INIT_VALUE_BASIC: TEST_VALUES.INIT_VALUE,
  /** Test value for V2 initialization (upgrade with init) */
  TEST_INIT_VALUE_WITH_UPGRADE: 123,
  /** Test value for V2 initialization (state verification) */
  TEST_INIT_VALUE_STATE_VERIFY: 999,
  /** EIP-1967 admin storage slot constant */
  EIP1967_ADMIN_SLOT: "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103",
  /** Gas limit for basic upgrade() call */
  MAX_GAS_UPGRADE: 200_000,
  /** Gas limit for upgradeAndCall() call (includes initialization) */
  MAX_GAS_UPGRADE_AND_CALL: 300_000,
} as const;

describe("upgradeProxy - Integration Tests", () => {
  before(() => {
    configureLogger({ level: LogLevel.SILENT });
  });

  describe("Basic Upgrade", () => {
    it("should upgrade proxy successfully (deploy new impl)", async () => {
      const { deployer, proxyAdmin, proxyAddress } = await loadFixture(deployTupProxyFixture);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationFactory: new MockImplementationV2__factory(deployer),
        newImplementationArgs: [],
      });

      expect(result.success).to.be.true;
      expect(result.upgraded).to.be.true;
      expect(result.transactionHash).to.exist;
      expect(result.blockNumber).to.be.greaterThan(0);
    });

    it("should return old and new implementation addresses", async () => {
      const { proxyAdmin, proxyAddress, implementationV1Address, implementationV2Address } =
        await loadFixture(deployTupProxyWithV2Fixture);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationAddress: implementationV2Address,
      });

      expect(result.success).to.be.true;
      expect(result.oldImplementation).to.exist;
      expect(result.newImplementation).to.exist;
      expect(result.oldImplementation?.toLowerCase()).to.equal(implementationV1Address.toLowerCase());
      expect(result.newImplementation?.toLowerCase()).to.equal(implementationV2Address.toLowerCase());
    });

    it("should verify implementation changed on-chain", async () => {
      const { deployer, proxyAdmin, proxyAddress, implementationV1Address, implementationV2Address } =
        await loadFixture(deployTupProxyWithV2Fixture);

      // Verify initial implementation
      const implBefore = await getProxyImplementation(ethers.provider, proxyAddress);
      expect(implBefore.toLowerCase()).to.equal(implementationV1Address.toLowerCase());

      // Upgrade
      await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationAddress: implementationV2Address,
      });

      // Verify new implementation on-chain
      const implAfter = await getProxyImplementation(ethers.provider, proxyAddress);
      expect(implAfter.toLowerCase()).to.equal(implementationV2Address.toLowerCase());

      // Verify version changed (V1 -> V2)
      const mockV2 = MockImplementationV2__factory.connect(proxyAddress, deployer);
      expect(await mockV2.version()).to.equal(TUP_VERSIONS.V2);
    });
  });

  describe("Upgrade with Pre-deployed Implementation", () => {
    it("should upgrade using existing implementation address", async () => {
      const { proxyAdmin, proxyAddress, implementationV2Address } = await loadFixture(deployTupProxyWithV2Fixture);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationAddress: implementationV2Address,
      });

      expect(result.success).to.be.true;
      expect(result.upgraded).to.be.true;
      expect(result.newImplementation).to.equal(implementationV2Address);
    });

    it("should verify implementation changed on-chain", async () => {
      const { proxyAdmin, proxyAddress, implementationV2Address } = await loadFixture(deployTupProxyWithV2Fixture);

      await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationAddress: implementationV2Address,
      });

      const implAfter = await getProxyImplementation(ethers.provider, proxyAddress);
      expect(implAfter.toLowerCase()).to.equal(implementationV2Address.toLowerCase());
    });
  });

  describe("Upgrade with Initialization", () => {
    it("should upgrade and call initialization function", async () => {
      const { deployer, proxyAdmin, proxyAddress } = await loadFixture(deployTupProxyFixture);

      const initData = MockImplementationV2__factory.createInterface().encodeFunctionData("initializeV2", [
        TEST_CONSTANTS.TEST_INIT_VALUE_BASIC,
      ]);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationFactory: new MockImplementationV2__factory(deployer),
        newImplementationArgs: [],
        initData,
      });

      expect(result.success).to.be.true;
      expect(result.upgraded).to.be.true;
    });

    it("should verify initialization data was executed", async () => {
      const { deployer, proxyAdmin, proxyAddress } = await loadFixture(deployTupProxyFixture);

      const initData = MockImplementationV2__factory.createInterface().encodeFunctionData("initializeV2", [
        TEST_CONSTANTS.TEST_INIT_VALUE_WITH_UPGRADE,
      ]);

      await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationFactory: new MockImplementationV2__factory(deployer),
        newImplementationArgs: [],
        initData,
      });

      // Verify newState was set via initializeV2
      const mockV2 = MockImplementationV2__factory.connect(proxyAddress, deployer);
      expect(await mockV2.newState()).to.equal(TEST_CONSTANTS.TEST_INIT_VALUE_WITH_UPGRADE);
      expect(await mockV2.initializedV2()).to.be.true;
    });

    it("should preserve proxy state after upgradeAndCall", async () => {
      const { deployer, proxyAdmin, proxyAddress } = await loadFixture(deployTupProxyFixture);

      // Initialize V1 first
      const mockV1 = MockImplementation__factory.connect(proxyAddress, deployer);
      await mockV1.initialize();
      const initializedValueV1 = await mockV1.initializedValue();

      // Upgrade to V2 with initialization
      const initData = MockImplementationV2__factory.createInterface().encodeFunctionData("initializeV2", [
        TEST_CONSTANTS.TEST_INIT_VALUE_STATE_VERIFY,
      ]);

      await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationFactory: new MockImplementationV2__factory(deployer),
        newImplementationArgs: [],
        initData,
      });

      // Verify V1 state was preserved
      const mockV2 = MockImplementationV2__factory.connect(proxyAddress, deployer);
      expect(await mockV2.initializedValue()).to.equal(initializedValueV1); // V1 state preserved
      expect(await mockV2.newState()).to.equal(TEST_CONSTANTS.TEST_INIT_VALUE_STATE_VERIFY); // V2 state set
    });
  });

  describe("Already at Target Implementation", () => {
    it("should return upgraded=false when already at target", async () => {
      const { proxyAdmin, proxyAddress, implementationV1Address } = await loadFixture(deployTupProxyFixture);

      // Attempt to "upgrade" to same implementation
      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationAddress: implementationV1Address,
      });

      expect(result.success).to.be.true;
      expect(result.upgraded).to.be.false;
      expect(result.oldImplementation).to.exist;
      expect(result.newImplementation).to.exist;
      expect(result.oldImplementation?.toLowerCase()).to.equal(implementationV1Address.toLowerCase());
      expect(result.newImplementation?.toLowerCase()).to.equal(implementationV1Address.toLowerCase());
    });

    it("should not execute transaction when already upgraded", async () => {
      const { proxyAdmin, proxyAddress, implementationV1Address } = await loadFixture(deployTupProxyFixture);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationAddress: implementationV1Address,
      });

      // No transaction should be executed
      expect(result.transactionHash).to.be.undefined;
      expect(result.blockNumber).to.be.undefined;
      expect(result.gasUsed).to.be.undefined;
    });
  });

  describe("Access Control", () => {
    it("should succeed when ProxyAdmin owner calls upgrade", async () => {
      const { proxyAdmin, proxyAddress, implementationV2Address } = await loadFixture(deployTupProxyWithV2Fixture);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationAddress: implementationV2Address,
      });

      expect(result.success).to.be.true;
    });

    it("should fail when non-owner attempts upgrade", async () => {
      const { unknownSigner, proxyAdminAddress, proxyAddress, implementationV2Address } =
        await loadFixture(deployTupProxyWithV2Fixture);

      // Connect ProxyAdmin with unknown signer (not owner)
      const proxyAdminAsNonOwner = ProxyAdmin__factory.connect(proxyAdminAddress, unknownSigner);

      const result = await upgradeProxy(proxyAdminAsNonOwner, {
        proxyAddress,
        newImplementationAddress: implementationV2Address,
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
      expect(result.error).to.match(/caller is not the owner|Ownable/i);
    });

    it("should verify ProxyAdmin controls proxy", async () => {
      const { proxyAddress, proxyAdminAddress } = await loadFixture(deployTupProxyFixture);

      // Verify ProxyAdmin is the admin of the proxy (EIP-1967)
      const adminAddressSlot = await ethers.provider.getStorageAt(proxyAddress, TEST_CONSTANTS.EIP1967_ADMIN_SLOT);
      const adminAddress = ethers.utils.getAddress("0x" + adminAddressSlot.slice(-40));

      expect(adminAddress.toLowerCase()).to.equal(proxyAdminAddress.toLowerCase());
    });
  });

  describe("Error Handling", () => {
    it("should fail for invalid proxy address", async () => {
      const { proxyAdmin } = await loadFixture(deployTupProxyFixture);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress: TEST_ADDRESSES.NO_CODE,
        newImplementationAddress: ethers.constants.AddressZero,
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });

    it("should return structured error result (not throw)", async () => {
      const { proxyAdmin } = await loadFixture(deployTupProxyFixture);

      // Should return result, not throw
      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress: TEST_ADDRESSES.NO_CODE,
        newImplementationAddress: ethers.constants.AddressZero,
      });

      expect(result).to.be.an("object");
      expect(result.success).to.be.false;
      expect(result.error).to.be.a("string");
      expect(result.proxyAddress).to.exist;
    });

    it("should include old implementation in error result when available", async () => {
      const { unknownSigner, proxyAdminAddress, proxyAddress, implementationV1Address, implementationV2Address } =
        await loadFixture(deployTupProxyWithV2Fixture);

      // Connect ProxyAdmin with unknown signer (will fail due to access control)
      const proxyAdminAsNonOwner = ProxyAdmin__factory.connect(proxyAdminAddress, unknownSigner);

      const result = await upgradeProxy(proxyAdminAsNonOwner, {
        proxyAddress,
        newImplementationAddress: implementationV2Address,
      });

      expect(result.success).to.be.false;
      expect(result.oldImplementation).to.exist;
      expect(result.oldImplementation?.toLowerCase()).to.equal(implementationV1Address.toLowerCase()); // Old impl retrieved before error
    });
  });

  describe("State Verification", () => {
    it("should preserve proxy address (unchanged)", async () => {
      const { proxyAdmin, proxyAddress, implementationV2Address } = await loadFixture(deployTupProxyWithV2Fixture);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationAddress: implementationV2Address,
      });

      expect(result.proxyAddress).to.equal(proxyAddress); // Proxy address unchanged
    });

    it("should persist implementation change after upgrade", async () => {
      const { proxyAdmin, proxyAddress, implementationV2Address } = await loadFixture(deployTupProxyWithV2Fixture);

      await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationAddress: implementationV2Address,
      });

      // Verify persistence by reading again
      const implAfter = await getProxyImplementation(ethers.provider, proxyAddress);
      expect(implAfter.toLowerCase()).to.equal(implementationV2Address.toLowerCase());
    });

    it("should allow subsequent upgrades", async () => {
      const { proxyAdmin, proxyAddress, implementationV1Address, implementationV2Address } =
        await loadFixture(deployTupProxyWithV2Fixture);

      // First upgrade: V1 -> V2
      const result1 = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationAddress: implementationV2Address,
      });
      expect(result1.success).to.be.true;

      // Second upgrade: V2 -> V1 (downgrade for testing)
      const result2 = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationAddress: implementationV1Address,
      });
      expect(result2.success).to.be.true;

      // Verify final state is V1
      const implFinal = await getProxyImplementation(ethers.provider, proxyAddress);
      expect(implFinal.toLowerCase()).to.equal(implementationV1Address.toLowerCase());
    });
  });

  describe("Gas Usage", () => {
    it("should report gas used for upgrade() call", async () => {
      const { proxyAdmin, proxyAddress, implementationV2Address } = await loadFixture(deployTupProxyWithV2Fixture);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationAddress: implementationV2Address,
      });

      expect(result.success).to.be.true;
      expect(result.gasUsed).to.exist;
      expect(result.gasUsed).to.be.greaterThan(0);
      expect(result.gasUsed).to.be.lessThan(TEST_CONSTANTS.MAX_GAS_UPGRADE); // Reasonable gas limit for upgrade
    });

    it("should report gas used for upgradeAndCall() call", async () => {
      const { deployer, proxyAdmin, proxyAddress } = await loadFixture(deployTupProxyFixture);

      const initData = MockImplementationV2__factory.createInterface().encodeFunctionData("initializeV2", [
        TEST_CONSTANTS.TEST_INIT_VALUE_BASIC,
      ]);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationFactory: new MockImplementationV2__factory(deployer),
        newImplementationArgs: [],
        initData,
      });

      expect(result.success).to.be.true;
      expect(result.gasUsed).to.exist;
      expect(result.gasUsed).to.be.greaterThan(0);
      expect(result.gasUsed).to.be.lessThan(TEST_CONSTANTS.MAX_GAS_UPGRADE_AND_CALL); // upgradeAndCall uses more gas
    });
  });

  describe("Helper Functions", () => {
    it("proxyNeedsUpgrade should return true when upgrade needed", async () => {
      const { proxyAddress, implementationV1Address, implementationV2Address } =
        await loadFixture(deployTupProxyWithV2Fixture);

      const needsUpgrade = await proxyNeedsUpgrade(ethers.provider, proxyAddress, implementationV2Address);

      expect(needsUpgrade).to.be.true;

      // Verify current implementation is V1
      const currentImpl = await getProxyImplementation(ethers.provider, proxyAddress);
      expect(currentImpl.toLowerCase()).to.equal(implementationV1Address.toLowerCase());
    });

    it("proxyNeedsUpgrade should return false when already at target", async () => {
      const { proxyAddress, implementationV1Address } = await loadFixture(deployTupProxyFixture);

      const needsUpgrade = await proxyNeedsUpgrade(ethers.provider, proxyAddress, implementationV1Address);

      expect(needsUpgrade).to.be.false;
    });

    it("prepareUpgrade should deploy implementation without upgrading", async () => {
      const { deployer, proxyAddress } = await loadFixture(deployTupProxyFixture);

      // Prepare upgrade (deploy V2 without upgrading) using TypeChain factory
      const newImplAddress = await prepareUpgrade(new MockImplementationV2__factory(deployer), []);

      // Verify V2 was deployed
      expect(newImplAddress).to.be.a("string");
      expect(newImplAddress).to.not.equal(ethers.constants.AddressZero);

      // Verify proxy is still at V1
      const currentImpl = await getProxyImplementation(ethers.provider, proxyAddress);
      expect(currentImpl.toLowerCase()).to.not.equal(newImplAddress.toLowerCase());
    });
  });
});
