// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  BusinessLogicResolver,
  IMockFactory,
  IMockFactory__factory,
  type AccessControl,
  type ControlList,
  type ControllerFacet,
  type CoreFacet,
} from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture } from "@test";
import { getRegulationData, getSecurityData } from "@test";
import { makeEquityDetailsData } from "@test";
import { RegulationType, RegulationSubType, ADDRESS_ZERO, EQUITY_CONFIG_ID, ATS_ROLES, BOND_CONFIG_ID } from "@scripts";
import { Rbac, SecurityType } from "@scripts/domain";
import { decodeEvent } from "@scripts/infrastructure";
import { getBondDetails } from "@test";

describe("Factory Tests", () => {
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;

  const init_rbacs: Rbac[] = [];

  const regulationSubType = RegulationSubType.REG_D_506_B;
  const countriesControlListType = true;
  const listOfCountries = "ES,FR,CH";
  const info = "info";

  let factory: IMockFactory;
  let businessLogicResolver: BusinessLogicResolver;
  let accessControlFacet: AccessControl;
  let controlListFacet: ControlList;
  let controllerFacet: ControllerFacet;
  let coreFacet: CoreFacet;

  const listOfRoles = [
    ATS_ROLES.DEFAULT_ADMIN_ROLE,
    ATS_ROLES.ROLE_CONTROL_LIST,
    ATS_ROLES.ROLE_CORPORATE_ACTION,
    ATS_ROLES.ROLE_ISSUER,
    ATS_ROLES.ROLE_DOCUMENTER,
    ATS_ROLES.ROLE_CONTROLLER,
    ATS_ROLES.ROLE_PAUSER,
    ATS_ROLES.ROLE_SNAPSHOT,
    ATS_ROLES.ROLE_LOCKER,
  ];
  let listOfMembers: string[];

  async function deployFactoryFixture() {
    const base = await deployAtsInfrastructureFixture();
    signer_A = base.deployer;
    signer_B = base.user1;
    factory = IMockFactory__factory.connect(await base.factory.getAddress(), signer_A);
    businessLogicResolver = base.blr;

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

    controllerFacet = await ethers.getContractAt("ControllerFacet", equityAddress);

    coreFacet = await ethers.getContractAt("CoreFacet", equityAddress);
  }

  beforeEach(async () => {
    await loadFixture(deployFactoryFixture);
  });

  describe("Modifier Tests - Comprehensive Coverage", () => {
    describe("onlyValidResolver modifier", () => {
      it("GIVEN empty resolver (address(0)) WHEN deploying equity THEN reverts with EmptyResolver", async () => {
        const equityData = {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          equityDetails: makeEquityDetailsData(),
        };
        equityData.security.resolver = ADDRESS_ZERO;
        equityData.security.resolverProxyConfigurationV2 = {
          configurationId: EQUITY_CONFIG_ID,
          configurationVersion: 1,
          replacementEnabled: true,
        };

        await expect(factory.deployEquity(equityData, getRegulationData())).to.be.revertedWithCustomError(
          factory,
          "EmptyResolver",
        );
      });

      it("GIVEN empty resolver WHEN deploying bond THEN reverts with EmptyResolver", async () => {
        const bondData = {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        };
        bondData.security.resolver = ADDRESS_ZERO;
        bondData.security.resolverProxyConfigurationV2 = {
          configurationId: BOND_CONFIG_ID,
          configurationVersion: 1,
          replacementEnabled: true,
        };

        await expect(factory.deployBond(bondData, getRegulationData())).to.be.revertedWithCustomError(
          factory,
          "EmptyResolver",
        );
      });

      it("GIVEN valid resolver WHEN deploying equity THEN passes onlyValidResolver validation", async () => {
        const equityData = {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          equityDetails: makeEquityDetailsData(),
        };
        equityData.security.resolverProxyConfigurationV2 = {
          configurationId: EQUITY_CONFIG_ID,
          configurationVersion: 1,
          replacementEnabled: true,
        };

        await expect(factory.deployEquity(equityData, getRegulationData())).to.emit(factory, "EquityDeployed");
      });
    });

    describe("onlyValidAdmins modifier", () => {
      it("GIVEN rbacs with empty members array for admin role WHEN deploying equity THEN reverts with NoInitialAdmins", async () => {
        const emptyAdminRbacs: Rbac[] = [
          {
            role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
            members: [],
          },
        ];

        const equityData = {
          security: getSecurityData(businessLogicResolver, {
            rbacs: emptyAdminRbacs,
          }),
          equityDetails: makeEquityDetailsData(),
        };
        equityData.security.resolverProxyConfigurationV2 = {
          configurationId: EQUITY_CONFIG_ID,
          configurationVersion: 1,
          replacementEnabled: true,
        };

        await expect(factory.deployEquity(equityData, getRegulationData())).to.be.revertedWithCustomError(
          factory,
          "NoInitialAdmins",
        );
      });

      it("GIVEN rbacs with only zero address as admin WHEN deploying bond THEN reverts with NoInitialAdmins", async () => {
        const zeroAddressAdminRbacs: Rbac[] = [
          {
            role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
            members: [ADDRESS_ZERO],
          },
        ];

        const bondData = {
          security: getSecurityData(businessLogicResolver, {
            rbacs: zeroAddressAdminRbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        };
        bondData.security.resolverProxyConfigurationV2 = {
          configurationId: BOND_CONFIG_ID,
          configurationVersion: 1,
          replacementEnabled: true,
        };

        await expect(factory.deployBond(bondData, getRegulationData())).to.be.revertedWithCustomError(
          factory,
          "NoInitialAdmins",
        );
      });

      it("GIVEN rbacs with no admin role WHEN deploying equity THEN reverts with NoInitialAdmins", async () => {
        const noAdminRbacs: Rbac[] = [
          {
            role: ATS_ROLES.ROLE_CONTROL_LIST,
            members: [signer_A.address],
          },
        ];

        const equityData = {
          security: getSecurityData(businessLogicResolver, {
            rbacs: noAdminRbacs,
          }),
          equityDetails: makeEquityDetailsData(),
        };
        equityData.security.resolverProxyConfigurationV2 = {
          configurationId: EQUITY_CONFIG_ID,
          configurationVersion: 1,
          replacementEnabled: true,
        };

        await expect(factory.deployEquity(equityData, getRegulationData())).to.be.revertedWithCustomError(
          factory,
          "NoInitialAdmins",
        );
      });

      it("GIVEN rbacs with admin role having valid address after zero address WHEN deploying equity THEN passes validation", async () => {
        const mixedAdminRbacs: Rbac[] = [
          {
            role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
            members: [ADDRESS_ZERO, signer_A.address],
          },
        ];

        const equityData = {
          security: getSecurityData(businessLogicResolver, {
            rbacs: mixedAdminRbacs,
          }),
          equityDetails: makeEquityDetailsData(),
        };
        equityData.security.resolverProxyConfigurationV2 = {
          configurationId: EQUITY_CONFIG_ID,
          configurationVersion: 1,
          replacementEnabled: true,
        };

        await expect(factory.deployEquity(equityData, getRegulationData())).to.emit(factory, "EquityDeployed");
      });

      it("GIVEN rbacs with multiple roles where admin role is last WHEN deploying bond THEN passes validation", async () => {
        const orderedRbacs: Rbac[] = [
          {
            role: ATS_ROLES.ROLE_CONTROL_LIST,
            members: [signer_A.address],
          },
          {
            role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
            members: [signer_B.address],
          },
        ];

        const bondData = {
          security: getSecurityData(businessLogicResolver, {
            rbacs: orderedRbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        };
        bondData.security.resolverProxyConfigurationV2 = {
          configurationId: BOND_CONFIG_ID,
          configurationVersion: 1,
          replacementEnabled: true,
        };

        await expect(factory.deployBond(bondData, getRegulationData())).to.emit(factory, "BondDeployed");
      });
    });

    describe("onlyValidRegulation modifier", () => {
      it("GIVEN NONE regulation type with non-NONE subtype WHEN deploying equity THEN reverts with RegulationTypeAndSubTypeForbidden", async () => {
        const equityData = {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          equityDetails: makeEquityDetailsData(),
        };
        equityData.security.resolverProxyConfigurationV2 = {
          configurationId: EQUITY_CONFIG_ID,
          configurationVersion: 1,
          replacementEnabled: true,
        };

        const invalidRegulationData = getRegulationData({
          regulationType: RegulationType.NONE,
          regulationSubType: RegulationSubType.REG_D_506_B,
        });

        await expect(factory.deployEquity(equityData, invalidRegulationData))
          .to.be.revertedWithCustomError(factory, "RegulationTypeAndSubTypeForbidden")
          .withArgs(RegulationType.NONE, RegulationSubType.REG_D_506_B);
      });

      it("GIVEN non-NONE regulation type with NONE subtype WHEN deploying bond THEN reverts with RegulationTypeAndSubTypeForbidden", async () => {
        const bondData = {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        };
        bondData.security.resolverProxyConfigurationV2 = {
          configurationId: BOND_CONFIG_ID,
          configurationVersion: 1,
          replacementEnabled: true,
        };

        const invalidRegulationData = getRegulationData({
          regulationType: RegulationType.REG_D,
          regulationSubType: RegulationSubType.NONE,
        });

        await expect(factory.deployBond(bondData, invalidRegulationData))
          .to.be.revertedWithCustomError(factory, "RegulationTypeAndSubTypeForbidden")
          .withArgs(RegulationType.REG_D, RegulationSubType.NONE);
      });

      it("GIVEN REG_S with REG_D_506_B subtype WHEN deploying equity THEN reverts with RegulationTypeAndSubTypeForbidden", async () => {
        const equityData = {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          equityDetails: makeEquityDetailsData(),
        };
        equityData.security.resolverProxyConfigurationV2 = {
          configurationId: EQUITY_CONFIG_ID,
          configurationVersion: 1,
          replacementEnabled: true,
        };

        const invalidRegulationData = getRegulationData({
          regulationType: RegulationType.REG_S,
          regulationSubType: RegulationSubType.REG_D_506_B,
        });

        await expect(factory.deployEquity(equityData, invalidRegulationData))
          .to.be.revertedWithCustomError(factory, "RegulationTypeAndSubTypeForbidden")
          .withArgs(RegulationType.REG_S, RegulationSubType.REG_D_506_B);
      });

      it("GIVEN valid regulation type and subtype combination WHEN deploying equity THEN passes validation", async () => {
        const equityData = {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          equityDetails: makeEquityDetailsData(),
        };
        equityData.security.resolverProxyConfigurationV2 = {
          configurationId: EQUITY_CONFIG_ID,
          configurationVersion: 1,
          replacementEnabled: true,
        };

        const validRegulationData = getRegulationData({
          regulationType: RegulationType.REG_D,
          regulationSubType: RegulationSubType.REG_D_506_C,
        });

        await expect(factory.deployEquity(equityData, validRegulationData)).to.emit(factory, "EquityDeployed");
      });

      it("GIVEN REG_S/NONE regulation combination WHEN deploying bond THEN passes validation", async () => {
        const bondData = {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        };
        bondData.security.resolverProxyConfigurationV2 = {
          configurationId: BOND_CONFIG_ID,
          configurationVersion: 1,
          replacementEnabled: true,
        };

        const regSRegulationData = getRegulationData({
          regulationType: RegulationType.REG_S,
          regulationSubType: RegulationSubType.NONE,
        });

        await expect(factory.deployBond(bondData, regSRegulationData)).to.emit(factory, "BondDeployed");
      });
    });
  });

  describe("Generic Proxy tests", () => {
    it("GIVEN an empty Resolver WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const resolverProxyConfigurationV2 = {
        configurationId: EQUITY_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
      };
      await expect(
        factory.deployProxy(ADDRESS_ZERO, resolverProxyConfigurationV2, init_rbacs, "0x"),
      ).to.be.revertedWithCustomError(factory, "EmptyResolver");
    });

    it("GIVEN no admin WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const resolverProxyConfigurationV2 = {
        configurationId: EQUITY_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
      };
      await expect(
        factory.deployProxy(businessLogicResolver, resolverProxyConfigurationV2, [], "0x"),
      ).to.be.revertedWithCustomError(factory, "NoInitialAdmins");
    });

    it("GIVEN the proper information WHEN deploying a new resolverProxy THEN transaction succeeds", async () => {
      const originalData = "0x1234567812345678";
      const resolverProxyConfigurationV2 = {
        configurationId: EQUITY_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
      };
      const expectedProxyAddress = await factory
        .getFunction("deployProxy")
        .staticCall(businessLogicResolver, resolverProxyConfigurationV2, init_rbacs, originalData);

      const tx = factory.deployProxy(businessLogicResolver, resolverProxyConfigurationV2, init_rbacs, originalData);
      await expect(tx).to.emit(factory, "ProxyDeployed");

      const result = await tx;
      const receipt = await result.wait();

      const decoded = await decodeEvent(factory, "ProxyDeployed", receipt);

      const proxyAddress = decoded.proxyAddress;
      const resolver = decoded.resolver;
      const configKey = decoded.configKey;
      const version = decoded.version;
      const rbac = decoded.rbac;
      const data = decoded.data;

      expect(proxyAddress).not.to.equal(ADDRESS_ZERO);
      expect(proxyAddress).to.equal(expectedProxyAddress);
      expect(resolver).to.equal(businessLogicResolver);
      expect(configKey).to.equal(EQUITY_CONFIG_ID);
      expect(version).to.equal(1);
      expect(rbac.length).to.equal(init_rbacs.length);
      expect(data).to.equal(originalData);

      for (let i = 0; i < init_rbacs.length; i++) {
        expect(rbac[i][0]).to.be.equal(listOfRoles[i]);
        expect(rbac[i][1].length).to.equal(listOfMembers.length);
        expect(rbac[i][1][0]).to.be.equal(listOfMembers[0]);
        expect(rbac[i][1][1]).to.be.equal(listOfMembers[1]);
      }
    });
  });

  describe("Equity tests", () => {
    it("GIVEN an empty Resolver WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver),
        equityDetails: makeEquityDetailsData(),
      };
      equityData.security.resolverProxyConfigurationV2 = {
        configurationId: EQUITY_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
      };
      equityData.security.resolver = ADDRESS_ZERO;

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployEquity(equityData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "EmptyResolver",
      );
    });

    it("GIVEN no admin WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver),
        equityDetails: makeEquityDetailsData(),
      };
      equityData.security.resolverProxyConfigurationV2 = {
        configurationId: EQUITY_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployEquity(equityData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "NoInitialAdmins",
      );
    });

    it("GIVEN wrong regulation type WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
        }),
        equityDetails: makeEquityDetailsData(),
      };
      equityData.security.resolverProxyConfigurationV2 = {
        configurationId: EQUITY_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
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
        equityDetails: makeEquityDetailsData(),
      };
      equityData.security.resolverProxyConfigurationV2 = {
        configurationId: EQUITY_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
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
        equityDetails: makeEquityDetailsData(),
      };
      equityData.security.resolverProxyConfigurationV2 = {
        configurationId: EQUITY_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
      };

      const factoryRegulationData = getRegulationData();

      const tx = factory.deployEquity(equityData, factoryRegulationData);
      await expect(tx).to.emit(factory, "EquityDeployed");

      const result = await tx;
      const receipt = await result.wait();
      const decoded = await decodeEvent(factory, "EquityDeployed", receipt);
      const equityAddress = decoded.equityAddress;

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

      const controllable = await controllerFacet.isControllable();
      expect(controllable).to.be.equal(equityData.security.isControllable);

      const metadata = await coreFacet.getERC20Metadata();
      expect(metadata.info.name).to.be.equal(equityData.security.erc20MetadataInfo.name);
      expect(metadata.info.symbol).to.be.equal(equityData.security.erc20MetadataInfo.symbol);
      expect(metadata.info.decimals).to.be.equal(equityData.security.erc20MetadataInfo.decimals);
      expect(metadata.securityType).to.be.equal(SecurityType.EQUITY);

      const nominalValueFacet = await ethers.getContractAt("NominalValue", equityAddress);
      expect(await nominalValueFacet.getNominalValueCurrency()).to.equal(equityData.equityDetails.currency);
      expect(await nominalValueFacet.getNominalValue()).to.equal(equityData.equityDetails.nominalValue);
      expect(await nominalValueFacet.getNominalValueDecimals()).to.equal(equityData.equityDetails.nominalValueDecimals);

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
      bondData.security.resolverProxyConfigurationV2 = {
        configurationId: BOND_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
      };
      bondData.security.resolver = ADDRESS_ZERO;

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployBond(bondData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "EmptyResolver",
      );
    });

    it("GIVEN no admin WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const bondData = {
        security: getSecurityData(businessLogicResolver),
        bondDetails: await getBondDetails(),
        proceedRecipients: [],
        proceedRecipientsData: [],
      };
      bondData.security.resolverProxyConfigurationV2 = {
        configurationId: BOND_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployBond(bondData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "NoInitialAdmins",
      );
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
      bondData.security.resolverProxyConfigurationV2 = {
        configurationId: BOND_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployBond(bondData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "WrongDates",
      );

      const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000) + 1;
      bondData.bondDetails.startingDate = currentTimeInSeconds - 10000;
      bondData.bondDetails.maturityDate = bondData.bondDetails.startingDate + 10;

      await expect(factory.deployBond(bondData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "WrongTimestamp",
      );
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
      bondData.security.resolverProxyConfigurationV2 = {
        configurationId: BOND_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
      };

      const factoryRegulationData = getRegulationData();

      const tx = factory.deployBond(bondData, factoryRegulationData);

      await expect(tx).to.emit(factory, "BondDeployed");

      const result = await tx;
      const receipt = await result.wait();
      const decoded = await decodeEvent(factory, "BondDeployed", receipt);
      const bondAddress = decoded.bondAddress;

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

      const controllable = await controllerFacet.isControllable();
      expect(controllable).to.be.equal(bondData.security.isControllable);

      const metadata = await coreFacet.getERC20Metadata();
      expect(metadata.info.name).to.be.equal(bondData.security.erc20MetadataInfo.name);
      expect(metadata.info.symbol).to.be.equal(bondData.security.erc20MetadataInfo.symbol);
      expect(metadata.info.decimals).to.be.equal(bondData.security.erc20MetadataInfo.decimals);
      expect(metadata.securityType).to.be.equal(SecurityType.BOND_VARIABLE_RATE);

      const capFacet = await ethers.getContractAt("Cap", bondAddress);
      const maxSupply = await capFacet.getMaxSupply();
      expect(maxSupply).to.equal(bondData.security.maxSupply);

      const nominalFacet = await ethers.getContractAt("NominalValue", bondAddress);

      expect(await nominalFacet.getNominalValueCurrency()).to.be.deep.equal(bondData.bondDetails.currency);
      expect(await nominalFacet.getNominalValue()).to.be.deep.equal(bondData.bondDetails.nominalValue);
      expect(await nominalFacet.getNominalValueDecimals()).to.be.deep.equal(bondData.bondDetails.nominalValueDecimals);

      const maturityFacet = await ethers.getContractAt("Maturity", bondAddress);
      expect(await maturityFacet.getMaturityDate()).to.be.deep.equal(bondData.bondDetails.maturityDate);

      const couponFacet = await ethers.getContractAt("CouponFacet", bondAddress);
      const couponCount = await couponFacet.getCouponCount();
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
      bondData.security.resolverProxyConfigurationV2 = {
        configurationId: BOND_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
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
      bondData.security.resolverProxyConfigurationV2 = {
        configurationId: BOND_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
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

  describe("getAppliedRegulationData tests", () => {
    it("GIVEN a valid regulation type and subtype WHEN calling getAppliedRegulationData THEN returns regulation data", async () => {
      const regulationType = RegulationType.REG_D;
      const regulationSubType = RegulationSubType.REG_D_506_B;

      const regulationData = await factory.getAppliedRegulationData(regulationType, regulationSubType);

      expect(regulationData.regulationType).to.equal(regulationType);
      expect(regulationData.regulationSubType).to.equal(regulationSubType);
    });

    it("GIVEN REG_D with 506_C subtype WHEN calling getAppliedRegulationData THEN returns correct data", async () => {
      const regulationType = RegulationType.REG_D;
      const regulationSubType = RegulationSubType.REG_D_506_C;

      const regulationData = await factory.getAppliedRegulationData(regulationType, regulationSubType);

      expect(regulationData.regulationType).to.equal(regulationType);
      expect(regulationData.regulationSubType).to.equal(regulationSubType);
    });

    it("GIVEN REG_S regulation type WHEN calling getAppliedRegulationData THEN returns correct data", async () => {
      const regulationType = RegulationType.REG_S;
      const regulationSubType = RegulationSubType.NONE;

      const regulationData = await factory.getAppliedRegulationData(regulationType, regulationSubType);

      expect(regulationData.regulationType).to.equal(regulationType);
      expect(regulationData.regulationSubType).to.equal(regulationSubType);
    });
  });

  describe("onlyValidAdmins edge cases", () => {
    it("GIVEN rbacs with empty members array for admin role WHEN deploying equity THEN transaction fails", async () => {
      const emptyAdminRbacs: Rbac[] = [
        {
          role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
          members: [], // Empty members array
        },
      ];

      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: emptyAdminRbacs,
        }),
        equityDetails: makeEquityDetailsData(),
      };
      equityData.security.resolverProxyConfigurationV2 = {
        configurationId: EQUITY_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployEquity(equityData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "NoInitialAdmins",
      );
    });

    it("GIVEN rbacs with only zero address as admin WHEN deploying equity THEN transaction fails", async () => {
      const zeroAddressAdminRbacs: Rbac[] = [
        {
          role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
          members: [ADDRESS_ZERO], // Only zero address
        },
      ];

      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: zeroAddressAdminRbacs,
        }),
        equityDetails: makeEquityDetailsData(),
      };
      equityData.security.resolverProxyConfigurationV2 = {
        configurationId: EQUITY_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployEquity(equityData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "NoInitialAdmins",
      );
    });

    it("GIVEN rbacs with multiple roles but no admin role WHEN deploying equity THEN transaction fails", async () => {
      const noAdminRbacs: Rbac[] = [
        {
          role: ATS_ROLES.ROLE_CONTROL_LIST,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_ISSUER,
          members: [signer_B.address],
        },
      ];

      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: noAdminRbacs,
        }),
        equityDetails: makeEquityDetailsData(),
      };
      equityData.security.resolverProxyConfigurationV2 = {
        configurationId: EQUITY_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployEquity(equityData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "NoInitialAdmins",
      );
    });

    it("GIVEN rbacs with admin role having zero address followed by valid address WHEN deploying equity THEN transaction succeeds", async () => {
      const mixedAdminRbacs: Rbac[] = [
        {
          role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
          members: [ADDRESS_ZERO, signer_A.address], // Zero address first, then valid address
        },
      ];

      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: mixedAdminRbacs,
        }),
        equityDetails: makeEquityDetailsData(),
      };
      equityData.security.resolverProxyConfigurationV2 = {
        configurationId: EQUITY_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployEquity(equityData, factoryRegulationData)).to.emit(factory, "EquityDeployed");
    });

    it("GIVEN rbacs with non-admin roles followed by admin role WHEN deploying bond THEN transaction succeeds", async () => {
      const orderedRbacs: Rbac[] = [
        {
          role: ATS_ROLES.ROLE_CONTROL_LIST,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_ISSUER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
          members: [signer_A.address],
        },
      ];

      const bondData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: orderedRbacs,
        }),
        bondDetails: await getBondDetails(),
        proceedRecipients: [],
        proceedRecipientsData: [],
      };
      bondData.security.resolverProxyConfigurationV2 = {
        configurationId: BOND_CONFIG_ID,
        configurationVersion: 1,
        replacementEnabled: true,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployBond(bondData, factoryRegulationData)).to.emit(factory, "BondDeployed");
    });
  });
});
