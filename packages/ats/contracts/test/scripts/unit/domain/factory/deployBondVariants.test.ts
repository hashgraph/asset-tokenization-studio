// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for Bond variant deployments from Factory.
 *
 * Tests the unified deployBondFromFactory function with different BondRateType
 * values, verifying that:
 * - Variable rate calls factory.deployBond and uses BOND_CONFIG_ID
 * - All bond variants share the unified BOND_CONFIG_ID resolver key
 *
 * Fixed, KpiLinked, and Spt rate types are deployed via factory contract methods
 * (deployBondFixedRate, deployBondKpiLinkedRate, deployBondSustainabilityPerformanceTargetRate)
 * directly from fixtures, not via deployBondFromFactory.
 *
 * @module test/scripts/unit/domain/factory/deployBondVariants.test
 */

import { expect } from "chai";
import sinon from "sinon";
import { deployBondFromFactory, BOND_CONFIG_ID, BondRateType } from "@scripts/domain";
import { TEST_ADDRESSES, TEST_FACTORY_EVENTS } from "@test";
import {
  createMockFactory,
  createMockRegulationData,
  createDeployBondParams,
  createMockFactoryWithWrongEvent,
  createMockFactoryWithNoArgs,
  createMockFactoryWithZeroAddress,
} from "./helpers/mockFactories";

describe("Bond Variant Deployments", () => {
  afterEach(() => {
    sinon.restore();
  });

  // ============================================================================
  // Variable Rate Tests (default behaviour)
  // ============================================================================

  describe("deployBondFromFactory — Variable rate (default)", () => {
    describe("resolver configuration", () => {
      it("should use BOND_CONFIG_ID for Variable rate", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();

        await deployBondFromFactory(params, regulationData);

        const callArgs = mockFactory.deployBond.getCall(0).args[0];
        const config = callArgs.security.resolverProxyConfiguration;

        expect(config.key).to.equal(BOND_CONFIG_ID);
      });

      it("should use BOND_CONFIG_ID when rateType is explicitly Variable", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
        const params = { ...createDeployBondParams(mockFactory), rateType: BondRateType.Variable };
        const regulationData = createMockRegulationData();

        await deployBondFromFactory(params, regulationData);

        const callArgs = mockFactory.deployBond.getCall(0).args[0];
        const config = callArgs.security.resolverProxyConfiguration;

        expect(config.key).to.equal(BOND_CONFIG_ID);
      });
    });

    describe("factory call", () => {
      it("should call factory.deployBond for Variable rate", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();

        await deployBondFromFactory(params, regulationData);

        expect(mockFactory.deployBond.calledOnce).to.be.true;
        expect(mockFactory.deployBondFixedRate.called).to.be.false;
        expect(mockFactory.deployBondKpiLinkedRate.called).to.be.false;
        expect(mockFactory.deployBondSustainabilityPerformanceTargetRate.called).to.be.false;
        expect(mockFactory.deployEquity.called).to.be.false;
      });

      it("should include bond data and regulation data nested in single argument", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();

        await deployBondFromFactory(params, regulationData);

        const callArgs = mockFactory.deployBond.getCall(0).args[0];

        expect(callArgs).to.have.property("security");
        expect(callArgs).to.have.property("bondDetails");
        expect(callArgs).to.have.property("proceedRecipients");
        expect(callArgs).to.have.property("proceedRecipientsData");
      });
    });

    describe("event parsing", () => {
      it("should look for BondDeployed event", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();

        const result = await deployBondFromFactory(params, regulationData);

        expect(result.target).to.equal(diamondAddress);
      });

      it("should throw if BondDeployed event not found", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactoryWithWrongEvent(diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();

        await expect(deployBondFromFactory(params, regulationData)).to.be.rejectedWith("BondDeployed event not found");
      });

      it("should throw if event has no args", async () => {
        const mockFactory = createMockFactoryWithNoArgs(TEST_FACTORY_EVENTS.BOND_DEPLOYED);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();

        await expect(deployBondFromFactory(params, regulationData)).to.be.rejectedWith("BondDeployed event not found");
      });

      it("should throw if diamondAddress is zero address", async () => {
        const mockFactory = createMockFactoryWithZeroAddress(TEST_FACTORY_EVENTS.BOND_DEPLOYED);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();

        await expect(deployBondFromFactory(params, regulationData)).to.be.rejectedWith("Invalid diamond address");
      });
    });
  });

  // ============================================================================
  // Non-Variable Rate Tests — factory contract stubs are still reachable
  // ============================================================================

  describe("Mock factory — rate-specific contract methods", () => {
    it("mock factory should have deployBondFixedRate stub", () => {
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_FIXED_RATE_DEPLOYED, TEST_ADDRESSES.VALID_3);
      expect(typeof mockFactory.deployBondFixedRate).to.equal("function");
    });

    it("mock factory should have deployBondKpiLinkedRate stub", () => {
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_KPI_LINKED_RATE_DEPLOYED, TEST_ADDRESSES.VALID_3);
      expect(typeof mockFactory.deployBondKpiLinkedRate).to.equal("function");
    });

    it("mock factory should have deployBondSustainabilityPerformanceTargetRate stub", () => {
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_SPT_DEPLOYED, TEST_ADDRESSES.VALID_3);
      expect(typeof mockFactory.deployBondSustainabilityPerformanceTargetRate).to.equal("function");
    });
  });

  // ============================================================================
  // BondRateType enum values (stability contract)
  // ============================================================================

  describe("BondRateType enum ordinal stability", () => {
    it("Variable should have ordinal 0", () => {
      expect(BondRateType.Variable).to.equal(0);
    });

    it("Fixed should have ordinal 1", () => {
      expect(BondRateType.Fixed).to.equal(1);
    });

    it("KpiLinked should have ordinal 2", () => {
      expect(BondRateType.KpiLinked).to.equal(2);
    });

    it("Spt should have ordinal 3", () => {
      expect(BondRateType.Spt).to.equal(3);
    });
  });
});
