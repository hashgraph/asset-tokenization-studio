// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for Factory deployment utilities.
 *
 * Tests pure functions like getFactoryDeploymentSummary that don't require
 * actual contract deployment interactions.
 *
 * @module test/scripts/unit/domain/factory/deploy.test
 */

import { expect } from "chai";
import { getFactoryDeploymentSummary, type DeployFactoryResult } from "@scripts/domain";
import { TEST_ADDRESSES } from "@test";
import { createMockDeployFactoryResult } from "./helpers/mockFactories";

describe("Factory Deployment Utilities", () => {
  // ============================================================================
  // getFactoryDeploymentSummary Tests
  // ============================================================================

  describe("getFactoryDeploymentSummary", () => {
    it("should extract factoryAddress from result", () => {
      const result = createMockDeployFactoryResult({
        factoryAddress: TEST_ADDRESSES.VALID_0,
      });

      const summary = getFactoryDeploymentSummary(result as DeployFactoryResult);

      expect(summary.factoryAddress).to.equal(TEST_ADDRESSES.VALID_0);
    });

    it("should extract implementationAddress from result", () => {
      const result = createMockDeployFactoryResult({
        implementationAddress: TEST_ADDRESSES.VALID_1,
      });

      const summary = getFactoryDeploymentSummary(result as DeployFactoryResult);

      expect(summary.implementationAddress).to.equal(TEST_ADDRESSES.VALID_1);
    });

    it("should extract proxyAdminAddress from result", () => {
      const result = createMockDeployFactoryResult({
        proxyAdminAddress: TEST_ADDRESSES.VALID_2,
      });

      const summary = getFactoryDeploymentSummary(result as DeployFactoryResult);

      expect(summary.proxyAdminAddress).to.equal(TEST_ADDRESSES.VALID_2);
    });

    it("should extract initialized flag from result", () => {
      const resultTrue = createMockDeployFactoryResult({ initialized: true });
      const resultFalse = createMockDeployFactoryResult({ initialized: false });

      const summaryTrue = getFactoryDeploymentSummary(resultTrue as DeployFactoryResult);
      const summaryFalse = getFactoryDeploymentSummary(resultFalse as DeployFactoryResult);

      expect(summaryTrue.initialized).to.be.true;
      expect(summaryFalse.initialized).to.be.false;
    });

    it("should extract all required fields", () => {
      const result = createMockDeployFactoryResult({
        factoryAddress: TEST_ADDRESSES.VALID_0,
        implementationAddress: TEST_ADDRESSES.VALID_1,
        proxyAdminAddress: TEST_ADDRESSES.VALID_2,
        initialized: false,
      });

      const summary = getFactoryDeploymentSummary(result as DeployFactoryResult);

      expect(summary).to.have.all.keys(["factoryAddress", "implementationAddress", "proxyAdminAddress", "initialized"]);
    });

    it("should return consistent summary object structure", () => {
      const result = createMockDeployFactoryResult();

      const summary = getFactoryDeploymentSummary(result as DeployFactoryResult);

      expect(summary).to.be.an("object");
      expect(typeof summary.factoryAddress).to.equal("string");
      expect(typeof summary.implementationAddress).to.equal("string");
      expect(typeof summary.proxyAdminAddress).to.equal("string");
      expect(typeof summary.initialized).to.equal("boolean");
    });

    it("should handle different addresses correctly", () => {
      const addresses = [
        { factory: TEST_ADDRESSES.VALID_0, impl: TEST_ADDRESSES.VALID_1, admin: TEST_ADDRESSES.VALID_2 },
        { factory: TEST_ADDRESSES.VALID_3, impl: TEST_ADDRESSES.VALID_4, admin: TEST_ADDRESSES.VALID_5 },
        { factory: TEST_ADDRESSES.VALID_6, impl: TEST_ADDRESSES.VALID_0, admin: TEST_ADDRESSES.VALID_1 },
      ];

      addresses.forEach(({ factory, impl, admin }) => {
        const result = createMockDeployFactoryResult({
          factoryAddress: factory,
          implementationAddress: impl,
          proxyAdminAddress: admin,
        });

        const summary = getFactoryDeploymentSummary(result as DeployFactoryResult);

        expect(summary.factoryAddress).to.equal(factory);
        expect(summary.implementationAddress).to.equal(impl);
        expect(summary.proxyAdminAddress).to.equal(admin);
      });
    });

    it("should not modify the original result object", () => {
      const result = createMockDeployFactoryResult({
        factoryAddress: TEST_ADDRESSES.VALID_0,
        implementationAddress: TEST_ADDRESSES.VALID_1,
        proxyAdminAddress: TEST_ADDRESSES.VALID_2,
        initialized: true,
      });

      const originalFactory = result.factoryAddress;
      const originalImpl = result.implementationAddress;
      const originalAdmin = result.proxyAdminAddress;
      const originalInit = result.initialized;

      getFactoryDeploymentSummary(result as DeployFactoryResult);

      expect(result.factoryAddress).to.equal(originalFactory);
      expect(result.implementationAddress).to.equal(originalImpl);
      expect(result.proxyAdminAddress).to.equal(originalAdmin);
      expect(result.initialized).to.equal(originalInit);
    });

    it("should return new object on each call", () => {
      const result = createMockDeployFactoryResult();

      const summary1 = getFactoryDeploymentSummary(result as DeployFactoryResult);
      const summary2 = getFactoryDeploymentSummary(result as DeployFactoryResult);

      expect(summary1).to.not.equal(summary2);
      expect(summary1).to.deep.equal(summary2);
    });
  });
});
