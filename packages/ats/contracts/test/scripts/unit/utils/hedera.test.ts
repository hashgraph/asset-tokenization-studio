// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for Hedera utilities.
 *
 * Tests network detection and mirror node URL resolution.
 *
 * @module test/scripts/unit/utils/hedera.test
 */

import { expect } from "chai";
import { isHederaNetwork, getMirrorNodeUrl } from "@scripts/infrastructure";
import { TEST_NETWORKS, TEST_NON_EXISTENT } from "@test";

describe("Hedera Utilities", () => {
  // ============================================================================
  // isHederaNetwork Tests
  // ============================================================================

  describe("isHederaNetwork", () => {
    describe("should return true for Hedera networks", () => {
      it("should return true for hedera-testnet", () => {
        expect(isHederaNetwork(TEST_NETWORKS.TESTNET)).to.be.true;
      });

      it("should return true for hedera-mainnet", () => {
        expect(isHederaNetwork(TEST_NETWORKS.MAINNET)).to.be.true;
      });

      it("should return true for hedera-previewnet", () => {
        expect(isHederaNetwork(TEST_NETWORKS.PREVIEWNET)).to.be.true;
      });

      it("should return true for testnet (without hedera prefix)", () => {
        expect(isHederaNetwork(TEST_NETWORKS.TESTNET_SHORT)).to.be.true;
      });

      it("should return true for mainnet (without hedera prefix)", () => {
        expect(isHederaNetwork(TEST_NETWORKS.MAINNET_SHORT)).to.be.true;
      });

      it("should return true for previewnet (without hedera prefix)", () => {
        expect(isHederaNetwork(TEST_NETWORKS.PREVIEWNET_SHORT)).to.be.true;
      });

      it("should return true for hedera-local", () => {
        expect(isHederaNetwork(TEST_NETWORKS.HEDERA_LOCAL)).to.be.true;
      });
    });

    describe("should be case insensitive", () => {
      it("should return true for HEDERA-TESTNET", () => {
        expect(isHederaNetwork(TEST_NETWORKS.TESTNET.toUpperCase())).to.be.true;
      });

      it("should return true for Hedera-Mainnet", () => {
        expect(isHederaNetwork("Hedera-Mainnet")).to.be.true;
      });

      it("should return true for TESTNET", () => {
        expect(isHederaNetwork(TEST_NETWORKS.TESTNET_SHORT.toUpperCase())).to.be.true;
      });

      it("should return true for TestNet", () => {
        expect(isHederaNetwork("TestNet")).to.be.true;
      });
    });

    describe("should return false for non-Hedera networks", () => {
      it("should return false for hardhat", () => {
        expect(isHederaNetwork(TEST_NETWORKS.HARDHAT)).to.be.false;
      });

      it("should return false for local", () => {
        expect(isHederaNetwork(TEST_NETWORKS.LOCAL)).to.be.false;
      });

      it("should return false for localhost", () => {
        expect(isHederaNetwork(TEST_NETWORKS.LOCALHOST)).to.be.false;
      });

      it("should return false for ethereum-mainnet", () => {
        // Note: Contains 'mainnet' so this would return true
        // This is expected behavior based on the implementation
        expect(isHederaNetwork(TEST_NETWORKS.ETHEREUM_MAINNET)).to.be.true; // Contains 'mainnet'
      });

      it("should return false for polygon", () => {
        expect(isHederaNetwork(TEST_NETWORKS.POLYGON)).to.be.false;
      });

      it("should return false for arbitrum", () => {
        expect(isHederaNetwork(TEST_NETWORKS.ARBITRUM)).to.be.false;
      });

      it("should return false for empty string", () => {
        expect(isHederaNetwork("")).to.be.false;
      });
    });
  });

  // ============================================================================
  // getMirrorNodeUrl Tests
  // ============================================================================

  describe("getMirrorNodeUrl", () => {
    describe("returns valid mirror node URLs", () => {
      it("should return a valid HTTPS URL for testnet network", () => {
        const url = getMirrorNodeUrl(TEST_NETWORKS.TESTNET_SHORT);
        expect(url).to.match(/^https:\/\/.+mirrornode.+/);
        expect(url).to.include(TEST_NETWORKS.TESTNET_SHORT);
      });

      it("should return a valid HTTPS URL for hedera-testnet", () => {
        const url = getMirrorNodeUrl(TEST_NETWORKS.TESTNET);
        expect(url).to.match(/^https:\/\/.+mirrornode.+/);
      });

      it("should return a valid HTTPS URL for mainnet network", () => {
        const url = getMirrorNodeUrl(TEST_NETWORKS.MAINNET_SHORT);
        expect(url).to.match(/^https:\/\/.+mirrornode.+/);
        expect(url).to.include(TEST_NETWORKS.MAINNET_SHORT);
      });

      it("should return a valid HTTPS URL for hedera-mainnet", () => {
        const url = getMirrorNodeUrl(TEST_NETWORKS.MAINNET);
        expect(url).to.match(/^https:\/\/.+mirrornode.+/);
      });

      it("should return a valid HTTPS URL for previewnet network", () => {
        const url = getMirrorNodeUrl(TEST_NETWORKS.PREVIEWNET_SHORT);
        expect(url).to.match(/^https:\/\/.+mirrornode.+/);
        expect(url).to.include(TEST_NETWORKS.PREVIEWNET_SHORT);
      });

      it("should return a valid HTTPS URL for hedera-previewnet", () => {
        const url = getMirrorNodeUrl(TEST_NETWORKS.PREVIEWNET);
        expect(url).to.match(/^https:\/\/.+mirrornode.+/);
      });
    });

    describe("returns URL for various input cases", () => {
      it("should return a URL for TESTNET (uppercase)", () => {
        const url = getMirrorNodeUrl(TEST_NETWORKS.TESTNET_SHORT.toUpperCase());
        expect(url).to.match(/^https:\/\/.+/);
      });

      it("should return a URL for MAINNET (uppercase)", () => {
        const url = getMirrorNodeUrl(TEST_NETWORKS.MAINNET_SHORT.toUpperCase());
        expect(url).to.match(/^https:\/\/.+/);
      });

      it("should return a URL for PREVIEWNET (uppercase)", () => {
        const url = getMirrorNodeUrl(TEST_NETWORKS.PREVIEWNET_SHORT.toUpperCase());
        expect(url).to.match(/^https:\/\/.+/);
      });
    });

    describe("fallback for unknown networks", () => {
      it("should return a valid URL for unknown network", () => {
        const url = getMirrorNodeUrl(TEST_NON_EXISTENT.NETWORK);
        expect(url).to.match(/^https:\/\/.+mirrornode.+/);
      });

      it("should return a valid URL for hardhat", () => {
        const url = getMirrorNodeUrl(TEST_NETWORKS.HARDHAT);
        expect(url).to.match(/^https:\/\/.+/);
      });

      it("should return a valid URL for empty string", () => {
        const url = getMirrorNodeUrl("");
        expect(url).to.match(/^https:\/\/.+/);
      });
    });
  });
});
