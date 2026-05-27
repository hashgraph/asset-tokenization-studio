// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  BusinessLogicResolver,
  IFactory,
  type AccessControl,
  type ControlList,
  type ControllerFacet,
  type CoreFacet,
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
  BOND_FIXED_RATE_CONFIG_ID,
  BOND_KPI_LINKED_RATE_CONFIG_ID,
  DEPOSIT_TOKEN_CONFIG_ID,
} from "@scripts";
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

  let factory: IFactory;
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

    controllerFacet = await ethers.getContractAt("ControllerFacet", equityAddress);

    coreFacet = await ethers.getContractAt("CoreFacet", equityAddress);
  }

  beforeEach(async () => {
    await loadFixture(deployFactoryFixture);
  });

  describe("Modifier Tests - Comprehensive Coverage", () => {
    describe("checkResolver modifier", () => {
      it("GIVEN empty resolver (address(0)) WHEN deploying equity THEN reverts with EmptyResolver", async () => {
        const equityData = {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          equityDetails: getEquityDetails(),
        };
        equityData.security.resolver = ADDRESS_ZERO;
        equityData.security.resolverProxyConfiguration = {
          key: EQUITY_CONFIG_ID,
          version: 1,
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
        bondData.security.resolverProxyConfiguration = {
          key: BOND_CONFIG_ID,
          version: 1,
        };

        await expect(factory.deployBond(bondData, getRegulationData())).to.be.revertedWithCustomError(
          factory,
          "EmptyResolver",
        );
      });

      it("GIVEN valid resolver WHEN deploying equity THEN passes checkResolver validation", async () => {
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

        await expect(factory.deployEquity(equityData, getRegulationData())).to.emit(factory, "EquityDeployed");
      });
    });

    describe("checkISIN modifier", () => {
      it("GIVEN ISIN with length < 12 WHEN deploying equity THEN reverts with WrongISIN", async () => {
        const equityData = {
          security: getSecurityData(businessLogicResolver, {
            erc20MetadataInfo: { isin: "US037833100" }, // 11 characters
            rbacs: init_rbacs,
          }),
          equityDetails: getEquityDetails(),
        };
        equityData.security.resolverProxyConfiguration = {
          key: EQUITY_CONFIG_ID,
          version: 1,
        };

        await expect(factory.deployEquity(equityData, getRegulationData())).to.be.revertedWithCustomError(
          factory,
          "WrongISIN",
        );
      });

      it("GIVEN ISIN with length > 12 WHEN deploying equity THEN reverts with WrongISIN", async () => {
        const equityData = {
          security: getSecurityData(businessLogicResolver, {
            erc20MetadataInfo: { isin: "US03783310051" }, // 13 characters
            rbacs: init_rbacs,
          }),
          equityDetails: getEquityDetails(),
        };
        equityData.security.resolverProxyConfiguration = {
          key: EQUITY_CONFIG_ID,
          version: 1,
        };

        await expect(factory.deployEquity(equityData, getRegulationData())).to.be.revertedWithCustomError(
          factory,
          "WrongISIN",
        );
      });

      it("GIVEN empty ISIN WHEN deploying bond THEN reverts with WrongISIN", async () => {
        const bondData = {
          security: getSecurityData(businessLogicResolver, {
            erc20MetadataInfo: { isin: "" },
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

        await expect(factory.deployBond(bondData, getRegulationData())).to.be.revertedWithCustomError(
          factory,
          "WrongISIN",
        );
      });

      it("GIVEN invalid ISIN checksum WHEN deploying equity THEN reverts with WrongISINChecksum", async () => {
        const equityData = {
          security: getSecurityData(businessLogicResolver, {
            erc20MetadataInfo: { isin: "US0378331009" }, // Wrong checksum digit
            rbacs: init_rbacs,
          }),
          equityDetails: getEquityDetails(),
        };
        equityData.security.resolverProxyConfiguration = {
          key: EQUITY_CONFIG_ID,
          version: 1,
        };

        await expect(factory.deployEquity(equityData, getRegulationData())).to.be.revertedWithCustomError(
          factory,
          "WrongISINChecksum",
        );
      });

      it("GIVEN invalid ISIN checksum WHEN deploying equity THEN reverts with WrongISIN", async () => {
        const equityData = {
          security: getSecurityData(businessLogicResolver, {
            erc20MetadataInfo: { isin: "US0378331009" }, // Wrong checksum digit
            rbacs: init_rbacs,
          }),
          equityDetails: getEquityDetails(),
        };
        equityData.security.resolverProxyConfiguration = {
          key: EQUITY_CONFIG_ID,
          version: 1,
        };

        await expect(factory.deployEquity(equityData, getRegulationData())).to.be.revertedWithCustomError(
          factory,
          "WrongISINChecksum",
        );
      });

      it("GIVEN valid ISIN WHEN deploying bond THEN passes checkISIN validation", async () => {
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

        await expect(factory.deployBond(bondData, getRegulationData())).to.emit(factory, "BondDeployed");
      });
    });

    describe("checkAdmins modifier", () => {
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
          equityDetails: getEquityDetails(),
        };
        equityData.security.resolverProxyConfiguration = {
          key: EQUITY_CONFIG_ID,
          version: 1,
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
        bondData.security.resolverProxyConfiguration = {
          key: BOND_CONFIG_ID,
          version: 1,
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
          equityDetails: getEquityDetails(),
        };
        equityData.security.resolverProxyConfiguration = {
          key: EQUITY_CONFIG_ID,
          version: 1,
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
          equityDetails: getEquityDetails(),
        };
        equityData.security.resolverProxyConfiguration = {
          key: EQUITY_CONFIG_ID,
          version: 1,
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
        bondData.security.resolverProxyConfiguration = {
          key: BOND_CONFIG_ID,
          version: 1,
        };

        await expect(factory.deployBond(bondData, getRegulationData())).to.emit(factory, "BondDeployed");
      });
    });

    describe("checkRegulation modifier", () => {
      it("GIVEN NONE regulation type with non-NONE subtype WHEN deploying equity THEN reverts with RegulationTypeAndSubTypeForbidden", async () => {
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
        bondData.security.resolverProxyConfiguration = {
          key: BOND_CONFIG_ID,
          version: 1,
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
          equityDetails: getEquityDetails(),
        };
        equityData.security.resolverProxyConfiguration = {
          key: EQUITY_CONFIG_ID,
          version: 1,
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
          equityDetails: getEquityDetails(),
        };
        equityData.security.resolverProxyConfiguration = {
          key: EQUITY_CONFIG_ID,
          version: 1,
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
        bondData.security.resolverProxyConfiguration = {
          key: BOND_CONFIG_ID,
          version: 1,
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
      await expect(factory.deployProxy(ADDRESS_ZERO, EQUITY_CONFIG_ID, 1, init_rbacs)).to.be.revertedWithCustomError(
        factory,
        "EmptyResolver",
      );
    });

    it("GIVEN no admin WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      await expect(factory.deployProxy(businessLogicResolver, EQUITY_CONFIG_ID, 1, [])).to.be.revertedWithCustomError(
        factory,
        "NoInitialAdmins",
      );
    });

    it("GIVEN the proper information WHEN deploying a new resolverProxy THEN transaction succeeds", async () => {
      const expectedProxyAddress = await factory
        .getFunction("deployProxy")
        .staticCall(businessLogicResolver, EQUITY_CONFIG_ID, 1, init_rbacs);

      const tx = factory.deployProxy(businessLogicResolver, EQUITY_CONFIG_ID, 1, init_rbacs);
      await expect(tx).to.emit(factory, "ProxyDeployed");

      const result = await tx;
      const receipt = await result.wait();

      const decoded = await decodeEvent(factory, "ProxyDeployed", receipt);

      const proxyAddress = decoded.proxyAddress;
      const resolver = decoded.resolver;
      const configKey = decoded.configKey;
      const version = decoded.version;
      const rbac = decoded.rbac;

      expect(proxyAddress).not.to.equal(ADDRESS_ZERO);
      expect(proxyAddress).to.equal(expectedProxyAddress);
      expect(resolver).to.equal(businessLogicResolver);
      expect(configKey).to.equal(EQUITY_CONFIG_ID);
      expect(version).to.equal(1);
      expect(rbac.length).to.equal(init_rbacs.length);

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
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };
      equityData.security.resolver = ADDRESS_ZERO;

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployEquity(equityData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "EmptyResolver",
      );
    });

    it("GIVEN a wrong ISIN WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          erc20MetadataInfo: { isin: "short" },
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
      ).to.be.revertedWithCustomError(factory, "WrongISIN");
      equityData.security.erc20MetadataInfo.isin = "SJ5633813321";
      await expect(factory.deployEquity(equityData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "WrongISINChecksum",
      );
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
      expect(equityMetadata.nominalValueDecimals).to.equal(equityData.equityDetails.nominalValueDecimals);

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

      await expect(factory.deployBond(bondData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "EmptyResolver",
      );
    });

    it("GIVEN a wrong ISIN WHEN deploying a new resolverProxy THEN transaction fails", async () => {
      const bondData = {
        security: getSecurityData(businessLogicResolver, {
          erc20MetadataInfo: { isin: "wrong_isin" },
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

      await expect(factory.deployBond(bondData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "WrongISIN",
      );
      bondData.security.erc20MetadataInfo.isin = "SJ5633813321";
      await expect(factory.deployBond(bondData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "WrongISINChecksum",
      );
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
      bondData.security.resolverProxyConfiguration = {
        key: BOND_CONFIG_ID,
        version: 1,
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
      bondData.security.resolverProxyConfiguration = {
        key: BOND_CONFIG_ID,
        version: 1,
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
      expect(metadata.info.isin).to.be.equal(bondData.security.erc20MetadataInfo.isin);
      expect(metadata.securityType).to.be.equal(SecurityType.BOND_VARIABLE_RATE);

      const capFacet = await ethers.getContractAt("Cap", bondAddress);
      const maxSupply = await capFacet.getMaxSupply();
      expect(maxSupply).to.equal(bondData.security.maxSupply);

      const bondFacet = await ethers.getContractAt("BondRead", bondAddress);
      const bondDetails = await bondFacet.getBondDetails();
      expect(bondDetails.currency).to.be.deep.equal(bondData.bondDetails.currency);
      expect(bondDetails.nominalValue).to.be.deep.equal(bondData.bondDetails.nominalValue);
      expect(bondDetails.nominalValueDecimals).to.be.deep.equal(bondData.bondDetails.nominalValueDecimals);
      expect(bondDetails.startingDate).to.be.deep.equal(bondData.bondDetails.startingDate);
      expect(bondDetails.maturityDate).to.be.deep.equal(bondData.bondDetails.maturityDate);
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

  describe("Deposit Token tests", () => {
    function buildDepositTokenData() {
      const depositTokenData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
        }),
      };
      depositTokenData.security.resolverProxyConfiguration = {
        key: DEPOSIT_TOKEN_CONFIG_ID,
        version: 1,
      };
      return depositTokenData;
    }

    it("GIVEN an empty Resolver WHEN deploying a new deposit token THEN transaction fails", async () => {
      const depositTokenData = buildDepositTokenData();
      depositTokenData.security.resolver = ADDRESS_ZERO;

      await expect(factory.deployDepositToken(depositTokenData, getRegulationData())).to.be.revertedWithCustomError(
        factory,
        "EmptyResolver",
      );
    });

    it("GIVEN a wrong ISIN WHEN deploying a new deposit token THEN transaction fails", async () => {
      const depositTokenData = buildDepositTokenData();
      depositTokenData.security.erc20MetadataInfo.isin = "short";

      await expect(
        factory.deployDepositToken(depositTokenData, getRegulationData(), {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(factory, "WrongISIN");

      depositTokenData.security.erc20MetadataInfo.isin = "SJ5633813321";
      await expect(factory.deployDepositToken(depositTokenData, getRegulationData())).to.be.revertedWithCustomError(
        factory,
        "WrongISINChecksum",
      );
    });

    it("GIVEN no admin WHEN deploying a new deposit token THEN transaction fails", async () => {
      const depositTokenData = {
        security: getSecurityData(businessLogicResolver),
      };
      depositTokenData.security.resolverProxyConfiguration = {
        key: DEPOSIT_TOKEN_CONFIG_ID,
        version: 1,
      };

      await expect(factory.deployDepositToken(depositTokenData, getRegulationData())).to.be.revertedWithCustomError(
        factory,
        "NoInitialAdmins",
      );
    });

    it("GIVEN wrong regulation type WHEN deploying a new deposit token THEN transaction fails", async () => {
      const depositTokenData = buildDepositTokenData();
      const factoryRegulationData = getRegulationData({
        regulationType: RegulationType.NONE,
        regulationSubType,
        additionalSecurityData: {
          countriesControlListType,
          listOfCountries,
          info,
        },
      });

      await expect(factory.deployDepositToken(depositTokenData, factoryRegulationData))
        .to.be.revertedWithCustomError(factory, "RegulationTypeAndSubTypeForbidden")
        .withArgs(RegulationType.NONE, regulationSubType);
    });

    it("GIVEN the proper information WHEN deploying a new deposit token THEN transaction succeeds and exposes the 24-capability surface", async () => {
      const depositTokenData = buildDepositTokenData();

      const tx = factory.deployDepositToken(depositTokenData, getRegulationData());
      await expect(tx).to.emit(factory, "DepositTokenDeployed");

      const result = await tx;
      const receipt = await result.wait();
      const decoded = await decodeEvent(factory, "DepositTokenDeployed", receipt);
      const depositTokenAddress: string = decoded.depositTokenAddress;
      expect(depositTokenAddress).to.not.equal(ADDRESS_ZERO);

      await readFacets(depositTokenAddress);

      // RBAC: every role assigned in init_rbacs is present
      for (let i = 0; i < listOfMembers.length; i++) {
        const roleMemberCount = await accessControlFacet.getRoleMemberCount(listOfRoles[i]);
        expect(roleMemberCount).to.be.equal(2);
      }

      // SecurityType encoded in CoreFacet metadata is DEPOSIT_TOKEN (index 5)
      const metadata = await coreFacet.getERC20Metadata();
      expect(metadata.info.name).to.be.equal(depositTokenData.security.erc20MetadataInfo.name);
      expect(metadata.info.symbol).to.be.equal(depositTokenData.security.erc20MetadataInfo.symbol);
      expect(metadata.info.decimals).to.be.equal(depositTokenData.security.erc20MetadataInfo.decimals);
      expect(metadata.info.isin).to.be.equal(depositTokenData.security.erc20MetadataInfo.isin);
      expect(metadata.securityType).to.be.equal(SecurityType.DEPOSIT_TOKEN);

      // Cap initialised from SecurityData.maxSupply
      const capFacet = await ethers.getContractAt("Cap", depositTokenAddress);
      expect(await capFacet.getMaxSupply()).to.equal(depositTokenData.security.maxSupply);

      // Verify via the diamond loupe that at least one selector from every YES capability
      // (per docs/DEPOSIT_TOKEN_PLAN.md §3) is registered on this diamond. Also verifies
      // that the four "TODO — REMOVE WHEN POSSIBLE" zombie facetas
      // (KycFacet, ExternalPauseManagementFacet, ExternalKycListManagementFacet,
      // ProtectedPartitionsFacet) are routable even though their capabilities are gated OFF.
      const loupe = await ethers.getContractAt("IDiamondLoupe", depositTokenAddress);

      const sel = async (facetName: string, functionName: string) =>
        (await ethers.getContractAt(facetName, depositTokenAddress)).interface.getFunction(functionName)!.selector;

      const expectedSelectors: Array<{ capability: string; name: string; selector: string }> = [
        // Controller (covers the 5 controller verbs)
        {
          capability: "Controller",
          name: "controllerTransfer",
          selector: await sel("ControllerFacet", "controllerTransfer"),
        },
        {
          capability: "Controller",
          name: "controllerRedeem",
          selector: await sel("ControllerFacet", "controllerRedeem"),
        },
        {
          capability: "Controller",
          name: "controllerTransferByPartition",
          selector: await sel("ControllerByPartitionFacet", "controllerTransferByPartition"),
        },
        {
          capability: "Controller",
          name: "controllerRedeemByPartition",
          selector: await sel("ControllerByPartitionFacet", "controllerRedeemByPartition"),
        },
        {
          capability: "Controller",
          name: "controllerCreateHoldByPartition",
          selector: await sel("ControllerHoldByPartitionFacet", "controllerCreateHoldByPartition"),
        },
        // Hold
        {
          capability: "Hold",
          name: "executeHoldByPartition",
          selector: await sel("HoldByPartitionFacet", "executeHoldByPartition"),
        },
        {
          capability: "Hold",
          name: "releaseHoldByPartition",
          selector: await sel("HoldByPartitionFacet", "releaseHoldByPartition"),
        },
        {
          capability: "Hold",
          name: "reclaimHoldByPartition",
          selector: await sel("HoldByPartitionFacet", "reclaimHoldByPartition"),
        },
        // Mint
        { capability: "Mint", name: "issue", selector: await sel("MintFacet", "issue") },
        {
          capability: "Mint",
          name: "issueByPartition",
          selector: await sel("MintByPartitionFacet", "issueByPartition"),
        },
        // Burn
        { capability: "Burn", name: "burn", selector: await sel("BurnFacet", "burn") },
        // Transfer
        { capability: "Transfer", name: "transfer", selector: await sel("TransferFacet", "transfer") },
        // Allowance (includes approve)
        { capability: "Allowance", name: "approve", selector: await sel("AllowanceFacet", "approve") },
        // Operator
        {
          capability: "Operator",
          name: "authorizeOperator",
          selector: await sel("OperatorFacet", "authorizeOperator"),
        },
        // Partitions
        { capability: "Partitions", name: "partitionsOf", selector: await sel("PartitionsFacet", "partitionsOf") },
        // Batch
        { capability: "Batch", name: "batchTransfer", selector: await sel("BatchTransferFacet", "batchTransfer") },
        // Freeze
        {
          capability: "Freeze",
          name: "freezePartialTokens",
          selector: await sel("FreezeFacet", "freezePartialTokens"),
        },
        // Cap per-partition
        {
          capability: "Cap",
          name: "setMaxSupplyByPartition",
          selector: await sel("CapByPartitionFacet", "setMaxSupplyByPartition"),
        },
        // Clearing
        { capability: "Clearing", name: "activateClearing", selector: await sel("ClearingFacet", "activateClearing") },
        // Transfer Compliance
        {
          capability: "Transfer Compliance",
          name: "canTransfer",
          selector: await sel("ComplianceFacet", "canTransfer"),
        },
        // Eligibility (ControlList)
        {
          capability: "Eligibility",
          name: "addToControlList",
          selector: await sel("ControlListFacet", "addToControlList"),
        },
        // External Eligibility
        {
          capability: "External Eligibility",
          name: "addExternalControlList",
          selector: await sel("ExternalControlListManagementFacet", "addExternalControlList"),
        },
        // Balance Tracker
        { capability: "Balance Tracker", name: "balanceOf", selector: await sel("BalanceTrackerFacet", "balanceOf") },
        {
          capability: "Balance Tracker",
          name: "balanceOfByPartition",
          selector: await sel("BalanceTrackerByPartitionFacet", "balanceOfByPartition"),
        },
        // Security Holders
        {
          capability: "Security Holders",
          name: "getTotalSecurityHolders",
          selector: await sel("SecurityHoldersFacet", "getTotalSecurityHolders"),
        },
        // Deactivate
        { capability: "Deactivate", name: "deactivate", selector: await sel("DeactivateFacet", "deactivate") },
        // Documentation
        { capability: "Documentation", name: "setDocument", selector: await sel("DocumentationFacet", "setDocument") },
        // Metadata (Custom Data)
        { capability: "Metadata", name: "setMetadata", selector: await sel("MetadataFacet", "setMetadata") },
        // Nominal Value
        {
          capability: "Nominal Value",
          name: "setNominalValue",
          selector: await sel("NominalValueFacet", "setNominalValue"),
        },
        // Pause
        { capability: "Pause", name: "pause", selector: await sel("PauseFacet", "pause") },
        // Always-on TODO/zombie facetas (capabilities = NO but the faceta is in the config)
        {
          capability: "[zombie] KYC",
          name: "initializeInternalKyc",
          selector: await sel("KycFacet", "initializeInternalKyc"),
        },
        {
          capability: "[zombie] External Pause",
          name: "initializeExternalPauses",
          selector: await sel("ExternalPauseManagementFacet", "initializeExternalPauses"),
        },
        {
          capability: "[zombie] External KYC",
          name: "initializeExternalKycLists",
          selector: await sel("ExternalKycListManagementFacet", "initializeExternalKycLists"),
        },
        {
          capability: "[zombie] Protected",
          name: "initialize_ProtectedPartitions",
          selector: await sel("ProtectedPartitionsFacet", "initialize_ProtectedPartitions"),
        },
      ];

      for (const { capability, name, selector } of expectedSelectors) {
        const facetAddress = await loupe.getFacetAddress(selector);
        expect(
          facetAddress,
          `[${capability}] selector ${name} (${selector}) is not registered on the deposit token diamond`,
        ).to.not.equal(ADDRESS_ZERO);
      }
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

  describe("ISIN validation edge cases", () => {
    it("GIVEN an ISIN with length less than 12 WHEN deploying equity THEN transaction fails with WrongISIN", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          erc20MetadataInfo: { isin: "US037833100" }, // 11 characters - too short
          rbacs: init_rbacs,
        }),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployEquity(equityData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "WrongISIN",
      );
    });

    it("GIVEN an ISIN with length greater than 12 WHEN deploying equity THEN transaction fails with WrongISIN", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          erc20MetadataInfo: { isin: "US03783310051" }, // 13 characters - too long
          rbacs: init_rbacs,
        }),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployEquity(equityData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "WrongISIN",
      );
    });

    it("GIVEN an empty ISIN WHEN deploying equity THEN transaction fails with WrongISIN", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          erc20MetadataInfo: { isin: "" }, // Empty string
          rbacs: init_rbacs,
        }),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployEquity(equityData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "WrongISIN",
      );
    });

    it("GIVEN an ISIN with wrong length WHEN deploying bond THEN transaction fails with WrongISIN", async () => {
      const bondData = {
        security: getSecurityData(businessLogicResolver, {
          erc20MetadataInfo: { isin: "SHORT" }, // Too short
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

      await expect(factory.deployBond(bondData, factoryRegulationData)).to.be.revertedWithCustomError(
        factory,
        "WrongISIN",
      );
    });
  });

  describe("Bond with Fixed Rate tests", () => {
    it("GIVEN proper BondFixedRateData WHEN deploying a new bond with fixed rate THEN transaction succeeds", async () => {
      const bondFixedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData(),
        fixedRateData: {
          rate: 500, // 5% with 2 decimals
          rateDecimals: 2,
        },
      };

      bondFixedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_FIXED_RATE_CONFIG_ID,
        version: 1,
      };

      const tx = factory.deployBondFixedRate(bondFixedRateData);
      await expect(tx).to.emit(factory, "BondFixedRateDeployed");

      const result = await tx;
      const receipt = await result.wait();
      const decoded = await decodeEvent(factory, "BondFixedRateDeployed", receipt);
      const bondAddress = decoded.bondAddress;

      // Verify fixed rate was set
      const fixedRateFacet = await ethers.getContractAt("FixedRate", bondAddress);
      const [rate, decimals] = await fixedRateFacet.getRate();
      expect(rate).to.equal(bondFixedRateData.fixedRateData.rate);
      expect(decimals).to.equal(bondFixedRateData.fixedRateData.rateDecimals);
    });

    it("GIVEN empty resolver WHEN deploying BondFixedRate THEN transaction fails", async () => {
      const bondFixedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData(),
        fixedRateData: {
          rate: 500,
          rateDecimals: 2,
        },
      };

      bondFixedRateData.bondData.security.resolver = ADDRESS_ZERO;
      bondFixedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_FIXED_RATE_CONFIG_ID,
        version: 1,
      };

      await expect(factory.deployBondFixedRate(bondFixedRateData)).to.be.revertedWithCustomError(
        factory,
        "EmptyResolver",
      );
    });

    it("GIVEN wrong ISIN WHEN deploying BondFixedRate THEN transaction fails", async () => {
      const bondFixedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver, {
            erc20MetadataInfo: { isin: "short" },
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData(),
        fixedRateData: {
          rate: 500,
          rateDecimals: 2,
        },
      };

      bondFixedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_FIXED_RATE_CONFIG_ID,
        version: 1,
      };

      await expect(factory.deployBondFixedRate(bondFixedRateData)).to.be.revertedWithCustomError(factory, "WrongISIN");
    });

    it("GIVEN no admin WHEN deploying BondFixedRate THEN transaction fails", async () => {
      const bondFixedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData(),
        fixedRateData: {
          rate: 500,
          rateDecimals: 2,
        },
      };

      bondFixedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_FIXED_RATE_CONFIG_ID,
        version: 1,
      };

      await expect(factory.deployBondFixedRate(bondFixedRateData)).to.be.revertedWithCustomError(
        factory,
        "NoInitialAdmins",
      );
    });

    it("GIVEN wrong regulation type WHEN deploying BondFixedRate THEN transaction fails", async () => {
      const bondFixedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData({
          regulationType: RegulationType.NONE,
          regulationSubType: RegulationSubType.REG_D_506_B,
        }),
        fixedRateData: {
          rate: 500,
          rateDecimals: 2,
        },
      };

      bondFixedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_FIXED_RATE_CONFIG_ID,
        version: 1,
      };

      await expect(factory.deployBondFixedRate(bondFixedRateData))
        .to.be.revertedWithCustomError(factory, "RegulationTypeAndSubTypeForbidden")
        .withArgs(RegulationType.NONE, RegulationSubType.REG_D_506_B);
    });
  });

  describe("Bond with KPI Linked Rate tests", () => {
    it("GIVEN proper BondKpiLinkedRateData WHEN deploying a new bond with KPI linked rate THEN transaction succeeds", async () => {
      const bondKpiLinkedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData(),
        interestRate: {
          maxRate: 1000, // 10%
          baseRate: 500, // 5%
          minRate: 100, // 1%
          startPeriod: Math.floor(Date.now() / 1000) + 86400,
          startRate: 500,
          missedPenalty: 50,
          reportPeriod: 86400 * 30, // 30 days
          rateDecimals: 2,
        },
        impactData: {
          maxDeviationCap: 150,
          baseLine: 100,
          maxDeviationFloor: 50,
          impactDataDecimals: 2,
          adjustmentPrecision: 100,
        },
      };

      bondKpiLinkedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_KPI_LINKED_RATE_CONFIG_ID,
        version: 1,
      };

      const tx = factory.deployBondKpiLinkedRate(bondKpiLinkedRateData);
      await expect(tx).to.emit(factory, "BondKpiLinkedRateDeployed");

      const result = await tx;
      const receipt = await result.wait();
      const decoded = await decodeEvent(factory, "BondKpiLinkedRateDeployed", receipt);
      const bondAddress = decoded.bondAddress;

      // Verify KPI linked rate was set
      const asset = await ethers.getContractAt("IAsset", bondAddress);
      const interestRate = await asset.getKpiLinkedRateInterestRate();
      expect(interestRate.maxRate).to.equal(bondKpiLinkedRateData.interestRate.maxRate);
      expect(interestRate.baseRate).to.equal(bondKpiLinkedRateData.interestRate.baseRate);
      expect(interestRate.minRate).to.equal(bondKpiLinkedRateData.interestRate.minRate);

      const impactData = await asset.getKpiLinkedRateImpactData();
      expect(impactData.maxDeviationCap).to.equal(bondKpiLinkedRateData.impactData.maxDeviationCap);
      expect(impactData.baseLine).to.equal(bondKpiLinkedRateData.impactData.baseLine);
      expect(impactData.maxDeviationFloor).to.equal(bondKpiLinkedRateData.impactData.maxDeviationFloor);
    });

    it("GIVEN invalid interest rate (minRate > baseRate) WHEN deploying bond THEN transaction fails", async () => {
      const bondKpiLinkedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData(),
        interestRate: {
          maxRate: 1000,
          baseRate: 500,
          minRate: 600, // minRate > baseRate - INVALID
          startPeriod: Math.floor(Date.now() / 1000) + 86400,
          startRate: 500,
          missedPenalty: 50,
          reportPeriod: 86400 * 30,
          rateDecimals: 2,
        },
        impactData: {
          maxDeviationCap: 150,
          baseLine: 100,
          maxDeviationFloor: 50,
          impactDataDecimals: 2,
          adjustmentPrecision: 100,
        },
      };

      bondKpiLinkedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_KPI_LINKED_RATE_CONFIG_ID,
        version: 1,
      };

      await expect(factory.deployBondKpiLinkedRate(bondKpiLinkedRateData)).to.be.revertedWithCustomError(
        factory,
        "WrongInterestRateValues",
      );
    });

    it("GIVEN invalid impact data (maxDeviationFloor == baseLine) WHEN deploying bond THEN transaction fails", async () => {
      const bondKpiLinkedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData(),
        interestRate: {
          maxRate: 1000,
          baseRate: 500,
          minRate: 100,
          startPeriod: Math.floor(Date.now() / 1000) + 86400,
          startRate: 500,
          missedPenalty: 50,
          reportPeriod: 86400 * 30,
          rateDecimals: 2,
        },
        impactData: {
          maxDeviationCap: 150,
          baseLine: 100,
          maxDeviationFloor: 100, // maxDeviationFloor == baseLine - INVALID (zero denominator)
          impactDataDecimals: 2,
          adjustmentPrecision: 100,
        },
      };

      bondKpiLinkedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_KPI_LINKED_RATE_CONFIG_ID,
        version: 1,
      };

      await expect(factory.deployBondKpiLinkedRate(bondKpiLinkedRateData)).to.be.revertedWithCustomError(
        factory,
        "WrongImpactDataValues",
      );
    });

    it("GIVEN invalid impact data (baseLine == maxDeviationCap) WHEN deploying bond THEN transaction fails", async () => {
      const bondKpiLinkedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData(),
        interestRate: {
          maxRate: 1000,
          baseRate: 500,
          minRate: 100,
          startPeriod: Math.floor(Date.now() / 1000) + 86400,
          startRate: 500,
          missedPenalty: 50,
          reportPeriod: 86400 * 30,
          rateDecimals: 2,
        },
        impactData: {
          maxDeviationCap: 100,
          baseLine: 100, // baseLine == maxDeviationCap - INVALID (zero denominator)
          maxDeviationFloor: 50,
          impactDataDecimals: 2,
          adjustmentPrecision: 100,
        },
      };

      bondKpiLinkedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_KPI_LINKED_RATE_CONFIG_ID,
        version: 1,
      };

      await expect(factory.deployBondKpiLinkedRate(bondKpiLinkedRateData)).to.be.revertedWithCustomError(
        factory,
        "WrongImpactDataValues",
      );
    });

    it("GIVEN invalid interest rate (baseRate > maxRate) WHEN deploying bond THEN transaction fails", async () => {
      const bondKpiLinkedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData(),
        interestRate: {
          maxRate: 400,
          baseRate: 500, // baseRate > maxRate - INVALID
          minRate: 100,
          startPeriod: Math.floor(Date.now() / 1000) + 86400,
          startRate: 500,
          missedPenalty: 50,
          reportPeriod: 86400 * 30,
          rateDecimals: 2,
        },
        impactData: {
          maxDeviationCap: 150,
          baseLine: 100,
          maxDeviationFloor: 50,
          impactDataDecimals: 2,
          adjustmentPrecision: 100,
        },
      };

      bondKpiLinkedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_KPI_LINKED_RATE_CONFIG_ID,
        version: 1,
      };

      await expect(factory.deployBondKpiLinkedRate(bondKpiLinkedRateData)).to.be.revertedWithCustomError(
        factory,
        "WrongInterestRateValues",
      );
    });

    it("GIVEN invalid impact data (maxDeviationFloor > baseLine) WHEN deploying bond THEN transaction fails", async () => {
      const bondKpiLinkedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData(),
        interestRate: {
          maxRate: 1000,
          baseRate: 500,
          minRate: 100,
          startPeriod: Math.floor(Date.now() / 1000) + 86400,
          startRate: 500,
          missedPenalty: 50,
          reportPeriod: 86400 * 30,
          rateDecimals: 2,
        },
        impactData: {
          maxDeviationCap: 150,
          baseLine: 100,
          maxDeviationFloor: 120, // maxDeviationFloor > baseLine - INVALID
          impactDataDecimals: 2,
          adjustmentPrecision: 100,
        },
      };

      bondKpiLinkedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_KPI_LINKED_RATE_CONFIG_ID,
        version: 1,
      };

      await expect(factory.deployBondKpiLinkedRate(bondKpiLinkedRateData)).to.be.revertedWithCustomError(
        factory,
        "WrongImpactDataValues",
      );
    });

    it("GIVEN invalid impact data (baseLine > maxDeviationCap) WHEN deploying bond THEN transaction fails", async () => {
      const bondKpiLinkedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData(),
        interestRate: {
          maxRate: 1000,
          baseRate: 500,
          minRate: 100,
          startPeriod: Math.floor(Date.now() / 1000) + 86400,
          startRate: 500,
          missedPenalty: 50,
          reportPeriod: 86400 * 30,
          rateDecimals: 2,
        },
        impactData: {
          maxDeviationCap: 90,
          baseLine: 100, // baseLine > maxDeviationCap - INVALID
          maxDeviationFloor: 50,
          impactDataDecimals: 2,
          adjustmentPrecision: 100,
        },
      };

      bondKpiLinkedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_KPI_LINKED_RATE_CONFIG_ID,
        version: 1,
      };

      await expect(factory.deployBondKpiLinkedRate(bondKpiLinkedRateData)).to.be.revertedWithCustomError(
        factory,
        "WrongImpactDataValues",
      );
    });

    it("GIVEN empty resolver WHEN deploying BondKpiLinkedRate THEN transaction fails", async () => {
      const bondKpiLinkedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData(),
        interestRate: {
          maxRate: 1000,
          baseRate: 500,
          minRate: 100,
          startPeriod: Math.floor(Date.now() / 1000) + 86400,
          startRate: 500,
          missedPenalty: 50,
          reportPeriod: 86400 * 30,
          rateDecimals: 2,
        },
        impactData: {
          maxDeviationCap: 150,
          baseLine: 100,
          maxDeviationFloor: 50,
          impactDataDecimals: 2,
          adjustmentPrecision: 100,
        },
      };

      bondKpiLinkedRateData.bondData.security.resolver = ADDRESS_ZERO;
      bondKpiLinkedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_KPI_LINKED_RATE_CONFIG_ID,
        version: 1,
      };

      await expect(factory.deployBondKpiLinkedRate(bondKpiLinkedRateData)).to.be.revertedWithCustomError(
        factory,
        "EmptyResolver",
      );
    });

    it("GIVEN wrong ISIN WHEN deploying BondKpiLinkedRate THEN transaction fails", async () => {
      const bondKpiLinkedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver, {
            erc20MetadataInfo: { isin: "short" },
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData(),
        interestRate: {
          maxRate: 1000,
          baseRate: 500,
          minRate: 100,
          startPeriod: Math.floor(Date.now() / 1000) + 86400,
          startRate: 500,
          missedPenalty: 50,
          reportPeriod: 86400 * 30,
          rateDecimals: 2,
        },
        impactData: {
          maxDeviationCap: 150,
          baseLine: 100,
          maxDeviationFloor: 50,
          impactDataDecimals: 2,
          adjustmentPrecision: 100,
        },
      };

      bondKpiLinkedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_KPI_LINKED_RATE_CONFIG_ID,
        version: 1,
      };

      await expect(factory.deployBondKpiLinkedRate(bondKpiLinkedRateData)).to.be.revertedWithCustomError(
        factory,
        "WrongISIN",
      );
    });

    it("GIVEN no admin WHEN deploying BondKpiLinkedRate THEN transaction fails", async () => {
      const bondKpiLinkedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData(),
        interestRate: {
          maxRate: 1000,
          baseRate: 500,
          minRate: 100,
          startPeriod: Math.floor(Date.now() / 1000) + 86400,
          startRate: 500,
          missedPenalty: 50,
          reportPeriod: 86400 * 30,
          rateDecimals: 2,
        },
        impactData: {
          maxDeviationCap: 150,
          baseLine: 100,
          maxDeviationFloor: 50,
          impactDataDecimals: 2,
          adjustmentPrecision: 100,
        },
      };

      bondKpiLinkedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_KPI_LINKED_RATE_CONFIG_ID,
        version: 1,
      };

      await expect(factory.deployBondKpiLinkedRate(bondKpiLinkedRateData)).to.be.revertedWithCustomError(
        factory,
        "NoInitialAdmins",
      );
    });

    it("GIVEN wrong regulation type WHEN deploying BondKpiLinkedRate THEN transaction fails", async () => {
      const bondKpiLinkedRateData = {
        bondData: {
          security: getSecurityData(businessLogicResolver, {
            rbacs: init_rbacs,
          }),
          bondDetails: await getBondDetails(),
          proceedRecipients: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: getRegulationData({
          regulationType: RegulationType.REG_D,
          regulationSubType: RegulationSubType.NONE,
        }),
        interestRate: {
          maxRate: 1000,
          baseRate: 500,
          minRate: 100,
          startPeriod: Math.floor(Date.now() / 1000) + 86400,
          startRate: 500,
          missedPenalty: 50,
          reportPeriod: 86400 * 30,
          rateDecimals: 2,
        },
        impactData: {
          maxDeviationCap: 150,
          baseLine: 100,
          maxDeviationFloor: 50,
          impactDataDecimals: 2,
          adjustmentPrecision: 100,
        },
      };

      bondKpiLinkedRateData.bondData.security.resolverProxyConfiguration = {
        key: BOND_KPI_LINKED_RATE_CONFIG_ID,
        version: 1,
      };

      await expect(factory.deployBondKpiLinkedRate(bondKpiLinkedRateData))
        .to.be.revertedWithCustomError(factory, "RegulationTypeAndSubTypeForbidden")
        .withArgs(RegulationType.REG_D, RegulationSubType.NONE);
    });
  });

  describe("checkAdmins edge cases", () => {
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
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
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
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
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
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
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
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
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
      bondData.security.resolverProxyConfiguration = {
        key: BOND_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      await expect(factory.deployBond(bondData, factoryRegulationData)).to.emit(factory, "BondDeployed");
    });
  });
});
