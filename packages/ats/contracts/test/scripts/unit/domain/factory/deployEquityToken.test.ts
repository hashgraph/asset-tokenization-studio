// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for Equity token deployment from Factory.
 *
 * Tests the deployEquityFromFactory function using sinon mocking
 * to verify data structure construction, RBAC building, and event parsing
 * without actual contract interactions.
 *
 * @module test/scripts/unit/domain/factory/deployEquityToken.test
 */

import { expect } from "chai";
import sinon from "sinon";
import { deployEquityFromFactory, ATS_ROLES, EQUITY_CONFIG_ID } from "@scripts/domain";
import { TEST_ADDRESSES, TEST_FACTORY_EVENTS, TEST_TOKEN_METADATA } from "@test";
import {
  createMockFactory,
  createMockSecurityData,
  createMockEquityDetails,
  createMockRegulationData,
  createDeployEquityParams,
  createMockFactoryWithWrongEvent,
  createMockFactoryWithNoArgs,
  createMockFactoryWithZeroAddress,
  createMockSecurityDataWithRbacs,
} from "./helpers/mockFactories";

describe("Equity Token Deployment", () => {
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
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const params = createDeployEquityParams(mockFactory, { adminAccount });
      const regulationData = createMockRegulationData();

      await deployEquityFromFactory(params, regulationData);

      expect(mockFactory.deployEquity.calledOnce).to.be.true;
      const callArgs = mockFactory.deployEquity.getCall(0).args[0];
      const rbacs = callArgs.security.rbacs;

      expect(rbacs[0].role).to.equal(ATS_ROLES._DEFAULT_ADMIN_ROLE);
      expect(rbacs[0].members).to.include(adminAccount);
    });

    it("should merge additional rbacs from securityData", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const additionalRbacs = [
        { role: ATS_ROLES._PAUSER_ROLE, members: [TEST_ADDRESSES.VALID_4] },
        { role: ATS_ROLES._CONTROLLER_ROLE, members: [TEST_ADDRESSES.VALID_5] },
      ];
      const securityData = createMockSecurityDataWithRbacs(additionalRbacs);
      const params = createDeployEquityParams(mockFactory, { securityData });
      const regulationData = createMockRegulationData();

      await deployEquityFromFactory(params, regulationData);

      const callArgs = mockFactory.deployEquity.getCall(0).args[0];
      const rbacs = callArgs.security.rbacs;

      // Admin role should be first, then additional roles
      expect(rbacs).to.have.length(3);
      expect(rbacs[0].role).to.equal(ATS_ROLES._DEFAULT_ADMIN_ROLE);
      expect(rbacs[1].role).to.equal(ATS_ROLES._PAUSER_ROLE);
      expect(rbacs[2].role).to.equal(ATS_ROLES._CONTROLLER_ROLE);
    });

    it("should place admin role first in array", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const additionalRbacs = [{ role: "CUSTOM_ROLE", members: [TEST_ADDRESSES.VALID_4] }];
      const securityData = createMockSecurityDataWithRbacs(additionalRbacs);
      const params = createDeployEquityParams(mockFactory, { securityData });
      const regulationData = createMockRegulationData();

      await deployEquityFromFactory(params, regulationData);

      const callArgs = mockFactory.deployEquity.getCall(0).args[0];
      const rbacs = callArgs.security.rbacs;

      expect(rbacs[0].role).to.equal(ATS_ROLES._DEFAULT_ADMIN_ROLE);
    });
  });

  // ============================================================================
  // Resolver Proxy Configuration Tests
  // ============================================================================

  describe("resolverProxyConfiguration", () => {
    it("should use EQUITY_CONFIG_ID", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const params = createDeployEquityParams(mockFactory);
      const regulationData = createMockRegulationData();

      await deployEquityFromFactory(params, regulationData);

      const callArgs = mockFactory.deployEquity.getCall(0).args[0];
      const config = callArgs.security.resolverProxyConfiguration;

      expect(config.key).to.equal(EQUITY_CONFIG_ID);
    });

    it("should set version to 1", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const params = createDeployEquityParams(mockFactory);
      const regulationData = createMockRegulationData();

      await deployEquityFromFactory(params, regulationData);

      const callArgs = mockFactory.deployEquity.getCall(0).args[0];
      const config = callArgs.security.resolverProxyConfiguration;

      expect(config.version).to.equal(1);
    });
  });

  // ============================================================================
  // Security Data Structure Tests
  // ============================================================================

  describe("security data structure", () => {
    it("should map all securityData params correctly", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const securityData = createMockSecurityData({
        arePartitionsProtected: true,
        isMultiPartition: true,
        isControllable: false,
        isWhiteList: false,
      });
      const params = createDeployEquityParams(mockFactory, { securityData });
      const regulationData = createMockRegulationData();

      await deployEquityFromFactory(params, regulationData);

      const callArgs = mockFactory.deployEquity.getCall(0).args[0];
      const security = callArgs.security;

      expect(security.arePartitionsProtected).to.be.true;
      expect(security.isMultiPartition).to.be.true;
      expect(security.isControllable).to.be.false;
      expect(security.isWhiteList).to.be.false;
    });

    it("should nest erc20MetadataInfo correctly", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const securityData = createMockSecurityData({
        erc20MetadataInfo: {
          name: "Custom Token",
          symbol: "CUST",
          decimals: 8,
          isin: "XS1234567890",
        },
      });
      const params = createDeployEquityParams(mockFactory, { securityData });
      const regulationData = createMockRegulationData();

      await deployEquityFromFactory(params, regulationData);

      const callArgs = mockFactory.deployEquity.getCall(0).args[0];
      const metadata = callArgs.security.erc20MetadataInfo;

      expect(metadata.name).to.equal("Custom Token");
      expect(metadata.symbol).to.equal("CUST");
      expect(metadata.decimals).to.equal(8);
      expect(metadata.isin).to.equal("XS1234567890");
    });

    it("should include external lists arrays", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const securityData = createMockSecurityData({
        externalPauses: [TEST_ADDRESSES.VALID_4],
        externalControlLists: [TEST_ADDRESSES.VALID_5],
        externalKycLists: [TEST_ADDRESSES.VALID_6],
      });
      const params = createDeployEquityParams(mockFactory, { securityData });
      const regulationData = createMockRegulationData();

      await deployEquityFromFactory(params, regulationData);

      const callArgs = mockFactory.deployEquity.getCall(0).args[0];
      const security = callArgs.security;

      expect(security.externalPauses).to.deep.equal([TEST_ADDRESSES.VALID_4]);
      expect(security.externalControlLists).to.deep.equal([TEST_ADDRESSES.VALID_5]);
      expect(security.externalKycLists).to.deep.equal([TEST_ADDRESSES.VALID_6]);
    });

    it("should include compliance and identityRegistry addresses", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const securityData = createMockSecurityData({
        compliance: TEST_ADDRESSES.VALID_4,
        identityRegistry: TEST_ADDRESSES.VALID_5,
      });
      const params = createDeployEquityParams(mockFactory, { securityData });
      const regulationData = createMockRegulationData();

      await deployEquityFromFactory(params, regulationData);

      const callArgs = mockFactory.deployEquity.getCall(0).args[0];
      const security = callArgs.security;

      expect(security.compliance).to.equal(TEST_ADDRESSES.VALID_4);
      expect(security.identityRegistry).to.equal(TEST_ADDRESSES.VALID_5);
    });

    it("should include resolver address", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const blrAddress = TEST_ADDRESSES.VALID_6;
      const securityData = createMockSecurityData({
        resolver: blrAddress,
      });
      const params = createDeployEquityParams(mockFactory, { securityData });
      const regulationData = createMockRegulationData();

      await deployEquityFromFactory(params, regulationData);

      const callArgs = mockFactory.deployEquity.getCall(0).args[0];

      expect(callArgs.security.resolver).to.equal(blrAddress);
    });
  });

  // ============================================================================
  // Equity Details Structure Tests
  // ============================================================================

  describe("equity details structure", () => {
    it("should map all boolean rights flags", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const equityDetails = createMockEquityDetails({
        votingRight: true,
        informationRight: true,
        liquidationRight: true,
        subscriptionRight: true,
        conversionRight: true,
        redemptionRight: true,
        putRight: true,
      });
      const params = createDeployEquityParams(mockFactory, { equityDetails });
      const regulationData = createMockRegulationData();

      await deployEquityFromFactory(params, regulationData);

      const callArgs = mockFactory.deployEquity.getCall(0).args[0];
      const details = callArgs.equityDetails;

      expect(details.votingRight).to.be.true;
      expect(details.informationRight).to.be.true;
      expect(details.liquidationRight).to.be.true;
      expect(details.subscriptionRight).to.be.true;
      expect(details.conversionRight).to.be.true;
      expect(details.redemptionRight).to.be.true;
      expect(details.putRight).to.be.true;
    });

    it("should include DividendRight enum value", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const equityDetails = createMockEquityDetails({
        dividendRight: 1, // DividendRight.PREFERRED
      });
      const params = createDeployEquityParams(mockFactory, { equityDetails });
      const regulationData = createMockRegulationData();

      await deployEquityFromFactory(params, regulationData);

      const callArgs = mockFactory.deployEquity.getCall(0).args[0];

      expect(callArgs.equityDetails.dividendRight).to.equal(1);
    });

    it("should include currency and nominal value", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const equityDetails = createMockEquityDetails({
        currency: TEST_TOKEN_METADATA.CURRENCY,
        nominalValue: "5000000000000000000",
        nominalValueDecimals: 18,
      });
      const params = createDeployEquityParams(mockFactory, { equityDetails });
      const regulationData = createMockRegulationData();

      await deployEquityFromFactory(params, regulationData);

      const callArgs = mockFactory.deployEquity.getCall(0).args[0];
      const details = callArgs.equityDetails;

      expect(details.currency).to.equal(TEST_TOKEN_METADATA.CURRENCY);
      expect(details.nominalValue).to.equal("5000000000000000000");
      expect(details.nominalValueDecimals).to.equal(18);
    });
  });

  // ============================================================================
  // Regulation Data Structure Tests
  // ============================================================================

  describe("regulation data structure", () => {
    it("should map regulation type and subtype", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const params = createDeployEquityParams(mockFactory);
      const regulationData = createMockRegulationData({
        regulationType: 2,
        regulationSubType: 1,
      });

      await deployEquityFromFactory(params, regulationData);

      const callArgs = mockFactory.deployEquity.getCall(0).args;
      const regData = callArgs[1];

      expect(regData.regulationType).to.equal(2);
      expect(regData.regulationSubType).to.equal(1);
    });

    it("should map additionalSecurityData correctly", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const params = createDeployEquityParams(mockFactory);
      const regulationData = createMockRegulationData({
        additionalSecurityData: {
          countriesControlListType: false,
          listOfCountries: "JP,CN",
          info: "Custom info",
        },
      });

      await deployEquityFromFactory(params, regulationData);

      const callArgs = mockFactory.deployEquity.getCall(0).args;
      const regData = callArgs[1];

      expect(regData.additionalSecurityData.countriesControlListType).to.be.false;
      expect(regData.additionalSecurityData.listOfCountries).to.equal("JP,CN");
      expect(regData.additionalSecurityData.info).to.equal("Custom info");
    });
  });

  // ============================================================================
  // Factory Call Tests
  // ============================================================================

  describe("factory call", () => {
    it("should call factory.deployEquity with correct data", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const params = createDeployEquityParams(mockFactory);
      const regulationData = createMockRegulationData();

      await deployEquityFromFactory(params, regulationData);

      expect(mockFactory.deployEquity.calledOnce).to.be.true;
      const callArgs = mockFactory.deployEquity.getCall(0).args;

      // First arg is equity data, second is regulation data, third is options
      expect(callArgs[0]).to.have.property("security");
      expect(callArgs[0]).to.have.property("equityDetails");
      expect(callArgs[1]).to.have.property("regulationType");
    });

    it("should include gas options in call", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const params = createDeployEquityParams(mockFactory);
      const regulationData = createMockRegulationData();

      await deployEquityFromFactory(params, regulationData);

      const callArgs = mockFactory.deployEquity.getCall(0).args;

      // Third argument should be options with gasLimit
      expect(callArgs[2]).to.have.property("gasLimit");
    });
  });

  // ============================================================================
  // Event Parsing Tests
  // ============================================================================

  describe("event parsing", () => {
    it("should throw if EquityDeployed event not found", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactoryWithWrongEvent(diamondAddress);
      const params = createDeployEquityParams(mockFactory);
      const regulationData = createMockRegulationData();

      await expect(deployEquityFromFactory(params, regulationData)).to.be.rejectedWith(
        "EquityDeployed event not found",
      );
    });

    it("should throw if event has no args", async () => {
      const mockFactory = createMockFactoryWithNoArgs(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED);
      const params = createDeployEquityParams(mockFactory);
      const regulationData = createMockRegulationData();

      await expect(deployEquityFromFactory(params, regulationData)).to.be.rejectedWith(
        "EquityDeployed event not found",
      );
    });

    it("should throw if diamondAddress is zero address", async () => {
      const mockFactory = createMockFactoryWithZeroAddress(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED);
      const params = createDeployEquityParams(mockFactory);
      const regulationData = createMockRegulationData();

      await expect(deployEquityFromFactory(params, regulationData)).to.be.rejectedWith("Invalid diamond address");
    });

    it("should extract diamondProxyAddress from event args", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const params = createDeployEquityParams(mockFactory);
      const regulationData = createMockRegulationData();

      const result = await deployEquityFromFactory(params, regulationData);

      // The result should be connected to the diamond address
      expect(result.address).to.equal(diamondAddress);
    });

    it("should return ResolverProxy contract instance", async () => {
      const diamondAddress = TEST_ADDRESSES.VALID_3;
      const mockFactory = createMockFactory(TEST_FACTORY_EVENTS.EQUITY_DEPLOYED, diamondAddress);
      const params = createDeployEquityParams(mockFactory);
      const regulationData = createMockRegulationData();

      const result = await deployEquityFromFactory(params, regulationData);

      expect(result).to.have.property("address");
      expect(result.address).to.equal(diamondAddress);
    });
  });
});
