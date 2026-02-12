// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for Bond variant deployments from Factory.
 *
 * Tests deployBondFixedRateFromFactory, deployBondKpiLinkedRateFromFactory,
 * and deployBondSustainabilityPerformanceTargetRateFromFactory functions.
 *
 * Focuses on unique variant-specific logic since the base bond functionality
 * is already tested in deployBondToken.test.ts.
 *
 * @module test/scripts/unit/domain/factory/deployBondVariants.test
 */

import { expect } from "chai";
import sinon from "sinon";
import {
  deployBondFixedRateFromFactory,
  deployBondKpiLinkedRateFromFactory,
  deployBondSustainabilityPerformanceTargetRateFromFactory,
  BOND_FIXED_RATE_CONFIG_ID,
  BOND_KPI_LINKED_RATE_CONFIG_ID,
  BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_CONFIG_ID,
} from "@scripts/domain";
import { TEST_ADDRESSES, TEST_FACTORY_EVENTS, TEST_INTEREST_RATES, TEST_IMPACT_DATA } from "@test";
import {
  createMockFactory,
  createMockRegulationData,
  createDeployBondParams,
  createMockFactoryWithWrongEvent,
  createMockFactoryWithNoArgs,
  createMockFactoryWithZeroAddress,
  createMockFixedRateParams,
  createMockInterestRateParams,
  createMockInterestRateParamsSPT,
  createMockImpactDataParams,
  createMockImpactDataParamsSPT,
} from "./helpers/mockFactories";

