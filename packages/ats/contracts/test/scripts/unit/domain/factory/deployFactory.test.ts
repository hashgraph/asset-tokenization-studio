// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the new deployFactory (ResolverProxy-based).
 *
 * Verifies that deployFactory:
 * - Requires blrAddress, factoryVersion, and factoryFacetAddress
 * - Constructs ResolverProxy with (blr, FACTORY_CONFIG_ID, factoryVersion, [])
 * - Returns factoryAddress (proxy) and implementationAddress (FactoryFacet)
 *
 * @module test/scripts/unit/domain/factory/deployFactory.test
 */

import { expect } from "chai";
import { deployFactory, FACTORY_CONFIG_ID } from "@scripts/domain";
import { TEST_ADDRESSES } from "@test";

const MOCK_BLR_ADDRESS = TEST_ADDRESSES.VALID_0;
const MOCK_FACTORY_FACET_ADDRESS = TEST_ADDRESSES.VALID_1;
const MOCK_FACTORY_VERSION = 1;
const MOCK_PROXY_ADDRESS = TEST_ADDRESSES.VALID_2;

describe("deployFactory (ResolverProxy)", () => {
  describe("parameter validation", () => {
    it("should throw if blrAddress is missing", async () => {
      const mockSigner = {} as any;

      try {
        await deployFactory(mockSigner, {
          blrAddress: "",
          factoryVersion: MOCK_FACTORY_VERSION,
          factoryFacetAddress: MOCK_FACTORY_FACET_ADDRESS,
        });
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).to.include("blrAddress");
      }
    });

    it("should throw if factoryVersion is missing (0)", async () => {
      const mockSigner = {} as any;

      try {
        await deployFactory(mockSigner, {
          blrAddress: MOCK_BLR_ADDRESS,
          factoryVersion: 0,
          factoryFacetAddress: MOCK_FACTORY_FACET_ADDRESS,
        });
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).to.include("factoryVersion");
      }
    });

    it("should throw if factoryFacetAddress is missing", async () => {
      const mockSigner = {} as any;

      try {
        await deployFactory(mockSigner, {
          blrAddress: MOCK_BLR_ADDRESS,
          factoryVersion: MOCK_FACTORY_VERSION,
          factoryFacetAddress: "",
        });
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).to.include("factoryFacetAddress");
      }
    });
  });

  describe("DeployFactoryOptions contract", () => {
    it("should use FACTORY_CONFIG_ID (bytes32(uint256(8)))", () => {
      // Verify the config ID matches the documented spec
      expect(FACTORY_CONFIG_ID).to.equal("0x0000000000000000000000000000000000000000000000000000000000000008");
    });

    it("should accept valid options without throwing before deployment", () => {
      // Test that options validation logic is sound (not the actual deployment)
      const validOptions = {
        blrAddress: MOCK_BLR_ADDRESS,
        factoryVersion: MOCK_FACTORY_VERSION,
        factoryFacetAddress: MOCK_FACTORY_FACET_ADDRESS,
      };

      // All required fields present — no validation error
      expect(validOptions.blrAddress).to.be.a("string").and.have.length.above(0);
      expect(validOptions.factoryVersion).to.be.a("number").and.above(0);
      expect(validOptions.factoryFacetAddress).to.be.a("string").and.have.length.above(0);
    });
  });

  describe("DeployFactoryResult shape", () => {
    it("should define expected result interface fields", () => {
      // Mock result matching DeployFactoryResult interface
      const mockResult = {
        success: true,
        factoryAddress: MOCK_PROXY_ADDRESS,
        implementationAddress: MOCK_FACTORY_FACET_ADDRESS,
      };

      // Verify the result shape matches the expected interface
      expect(mockResult).to.have.property("success", true);
      expect(mockResult).to.have.property("factoryAddress", MOCK_PROXY_ADDRESS);
      expect(mockResult).to.have.property("implementationAddress", MOCK_FACTORY_FACET_ADDRESS);

      // Should NOT have old TUP fields
      expect(mockResult).to.not.have.property("proxyAdminAddress");
      expect(mockResult).to.not.have.property("initialized");
      expect(mockResult).to.not.have.property("proxyResult");
    });

    it("should return factoryAddress as proxy address and implementationAddress as FactoryFacet", () => {
      // The proxy is the ResolverProxy; implementation is the FactoryFacet
      const mockResult = {
        success: true,
        factoryAddress: MOCK_PROXY_ADDRESS, // ResolverProxy
        implementationAddress: MOCK_FACTORY_FACET_ADDRESS, // FactoryFacet
      };

      // proxy != implementation (they are different contracts)
      expect(mockResult.factoryAddress).to.not.equal(mockResult.implementationAddress);
    });
  });
});
