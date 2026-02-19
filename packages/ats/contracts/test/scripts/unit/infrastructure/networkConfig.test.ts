// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for network configuration utilities.
 *
 * Tests network-specific deployment configuration lookup
 * and network type detection functions.
 *
 * @module test/scripts/unit/infrastructure/networkConfig.test
 */

import { expect } from "chai";
import {
  getDeploymentConfig,
  isLocalNetwork,
  isInstantMiningNetwork,
  DEPLOYMENT_CONFIGS,
  KNOWN_NETWORKS,
} from "@scripts/infrastructure";
import { TEST_NETWORKS, TEST_NON_EXISTENT, TEST_INVALID_INPUTS } from "@test";

describe("Network Configuration", () => {
  // ============================================================================
  // getDeploymentConfig Tests
  // ============================================================================

  describe("getDeploymentConfig", () => {
    it("should return hardhat config for hardhat network", () => {
      const config = getDeploymentConfig("hardhat");

      expect(config.confirmations).to.equal(0);
      expect(config.timeout).to.equal(10_000);
      expect(config.retryOptions.maxRetries).to.equal(0);
      expect(config.verifyDeployment).to.be.false;
    });

    it("should return local config for local network", () => {
      const config = getDeploymentConfig("local");

      expect(config.confirmations).to.equal(1);
      expect(config.timeout).to.equal(10_000);
      expect(config.retryOptions.maxRetries).to.equal(0);
      expect(config.verifyDeployment).to.be.true;
    });

    it("should return hedera-local config", () => {
      const config = getDeploymentConfig("hedera-local");

      expect(config.confirmations).to.equal(1);
      expect(config.timeout).to.equal(60_000);
      expect(config.retryOptions.maxRetries).to.equal(1);
      expect(config.verifyDeployment).to.be.true;
    });

    it("should return hedera-testnet config", () => {
      const config = getDeploymentConfig("hedera-testnet");

      expect(config.confirmations).to.equal(2);
      expect(config.timeout).to.equal(120_000);
      expect(config.retryOptions.maxRetries).to.equal(2);
      expect(config.retryOptions.baseDelay).to.equal(1000);
      expect(config.retryOptions.maxDelay).to.equal(4000);
      expect(config.verifyDeployment).to.be.true;
    });

    it("should return hedera-previewnet config", () => {
      const config = getDeploymentConfig("hedera-previewnet");

      expect(config.confirmations).to.equal(2);
      expect(config.timeout).to.equal(120_000);
      expect(config.retryOptions.maxRetries).to.equal(2);
    });

    it("should return hedera-mainnet config with conservative settings", () => {
      const config = getDeploymentConfig("hedera-mainnet");

      expect(config.confirmations).to.equal(3);
      expect(config.timeout).to.equal(300_000); // 5 minutes
      expect(config.retryOptions.maxRetries).to.equal(3);
      expect(config.retryOptions.baseDelay).to.equal(2000);
      expect(config.retryOptions.maxDelay).to.equal(8000);
    });

    it("should fallback to testnet config for unknown networks", () => {
      const config = getDeploymentConfig(TEST_NON_EXISTENT.NETWORK);
      const testnetConfig = getDeploymentConfig(TEST_NETWORKS.TESTNET);

      expect(config).to.deep.equal(testnetConfig);
    });

    it("should fallback to testnet config for empty string", () => {
      const config = getDeploymentConfig(TEST_INVALID_INPUTS.EMPTY);
      const testnetConfig = getDeploymentConfig(TEST_NETWORKS.TESTNET);

      expect(config).to.deep.equal(testnetConfig);
    });

    it("should use KNOWN_NETWORKS constants correctly", () => {
      const hardhatConfig = getDeploymentConfig(KNOWN_NETWORKS.HARDHAT);
      const testnetConfig = getDeploymentConfig(KNOWN_NETWORKS.HEDERA_TESTNET);
      const mainnetConfig = getDeploymentConfig(KNOWN_NETWORKS.HEDERA_MAINNET);

      expect(hardhatConfig.confirmations).to.equal(0);
      expect(testnetConfig.confirmations).to.equal(2);
      expect(mainnetConfig.confirmations).to.equal(3);
    });
  });

  // ============================================================================
  // isInstantMiningNetwork Tests
  // ============================================================================

  describe("isInstantMiningNetwork", () => {
    it("should return true for hardhat network", () => {
      expect(isInstantMiningNetwork(TEST_NETWORKS.HARDHAT)).to.be.true;
    });

    it("should return true for local network", () => {
      expect(isInstantMiningNetwork(TEST_NETWORKS.LOCAL)).to.be.true;
    });

    it("should return false for hedera-local (simulates real network)", () => {
      expect(isInstantMiningNetwork(TEST_NETWORKS.HEDERA_LOCAL)).to.be.false;
    });

    it("should return false for hedera-testnet", () => {
      expect(isInstantMiningNetwork(TEST_NETWORKS.TESTNET)).to.be.false;
    });

    it("should return false for hedera-mainnet", () => {
      expect(isInstantMiningNetwork(TEST_NETWORKS.MAINNET)).to.be.false;
    });

    it("should return false for unknown networks", () => {
      expect(isInstantMiningNetwork(TEST_NON_EXISTENT.NETWORK)).to.be.false;
    });

    it("should return false for empty string", () => {
      expect(isInstantMiningNetwork(TEST_INVALID_INPUTS.EMPTY)).to.be.false;
    });

    it("should be case sensitive", () => {
      expect(isInstantMiningNetwork(TEST_NETWORKS.HARDHAT.toUpperCase())).to.be.false;
      expect(isInstantMiningNetwork("Hardhat")).to.be.false;
    });
  });

  // ============================================================================
  // isLocalNetwork Tests (deprecated alias)
  // ============================================================================

  describe("isLocalNetwork (deprecated)", () => {
    it("should behave identically to isInstantMiningNetwork", () => {
      expect(isLocalNetwork(TEST_NETWORKS.HARDHAT)).to.equal(isInstantMiningNetwork(TEST_NETWORKS.HARDHAT));
      expect(isLocalNetwork(TEST_NETWORKS.LOCAL)).to.equal(isInstantMiningNetwork(TEST_NETWORKS.LOCAL));
      expect(isLocalNetwork(TEST_NETWORKS.HEDERA_LOCAL)).to.equal(isInstantMiningNetwork(TEST_NETWORKS.HEDERA_LOCAL));
      expect(isLocalNetwork(TEST_NETWORKS.TESTNET)).to.equal(isInstantMiningNetwork(TEST_NETWORKS.TESTNET));
    });
  });

  // ============================================================================
  // DEPLOYMENT_CONFIGS Structure Tests
  // ============================================================================

  describe("DEPLOYMENT_CONFIGS", () => {
    it("should have all expected networks", () => {
      const expectedNetworks = [
        "hardhat",
        "local",
        "hedera-local",
        "hedera-previewnet",
        "hedera-testnet",
        "hedera-mainnet",
      ];

      expectedNetworks.forEach((network) => {
        expect(DEPLOYMENT_CONFIGS[network], `Missing config for ${network}`).to.exist;
      });
    });

    it("should have required properties on all configs", () => {
      Object.entries(DEPLOYMENT_CONFIGS).forEach(([network, config]) => {
        expect(config.confirmations, `${network}.confirmations`).to.be.a("number");
        expect(config.timeout, `${network}.timeout`).to.be.a("number");
        expect(config.verifyDeployment, `${network}.verifyDeployment`).to.be.a("boolean");
        expect(config.retryOptions, `${network}.retryOptions`).to.exist;
        expect(config.retryOptions.maxRetries, `${network}.retryOptions.maxRetries`).to.be.a("number");
        expect(config.retryOptions.baseDelay, `${network}.retryOptions.baseDelay`).to.be.a("number");
        expect(config.retryOptions.maxDelay, `${network}.retryOptions.maxDelay`).to.be.a("number");
        expect(config.retryOptions.logRetries, `${network}.retryOptions.logRetries`).to.be.a("boolean");
      });
    });

    it("should have local networks with shorter timeouts than remote", () => {
      expect(DEPLOYMENT_CONFIGS["hardhat"].timeout).to.be.lessThan(DEPLOYMENT_CONFIGS["hedera-testnet"].timeout);
      expect(DEPLOYMENT_CONFIGS["local"].timeout).to.be.lessThan(DEPLOYMENT_CONFIGS["hedera-testnet"].timeout);
    });

    it("should have mainnet with most confirmations", () => {
      const mainnetConfirmations = DEPLOYMENT_CONFIGS["hedera-mainnet"].confirmations;
      const testnetConfirmations = DEPLOYMENT_CONFIGS["hedera-testnet"].confirmations;

      expect(mainnetConfirmations).to.be.greaterThan(testnetConfirmations);
    });
  });

  // ============================================================================
  // KNOWN_NETWORKS Constants Tests
  // ============================================================================

  describe("KNOWN_NETWORKS", () => {
    it("should have all expected network constants", () => {
      expect(KNOWN_NETWORKS.HARDHAT).to.equal("hardhat");
      expect(KNOWN_NETWORKS.LOCAL).to.equal("local");
      expect(KNOWN_NETWORKS.HEDERA_LOCAL).to.equal("hedera-local");
      expect(KNOWN_NETWORKS.HEDERA_PREVIEWNET).to.equal("hedera-previewnet");
      expect(KNOWN_NETWORKS.HEDERA_TESTNET).to.equal("hedera-testnet");
      expect(KNOWN_NETWORKS.HEDERA_MAINNET).to.equal("hedera-mainnet");
    });
  });
});