describe("Bond Variant Deployments", () => {
  afterEach(() => {
    sinon.restore();
  });

  // ============================================================================
  // Bond Fixed Rate Tests
  // ============================================================================

  describe("deployBondFixedRateFromFactory", () => {
    describe("fixed rate data structure", () => {
      it("should build fixed rate data structure with rate and rateDecimals", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_FIXED_RATE_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const fixedRateParams = createMockFixedRateParams();

        await deployBondFixedRateFromFactory(params, regulationData, fixedRateParams);

        const callArgs = mockFactory.deployBondFixedRate.getCall(0).args[0];

        expect(callArgs.fixedRateData.rate).to.equal(TEST_INTEREST_RATES.FIXED_RATE);
        expect(callArgs.fixedRateData.rateDecimals).to.equal(TEST_INTEREST_RATES.FIXED_RATE_DECIMALS);
      });

      it("should use custom rate values when provided", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_FIXED_RATE_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const fixedRateParams = { rate: 750, rateDecimals: 3 };

        await deployBondFixedRateFromFactory(params, regulationData, fixedRateParams);

        const callArgs = mockFactory.deployBondFixedRate.getCall(0).args[0];

        expect(callArgs.fixedRateData.rate).to.equal(750);
        expect(callArgs.fixedRateData.rateDecimals).to.equal(3);
      });
    });

    describe("resolver configuration", () => {
      it("should use BOND_FIXED_RATE_CONFIG_ID", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_FIXED_RATE_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const fixedRateParams = createMockFixedRateParams();

        await deployBondFixedRateFromFactory(params, regulationData, fixedRateParams);

        const callArgs = mockFactory.deployBondFixedRate.getCall(0).args[0];
        const config = callArgs.bondData.security.resolverProxyConfiguration;

        expect(config.key).to.equal(BOND_FIXED_RATE_CONFIG_ID);
      });
    });

    describe("factory call", () => {
      it("should call factory.deployBondFixedRate", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_FIXED_RATE_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const fixedRateParams = createMockFixedRateParams();

        await deployBondFixedRateFromFactory(params, regulationData, fixedRateParams);

        expect(mockFactory.deployBondFixedRate.calledOnce).to.be.true;
        expect(mockFactory.deployBond.called).to.be.false;
        expect(mockFactory.deployEquity.called).to.be.false;
      });

      it("should include bond data and regulation data nested in single argument", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_FIXED_RATE_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const fixedRateParams = createMockFixedRateParams();

        await deployBondFixedRateFromFactory(params, regulationData, fixedRateParams);

        const callArgs = mockFactory.deployBondFixedRate.getCall(0).args[0];

        expect(callArgs).to.have.property("bondData");
        expect(callArgs).to.have.property("factoryRegulationData");
        expect(callArgs).to.have.property("fixedRateData");
      });
    });

    describe("event parsing", () => {
      it("should look for BondFixedRateDeployed event", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_FIXED_RATE_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const fixedRateParams = createMockFixedRateParams();

        const result = await deployBondFixedRateFromFactory(params, regulationData, fixedRateParams);

        expect(result.target).to.equal(diamondAddress);
      });

      it("should throw if BondFixedRateDeployed event not found", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactoryWithWrongEvent(diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const fixedRateParams = createMockFixedRateParams();

        await expect(deployBondFixedRateFromFactory(params, regulationData, fixedRateParams)).to.be.rejectedWith(
          "BondFixedRateDeployed event not found",
        );
      });

      it("should throw if event has no args", async () => {
        const mockFactory = createMockFactoryWithNoArgs(TEST_FACTORY_EVENTS.BOND_FIXED_RATE_DEPLOYED);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const fixedRateParams = createMockFixedRateParams();

        await expect(deployBondFixedRateFromFactory(params, regulationData, fixedRateParams)).to.be.rejectedWith(
          "BondFixedRateDeployed event not found",
        );
      });

      it("should throw if diamondAddress is zero address", async () => {
        const mockFactory = createMockFactoryWithZeroAddress(TEST_FACTORY_EVENTS.BOND_FIXED_RATE_DEPLOYED);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const fixedRateParams = createMockFixedRateParams();

        await expect(deployBondFixedRateFromFactory(params, regulationData, fixedRateParams)).to.be.rejectedWith(
          "Invalid diamond address",
        );
      });
    });
  });

  // ============================================================================
  // Bond KPI Linked Rate Tests
  // ============================================================================

  describe("deployBondKpiLinkedRateFromFactory", () => {
    describe("interest rate params structure", () => {
      it("should build interest rate params structure", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_KPI_LINKED_RATE_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParams();
        const impactDataParams = createMockImpactDataParams();

        await deployBondKpiLinkedRateFromFactory(params, regulationData, interestRateParams, impactDataParams);

        const callArgs = mockFactory.deployBondKpiLinkedRate.getCall(0).args[0];

        expect(callArgs.interestRate.maxRate).to.equal(TEST_INTEREST_RATES.MAX_RATE);
        expect(callArgs.interestRate.baseRate).to.equal(TEST_INTEREST_RATES.BASE_RATE);
        expect(callArgs.interestRate.minRate).to.equal(TEST_INTEREST_RATES.MIN_RATE);
        expect(callArgs.interestRate.startPeriod).to.equal(TEST_INTEREST_RATES.START_PERIOD);
        expect(callArgs.interestRate.startRate).to.equal(TEST_INTEREST_RATES.START_RATE);
        expect(callArgs.interestRate.missedPenalty).to.equal(TEST_INTEREST_RATES.MISSED_PENALTY);
        expect(callArgs.interestRate.reportPeriod).to.equal(TEST_INTEREST_RATES.REPORT_PERIOD);
        expect(callArgs.interestRate.rateDecimals).to.equal(TEST_INTEREST_RATES.RATE_DECIMALS);
      });
    });

    describe("impact data params structure", () => {
      it("should build impact data params structure", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_KPI_LINKED_RATE_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParams();
        const impactDataParams = createMockImpactDataParams();

        await deployBondKpiLinkedRateFromFactory(params, regulationData, interestRateParams, impactDataParams);

        const callArgs = mockFactory.deployBondKpiLinkedRate.getCall(0).args[0];

        expect(callArgs.impactData.maxDeviationCap).to.equal(TEST_IMPACT_DATA.MAX_DEVIATION_CAP);
        expect(callArgs.impactData.baseLine).to.equal(TEST_IMPACT_DATA.BASELINE);
        expect(callArgs.impactData.maxDeviationFloor).to.equal(TEST_IMPACT_DATA.MAX_DEVIATION_FLOOR);
        expect(callArgs.impactData.impactDataDecimals).to.equal(TEST_IMPACT_DATA.DECIMALS);
        expect(callArgs.impactData.adjustmentPrecision).to.equal(TEST_IMPACT_DATA.ADJUSTMENT_PRECISION);
      });
    });

    describe("resolver configuration", () => {
      it("should use BOND_KPI_LINKED_RATE_CONFIG_ID", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_KPI_LINKED_RATE_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParams();
        const impactDataParams = createMockImpactDataParams();

        await deployBondKpiLinkedRateFromFactory(params, regulationData, interestRateParams, impactDataParams);

        const callArgs = mockFactory.deployBondKpiLinkedRate.getCall(0).args[0];
        const config = callArgs.bondData.security.resolverProxyConfiguration;

        expect(config.key).to.equal(BOND_KPI_LINKED_RATE_CONFIG_ID);
      });
    });

    describe("factory call", () => {
      it("should call factory.deployBondKpiLinkedRate", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_KPI_LINKED_RATE_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParams();
        const impactDataParams = createMockImpactDataParams();

        await deployBondKpiLinkedRateFromFactory(params, regulationData, interestRateParams, impactDataParams);

        expect(mockFactory.deployBondKpiLinkedRate.calledOnce).to.be.true;
        expect(mockFactory.deployBond.called).to.be.false;
        expect(mockFactory.deployBondFixedRate.called).to.be.false;
      });
    });

    describe("event parsing", () => {
      it("should look for BondKpiLinkedRateDeployed event", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_KPI_LINKED_RATE_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParams();
        const impactDataParams = createMockImpactDataParams();

        const result = await deployBondKpiLinkedRateFromFactory(
          params,
          regulationData,
          interestRateParams,
          impactDataParams,
        );

        expect(result.target).to.equal(diamondAddress);
      });

      it("should throw if BondKpiLinkedRateDeployed event not found", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactoryWithWrongEvent(diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParams();
        const impactDataParams = createMockImpactDataParams();

        await expect(
          deployBondKpiLinkedRateFromFactory(params, regulationData, interestRateParams, impactDataParams),
        ).to.be.rejectedWith("BondKpiLinkedRateDeployed event not found");
      });

      it("should throw if event has no args", async () => {
        const mockFactory = createMockFactoryWithNoArgs(TEST_FACTORY_EVENTS.BOND_KPI_LINKED_RATE_DEPLOYED);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParams();
        const impactDataParams = createMockImpactDataParams();

        await expect(
          deployBondKpiLinkedRateFromFactory(params, regulationData, interestRateParams, impactDataParams),
        ).to.be.rejectedWith("BondKpiLinkedRateDeployed event not found");
      });

      it("should throw if diamondAddress is zero address", async () => {
        const mockFactory = createMockFactoryWithZeroAddress(TEST_FACTORY_EVENTS.BOND_KPI_LINKED_RATE_DEPLOYED);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParams();
        const impactDataParams = createMockImpactDataParams();

        await expect(
          deployBondKpiLinkedRateFromFactory(params, regulationData, interestRateParams, impactDataParams),
        ).to.be.rejectedWith("Invalid diamond address");
      });
    });
  });

  // ============================================================================
  // Bond Sustainability Performance Target Rate Tests
  // ============================================================================

  describe("deployBondSustainabilityPerformanceTargetRateFromFactory", () => {
    describe("SPT interest rate params structure", () => {
      it("should build SPT interest rate params", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_SPT_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParamsSPT();
        const impactDataParams = [createMockImpactDataParamsSPT()];
        const projects = [TEST_ADDRESSES.VALID_4];

        await deployBondSustainabilityPerformanceTargetRateFromFactory(
          params,
          regulationData,
          interestRateParams,
          impactDataParams,
          projects,
        );

        const callArgs = mockFactory.deployBondSustainabilityPerformanceTargetRate.getCall(0).args[0];

        expect(callArgs.interestRate.baseRate).to.equal(TEST_INTEREST_RATES.BASE_RATE);
        expect(callArgs.interestRate.startPeriod).to.equal(TEST_INTEREST_RATES.START_PERIOD);
        expect(callArgs.interestRate.startRate).to.equal(TEST_INTEREST_RATES.START_RATE);
        expect(callArgs.interestRate.rateDecimals).to.equal(TEST_INTEREST_RATES.RATE_DECIMALS);
      });
    });

    describe("SPT impact data array", () => {
      it("should handle impactData array correctly", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_SPT_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParamsSPT();
        const impactDataParams = [
          createMockImpactDataParamsSPT(),
          { ...createMockImpactDataParamsSPT(), baseLine: 600 },
        ];
        const projects = [TEST_ADDRESSES.VALID_4, TEST_ADDRESSES.VALID_5];

        await deployBondSustainabilityPerformanceTargetRateFromFactory(
          params,
          regulationData,
          interestRateParams,
          impactDataParams,
          projects,
        );

        const callArgs = mockFactory.deployBondSustainabilityPerformanceTargetRate.getCall(0).args[0];

        expect(callArgs.impactData).to.be.an("array");
        expect(callArgs.impactData).to.have.length(2);
        expect(callArgs.impactData[0].baseLine).to.equal(TEST_IMPACT_DATA.BASELINE);
        expect(callArgs.impactData[1].baseLine).to.equal(600);
      });

      it("should handle empty impactData array", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_SPT_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParamsSPT();
        const impactDataParams: ReturnType<typeof createMockImpactDataParamsSPT>[] = [];
        const projects: string[] = [];

        await deployBondSustainabilityPerformanceTargetRateFromFactory(
          params,
          regulationData,
          interestRateParams,
          impactDataParams,
          projects,
        );

        const callArgs = mockFactory.deployBondSustainabilityPerformanceTargetRate.getCall(0).args[0];

        expect(callArgs.impactData).to.deep.equal([]);
      });
    });

    describe("projects array", () => {
      it("should handle projects array correctly", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_SPT_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParamsSPT();
        const impactDataParams = [createMockImpactDataParamsSPT()];
        const projects = [TEST_ADDRESSES.VALID_4, TEST_ADDRESSES.VALID_5, TEST_ADDRESSES.VALID_6];

        await deployBondSustainabilityPerformanceTargetRateFromFactory(
          params,
          regulationData,
          interestRateParams,
          impactDataParams,
          projects,
        );

        const callArgs = mockFactory.deployBondSustainabilityPerformanceTargetRate.getCall(0).args[0];

        expect(callArgs.projects).to.deep.equal(projects);
      });

      it("should handle empty projects array", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_SPT_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParamsSPT();
        const impactDataParams: ReturnType<typeof createMockImpactDataParamsSPT>[] = [];
        const projects: string[] = [];

        await deployBondSustainabilityPerformanceTargetRateFromFactory(
          params,
          regulationData,
          interestRateParams,
          impactDataParams,
          projects,
        );

        const callArgs = mockFactory.deployBondSustainabilityPerformanceTargetRate.getCall(0).args[0];

        expect(callArgs.projects).to.deep.equal([]);
      });
    });

    describe("resolver configuration", () => {
      it("should use BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_CONFIG_ID", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_SPT_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParamsSPT();
        const impactDataParams = [createMockImpactDataParamsSPT()];
        const projects = [TEST_ADDRESSES.VALID_4];

        await deployBondSustainabilityPerformanceTargetRateFromFactory(
          params,
          regulationData,
          interestRateParams,
          impactDataParams,
          projects,
        );

        const callArgs = mockFactory.deployBondSustainabilityPerformanceTargetRate.getCall(0).args[0];
        const config = callArgs.bondData.security.resolverProxyConfiguration;

        expect(config.key).to.equal(BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_CONFIG_ID);
      });
    });

    describe("factory call", () => {
      it("should call factory.deployBondSustainabilityPerformanceTargetRate", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_SPT_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParamsSPT();
        const impactDataParams = [createMockImpactDataParamsSPT()];
        const projects = [TEST_ADDRESSES.VALID_4];

        await deployBondSustainabilityPerformanceTargetRateFromFactory(
          params,
          regulationData,
          interestRateParams,
          impactDataParams,
          projects,
        );

        expect(mockFactory.deployBondSustainabilityPerformanceTargetRate.calledOnce).to.be.true;
        expect(mockFactory.deployBond.called).to.be.false;
        expect(mockFactory.deployBondFixedRate.called).to.be.false;
        expect(mockFactory.deployBondKpiLinkedRate.called).to.be.false;
      });
    });

    describe("event parsing", () => {
      it("should look for BondSustainabilityPerformanceTargetRateDeployed event", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_SPT_DEPLOYED, diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParamsSPT();
        const impactDataParams = [createMockImpactDataParamsSPT()];
        const projects = [TEST_ADDRESSES.VALID_4];

        const result = await deployBondSustainabilityPerformanceTargetRateFromFactory(
          params,
          regulationData,
          interestRateParams,
          impactDataParams,
          projects,
        );

        expect(result.target).to.equal(diamondAddress);
      });

      it("should throw if BondSustainabilityPerformanceTargetRateDeployed event not found", async () => {
        const diamondAddress = TEST_ADDRESSES.VALID_3;
        const mockFactory = createMockFactoryWithWrongEvent(diamondAddress);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParamsSPT();
        const impactDataParams = [createMockImpactDataParamsSPT()];
        const projects = [TEST_ADDRESSES.VALID_4];

        await expect(
          deployBondSustainabilityPerformanceTargetRateFromFactory(
            params,
            regulationData,
            interestRateParams,
            impactDataParams,
            projects,
          ),
        ).to.be.rejectedWith("BondSustainabilityPerformanceTargetRateDeployed event not found");
      });

      it("should throw if event has no args", async () => {
        const mockFactory = createMockFactoryWithNoArgs(TEST_FACTORY_EVENTS.BOND_SPT_DEPLOYED);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParamsSPT();
        const impactDataParams = [createMockImpactDataParamsSPT()];
        const projects = [TEST_ADDRESSES.VALID_4];

        await expect(
          deployBondSustainabilityPerformanceTargetRateFromFactory(
            params,
            regulationData,
            interestRateParams,
            impactDataParams,
            projects,
          ),
        ).to.be.rejectedWith("BondSustainabilityPerformanceTargetRateDeployed event not found");
      });

      it("should throw if diamondAddress is zero address", async () => {
        const mockFactory = createMockFactoryWithZeroAddress(TEST_FACTORY_EVENTS.BOND_SPT_DEPLOYED);
        const params = createDeployBondParams(mockFactory);
        const regulationData = createMockRegulationData();
        const interestRateParams = createMockInterestRateParamsSPT();
        const impactDataParams = [createMockImpactDataParamsSPT()];
        const projects = [TEST_ADDRESSES.VALID_4];

        await expect(
          deployBondSustainabilityPerformanceTargetRateFromFactory(
            params,
            regulationData,
            interestRateParams,
            impactDataParams,
            projects,
          ),
        ).to.be.rejectedWith("Invalid diamond address");
      });
    });
  });
});
