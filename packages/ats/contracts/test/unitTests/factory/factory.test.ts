import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  BusinessLogicResolver,
  type AccessControl,
  type ControlList,
  type ERC1644,
  type ERC20,
  type Factory,
} from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture } from "@test";
import { getRegulationData, getSecurityData } from "@test";
import { getEquityDetails } from "@test";
import {
  RegulationType,
  RegulationSubType,
  ADDRESS_ZERO,
  EQUITY_CONFIG_ID,
  GAS_LIMIT,
  ATS_ROLES,
  BOND_CONFIG_ID,
} from "@scripts";
import { Rbac, SecurityType } from "@scripts/domain";
import { getBondDetails } from "@test";

describe("Factory Tests", () => {
  let signer_A: SignerWithAddress;
  let signer_B: SignerWithAddress;

  const init_rbacs: Rbac[] = [];

  const regulationSubType = RegulationSubType.REG_D_506_B;
  const countriesControlListType = true;
  const listOfCountries = "ES,FR,CH";
  const info = "info";

  let factory: Factory;
  let businessLogicResolver: BusinessLogicResolver;
  let accessControlFacet: AccessControl;
  let controlListFacet: ControlList;
  let erc1644Facet: ERC1644;
  let erc20Facet: ERC20;

  const listOfRoles = [
    ATS_ROLES._DEFAULT_ADMIN_ROLE,
    ATS_ROLES._CONTROL_LIST_ROLE,
    ATS_ROLES._CORPORATE_ACTION_ROLE,
    ATS_ROLES._ISSUER_ROLE,
    ATS_ROLES._DOCUMENTER_ROLE,
    ATS_ROLES._CONTROLLER_ROLE,
    ATS_ROLES._PAUSER_ROLE,
    ATS_ROLES._SNAPSHOT_ROLE,
    ATS_ROLES._LOCKER_ROLE,
  ];
  let listOfMembers: string[];

  async function deployFactoryFixture() {
    const base = await deployAtsInfrastructureFixture();
    factory = base.factory;
    businessLogicResolver = base.blr;
    signer_A = base.deployer;
    signer_B = base.user1;

    listOfMembers = [signer_A.address, signer_B.address];
    for (let i = 0; i < listOfRoles.length; i++) {
      const rbac: Rbac = {
        role: listOfRoles[i],
        members: listOfMembers,
      };
      init_rbacs.push(rbac);
    }
  }
  async function readFacets(equityAddress: string) {
    accessControlFacet = await ethers.getContractAt("AccessControl", equityAddress);

    controlListFacet = await ethers.getContractAt("ControlList", equityAddress);

    erc1644Facet = await ethers.getContractAt("ERC1644", equityAddress);

    erc20Facet = await ethers.getContractAt("ERC20", equityAddress);
  }

  beforeEach(async () => {
    await loadFixture(deployFactoryFixture);
  });

  describe("Equity tests", () => {
    it("GIVEN an empty Resolver WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };
      equityData.security.resolver = ADDRESS_ZERO;

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployEquity(equityData, factoryRegulationData)).to.be.rejectedWith("EmptyResolver");
    });

    it("GIVEN a wrong ISIN WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          erc20MetadataInfo: { isin: "invalid_isin" },
        }),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      await expect(
        factory.deployEquity(equityData, factoryRegulationData, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.rejectedWith("WrongISIN");
      equityData.security.erc20MetadataInfo.isin = "SJ5633813321";
      await expect(factory.deployEquity(equityData, factoryRegulationData)).to.be.rejectedWith("WrongISINChecksum");
    });

    it("GIVEN no admin WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployEquity(equityData, factoryRegulationData)).to.be.rejectedWith("NoInitialAdmins");
    });

    it("GIVEN wrong regulation type WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
        }),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData({
        regulationType: RegulationType.NONE,
        regulationSubType,
        additionalSecurityData: {
          countriesControlListType,
          listOfCountries,
          info,
        },
      });

      await expect(factory.deployEquity(equityData, factoryRegulationData))
        .to.be.revertedWithCustomError(factory, "RegulationTypeAndSubTypeForbidden")
        .withArgs(RegulationType.NONE, regulationSubType);
    });

    it("GIVEN wrong regulation type & subtype WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
        }),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData({
        regulationType: RegulationType.REG_D,
        regulationSubType: RegulationSubType.NONE,
        additionalSecurityData: {
          countriesControlListType,
          listOfCountries,
          info,
        },
      });

      await expect(factory.deployEquity(equityData, factoryRegulationData))
        .to.be.revertedWithCustomError(factory, "RegulationTypeAndSubTypeForbidden")
        .withArgs(RegulationType.REG_D, RegulationSubType.NONE);
    });

    it("GIVEN the proper information WHEN deploying a new resolverProxy THEN transaction succeeds", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
        }),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployEquity(equityData, factoryRegulationData)).to.emit(factory, "EquityDeployed");

      const result = await factory.deployEquity(equityData, factoryRegulationData);
      const events = (await result.wait()).events!;
      const deployedEquityEvent = events.find((e) => e.event == "EquityDeployed");
      const equityAddress = deployedEquityEvent!.args!.equityAddress;

      await readFacets(equityAddress);

      for (let i = 0; i < listOfMembers.length; i++) {
        const roleMemberCount = await accessControlFacet.getRoleMemberCount(listOfRoles[i]);
        const roleMember = await accessControlFacet.getRoleMembers(listOfRoles[i], 0, 2);
        expect(roleMemberCount).to.be.equal(2);
        expect(roleMember[0]).to.be.equal(listOfMembers[0]);
        expect(roleMember[1]).to.be.equal(listOfMembers[1]);
      }

      const whiteList = await controlListFacet.getControlListType();
      expect(whiteList).to.be.equal(equityData.security.isWhiteList);

      const controllable = await erc1644Facet.isControllable();
      expect(controllable).to.be.equal(equityData.security.isControllable);

      const metadata = await erc20Facet.getERC20Metadata();
      expect(metadata.info.name).to.be.equal(equityData.security.erc20MetadataInfo.name);
      expect(metadata.info.symbol).to.be.equal(equityData.security.erc20MetadataInfo.symbol);
      expect(metadata.info.decimals).to.be.equal(equityData.security.erc20MetadataInfo.decimals);
      expect(metadata.info.isin).to.be.equal(equityData.security.erc20MetadataInfo.isin);
      expect(metadata.securityType).to.be.equal(SecurityType.EQUITY);

      const equityFacet = await ethers.getContractAt("Equity", equityAddress);

      const equityMetadata = await equityFacet.getEquityDetails();
      expect(equityMetadata.votingRight).to.equal(equityData.equityDetails.votingRight);
      expect(equityMetadata.informationRight).to.equal(equityData.equityDetails.informationRight);
      expect(equityMetadata.liquidationRight).to.equal(equityData.equityDetails.liquidationRight);
      expect(equityMetadata.subscriptionRight).to.equal(equityData.equityDetails.subscriptionRight);
      expect(equityMetadata.conversionRight).to.equal(equityData.equityDetails.conversionRight);
      expect(equityMetadata.redemptionRight).to.equal(equityData.equityDetails.redemptionRight);
      expect(equityMetadata.putRight).to.equal(equityData.equityDetails.putRight);
      expect(equityMetadata.dividendRight).to.equal(equityData.equityDetails.dividendRight);
      expect(equityMetadata.currency).to.equal(equityData.equityDetails.currency);
      expect(equityMetadata.nominalValue).to.equal(equityData.equityDetails.nominalValue);

      const capFacet = await ethers.getContractAt("Cap", equityAddress);

      const maxSupply = await capFacet.getMaxSupply();
      expect(maxSupply).to.equal(equityData.security.maxSupply);
    });
  });

  describe("Bond tests", () => {
    it("GIVEN an empty Resolver WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const bondData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
        }),
        bondDetails: await await getBondDetails(),
        proceedRecipients: [],
        proceedRecipientsData: [],
      };
      bondData.security.resolverProxyConfiguration = {
        key: BOND_CONFIG_ID,
        version: 1,
      };
      bondData.security.resolver = ADDRESS_ZERO;

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployBond(bondData, factoryRegulationData)).to.be.rejectedWith("EmptyResolver");
    });

    it("GIVEN a wrong ISIN WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const bondData = {
        security: getSecurityData(businessLogicResolver, {
          erc20MetadataInfo: { isin: "invalid_isin" },
          rbacs: init_rbacs,
        }),
        bondDetails: await getBondDetails(),
        proceedRecipients: [],
        proceedRecipientsData: [],
      };
      bondData.security.resolverProxyConfiguration = {
        key: BOND_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployBond(bondData, factoryRegulationData)).to.be.rejectedWith("WrongISIN");
      bondData.security.erc20MetadataInfo.isin = "SJ5633813321";
      await expect(factory.deployBond(bondData, factoryRegulationData)).to.be.rejectedWith("WrongISINChecksum");
    });

    it("GIVEN no admin WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const bondData = {
        security: getSecurityData(businessLogicResolver),
        bondDetails: await getBondDetails(),
        proceedRecipients: [],
        proceedRecipientsData: [],
      };
      bondData.security.resolverProxyConfiguration = {
        key: BOND_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployBond(bondData, factoryRegulationData)).to.be.rejectedWith("NoInitialAdmins");
    });

    it("GIVEN incorrect maturity or starting date WHEN deploying a new bond THEN transaction fails", async () => {
      const bondData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
        }),
        bondDetails: await getBondDetails({
          maturityDate: Math.floor(Date.now() / 1000),
        }),
        proceedRecipients: [],
        proceedRecipientsData: [],
      };
      bondData.security.resolverProxyConfiguration = {
        key: BOND_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployBond(bondData, factoryRegulationData)).to.be.rejectedWith("WrongDates");

      const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000) + 1;
      bondData.bondDetails.startingDate = currentTimeInSeconds - 10000;
      bondData.bondDetails.maturityDate = bondData.bondDetails.startingDate + 10;

      await expect(factory.deployBond(bondData, factoryRegulationData)).to.be.rejectedWith("WrongTimestamp");
    });

    it("GIVEN the proper information WHEN deploying a new bond THEN transaction succeeds", async () => {
      const bondData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
        }),
        bondDetails: await getBondDetails(),
        proceedRecipients: [],
        proceedRecipientsData: [],
      };
      bondData.security.resolverProxyConfiguration = {
        key: BOND_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployBond(bondData, factoryRegulationData)).to.emit(factory, "BondDeployed");

      const result = await factory.deployBond(bondData, factoryRegulationData);
      const events = (await result.wait()).events!;
      const deployedBondEvent = events.find((e) => e.event == "BondDeployed");
      const bondAddress = deployedBondEvent!.args!.bondAddress;

      await readFacets(bondAddress);

      for (let i = 0; i < listOfMembers.length; i++) {
        const roleMemberCount = await accessControlFacet.getRoleMemberCount(listOfRoles[i]);
        const roleMember = await accessControlFacet.getRoleMembers(listOfRoles[i], 0, 2);
        expect(roleMemberCount).to.be.equal(2);
        expect(roleMember[0]).to.be.equal(listOfMembers[0]);
        expect(roleMember[1]).to.be.equal(listOfMembers[1]);
      }

      const whiteList = await controlListFacet.getControlListType();
      expect(whiteList).to.be.equal(bondData.security.isWhiteList);

      const controllable = await erc1644Facet.isControllable();
      expect(controllable).to.be.equal(bondData.security.isControllable);

      const metadata = await erc20Facet.getERC20Metadata();
      expect(metadata.info.name).to.be.equal(bondData.security.erc20MetadataInfo.name);
      expect(metadata.info.symbol).to.be.equal(bondData.security.erc20MetadataInfo.symbol);
      expect(metadata.info.decimals).to.be.equal(bondData.security.erc20MetadataInfo.decimals);
      expect(metadata.info.isin).to.be.equal(bondData.security.erc20MetadataInfo.isin);
      expect(metadata.securityType).to.be.equal(SecurityType.BOND);

      const capFacet = await ethers.getContractAt("Cap", bondAddress);
      const maxSupply = await capFacet.getMaxSupply();
      expect(maxSupply).to.equal(bondData.security.maxSupply);

      const bondFacet = await ethers.getContractAt("BondRead", bondAddress);
      const bondDetails = await bondFacet.getBondDetails();
      expect(bondDetails.currency).to.be.deep.equal(bondData.bondDetails.currency);
      expect(bondDetails.nominalValue).to.be.deep.equal(bondData.bondDetails.nominalValue);
      expect(bondDetails.startingDate).to.be.deep.equal(bondData.bondDetails.startingDate);
      expect(bondDetails.maturityDate).to.be.deep.equal(bondData.bondDetails.maturityDate);
      const couponCount = await bondFacet.getCouponCount();
      expect(couponCount).to.equal(0);

      // Coupon count assertion removed - no automatic coupons created
    });

    it("GIVEN wrong regulation type WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const bondData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
        }),
        bondDetails: await getBondDetails(),
        proceedRecipients: [],
        proceedRecipientsData: [],
      };
      bondData.security.resolverProxyConfiguration = {
        key: BOND_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData({
        regulationType: RegulationType.NONE,
        regulationSubType,
        additionalSecurityData: {
          countriesControlListType,
          listOfCountries,
          info,
        },
      });

      await expect(factory.deployBond(bondData, factoryRegulationData))
        .to.be.revertedWithCustomError(factory, "RegulationTypeAndSubTypeForbidden")
        .withArgs(RegulationType.NONE, regulationSubType);
    });

    it("GIVEN wrong regulation type & subtype WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const bondData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
        }),
        bondDetails: await getBondDetails(),
        proceedRecipients: [],
        proceedRecipientsData: [],
      };
      bondData.security.resolverProxyConfiguration = {
        key: BOND_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData({
        regulationType: RegulationType.REG_S,
        regulationSubType: RegulationSubType.REG_D_506_C,
        additionalSecurityData: {
          countriesControlListType,
          listOfCountries,
          info,
        },
      });

      await expect(factory.deployBond(bondData, factoryRegulationData))
        .to.be.revertedWithCustomError(factory, "RegulationTypeAndSubTypeForbidden")
        .withArgs(RegulationType.REG_S, RegulationSubType.REG_D_506_C);
    });
  });
});
