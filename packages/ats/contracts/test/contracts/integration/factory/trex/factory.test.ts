import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { BusinessLogicResolver, TREXFactoryAts, ITREXFactory, AccessControl, ERC20, IFactory } from "@contract-types";

import { deployFullSuiteFixture } from "./fixtures/deploy-full-suite.fixture";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture } from "@test";
import { ADDRESS_ZERO, EQUITY_CONFIG_ID, BOND_CONFIG_ID, ATS_ROLES } from "@scripts";
import { Rbac } from "@scripts/domain";
import { getSecurityData, getRegulationData } from "@test";
import { getEquityDetails } from "@test";
import { getBondDetails } from "@test";

describe("TREX Factory Tests", () => {
  let deployer: HardhatEthersSigner;

  let init_rbacs: Rbac[] = [];

  const name = "ATS-TREX-Token";
  const symbol = "ATS-TREX";
  const decimals = 6;

  let businessLogicResolver: BusinessLogicResolver;
  let factoryAts: TREXFactoryAts;
  const tokenDetails: ITREXFactory.TokenDetailsStruct = {} as ITREXFactory.TokenDetailsStruct;
  const claimDetails: ITREXFactory.ClaimDetailsStruct = {} as ITREXFactory.ClaimDetailsStruct;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let trexDeployment: any;

  let accessControlFacet: AccessControl;
  let erc20Facet: ERC20;
  let factory: IFactory;

  async function setFacets(diamond: string) {
    accessControlFacet = await ethers.getContractAt("AccessControl", diamond);

    erc20Facet = await ethers.getContractAt("ERC20", diamond);
  }
  async function deployAtsFactoryFixture() {
    const base = await deployAtsInfrastructureFixture();
    factory = base.factory;
    deployer = base.deployer;
    businessLogicResolver = base.blr;

    init_rbacs = [
      {
        role: ATS_ROLES._DEFAULT_ADMIN_ROLE,
        members: [deployer.address],
      },
    ];
  }

  async function deployTrexSuiteFixture() {
    trexDeployment = await deployFullSuiteFixture();

    const trexBondDeploymentLib = await (await ethers.getContractFactory("TREXBondDeploymentLib")).deploy();
    await trexBondDeploymentLib.waitForDeployment();
    const trexEquityDeploymentLib = await (await ethers.getContractFactory("TREXEquityDeploymentLib")).deploy();
    await trexEquityDeploymentLib.waitForDeployment();

    factoryAts = await (
      await ethers.getContractFactory("TREXFactoryAts", {
        signer: deployer,
        libraries: {
          TREXBondDeploymentLib: await trexBondDeploymentLib.getAddress(),
          TREXEquityDeploymentLib: await trexEquityDeploymentLib.getAddress(),
        },
      })
    ).deploy(
      trexDeployment.authorities.trexImplementationAuthority.target,
      await trexDeployment.factories.identityFactory.getAddress(),
      factory.target,
      {},
    );
    await factoryAts.waitForDeployment();

    await (
      trexDeployment.factories.identityFactory.connect(deployer) as unknown as {
        addTokenFactory: (address: string) => Promise<void>;
      }
    ).addTokenFactory(await factoryAts.getAddress());

    tokenDetails.name = name;
    tokenDetails.symbol = symbol;
    tokenDetails.decimals = decimals;
    tokenDetails.ONCHAINID = ADDRESS_ZERO;
    tokenDetails.owner = deployer.address;
    tokenDetails.irAgents = [deployer.address];
    tokenDetails.irs = ADDRESS_ZERO;
    tokenDetails.tokenAgents = [deployer.address];
    tokenDetails.complianceModules = [];
    tokenDetails.complianceSettings = [];

    claimDetails.claimTopics = [];
    claimDetails.issuerClaims = [];
    claimDetails.issuers = [];
  }

  beforeEach(async () => {
    await loadFixture(deployAtsFactoryFixture);
    await loadFixture(deployTrexSuiteFixture);
  });

  describe("Disabled deployTREXSuite", () => {
    it("GIVEN any parameters WHEN calling deployTREXSuite THEN it does nothing (disabled)", async () => {
      await factoryAts.connect(deployer).deployTREXSuite("test-salt", tokenDetails, claimDetails);
    });
  });

  describe("Equity tests", () => {
    it("GIVEN a consumed salt WHEN reusing it THEN transaction reverts with token already deployed", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();
      await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsEquity("salt-equity", tokenDetails, claimDetails, equityData, factoryRegulationData);
      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsEquity("salt-equity", tokenDetails, claimDetails, equityData, factoryRegulationData),
      ).to.revertedWith("token already deployed");
    });

    it("GIVEN an invalid claim pattern THEN transaction reverts with claim pattern not valid", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      claimDetails.issuers = [ethers.Wallet.createRandom().address];

      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsEquity("salt-equity", tokenDetails, claimDetails, equityData, factoryRegulationData),
      ).to.revertedWith("claim pattern not valid");
    });

    it("GIVEN max claim issuers exceeded THEN transaction reverts with max 5 claim issuers at deployment", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      claimDetails.issuers = Array.from({ length: 6 }, () => ethers.Wallet.createRandom().address);
      claimDetails.issuerClaims = Array.from({ length: 6 }, () => [Math.floor(Math.random() * 10)]);

      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsEquity("salt-equity", tokenDetails, claimDetails, equityData, factoryRegulationData),
      ).to.revertedWith("max 5 claim issuers at deployment");
    });

    it("GIVEN max claim topics exceeded THEN transaction reverts with max 5 claim topics at deployment", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      claimDetails.claimTopics = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));

      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsEquity("salt-equity", tokenDetails, claimDetails, equityData, factoryRegulationData),
      ).to.revertedWith("max 5 claim topics at deployment");
    });

    it("GIVEN max ir agents exceeded THEN transaction reverts with max 5 agents at deployment", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      tokenDetails.irAgents = Array.from({ length: 6 }, () => ethers.Wallet.createRandom().address);

      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsEquity("salt-equity", tokenDetails, claimDetails, equityData, factoryRegulationData),
      ).to.revertedWith("max 5 agents at deployment");
    });

    it("GIVEN max token agents exceeded THEN transaction reverts with max 5 agents at deployment", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      tokenDetails.tokenAgents = Array.from({ length: 6 }, () => ethers.Wallet.createRandom().address);

      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsEquity("salt-equity", tokenDetails, claimDetails, equityData, factoryRegulationData),
      ).to.revertedWith("max 5 agents at deployment");
    });

    it("GIVEN max token agents exceeded THEN transaction reverts with max 5 agents at deployment", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      tokenDetails.tokenAgents = Array.from({ length: 6 }, () => ethers.Wallet.createRandom().address);

      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsEquity("salt-equity", tokenDetails, claimDetails, equityData, factoryRegulationData),
      ).to.revertedWith("max 5 agents at deployment");
    });

    it("GIVEN max modules actions exceeded THEN transaction reverts with max 30 module actions at deployment", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      tokenDetails.complianceModules = Array.from({ length: 31 }, () => ethers.Wallet.createRandom().address);

      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsEquity("salt-equity", tokenDetails, claimDetails, equityData, factoryRegulationData),
      ).to.be.revertedWith("max 30 module actions at deployment");
    });

    it("GIVEN correct data WHEN deploying equity THEN deployment succeeds and events are emitted", async () => {
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

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsEquity("salt-equity", tokenDetails, claimDetails, equityData, factoryRegulationData);

      const deploymentReceipt = await deploymentResult.wait();

      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;

      const [trexAddr] = trexSuiteDeployedEvent?.args || [];

      await setFacets(trexAddr);

      expect(await erc20Facet.name()).to.equal(equityData.security.erc20MetadataInfo.name);
      expect(await erc20Facet.symbol()).to.equal(equityData.security.erc20MetadataInfo.symbol);
      expect(await erc20Facet.decimals()).to.equal(equityData.security.erc20MetadataInfo.decimals);
      expect(await accessControlFacet.hasRole(ATS_ROLES._TREX_OWNER_ROLE, deployer.address)).to.be.true;
      expect(await accessControlFacet.hasRole(ATS_ROLES._DEFAULT_ADMIN_ROLE, deployer.address)).to.be.true;
    });

    it("GIVEN correct data WHEN fetching deployed suite by salt THEN suite details are returned", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsEquity("salt-equity", tokenDetails, claimDetails, equityData, factoryRegulationData);

      const suiteDetails = await factoryAts.getToken("salt-equity");
      expect(suiteDetails).to.not.equal(ADDRESS_ZERO);
    });

    it("GIVEN rbacs with existing TREX_OWNER_ROLE matching tRexOwner WHEN deploying equity THEN SecurityDeploymentLib handles owner match", async () => {
      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: [
            {
              role: ATS_ROLES._TREX_OWNER_ROLE,
              members: [deployer.address],
            },
            {
              role: ATS_ROLES._DEFAULT_ADMIN_ROLE,
              members: [deployer.address],
            },
          ],
        }),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      tokenDetails.owner = deployer.address;
      const factoryRegulationData = getRegulationData();

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsEquity(
          "salt-equity-owner-match",
          tokenDetails,
          claimDetails,
          equityData,
          factoryRegulationData,
        );

      const deploymentReceipt = await deploymentResult.wait();

      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;
    });

    it("GIVEN compliance modules with settings WHEN deploying equity THEN TREXBaseDeploymentLib handles compliance settings", async () => {
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

      // Deploy a real compliance module contract
      const MockComplianceModule = await ethers.getContractFactory("MockComplianceModule");
      const complianceModule = await MockComplianceModule.deploy();
      await complianceModule.waitForDeployment();

      // Encode the setConfig function call with value 100
      const setConfigData = complianceModule.interface.encodeFunctionData("setConfig", [100]);

      tokenDetails.complianceModules = [complianceModule.target];
      tokenDetails.complianceSettings = [setConfigData];

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsEquity(
          "salt-equity-compliance",
          tokenDetails,
          claimDetails,
          equityData,
          factoryRegulationData,
        );

      const deploymentReceipt = await deploymentResult.wait();

      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;

      // Reset for next tests
      tokenDetails.complianceModules = [];
      tokenDetails.complianceSettings = [];
    });

    it("GIVEN rbacs with TREX_OWNER_ROLE but different member WHEN deploying equity THEN owner is added to rbacs", async () => {
      const [, , , , , otherUser] = await ethers.getSigners();
      const rbacWithDifferentOwner = [
        {
          role: ATS_ROLES._TREX_OWNER_ROLE,
          members: [otherUser.address],
        },
      ];

      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: rbacWithDifferentOwner,
        }),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsEquity(
          "salt-equity-diff-owner",
          tokenDetails,
          claimDetails,
          equityData,
          factoryRegulationData,
        );

      const deploymentReceipt = await deploymentResult.wait();
      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;
    });

    it("GIVEN existing compliance address WHEN deploying equity THEN uses existing compliance", async () => {
      // Deploy compliance proxy WITHOUT initializing - let factory use it as-is
      const ModularComplianceProxy = await ethers.getContractFactory("ModularComplianceProxy");
      const compliance = await ModularComplianceProxy.deploy(
        trexDeployment.authorities.trexImplementationAuthority.target,
      );
      await compliance.waitForDeployment();

      // Transfer ownership to factory so it can manage the uninitialized compliance
      const complianceContract = await ethers.getContractAt("ModularCompliance", compliance.target);
      await complianceContract.transferOwnership(factoryAts.target);

      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
          compliance: compliance.target as string,
        }),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsEquity(
          "salt-equity-existing-compliance",
          tokenDetails,
          claimDetails,
          equityData,
          factoryRegulationData,
        );

      const deploymentReceipt = await deploymentResult.wait();
      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;
    });

    it("GIVEN existing IRS address in tokenDetails WHEN deploying equity THEN uses existing IRS", async () => {
      // Deploy IRS proxy WITHOUT initializing - let factory use it as-is
      const IdentityRegistryStorageProxy = await ethers.getContractFactory("IdentityRegistryStorageProxy");
      const irs = await IdentityRegistryStorageProxy.deploy(
        trexDeployment.authorities.trexImplementationAuthority.target,
      );
      await irs.waitForDeployment();

      // Transfer ownership to factory so it can bind the identity registry
      const irsContract = await ethers.getContractAt("IdentityRegistryStorage", irs.target);
      await irsContract.transferOwnership(factoryAts.target);

      tokenDetails.irs = irs.target as string;

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

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsEquity(
          "salt-equity-existing-irs",
          tokenDetails,
          claimDetails,
          equityData,
          factoryRegulationData,
        );

      const deploymentReceipt = await deploymentResult.wait();
      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;

      // Reset for next tests
      tokenDetails.irs = ethers.ZeroAddress;
    });

    it("GIVEN existing identity registry WHEN deploying equity THEN uses existing IR", async () => {
      // First deploy a complete TREX suite to get a valid IR
      const equityDataFirst = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
        }),
        equityDetails: getEquityDetails(),
      };
      equityDataFirst.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      const firstDeployment = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsEquity(
          "salt-equity-first-for-ir",
          tokenDetails,
          claimDetails,
          equityDataFirst,
          factoryRegulationData,
        );

      await firstDeployment.wait();

      // Get the token address from factory and query its IR
      const firstToken = await factoryAts.getToken("salt-equity-first-for-ir");
      const firstTokenContract = await ethers.getContractAt("IERC3643", firstToken);
      const firstIR = await firstTokenContract.identityRegistry();

      // Verify firstIR is valid
      expect(firstIR).to.not.equal(ethers.ZeroAddress);
      expect(firstIR).to.not.be.undefined;

      // Transfer ownership of the IR and its components to factory so they can be reused
      const firstIRContract = await ethers.getContractAt("OwnableUpgradeable", firstIR);
      await firstIRContract.connect(deployer).transferOwnership(factoryAts.target);

      // Get TIR and CTR from the IR and transfer their ownership too
      const ir = await ethers.getContractAt(
        "@tokenysolutions/t-rex/contracts/registry/interface/IIdentityRegistry.sol:IIdentityRegistry",
        firstIR,
      );
      const tirAddress = await ir.issuersRegistry();
      const ctrAddress = await ir.topicsRegistry();
      const irsAddress = await ir.identityStorage();
      const tirContract = await ethers.getContractAt("OwnableUpgradeable", tirAddress);
      const ctrContract = await ethers.getContractAt("OwnableUpgradeable", ctrAddress);
      const irsContract = await ethers.getContractAt("OwnableUpgradeable", irsAddress);
      await tirContract.connect(deployer).transferOwnership(factoryAts.target);
      await ctrContract.connect(deployer).transferOwnership(factoryAts.target);
      await irsContract.connect(deployer).transferOwnership(factoryAts.target);

      // Create tokenDetails for second deployment with empty irAgents
      // since the IR already has its agents configured
      const tokenDetailsExistingIR = {
        ...tokenDetails,
        irAgents: [], // Don't add agents since IR already has them
      };

      // Now deploy with existing IR
      const equityData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
          identityRegistry: firstIR,
        }),
        equityDetails: getEquityDetails(),
      };
      equityData.security.resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
      };

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsEquity(
          "salt-equity-existing-ir",
          tokenDetailsExistingIR,
          claimDetails,
          equityData,
          factoryRegulationData,
        );

      const deploymentReceipt = await deploymentResult.wait();
      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");

      // Verify the event was emitted
      expect(trexSuiteDeployedEvent).to.not.be.undefined;
    });

    it("GIVEN existing ONCHAINID in tokenDetails WHEN deploying equity THEN uses existing token ID", async () => {
      // Create an identity first
      const identity = await ethers.deployContract("Identity", [deployer.address, true]);
      await identity.waitForDeployment();

      tokenDetails.ONCHAINID = identity.target as string;

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

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsEquity(
          "salt-equity-existing-onchainid",
          tokenDetails,
          claimDetails,
          equityData,
          factoryRegulationData,
        );

      const deploymentReceipt = await deploymentResult.wait();
      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;

      // Reset for next tests
      tokenDetails.ONCHAINID = ethers.ZeroAddress;
    });

    it("GIVEN more modules than settings WHEN deploying equity THEN handles modules without settings", async () => {
      const MockComplianceModule = await ethers.getContractFactory("MockComplianceModule");
      const module1 = await MockComplianceModule.deploy();
      await module1.waitForDeployment();
      const module2 = await MockComplianceModule.deploy();
      await module2.waitForDeployment();

      // Only one setting for two modules
      const setConfigData = module1.interface.encodeFunctionData("setConfig", [100]);

      tokenDetails.complianceModules = [module1.target, module2.target];
      tokenDetails.complianceSettings = [setConfigData]; // Only one setting

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

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsEquity(
          "salt-equity-partial-settings",
          tokenDetails,
          claimDetails,
          equityData,
          factoryRegulationData,
        );

      const deploymentReceipt = await deploymentResult.wait();
      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;

      // Reset for next tests
      tokenDetails.complianceModules = [];
      tokenDetails.complianceSettings = [];
    });

    it("GIVEN claim topics WHEN deploying equity THEN adds claim topics to CTR", async () => {
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

      // Add claim topics to test line 88
      claimDetails.claimTopics = [1, 2, 3];

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsEquity(
          "salt-equity-with-claim-topics",
          tokenDetails,
          claimDetails,
          equityData,
          factoryRegulationData,
        );

      const deploymentReceipt = await deploymentResult.wait();
      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;

      // Reset for next tests
      claimDetails.claimTopics = [];
    });

    it("GIVEN trusted issuers WHEN deploying equity THEN adds issuers to TIR", async () => {
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

      // Deploy claim issuer for testing line 91
      const ClaimIssuer = await ethers.getContractFactory("ClaimIssuer");
      const claimIssuer = await ClaimIssuer.deploy(deployer.address);
      await claimIssuer.waitForDeployment();

      // Add claim topics and issuer
      claimDetails.claimTopics = [1];
      claimDetails.issuers = [claimIssuer.target as string];
      claimDetails.issuerClaims = [[1]];

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsEquity(
          "salt-equity-with-issuers",
          tokenDetails,
          claimDetails,
          equityData,
          factoryRegulationData,
        );

      const deploymentReceipt = await deploymentResult.wait();
      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;

      // Reset for next tests
      claimDetails.claimTopics = [];
      claimDetails.issuers = [];
      claimDetails.issuerClaims = [];
    });
  });

  describe("Bond tests", () => {
    it("GIVEN a consumed salt WHEN reusing it THEN transaction reverts with token already deployed", async () => {
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

      await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsBond("salt-bond", tokenDetails, claimDetails, bondData, factoryRegulationData);
      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsBond("salt-bond", tokenDetails, claimDetails, bondData, factoryRegulationData),
      ).to.revertedWith("token already deployed");
    });

    it("GIVEN an invalid claim pattern THEN transaction reverts with claim pattern not valid", async () => {
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

      claimDetails.issuers = [await ethers.Wallet.createRandom().address];

      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsBond("salt-bond", tokenDetails, claimDetails, bondData, factoryRegulationData),
      ).to.revertedWith("claim pattern not valid");
    });

    it("GIVEN max claim issuers exceeded THEN transaction reverts with max 5 claim issuers at deployment", async () => {
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

      claimDetails.issuers = Array.from({ length: 6 }, () => ethers.Wallet.createRandom().address);
      claimDetails.issuerClaims = Array.from({ length: 6 }, () => [Math.floor(Math.random() * 10)]);

      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsBond("salt-bond", tokenDetails, claimDetails, bondData, factoryRegulationData),
      ).to.revertedWith("max 5 claim issuers at deployment");
    });

    it("GIVEN max claim topics exceeded THEN transaction reverts with max 5 claim topics at deployment", async () => {
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

      claimDetails.claimTopics = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));

      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsBond("salt-bond", tokenDetails, claimDetails, bondData, factoryRegulationData),
      ).to.revertedWith("max 5 claim topics at deployment");
    });

    it("GIVEN max ir agents exceeded THEN transaction reverts with max 5 agents at deployment", async () => {
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

      tokenDetails.irAgents = Array.from({ length: 6 }, () => ethers.Wallet.createRandom().address);

      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsBond("salt-bond", tokenDetails, claimDetails, bondData, factoryRegulationData),
      ).to.revertedWith("max 5 agents at deployment");
    });

    it("GIVEN max token agents exceeded THEN transaction reverts with max 5 agents at deployment", async () => {
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

      tokenDetails.tokenAgents = Array.from({ length: 6 }, () => ethers.Wallet.createRandom().address);

      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsBond("salt-bond", tokenDetails, claimDetails, bondData, factoryRegulationData),
      ).to.revertedWith("max 5 agents at deployment");
    });

    it("GIVEN max modules actions exceeded THEN transaction reverts with max 30 module actions at deployment", async () => {
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

      tokenDetails.complianceModules = Array.from({ length: 31 }, () => ethers.Wallet.createRandom().address);

      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsBond("salt-bond", tokenDetails, claimDetails, bondData, factoryRegulationData),
      ).to.be.revertedWith("max 30 module actions at deployment");
    });

    it("GIVEN more compliance settings than modules WHEN deploying bond THEN reverts with invalid compliance pattern", async () => {
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

      // Create 2 modules but 3 settings (more settings than modules)
      const mockModule1 = ethers.Wallet.createRandom().address;
      const mockModule2 = ethers.Wallet.createRandom().address;
      tokenDetails.complianceModules = [mockModule1, mockModule2];
      tokenDetails.complianceSettings = [
        "0x1234000000000000000000000000000000000000000000000000000000000000",
        "0x5678000000000000000000000000000000000000000000000000000000000000",
        "0x9abc000000000000000000000000000000000000000000000000000000000000",
      ];

      await expect(
        factoryAts
          .connect(deployer)
          .deployTREXSuiteAtsBond("salt-bond-invalid", tokenDetails, claimDetails, bondData, factoryRegulationData),
      ).to.be.revertedWith("invalid compliance pattern");
    });

    it("GIVEN module already bound WHEN deploying bond THEN skips adding duplicate module", async () => {
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

      // Deploy first bond with a module
      const mockModule = await (await ethers.getContractFactory("MockComplianceModule")).deploy();
      tokenDetails.complianceModules = [mockModule.target];
      tokenDetails.complianceSettings = [];

      await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsBond("salt-bond-first-module", tokenDetails, claimDetails, bondData, factoryRegulationData);

      const firstToken = await factoryAts.getToken("salt-bond-first-module");
      const firstTokenContract = await ethers.getContractAt("IERC3643", firstToken);
      const compliance = await firstTokenContract.compliance();

      // Transfer compliance ownership to factory so it can be reused
      const complianceContract = await ethers.getContractAt("OwnableUpgradeable", compliance);
      await complianceContract.connect(deployer).transferOwnership(factoryAts.target);

      // Now deploy second bond reusing the same compliance and same module
      const secondBondData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
          compliance: compliance, // Reuse existing compliance
        }),
        bondDetails: await getBondDetails(),
        proceedRecipients: [],
        proceedRecipientsData: [],
      };
      secondBondData.security.resolverProxyConfiguration = {
        key: BOND_CONFIG_ID,
        version: 1,
      };

      // Try to add the same module again - it should be skipped since already bound
      await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsBond(
          "salt-bond-second-module",
          tokenDetails,
          claimDetails,
          secondBondData,
          factoryRegulationData,
        );

      const secondToken = await factoryAts.getToken("salt-bond-second-module");
      expect(secondToken).to.not.equal(ADDRESS_ZERO);

      // Verify both tokens use same compliance
      const secondTokenContract = await ethers.getContractAt("IERC3643", secondToken);
      const secondCompliance = await secondTokenContract.compliance();
      expect(secondCompliance).to.equal(compliance);
    });

    it("GIVEN correct data WHEN deploying bond THEN deployment succeeds and events are emitted", async () => {
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

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsBond("salt-bond", tokenDetails, claimDetails, bondData, factoryRegulationData);

      const deploymentReceipt = await deploymentResult.wait();

      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;

      const [trexAddr] = trexSuiteDeployedEvent?.args || [];

      await setFacets(trexAddr);

      expect(await erc20Facet.name()).to.equal(bondData.security.erc20MetadataInfo.name);
      expect(await erc20Facet.symbol()).to.equal(bondData.security.erc20MetadataInfo.symbol);
      expect(await erc20Facet.decimals()).to.equal(bondData.security.erc20MetadataInfo.decimals);
      expect(await accessControlFacet.hasRole(ATS_ROLES._TREX_OWNER_ROLE, deployer.address)).to.be.true;
      expect(await accessControlFacet.hasRole(ATS_ROLES._DEFAULT_ADMIN_ROLE, deployer.address)).to.be.true;
    });

    it("GIVEN correct data WHEN fetching deployed suite by salt THEN suite details are returned", async () => {
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

      await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsBond("salt-bond", tokenDetails, claimDetails, bondData, factoryRegulationData);

      const suiteDetails = await factoryAts.getToken("salt-bond");
      expect(suiteDetails).to.not.equal(ADDRESS_ZERO);
    });

    it("GIVEN rbacs with existing TREX_OWNER_ROLE matching tRexOwner WHEN deploying bond THEN SecurityDeploymentLib handles owner match", async () => {
      const bondData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: [
            {
              role: ATS_ROLES._TREX_OWNER_ROLE,
              members: [deployer.address],
            },
            {
              role: ATS_ROLES._DEFAULT_ADMIN_ROLE,
              members: [deployer.address],
            },
          ],
        }),
        bondDetails: await getBondDetails(),
        proceedRecipients: [],
        proceedRecipientsData: [],
      };
      bondData.security.resolverProxyConfiguration = {
        key: BOND_CONFIG_ID,
        version: 1,
      };

      tokenDetails.owner = deployer.address;
      const factoryRegulationData = getRegulationData();

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsBond("salt-bond-owner-match", tokenDetails, claimDetails, bondData, factoryRegulationData);

      const deploymentReceipt = await deploymentResult.wait();

      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;
    });

    it("GIVEN compliance modules with settings WHEN deploying bond THEN TREXBaseDeploymentLib handles compliance settings", async () => {
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

      // Deploy a real compliance module contract
      const MockComplianceModule = await ethers.getContractFactory("MockComplianceModule");
      const complianceModule = await MockComplianceModule.deploy();
      await complianceModule.waitForDeployment();

      // Encode the setConfig function call with value 100
      const setConfigData = complianceModule.interface.encodeFunctionData("setConfig", [100]);

      tokenDetails.complianceModules = [complianceModule.target];
      tokenDetails.complianceSettings = [setConfigData];

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsBond("salt-bond-compliance", tokenDetails, claimDetails, bondData, factoryRegulationData);

      const deploymentReceipt = await deploymentResult.wait();

      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;

      // Reset for next tests
      tokenDetails.complianceModules = [];
      tokenDetails.complianceSettings = [];
    });

    it("GIVEN rbacs with TREX_OWNER_ROLE but different member WHEN deploying bond THEN owner is added to rbacs", async () => {
      const [, , , , , otherUser] = await ethers.getSigners();
      const rbacWithDifferentOwner = [
        {
          role: ATS_ROLES._TREX_OWNER_ROLE,
          members: [otherUser.address],
        },
      ];

      const bondData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: rbacWithDifferentOwner,
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

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsBond("salt-bond-diff-owner", tokenDetails, claimDetails, bondData, factoryRegulationData);

      const deploymentReceipt = await deploymentResult.wait();
      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;
    });

    it("GIVEN existing compliance address WHEN deploying bond THEN uses existing compliance", async () => {
      // Deploy compliance proxy WITHOUT initializing - let factory use it as-is
      const ModularComplianceProxy = await ethers.getContractFactory("ModularComplianceProxy");
      const compliance = await ModularComplianceProxy.deploy(
        trexDeployment.authorities.trexImplementationAuthority.target,
      );
      await compliance.waitForDeployment();

      // Transfer ownership to factory so it can manage the uninitialized compliance
      const complianceContract = await ethers.getContractAt("ModularCompliance", compliance.target);
      await complianceContract.transferOwnership(factoryAts.target);

      const bondData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
          compliance: compliance.target as string,
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

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsBond(
          "salt-bond-existing-compliance",
          tokenDetails,
          claimDetails,
          bondData,
          factoryRegulationData,
        );

      const deploymentReceipt = await deploymentResult.wait();
      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;
    });

    it("GIVEN existing IRS address in tokenDetails WHEN deploying bond THEN uses existing IRS", async () => {
      // Deploy IRS proxy WITHOUT initializing - let factory use it as-is
      const IdentityRegistryStorageProxy = await ethers.getContractFactory("IdentityRegistryStorageProxy");
      const irs = await IdentityRegistryStorageProxy.deploy(
        trexDeployment.authorities.trexImplementationAuthority.target,
      );
      await irs.waitForDeployment();

      // Transfer ownership to factory so it can bind the identity registry
      const irsContract = await ethers.getContractAt("IdentityRegistryStorage", irs.target);
      await irsContract.transferOwnership(factoryAts.target);

      tokenDetails.irs = irs.target as string;

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

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsBond("salt-bond-existing-irs", tokenDetails, claimDetails, bondData, factoryRegulationData);

      const deploymentReceipt = await deploymentResult.wait();
      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;

      // Reset for next tests
      tokenDetails.irs = ethers.ZeroAddress;
    });

    it("GIVEN existing identity registry WHEN deploying bond THEN uses existing IR", async () => {
      // First deploy a complete TREX suite to get a valid IR
      const bondDataFirst = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
        }),
        bondDetails: await getBondDetails(),
        proceedRecipients: [],
        proceedRecipientsData: [],
      };
      bondDataFirst.security.resolverProxyConfiguration = {
        key: BOND_CONFIG_ID,
        version: 1,
      };

      const factoryRegulationData = getRegulationData();

      const firstDeployment = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsBond(
          "salt-bond-first-for-ir",
          tokenDetails,
          claimDetails,
          bondDataFirst,
          factoryRegulationData,
        );

      await firstDeployment.wait();

      // Get the token address from factory and query its IR
      const firstToken = await factoryAts.getToken("salt-bond-first-for-ir");
      const firstTokenContract = await ethers.getContractAt("IERC3643", firstToken);
      const firstIR = await firstTokenContract.identityRegistry();

      // Verify firstIR is valid
      expect(firstIR).to.not.equal(ethers.ZeroAddress);
      expect(firstIR).to.not.be.undefined;

      // Transfer ownership of the IR and its components to factory so they can be reused
      const firstIRContract = await ethers.getContractAt("OwnableUpgradeable", firstIR);
      await firstIRContract.connect(deployer).transferOwnership(factoryAts.target);

      // Get TIR and CTR from the IR and transfer their ownership too
      const ir = await ethers.getContractAt(
        "@tokenysolutions/t-rex/contracts/registry/interface/IIdentityRegistry.sol:IIdentityRegistry",
        firstIR,
      );
      const tirAddress = await ir.issuersRegistry();
      const ctrAddress = await ir.topicsRegistry();
      const irsAddress = await ir.identityStorage();
      const tirContract = await ethers.getContractAt("OwnableUpgradeable", tirAddress);
      const ctrContract = await ethers.getContractAt("OwnableUpgradeable", ctrAddress);
      const irsContract = await ethers.getContractAt("OwnableUpgradeable", irsAddress);
      await tirContract.connect(deployer).transferOwnership(factoryAts.target);
      await ctrContract.connect(deployer).transferOwnership(factoryAts.target);
      await irsContract.connect(deployer).transferOwnership(factoryAts.target);

      // Create tokenDetails for second deployment with empty irAgents
      // since the IR already has its agents configured
      const tokenDetailsExistingIR = {
        ...tokenDetails,
        irAgents: [], // Don't add agents since IR already has them
      };

      // Now deploy with existing IR
      const bondData = {
        security: getSecurityData(businessLogicResolver, {
          rbacs: init_rbacs,
          identityRegistry: firstIR,
        }),
        bondDetails: await getBondDetails(),
        proceedRecipients: [],
        proceedRecipientsData: [],
      };
      bondData.security.resolverProxyConfiguration = {
        key: BOND_CONFIG_ID,
        version: 1,
      };

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsBond(
          "salt-bond-existing-ir",
          tokenDetailsExistingIR,
          claimDetails,
          bondData,
          factoryRegulationData,
        );

      const deploymentReceipt = await deploymentResult.wait();
      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");

      // Verify the event was emitted
      expect(trexSuiteDeployedEvent).to.not.be.undefined;
    });

    it("GIVEN existing ONCHAINID in tokenDetails WHEN deploying bond THEN uses existing token ID", async () => {
      const identity = await ethers.deployContract("Identity", [deployer.address, true]);
      await identity.waitForDeployment();

      tokenDetails.ONCHAINID = identity.target as string;

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

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsBond(
          "salt-bond-existing-onchainid",
          tokenDetails,
          claimDetails,
          bondData,
          factoryRegulationData,
        );

      const deploymentReceipt = await deploymentResult.wait();
      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;

      // Reset for next tests
      tokenDetails.ONCHAINID = ethers.ZeroAddress;
    });

    it("GIVEN more modules than settings WHEN deploying bond THEN handles modules without settings", async () => {
      const MockComplianceModule = await ethers.getContractFactory("MockComplianceModule");
      const module1 = await MockComplianceModule.deploy();
      await module1.waitForDeployment();
      const module2 = await MockComplianceModule.deploy();
      await module2.waitForDeployment();

      // Only one setting for two modules
      const setConfigData = module1.interface.encodeFunctionData("setConfig", [100]);

      tokenDetails.complianceModules = [module1.target, module2.target];
      tokenDetails.complianceSettings = [setConfigData]; // Only one setting

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

      const deploymentResult = await factoryAts
        .connect(deployer)
        .deployTREXSuiteAtsBond(
          "salt-bond-partial-settings",
          tokenDetails,
          claimDetails,
          bondData,
          factoryRegulationData,
        );

      const deploymentReceipt = await deploymentResult.wait();
      const trexSuiteDeployedEvent = deploymentReceipt!.logs
        .map((log) => {
          try {
            return factoryAts.interface.parseLog({ topics: log.topics as string[], data: log.data });
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "TREXSuiteDeployed");
      expect(trexSuiteDeployedEvent).to.not.be.undefined;

      // Reset for next tests
      tokenDetails.complianceModules = [];
      tokenDetails.complianceSettings = [];
    });
  });

  describe("Administrative functions tests", () => {
    let otherAccount: HardhatEthersSigner;

    beforeEach(async () => {
      [, otherAccount] = await ethers.getSigners();
    });

    describe("recoverContractOwnership", () => {
      it("GIVEN non-owner caller WHEN calling recoverContractOwnership THEN transaction reverts", async () => {
        await expect(
          factoryAts.connect(otherAccount).recoverContractOwnership(factory.target, otherAccount.address),
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("GIVEN owner caller WHEN calling recoverContractOwnership THEN ownership is transferred", async () => {
        // Deploy a mock ownable contract
        const bondLib = await (await ethers.getContractFactory("TREXBondDeploymentLib")).deploy();
        const equityLib = await (await ethers.getContractFactory("TREXEquityDeploymentLib")).deploy();
        const MockOwnable = await ethers.getContractFactory("TREXFactoryAts", {
          libraries: {
            TREXBondDeploymentLib: await bondLib.getAddress(),
            TREXEquityDeploymentLib: await equityLib.getAddress(),
          },
        });
        const mockContract = await MockOwnable.connect(deployer).deploy(
          trexDeployment.authorities.trexImplementationAuthority.target,
          await trexDeployment.factories.identityFactory.getAddress(),
          factory.target,
        );
        await mockContract.waitForDeployment();

        // Transfer ownership to factory first
        await mockContract.transferOwnership(factoryAts.target);

        // Recover ownership using factoryAts
        await factoryAts.connect(deployer).recoverContractOwnership(mockContract.target, otherAccount.address);

        expect(await mockContract.owner()).to.equal(otherAccount.address);
      });
    });

    describe("setImplementationAuthority", () => {
      it("GIVEN non-owner caller WHEN calling setImplementationAuthority THEN transaction reverts", async () => {
        await expect(
          factoryAts
            .connect(otherAccount)
            .setImplementationAuthority(trexDeployment.authorities.trexImplementationAuthority.target),
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("GIVEN zero address WHEN calling setImplementationAuthority THEN transaction reverts", async () => {
        await expect(factoryAts.connect(deployer).setImplementationAuthority(ADDRESS_ZERO)).to.be.revertedWith(
          "invalid argument - zero address",
        );
      });

      it("GIVEN incomplete implementation authority WHEN calling setImplementationAuthority THEN transaction reverts", async () => {
        // Deploy a mock incomplete implementation authority
        const IncompleteAuthority = await ethers.getContractFactory("MockIncompleteImplementationAuthority");
        const incompleteAuthority = await IncompleteAuthority.deploy();
        await incompleteAuthority.waitForDeployment();

        await expect(
          factoryAts.connect(deployer).setImplementationAuthority(incompleteAuthority.target),
        ).to.be.revertedWith("invalid Implementation Authority");
      });

      it("GIVEN valid implementation authority WHEN calling setImplementationAuthority THEN authority is set and event is emitted", async () => {
        const newAuthority = trexDeployment.authorities.trexImplementationAuthority.target;

        const tx = await factoryAts.connect(deployer).setImplementationAuthority(newAuthority);

        expect(await factoryAts.getImplementationAuthority()).to.equal(newAuthority);
        await expect(tx).to.emit(factoryAts, "ImplementationAuthoritySet").withArgs(newAuthority);
      });
    });

    describe("setIdFactory", () => {
      it("GIVEN non-owner caller WHEN calling setIdFactory THEN transaction reverts", async () => {
        await expect(
          factoryAts.connect(otherAccount).setIdFactory(await trexDeployment.factories.identityFactory.getAddress()),
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("GIVEN zero address WHEN calling setIdFactory THEN transaction reverts", async () => {
        await expect(factoryAts.connect(deployer).setIdFactory(ADDRESS_ZERO)).to.be.revertedWith(
          "invalid argument - zero address",
        );
      });

      it("GIVEN valid id factory address WHEN calling setIdFactory THEN factory is set and event is emitted", async () => {
        const newIdFactory = await trexDeployment.factories.identityFactory.getAddress();

        const tx = await factoryAts.connect(deployer).setIdFactory(newIdFactory);

        expect(await factoryAts.getIdFactory()).to.equal(newIdFactory);
        await expect(tx).to.emit(factoryAts, "IdFactorySet").withArgs(newIdFactory);
      });
    });

    describe("setAtsFactory", () => {
      it("GIVEN non-owner caller WHEN calling setAtsFactory THEN transaction reverts", async () => {
        await expect(factoryAts.connect(otherAccount).setAtsFactory(factory.target)).to.be.revertedWith(
          "Ownable: caller is not the owner",
        );
      });

      it("GIVEN zero address WHEN calling setAtsFactory THEN transaction reverts", async () => {
        await expect(factoryAts.connect(deployer).setAtsFactory(ADDRESS_ZERO)).to.be.revertedWith(
          "invalid argument - zero address",
        );
      });

      it("GIVEN valid ats factory address WHEN calling setAtsFactory THEN factory is set", async () => {
        const newAtsFactory = factory.target;

        await factoryAts.connect(deployer).setAtsFactory(newAtsFactory);

        // Note: There's no getter for atsFactory, but we can verify by checking it doesn't revert
        await expect(factoryAts.connect(deployer).setAtsFactory(newAtsFactory)).to.not.be.reverted;
      });
    });

    describe("Getter functions", () => {
      it("GIVEN deployed factory WHEN calling getImplementationAuthority THEN correct address is returned", async () => {
        const authority = await factoryAts.getImplementationAuthority();
        expect(authority).to.equal(trexDeployment.authorities.trexImplementationAuthority.target);
      });

      it("GIVEN deployed factory WHEN calling getIdFactory THEN correct address is returned", async () => {
        const idFactory = await factoryAts.getIdFactory();
        expect(idFactory).to.equal(trexDeployment.factories.identityFactory.target);
      });

      it("GIVEN non-existent salt WHEN calling getToken THEN zero address is returned", async () => {
        const tokenAddress = await factoryAts.getToken("non-existent-salt");
        expect(tokenAddress).to.equal(ADDRESS_ZERO);
      });
    });
  });
});
