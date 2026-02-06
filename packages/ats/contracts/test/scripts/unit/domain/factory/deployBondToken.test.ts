// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for Bond token deployment from Factory.
 *
 * Tests the deployBondFromFactory function using sinon mocking
 * to verify data structure construction, RBAC building, bond details,
 * proceed recipients, and event parsing without actual contract interactions.
 *
 * @module test/scripts/unit/domain/factory/deployBondToken.test
 */

import { expect } from "chai";
import sinon from "sinon";
import { deployBondFromFactory, ATS_ROLES, BOND_CONFIG_ID } from "@scripts/domain";
import { TEST_ADDRESSES, TEST_FACTORY_EVENTS, TEST_TOKEN_METADATA } from "@test";
import {
  createMockFactory,
  createMockSecurityData,
  createMockBondDetails,
  createMockRegulationData,
  createDeployBondParams,
  createMockFactoryWithWrongEvent,
  createMockFactoryWithNoArgs,
  createMockFactoryWithZeroAddress,
  createMockSecurityDataWithRbacs,
} from "./helpers/mockFactories";

describe("Bond Token Deployment", () => {
  afterEach(() => {
    sinon.restore();
  });

  // ============================================================================
  // RBAC Construction Tests
  // ============================================================================

  describe("RBAC construction", () => {
    it("should include DEFAULT_ADMIN_ROLE with admin account", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const adminAccount = TEST_ADDRESSES.VALID_1;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const params = createDeployBondParams(mockFactory, { adminAccount });
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      expect(mockFactory.deployBond.calledOnce).to.be.true;
      const callArgs = mockFactory.deployBond.getCall(0).args[0];
      const rbacs = callArgs.security.rbacs;

      expect(rbacs[0].role).to.equal(ATS_ROLES._DEFAULT_ADMIN_ROLE);
      expect(rbacs[0].members).to.include(adminAccount);
    });

    it("should merge additional rbacs from securityData", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const additionalRbacs = [
        { role: ATS_ROLES._PAUSER_ROLE, members: [TEST_ADDRESSES.VALID_4] },
        { role: ATS_ROLES._CORPORATE_ACTION_ROLE, members: [TEST_ADDRESSES.VALID_5] },
      ];
      const securityData = createMockSecurityDataWithRbacs(additionalRbacs);
      const params = createDeployBondParams(mockFactory, { securityData });
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      const callArgs = mockFactory.deployBond.getCall(0).args[0];
      const rbacs = callArgs.security.rbacs;

      expect(rbacs).to.have.length(3);
      expect(rbacs[0].role).to.equal(ATS_ROLES._DEFAULT_ADMIN_ROLE);
      expect(rbacs[1].role).to.equal(ATS_ROLES._PAUSER_ROLE);
      expect(rbacs[2].role).to.equal(ATS_ROLES._CORPORATE_ACTION_ROLE);
    });

    it("should place admin role first in array", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const additionalRbacs = [{ role: "CUSTOM_BOND_ROLE", members: [TEST_ADDRESSES.VALID_4] }];
      const securityData = createMockSecurityDataWithRbacs(additionalRbacs);
      const params = createDeployBondParams(mockFactory, { securityData });
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      const callArgs = mockFactory.deployBond.getCall(0).args[0];
      const rbacs = callArgs.security.rbacs;

      expect(rbacs[0].role).to.equal(ATS_ROLES._DEFAULT_ADMIN_ROLE);
    });
  });

  // ============================================================================
  // Resolver Proxy Configuration Tests
  // ============================================================================

  describe("resolverProxyConfiguration", () => {
    it("should use BOND_CONFIG_ID (not EQUITY_CONFIG_ID)", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const params = createDeployBondParams(mockFactory);
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      const callArgs = mockFactory.deployBond.getCall(0).args[0];
      const config = callArgs.security.resolverProxyConfiguration;

      expect(config.key).to.equal(BOND_CONFIG_ID);
    });

    it("should set version to 1", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const params = createDeployBondParams(mockFactory);
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      const callArgs = mockFactory.deployBond.getCall(0).args[0];
      const config = callArgs.security.resolverProxyConfiguration;

      expect(config.version).to.equal(1);
    });
  });

  // ============================================================================
  // Bond Details Structure Tests
  // ============================================================================

  describe("bond details structure", () => {
    it("should map currency, nominalValue, nominalValueDecimals", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const bondDetails = createMockBondDetails({
        currency: TEST_TOKEN_METADATA.CURRENCY,
        nominalValue: "10000000000000000000",
        nominalValueDecimals: 18,
      });
      const params = createDeployBondParams(mockFactory, { bondDetails });
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      const callArgs = mockFactory.deployBond.getCall(0).args[0];
      const details = callArgs.bondDetails;

      expect(details.currency).to.equal(TEST_TOKEN_METADATA.CURRENCY);
      expect(details.nominalValue).to.equal("10000000000000000000");
      expect(details.nominalValueDecimals).to.equal(18);
    });

    it("should use provided startingDate", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const startingDate = 1700000000;
      const bondDetails = createMockBondDetails({ startingDate });
      const params = createDeployBondParams(mockFactory, { bondDetails });
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      const callArgs = mockFactory.deployBond.getCall(0).args[0];

      expect(callArgs.bondDetails.startingDate).to.equal(startingDate);
    });

    it("should use Date.now() for startingDate if not provided (0)", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const bondDetails = createMockBondDetails({ startingDate: 0 });
      const params = createDeployBondParams(mockFactory, { bondDetails });
      const regulationData = createMockRegulationData();

      const beforeCall = Math.floor(Date.now() / 1000);
      await deployBondFromFactory(params, regulationData);
      const afterCall = Math.floor(Date.now() / 1000);

      const callArgs = mockFactory.deployBond.getCall(0).args[0];
      const startingDate = callArgs.bondDetails.startingDate;

      // Should be close to current time (within 1 second tolerance)
      expect(startingDate).to.be.at.least(beforeCall);
      expect(startingDate).to.be.at.most(afterCall + 1);
    });

    it("should default maturityDate to 0 if not provided", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const bondDetails = createMockBondDetails({ maturityDate: 0 });
      const params = createDeployBondParams(mockFactory, { bondDetails });
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      const callArgs = mockFactory.deployBond.getCall(0).args[0];

      expect(callArgs.bondDetails.maturityDate).to.equal(0);
    });

    it("should use provided maturityDate if specified", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const maturityDate = 1800000000;
      const bondDetails = createMockBondDetails({ maturityDate });
      const params = createDeployBondParams(mockFactory, { bondDetails });
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      const callArgs = mockFactory.deployBond.getCall(0).args[0];

      expect(callArgs.bondDetails.maturityDate).to.equal(maturityDate);
    });
  });

  // ============================================================================
  // Proceed Recipients Tests
  // ============================================================================

  describe("proceed recipients", () => {
    it("should include proceedRecipients array", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const proceedRecipients = [TEST_ADDRESSES.VALID_4, TEST_ADDRESSES.VALID_5];
      const params = createDeployBondParams(mockFactory, { proceedRecipients });
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      const callArgs = mockFactory.deployBond.getCall(0).args[0];

      expect(callArgs.proceedRecipients).to.deep.equal(proceedRecipients);
    });

    it("should include proceedRecipientsData array", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const proceedRecipientsData = ["0x1234", "0x5678"];
      const params = createDeployBondParams(mockFactory, { proceedRecipientsData });
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      const callArgs = mockFactory.deployBond.getCall(0).args[0];

      expect(callArgs.proceedRecipientsData).to.deep.equal(proceedRecipientsData);
    });

    it("should handle empty proceed recipients arrays", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const params = createDeployBondParams(mockFactory, {
        proceedRecipients: [],
        proceedRecipientsData: [],
      });
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      const callArgs = mockFactory.deployBond.getCall(0).args[0];

      expect(callArgs.proceedRecipients).to.deep.equal([]);
      expect(callArgs.proceedRecipientsData).to.deep.equal([]);
    });
  });

  // ============================================================================
  // Security Data Structure Tests
  // ============================================================================

  describe("security data structure", () => {
    it("should map all securityData params correctly", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const securityData = createMockSecurityData({
        arePartitionsProtected: true,
        isMultiPartition: false,
        isControllable: true,
        isWhiteList: false,
        clearingActive: true,
        internalKycActivated: true,
        erc20VotesActivated: true,
      });
      const params = createDeployBondParams(mockFactory, { securityData });
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      const callArgs = mockFactory.deployBond.getCall(0).args[0];
      const security = callArgs.security;

      expect(security.arePartitionsProtected).to.be.true;
      expect(security.isMultiPartition).to.be.false;
      expect(security.isControllable).to.be.true;
      expect(security.isWhiteList).to.be.false;
      expect(security.clearingActive).to.be.true;
      expect(security.internalKycActivated).to.be.true;
      expect(security.erc20VotesActivated).to.be.true;
    });

    it("should include resolver address", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const blrAddress = TEST_ADDRESSES.VALID_6;
      const securityData = createMockSecurityData({
        resolver: blrAddress,
      });
      const params = createDeployBondParams(mockFactory, { securityData });
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      const callArgs = mockFactory.deployBond.getCall(0).args[0];

      expect(callArgs.security.resolver).to.equal(blrAddress);
    });
  });

  // ============================================================================
  // Factory Call Tests
  // ============================================================================

  describe("factory call", () => {
    it("should call factory.deployBond (not deployEquity)", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const params = createDeployBondParams(mockFactory);
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      expect(mockFactory.deployBond.calledOnce).to.be.true;
      expect(mockFactory.deployEquity.called).to.be.false;
    });

    it("should include gas options in call", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const params = createDeployBondParams(mockFactory);
      const regulationData = createMockRegulationData();

      await deployBondFromFactory(params, regulationData);

      const callArgs = mockFactory.deployBond.getCall(0).args;

      // Third argument should be options with gasLimit
      expect(callArgs[2]).to.have.property("gasLimit");
    });
  });

  // ============================================================================
  // Event Parsing Tests
  // ============================================================================

  describe("event parsing", () => {
    it("should look for BondDeployed event (not EquityDeployed)", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      // Use EquityDeployed event - should fail because we're looking for BondDeployed
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const params = createDeployBondParams(mockFactory);
      const regulationData = createMockRegulationData();

      await expect(deployBondFromFactory(params, regulationData)).to.be.rejectedWith("BondDeployed event not found");
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

    it("should extract diamondProxyAddress from event args", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const params = createDeployBondParams(mockFactory);
      const regulationData = createMockRegulationData();

      const result = await deployBondFromFactory(params, regulationData);

      expect(result.target).to.equal(diamondAddress);
    });

    it("should return ResolverProxy contract instance", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.BOND_DEPLOYED, diamondAddress);
      const params = createDeployBondParams(mockFactory);
      const regulationData = createMockRegulationData();

      const result = await deployBondFromFactory(params, regulationData);

      expect(result).to.have.property("target");
      expect(result.target).to.equal(diamondAddress);
    });
  });
});
