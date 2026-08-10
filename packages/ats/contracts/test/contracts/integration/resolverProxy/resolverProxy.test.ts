// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import {
  type BusinessLogicResolver,
  type AccessControlFacet,
  type PauseFacet,
  type FactoryFacet,
  DiamondFacet,
} from "@contract-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ATS_ROLES } from "@scripts";
import { assertObject } from "../../../common";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("ResolverProxy Tests", () => {
  const CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000011";
  const CONFIG_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000022";

  let resolver: BusinessLogicResolver;
  let resolver_2: BusinessLogicResolver;
  let diamondFacet: DiamondFacet;
  let accessControlImpl: AccessControlFacet;
  let pauseImpl: PauseFacet;
  let factoryImpl: FactoryFacet;
  let signer_A: HardhatEthersSigner;

  async function deployContracts() {
    [signer_A] = await ethers.getSigners();
    resolver = await deployResolver();

    diamondFacet = await (await ethers.getContractFactory("DiamondFacet", signer_A)).deploy();
    accessControlImpl = await (await ethers.getContractFactory("AccessControlFacet", signer_A)).deploy();
    pauseImpl = await (await ethers.getContractFactory("PauseFacet", signer_A)).deploy();
    factoryImpl = await (await ethers.getContractFactory("FactoryFacet", signer_A)).deploy();
  }

  async function setUpResolver(
    businessLogicsRegistryDatas: any[],
    configID?: string,
    resolverContract?: BusinessLogicResolver,
  ) {
    if (!configID) configID = CONFIG_ID;
    if (!resolverContract) resolverContract = resolver;

    const facetIds = businessLogicsRegistryDatas.map((data) => `${data.businessLogicKey}`);

    const facetVersions = facetIds.map(() => 1);

    const facetConfigurations: any[] = [];
    facetIds.forEach((id, index) => facetConfigurations.push({ id, version: facetVersions[index] }));

    await resolverContract.registerBusinessLogics(businessLogicsRegistryDatas);

    await resolverContract.createConfiguration(configID, facetConfigurations as any, "0x");
  }

  async function deployResolver(): Promise<BusinessLogicResolver> {
    const deployedResolver = await (await ethers.getContractFactory("BusinessLogicResolver")).deploy();

    const newResolver = deployedResolver.connect(signer_A) as BusinessLogicResolver;

    await newResolver.initializeBusinessLogicResolver();

    return newResolver;
  }

  async function checkFacets(businessLogicsRegistryDatas: any[], diamondLoupe: DiamondFacet) {
    const expectedFacets = await Promise.all(
      businessLogicsRegistryDatas.map(async (data) => {
        const staticFunctionSelectors = await ethers.getContractAt(
          "IStaticFunctionSelectors",
          data.businessLogicAddress,
        );
        return {
          id: data.businessLogicKey,
          addr: data.businessLogicAddress,
          selectors: await staticFunctionSelectors.getStaticFunctionSelectors(),
          interfaceIds: await staticFunctionSelectors.getStaticInterfaceIds(),
        };
      }),
    );

    assertObject(await diamondLoupe.getFacets(), expectedFacets);

    const expectedFacetIds = expectedFacets.map((facet) => facet.id);
    const expectedFacetAddresses = expectedFacets.map((facet) => facet.addr);

    for (const facet of expectedFacets) {
      expect(await diamondLoupe.getFacetSelectors(facet.id)).to.deep.equal(facet.selectors);
      expect(await diamondLoupe.getFacetIdBySelector(facet.selectors[0])).to.deep.equal(facet.id);
      assertObject(await diamondLoupe.getFacet(facet.id), facet);
      expect(await diamondLoupe.getFacetAddress(facet.selectors[0])).to.deep.equal(facet.addr);
    }

    expect(await diamondLoupe.getFacetIds()).to.deep.equal(expectedFacetIds);
    expect(await diamondLoupe.getFacetAddresses()).to.deep.equal(expectedFacetAddresses);
  }

  beforeEach(async () => {
    await loadFixture(deployContracts);
  });

  it("GIVEN deployed facets WHEN deploy a new resolverProxy with correct configuration THEN a new resolverProxy proxy was deployed", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, []);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target);

    const result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver.target);
    expect(result.configurationId_).to.equal(CONFIG_ID);
    expect(result.configurationVersion_).to.equal(1);
    expect(result.replacementEnabled_).to.equal(false);

    const diamondLoupe = await ethers.getContractAt("DiamondFacet", resolverProxy.target);

    await checkFacets(businessLogicsRegistryDatas, diamondLoupe);
  });

  it("GIVEN a deployed FactoryFacet WHEN deploy a new resolverProxy with correct configuration THEN its static selectors and interface ids are correctly registered", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await factoryImpl.getStaticResolverKey(),
        businessLogicAddress: factoryImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, []);

    const diamondLoupe = await ethers.getContractAt("DiamondFacet", resolverProxy.target);

    await checkFacets(businessLogicsRegistryDatas, diamondLoupe);
  });

  it("GIVEN deployed facets WHEN deploying a resolverProxy and registering Facets to use a non exposed signature THEN raise FunctionNotFound and it is not recognized by supportsInterface", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, []);

    const accessControl = await ethers.getContractAt("AccessControl", resolverProxy.target);
    const diamondLoupe = await ethers.getContractAt("DiamondFacet", resolverProxy.target);

    const GRANT_ROLE_SIGNATURE = "0x2f2ff15d";
    await expect(accessControl.grantRole(ATS_ROLES.DEFAULT_ADMIN_ROLE, signer_A.address))
      .to.be.revertedWithCustomError(resolverProxy, "FunctionNotFound")
      .withArgs(GRANT_ROLE_SIGNATURE);
    await expect(await diamondLoupe.supportsInterface(GRANT_ROLE_SIGNATURE)).to.be.false;
  });

  it("GIVEN deployed facets WHEN pinning each diamond to its own explicit version THEN each keeps its pinned facet set even after later configuration updates", async () => {
    const businessLogicsRegistryDatas_1 = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    const businessLogicsRegistryDatas_2 = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
      {
        businessLogicKey: await pauseImpl.getStaticResolverKey(),
        businessLogicAddress: pauseImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas_1);

    const resolverProxy_v1 = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, []);
    const diamondFacet_v1 = await ethers.getContractAt("DiamondFacet", resolverProxy_v1.target);
    await checkFacets(businessLogicsRegistryDatas_1, diamondFacet_v1);

    await setUpResolver(businessLogicsRegistryDatas_2);

    const latestVersion = Number(await resolver.getLatestVersionByConfiguration(CONFIG_ID));
    expect(latestVersion).to.equal(2);

    const resolverProxy_v2 = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(
      resolver.target,
      { configurationId: CONFIG_ID, configurationVersion: latestVersion, replacementEnabled: false },
      [],
    );
    const diamondFacet_v2 = await ethers.getContractAt("DiamondFacet", resolverProxy_v2.target);

    await checkFacets(businessLogicsRegistryDatas_1, diamondFacet_v1);
    await checkFacets(businessLogicsRegistryDatas_2, diamondFacet_v2);
  });

  it("GIVEN a registered configuration WHEN deploying a ResolverProxy with version 0 THEN reverts with VersionZero", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const resolverProxyFactory = await ethers.getContractFactory("ResolverProxy");

    await expect(
      resolverProxyFactory.deploy(
        resolver.target,
        { configurationId: CONFIG_ID, configurationVersion: 0, replacementEnabled: false },
        [],
      ),
    )
      .to.be.revertedWithCustomError(resolver, "VersionZero")
      .withArgs(CONFIG_ID);
  });

  it("GIVEN resolverProxy and non-admin user WHEN updating version THEN fails with AccountHasNoRole", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, []);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target);

    await expect(diamondCut.updateConfigVersion(0)).to.be.revertedWithCustomError(diamondCut, "AccountHasNoRole");
  });

  it("GIVEN resolverProxy and admin user WHEN updating to non existing version THEN fails with ResolverProxyConfigurationNoRegistered", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const rbac = [
      {
        role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
        members: [signer_A.address],
      },
    ];

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, rbac);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target, signer_A);

    await expect(diamondCut.updateConfigVersion(100)).to.be.revertedWithCustomError(
      resolver,
      "ResolverProxyConfigurationNoRegistered",
    );
  });

  it("GIVEN resolverProxy and admin user WHEN updating version THEN succeeds", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const rbac = [
      {
        role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
        members: [signer_A.address],
      },
    ];

    const oldVersion = 1;

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(
      resolver.target,
      { configurationId: CONFIG_ID, configurationVersion: oldVersion, replacementEnabled: false },
      rbac,
    );

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target, signer_A);

    let result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver.target);
    expect(result.configurationId_).to.equal(CONFIG_ID);
    expect(result.configurationVersion_).to.equal(oldVersion);
    expect(result.replacementEnabled_).to.equal(false);

    const newVersion = 1;

    await diamondCut.updateConfigVersion(newVersion);

    result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver.target);
    expect(result.configurationId_).to.equal(CONFIG_ID);
    expect(result.configurationVersion_).to.equal(newVersion);
    expect(result.replacementEnabled_).to.equal(false);
  });

  it("GIVEN resolverProxy and non-admin user WHEN updating replacement enabled flag THEN fails with AccountHasNoRole", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, []);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target);

    await expect(diamondCut.updateReplacementEnabled(true)).to.be.revertedWithCustomError(
      diamondCut,
      "AccountHasNoRole",
    );
  });

  it("GIVEN resolverProxy and admin user WHEN updating replacement enabled flag THEN succeeds", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const rbac = [
      {
        role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
        members: [signer_A.address],
      },
    ];

    const version = 1;
    const oldReplacementEnabledFlag = false;

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(
      resolver.target,
      { configurationId: CONFIG_ID, configurationVersion: version, replacementEnabled: oldReplacementEnabledFlag },
      rbac,
    );

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target, signer_A);

    let result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver.target);
    expect(result.configurationId_).to.equal(CONFIG_ID);
    expect(result.configurationVersion_).to.equal(version);
    expect(result.replacementEnabled_).to.equal(oldReplacementEnabledFlag);

    const newReplacementEnabledFlag = !oldReplacementEnabledFlag;

    await diamondCut.updateReplacementEnabled(newReplacementEnabledFlag);

    result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver.target);
    expect(result.configurationId_).to.equal(CONFIG_ID);
    expect(result.configurationVersion_).to.equal(version);
    expect(result.replacementEnabled_).to.equal(newReplacementEnabledFlag);
  });

  it("GIVEN resolverProxy and non-admin user WHEN updating configID THEN fails with AccountHasNoRole", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, []);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target);

    await expect(diamondCut.updateConfig(CONFIG_ID_2, 1)).to.be.revertedWithCustomError(diamondCut, "AccountHasNoRole");
  });

  it("GIVEN resolverProxy and admin user WHEN updating to non existing configID THEN fails with ResolverProxyConfigurationNoRegistered", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const rbac = [
      {
        role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
        members: [signer_A.address],
      },
    ];

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, rbac);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target, signer_A);

    await expect(diamondCut.updateConfig(CONFIG_ID_2, 1)).to.be.revertedWithCustomError(
      resolver,
      "ResolverProxyConfigurationNoRegistered",
    );
  });

  it("GIVEN resolverProxy and admin user WHEN updating configID THEN succeeds", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);
    await setUpResolver(businessLogicsRegistryDatas, CONFIG_ID_2);

    const rbac = [
      {
        role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
        members: [signer_A.address],
      },
    ];

    const oldVersion = 1;

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(
      resolver.target,
      { configurationId: CONFIG_ID, configurationVersion: oldVersion, replacementEnabled: false },
      rbac,
    );

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target, signer_A);

    let result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver.target);
    expect(result.configurationId_).to.equal(CONFIG_ID);
    expect(result.configurationVersion_).to.equal(oldVersion);
    expect(result.replacementEnabled_).to.equal(false);

    const newVersion = 1;

    await diamondCut.updateConfig(CONFIG_ID_2, newVersion);

    result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver.target);
    expect(result.configurationId_).to.equal(CONFIG_ID_2);
    expect(result.configurationVersion_).to.equal(newVersion);
    expect(result.replacementEnabled_).to.equal(false);
  });

  it("GIVEN resolverProxy and non-admin user WHEN updating resolver THEN fails with AccountHasNoRole", async () => {
    resolver_2 = await deployResolver();

    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, []);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target);

    await expect(diamondCut.updateResolver(resolver_2.target, CONFIG_ID_2, 1, true)).to.be.revertedWithCustomError(
      diamondCut,
      "AccountHasNoRole",
    );
  });

  it("GIVEN resolverProxy and admin user WHEN updating to non existing resolver THEN fails with ResolverProxyConfigurationNoRegistered", async () => {
    resolver_2 = await deployResolver();

    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas, CONFIG_ID);

    const rbac = [
      {
        role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
        members: [signer_A.address],
      },
    ];

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, rbac);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target, signer_A);

    await expect(diamondCut.updateResolver(resolver_2.target, CONFIG_ID_2, 1, true)).to.be.revertedWithCustomError(
      resolver,
      "ResolverProxyConfigurationNoRegistered",
    );
  });

  it("GIVEN resolverProxy and admin user WHEN updating resolver THEN succeeds", async () => {
    resolver_2 = await deployResolver();

    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);
    await setUpResolver(businessLogicsRegistryDatas, CONFIG_ID_2, resolver_2);

    const rbac = [
      {
        role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
        members: [signer_A.address],
      },
    ];

    const oldVersion = 1;

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(
      resolver.target,
      { configurationId: CONFIG_ID, configurationVersion: oldVersion, replacementEnabled: false },
      rbac,
    );

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target, signer_A);

    let result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver.target);
    expect(result.configurationId_).to.equal(CONFIG_ID);
    expect(result.configurationVersion_).to.equal(oldVersion);
    expect(result.replacementEnabled_).to.equal(false);

    const newVersion = 1;

    await diamondCut.updateResolver(resolver_2.target, CONFIG_ID_2, newVersion, true);

    result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver_2.target);
    expect(result.configurationId_).to.equal(CONFIG_ID_2);
    expect(result.configurationVersion_).to.equal(newVersion);
    expect(result.replacementEnabled_).to.equal(true);
  });

  it("FIND-053 (TDD, expected red) GIVEN resolverProxy and admin user WHEN updating resolver to the zero address THEN reverts with InvalidBusinessLogicResolver", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const rbac = [{ role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [signer_A.address] }];

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, rbac);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target, signer_A);

    await expect(diamondCut.updateResolver(ethers.ZeroAddress, CONFIG_ID, 1, true)).to.be.revertedWithCustomError(
      diamondCut,
      "InvalidBusinessLogicResolver",
    );
  });

  it("FIND-053 (TDD, expected red) GIVEN resolverProxy and admin user WHEN updating resolver to a contract that is not a BusinessLogicResolver THEN reverts with InvalidBusinessLogicResolver", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const rbac = [{ role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [signer_A.address] }];

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, rbac);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target, signer_A);

    await expect(diamondCut.updateResolver(diamondFacet.target, CONFIG_ID, 1, true)).to.be.revertedWithCustomError(
      diamondCut,
      "InvalidBusinessLogicResolver",
    );
  });

  it("FIND-053 (TDD, expected red) GIVEN resolverProxy and admin user WHEN updating resolver THEN emits ResolverUpdated", async () => {
    resolver_2 = await deployResolver();

    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);
    await setUpResolver(businessLogicsRegistryDatas, CONFIG_ID_2, resolver_2);

    const rbac = [{ role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [signer_A.address] }];

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, rbac);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target, signer_A);

    await expect(diamondCut.updateResolver(resolver_2.target, CONFIG_ID_2, 1, true))
      .to.emit(diamondCut, "ResolverUpdated")
      .withArgs(signer_A.address, resolver.target, resolver_2.target, CONFIG_ID_2, 1);
  });

  it("FIND-053 (TDD, expected red) GIVEN resolverProxy and admin user WHEN updating config THEN emits ConfigUpdated", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas, CONFIG_ID);
    await setUpResolver(businessLogicsRegistryDatas, CONFIG_ID_2);

    const rbac = [{ role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [signer_A.address] }];

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, rbac);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target, signer_A);

    await expect(diamondCut.updateConfig(CONFIG_ID_2, 1))
      .to.emit(diamondCut, "ConfigUpdated")
      .withArgs(signer_A.address, CONFIG_ID, CONFIG_ID_2, 1);
  });

  it("FIND-053 (TDD, expected red) GIVEN resolverProxy and admin user WHEN updating config version THEN emits ConfigVersionUpdated", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.target,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.target,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const rbac = [{ role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [signer_A.address] }];

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.target, { configurationId: CONFIG_ID, configurationVersion: 1, replacementEnabled: false }, rbac);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.target, signer_A);

    await expect(diamondCut.updateConfigVersion(1))
      .to.emit(diamondCut, "ConfigVersionUpdated")
      .withArgs(signer_A.address, 1, 1);
  });
});
