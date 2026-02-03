// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for upgradeProxy operation.
 *
 * Tests parameter-based behavior detection and input validation logic.
 * These tests verify the operation correctly handles different upgrade scenarios:
 * - Deploy new implementation and upgrade
 * - Use existing implementation address
 * - Upgrade with initialization (upgradeAndCall)
 *
 * @module test/scripts/unit/operations/upgradeProxy.test
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  upgradeProxy,
  proxyNeedsUpgrade,
  prepareUpgrade,
  getProxyImplementation,
  configureLogger,
  LogLevel,
} from "@scripts/infrastructure";
import { deployTupProxyFixture, deployTupProxyWithV2Fixture } from "@test";
import { MockImplementationV2__factory, ProxyAdmin__factory } from "@contract-types";

/**
 * Test constants for upgradeProxy operation.
 */
const TEST_CONSTANTS = {
  /** Test value for V2 initialization state */
  TEST_INIT_VALUE: 42,
  /** Non-existent contract address (no code deployed) */
  NON_EXISTENT_PROXY_ADDRESS: "0x1234567890123456789012345678901234567890",
  /** Non-existent ProxyAdmin address (no code deployed) */
  NON_EXISTENT_ADMIN_ADDRESS: "0x2234567890123456789012345678901234567890",
} as const;

describe("upgradeProxy - Unit Tests", () => {
  before(() => {
    configureLogger({ level: LogLevel.SILENT });
  });

  describe("Parameter-Based Behavior Detection", () => {
    it("should deploy new implementation when factory provided", async () => {
      const { deployer, proxyAdmin, proxyAddress } = await loadFixture(deployTupProxyFixture);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationFactory: new MockImplementationV2__factory(deployer),
        newImplementationArgs: [],
      });

      expect(result.success).to.be.true;
      expect(result.upgraded).to.be.true;
      expect(result.newImplementation).to.not.equal(result.oldImplementation);
    });

    it("should use existing implementation when address provided", async () => {
      const { proxyAdmin, proxyAddress, implementationV2Address } = await loadFixture(deployTupProxyWithV2Fixture);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationAddress: implementationV2Address,
      });

      expect(result.success).to.be.true;
      expect(result.upgraded).to.be.true;
      expect(result.newImplementation).to.equal(implementationV2Address);
    });

    it("should call upgradeAndCall when initData provided", async () => {
      const { deployer, proxyAdmin, proxyAddress } = await loadFixture(deployTupProxyFixture);

      // Encode initializeV2 call using TypeChain factory interface
      const initData = MockImplementationV2__factory.createInterface().encodeFunctionData("initializeV2", [
        TEST_CONSTANTS.TEST_INIT_VALUE,
      ]);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationFactory: new MockImplementationV2__factory(deployer),
        newImplementationArgs: [],
        initData,
      });

      expect(result.success).to.be.true;
      expect(result.upgraded).to.be.true;

      // Verify initialization was called
      const mockV2 = MockImplementationV2__factory.connect(proxyAddress, deployer);
      expect(await mockV2.newState()).to.equal(TEST_CONSTANTS.TEST_INIT_VALUE);
    });
  });

  describe("Input Validation", () => {
    it("should fail with invalid proxy address format", async () => {
      const { proxyAdmin } = await loadFixture(deployTupProxyFixture);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress: "0xinvalid",
        newImplementationAddress: ethers.ZeroAddress,
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });

    it("should fail when proxy address has no code", async () => {
      const { proxyAdmin } = await loadFixture(deployTupProxyFixture);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress: TEST_CONSTANTS.NON_EXISTENT_PROXY_ADDRESS,
        newImplementationAddress: ethers.ZeroAddress,
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
      expect(result.error).to.include("No contract found at proxy address");
    });

    it("should fail when ProxyAdmin has no code", async () => {
      const { deployer, proxyAddress } = await loadFixture(deployTupProxyFixture);

      // Create ProxyAdmin instance at non-existent address using TypeChain factory
      const fakeProxyAdmin = ProxyAdmin__factory.connect(TEST_CONSTANTS.NON_EXISTENT_ADMIN_ADDRESS, deployer);

      const result = await upgradeProxy(fakeProxyAdmin, {
        proxyAddress,
        newImplementationAddress: ethers.ZeroAddress,
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
      expect(result.error).to.include("No contract found at ProxyAdmin address");
    });

    it("should fail when neither factory nor address provided", async () => {
      const { proxyAdmin, proxyAddress } = await loadFixture(deployTupProxyFixture);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        // Neither newImplementationFactory nor newImplementationAddress provided
      } as any);

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
      expect(result.error).to.include("Either newImplementationFactory or newImplementationAddress must be provided");
    });
  });

  describe("Result Structure", () => {
    it("should return all required fields on success", async () => {
      const { proxyAdmin, proxyAddress, implementationV1Address, implementationV2Address } =
        await loadFixture(deployTupProxyWithV2Fixture);

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationAddress: implementationV2Address,
      });

      expect(result.success).to.be.true;
      expect(result.proxyAddress).to.equal(proxyAddress);
      expect(result.oldImplementation).to.exist;
      expect(result.newImplementation).to.exist;
      expect(result.oldImplementation?.toLowerCase()).to.equal(implementationV1Address.toLowerCase());
      expect(result.newImplementation?.toLowerCase()).to.equal(implementationV2Address.toLowerCase());
      expect(result.upgraded).to.be.true;
      expect(result.transactionHash).to.exist;
      expect(result.blockNumber).to.be.greaterThan(0);
      expect(result.gasUsed).to.be.greaterThan(0);
      expect(result.error).to.be.undefined;
    });

    it("should return error message on failure", async () => {
      const { proxyAdmin } = await loadFixture(deployTupProxyFixture);
      const invalidAddress = "0x1234567890123456789012345678901234567890";

      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress: invalidAddress,
        newImplementationAddress: ethers.ZeroAddress,
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
      expect(result.error).to.be.a("string");
      expect(result.proxyAddress).to.equal(invalidAddress);
    });

    it("should set upgraded=false when already at target implementation", async () => {
      const { proxyAdmin, proxyAddress, implementationV1Address } = await loadFixture(deployTupProxyFixture);

      // Attempt to "upgrade" to the same implementation
      const result = await upgradeProxy(proxyAdmin, {
        proxyAddress,
        newImplementationAddress: implementationV1Address,
      });

      expect(result.success).to.be.true;
      expect(result.upgraded).to.be.false; // No upgrade needed
      expect(result.oldImplementation).to.exist;
      expect(result.newImplementation).to.exist;
      expect(result.oldImplementation?.toLowerCase()).to.equal(implementationV1Address.toLowerCase());
      expect(result.newImplementation?.toLowerCase()).to.equal(implementationV1Address.toLowerCase());
      expect(result.transactionHash).to.be.undefined; // No transaction executed
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
      expect(newImplAddress).to.not.equal(ethers.ZeroAddress);

      // Verify proxy is still at V1
      const currentImpl = await getProxyImplementation(ethers.provider, proxyAddress);
      expect(currentImpl.toLowerCase()).to.not.equal(newImplAddress.toLowerCase());
    });
  });
});
