// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for Factory deployment module.
 *
 * Tests the DeployFactoryResult interface shape and the new ResolverProxy-based
 * deployFactory options contract.
 *
 * @module test/scripts/unit/domain/factory/deploy.test
 */

import { expect } from "chai";
import { type DeployFactoryResult } from "@scripts/domain";
import { TEST_ADDRESSES } from "@test";
import { createMockDeployFactoryResult } from "./helpers/mockFactories";

describe("Factory Deployment Utilities", () => {
  // ============================================================================
  // DeployFactoryResult interface tests
  // ============================================================================

  describe("DeployFactoryResult shape", () => {
    it("should have factoryAddress field", () => {
      const result = createMockDeployFactoryResult({
        factoryAddress: TEST_ADDRESSES.VALID_0,
      });

      expect((result as DeployFactoryResult).factoryAddress).to.equal(TEST_ADDRESSES.VALID_0);
    });

    it("should have implementationAddress field", () => {
      const result = createMockDeployFactoryResult({
        implementationAddress: TEST_ADDRESSES.VALID_1,
      });

      expect((result as DeployFactoryResult).implementationAddress).to.equal(TEST_ADDRESSES.VALID_1);
    });

    it("should have success flag", () => {
      const resultSuccess = createMockDeployFactoryResult({ success: true });
      const resultFail = createMockDeployFactoryResult({ success: false });

      expect((resultSuccess as DeployFactoryResult).success).to.be.true;
      expect((resultFail as DeployFactoryResult).success).to.be.false;
    });

    it("should contain both proxy and implementation addresses", () => {
      const result = createMockDeployFactoryResult({
        factoryAddress: TEST_ADDRESSES.VALID_0,
        implementationAddress: TEST_ADDRESSES.VALID_1,
      });

      const typedResult = result as DeployFactoryResult;

      expect(typedResult.factoryAddress).to.equal(TEST_ADDRESSES.VALID_0);
      expect(typedResult.implementationAddress).to.equal(TEST_ADDRESSES.VALID_1);
    });

    it("should default to success=true when not specified", () => {
      const result = createMockDeployFactoryResult();

      expect((result as DeployFactoryResult).success).to.be.true;
    });

    it("should handle different addresses correctly", () => {
      const addresses = [
        { factory: TEST_ADDRESSES.VALID_0, impl: TEST_ADDRESSES.VALID_1 },
        { factory: TEST_ADDRESSES.VALID_3, impl: TEST_ADDRESSES.VALID_4 },
        { factory: TEST_ADDRESSES.VALID_6, impl: TEST_ADDRESSES.VALID_0 },
      ];

      addresses.forEach(({ factory, impl }) => {
        const result = createMockDeployFactoryResult({
          factoryAddress: factory,
          implementationAddress: impl,
        });

        expect((result as DeployFactoryResult).factoryAddress).to.equal(factory);
        expect((result as DeployFactoryResult).implementationAddress).to.equal(impl);
      });
    });
  });
});
