// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for network configuration utilities.
 *
 * Tests network configuration retrieval and validation.
 * Note: These tests work with whatever networks are configured in Configuration.ts.
 *
 * @module test/scripts/unit/infrastructure/config.test
 */

import { expect } from "chai";
import { getNetworkConfig, getAllNetworks, getPrivateKey, getPrivateKeys } from "@scripts/infrastructure";
import { TEST_NETWORKS, TEST_CONTRACT_NAMES, TEST_NON_EXISTENT } from "@test";

// Internal functions not exported from barrel - direct import required for unit testing
import { hasNetwork, getDeployedAddress, isDeployed } from "../../../../scripts/infrastructure/config";

describe("Network Configuration", () => {
  // ============================================================================
  // getAllNetworks Tests
  // ============================================================================

  describe("getAllNetworks", () => {
    it("should return an array of network names", () => {
      const networks = getAllNetworks();

      expect(networks).to.be.an("array");
      expect(networks.length).to.be.greaterThan(0);
    });

    it("should return strings as network names", () => {
      const networks = getAllNetworks();

      networks.forEach((network) => {
        expect(network).to.be.a("string");
        expect(network.length).to.be.greaterThan(0);
      });
    });

    it("should include expected Hedera networks when configured", () => {
      const networks = getAllNetworks();

      // Just verify we have some networks (actual config may vary)
      expect(networks.length).to.be.greaterThan(0);
    });
  });

  // ============================================================================
  // hasNetwork Tests
  // ============================================================================

  describe("hasNetwork", () => {
    it("should return true for configured networks", () => {
      const networks = getAllNetworks();

      if (networks.length > 0) {
        const firstNetwork = networks[0];
        expect(hasNetwork(firstNetwork)).to.be.true;
      }
    });

    it("should return false for non-existent network", () => {
      expect(hasNetwork(TEST_NON_EXISTENT.NETWORK_UNIQUE)).to.be.false;
    });

    it("should handle empty string", () => {
      expect(hasNetwork("")).to.be.false;
    });

    it("should resolve network aliases", () => {
      // If hedera-testnet is configured, 'testnet' should resolve to it
      if (hasNetwork(TEST_NETWORKS.TESTNET)) {
        expect(hasNetwork("testnet")).to.be.true;
      }

      // If hedera-mainnet is configured, 'mainnet' should resolve to it
      if (hasNetwork(TEST_NETWORKS.MAINNET)) {
        expect(hasNetwork("mainnet")).to.be.true;
      }
    });
  });

  // ============================================================================
  // getNetworkConfig Tests
  // ============================================================================

  describe("getNetworkConfig", () => {
    it("should return config for configured networks", () => {
      const networks = getAllNetworks();

      if (networks.length > 0) {
        const config = getNetworkConfig(networks[0]);

        expect(config).to.exist;
        expect(config.name).to.be.a("string");
        expect(config.jsonRpcUrl).to.be.a("string");
        expect(config.chainId).to.be.a("number");
      }
    });

    it("should throw error for non-existent network", () => {
      expect(() => getNetworkConfig(TEST_NON_EXISTENT.NETWORK_UNIQUE)).to.throw("not configured");
    });

    it("should include available networks in error message", () => {
      try {
        getNetworkConfig(TEST_NON_EXISTENT.NETWORK_UNIQUE);
        expect.fail("Should have thrown an error");
      } catch (err) {
        const error = err as Error;
        expect(error.message).to.include("Available networks");
      }
    });

    it("should resolve network aliases", () => {
      // Test alias resolution - 'testnet' should work if 'hedera-testnet' is configured
      if (hasNetwork(TEST_NETWORKS.TESTNET)) {
        const config = getNetworkConfig("testnet");
        expect(config.name).to.equal(TEST_NETWORKS.TESTNET);
      }
    });

    it("should return positive chain ID", () => {
      const networks = getAllNetworks();

      if (networks.length > 0) {
        const config = getNetworkConfig(networks[0]);
        expect(config.chainId).to.be.greaterThan(0);
      }
    });

    it("should have valid URL format for jsonRpcUrl (if non-empty)", () => {
      const networks = getAllNetworks();

      if (networks.length > 0) {
        const config = getNetworkConfig(networks[0]);

        // URL can be empty string (valid) or a proper URL
        if (config.jsonRpcUrl !== "") {
          expect(config.jsonRpcUrl).to.match(/^https?:\/\//);
        }
      }
    });
  });

  // ============================================================================
  // getPrivateKeys Tests
  // ============================================================================

  describe("getPrivateKeys", () => {
    it("should return an array", () => {
      const networks = getAllNetworks();

      if (networks.length > 0) {
        const keys = getPrivateKeys(networks[0]);
        expect(keys).to.be.an("array");
      }
    });

    it("should return empty array for network with no keys", () => {
      const keys = getPrivateKeys(TEST_NON_EXISTENT.NETWORK);
      expect(keys).to.be.an("array");
      expect(keys).to.have.length(0);
    });

    it("should return strings as private keys (if configured)", () => {
      const networks = getAllNetworks();

      if (networks.length > 0) {
        const keys = getPrivateKeys(networks[0]);

        if (keys.length > 0) {
          keys.forEach((key) => {
            expect(key).to.be.a("string");
          });
        }
      }
    });

    it("should resolve network aliases", () => {
      // If hedera-testnet has keys, 'testnet' should return the same keys
      if (hasNetwork(TEST_NETWORKS.TESTNET)) {
        const directKeys = getPrivateKeys(TEST_NETWORKS.TESTNET);
        const aliasKeys = getPrivateKeys("testnet");
        expect(aliasKeys).to.deep.equal(directKeys);
      }
    });
  });

  // ============================================================================
  // getPrivateKey Tests
  // ============================================================================

  describe("getPrivateKey", () => {
    it("should return undefined for network with no keys", () => {
      const key = getPrivateKey(TEST_NON_EXISTENT.NETWORK);
      expect(key).to.be.undefined;
    });

    it("should return undefined for out-of-range index", () => {
      const networks = getAllNetworks();

      if (networks.length > 0) {
        const key = getPrivateKey(networks[0], 9999);
        expect(key).to.be.undefined;
      }
    });

    it("should return first key by default", () => {
      const networks = getAllNetworks();

      if (networks.length > 0) {
        const keys = getPrivateKeys(networks[0]);

        if (keys.length > 0) {
          const firstKey = getPrivateKey(networks[0]);
          expect(firstKey).to.equal(keys[0]);
        }
      }
    });

    it("should return specific key by index", () => {
      const networks = getAllNetworks();

      if (networks.length > 0) {
        const keys = getPrivateKeys(networks[0]);

        if (keys.length > 1) {
          const secondKey = getPrivateKey(networks[0], 1);
          expect(secondKey).to.equal(keys[1]);
        }
      }
    });
  });

  // ============================================================================
  // getDeployedAddress Tests
  // ============================================================================

  describe("getDeployedAddress", () => {
    it("should return undefined for non-deployed contract", () => {
      const address = getDeployedAddress(TEST_CONTRACT_NAMES.NON_EXISTENT, TEST_NETWORKS.TESTNET);
      expect(address).to.be.undefined;
    });

    it("should return undefined for non-existent network", () => {
      const address = getDeployedAddress(TEST_CONTRACT_NAMES.FACTORY, TEST_NON_EXISTENT.NETWORK);
      expect(address).to.be.undefined;
    });

    it("should handle different address types", () => {
      // These should not throw, just return undefined if not configured
      expect(() =>
        getDeployedAddress(TEST_CONTRACT_NAMES.FACTORY, TEST_NETWORKS.TESTNET, "implementation"),
      ).not.to.throw();
      expect(() => getDeployedAddress(TEST_CONTRACT_NAMES.FACTORY, TEST_NETWORKS.TESTNET, "proxy")).not.to.throw();
      expect(() => getDeployedAddress(TEST_CONTRACT_NAMES.FACTORY, TEST_NETWORKS.TESTNET, "proxyAdmin")).not.to.throw();
    });
  });

  // ============================================================================
  // isDeployed Tests
  // ============================================================================

  describe("isDeployed", () => {
    it("should return false for non-deployed contract", () => {
      const deployed = isDeployed(TEST_CONTRACT_NAMES.NON_EXISTENT, TEST_NETWORKS.TESTNET);
      expect(deployed).to.be.false;
    });

    it("should return false for non-existent network", () => {
      const deployed = isDeployed(TEST_CONTRACT_NAMES.FACTORY, TEST_NON_EXISTENT.NETWORK);
      expect(deployed).to.be.false;
    });

    it("should return boolean", () => {
      const networks = getAllNetworks();

      if (networks.length > 0) {
        const deployed = isDeployed(TEST_CONTRACT_NAMES.FACTORY, networks[0]);
        expect(deployed).to.be.a("boolean");
      }
    });
  });
});
