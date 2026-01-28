import { expect } from "chai";
import { ethers } from "hardhat";
import { type BusinessLogicResolver, type AccessControlFacet, type PauseFacet, DiamondFacet } from "@contract-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
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
  let signer_A: SignerWithAddress;

  async function deployContracts() {
    [signer_A] = await ethers.getSigners();
    resolver = await deployResolver();

    diamondFacet = await (await ethers.getContractFactory("DiamondFacet", signer_A)).deploy();
    accessControlImpl = await (await ethers.getContractFactory("AccessControlFacet", signer_A)).deploy();
    pauseImpl = await (await ethers.getContractFactory("PauseFacet", signer_A)).deploy();
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

    await resolverContract.createConfiguration(configID, facetConfigurations as any);
  }

  async function deployResolver(): Promise<BusinessLogicResolver> {
    let newResolver = await (await ethers.getContractFactory("BusinessLogicResolver")).deploy();

    newResolver = newResolver.connect(signer_A);

    await newResolver.initialize_BusinessLogicResolver();

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
    //await loadFixture(deployContracts)
    await loadFixture(deployContracts);
  });

  it("GIVEN deployed facets WHEN deploy a new resolverProxy with correct configuration THEN a new resolverProxy proxy was deployed", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.address,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.address,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.address, CONFIG_ID, 1, []);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.address);

    const result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver.address);
    expect(result.configurationId_).to.equal(CONFIG_ID);
    expect(result.version_).to.equal(1);

    const diamondLoupe = await ethers.getContractAt("DiamondFacet", resolverProxy.address);

    await checkFacets(businessLogicsRegistryDatas, diamondLoupe);
  });

  it("GIVEN deployed facets WHEN deploying a resolverProxy and registering Facets to use a non exposed signature THEN raise FunctionNotFound and it is not recognized by supportsInterface", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.address,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.address, CONFIG_ID, 1, []);

    const accessControl = await ethers.getContractAt("AccessControl", resolverProxy.address);
    const diamondLoupe = await ethers.getContractAt("DiamondFacet", resolverProxy.address);

    const GRANT_ROLE_SIGNATURE = "0x2f2ff15d";
    await expect(accessControl.grantRole(ATS_ROLES._DEFAULT_ADMIN_ROLE, signer_A.address))
      .to.be.revertedWithCustomError(resolverProxy, "FunctionNotFound")
      .withArgs(GRANT_ROLE_SIGNATURE);
    await expect(await diamondLoupe.supportsInterface(GRANT_ROLE_SIGNATURE)).to.be.false;
  });

  it("GIVEN deployed facets WHEN deploy a diamond to latestVersion and one to a specific version THEN only the latest version one will get updated", async () => {
    const businessLogicsRegistryDatas_1 = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.address,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.address,
      },
    ];

    const businessLogicsRegistryDatas_2 = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.address,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.address,
      },
      {
        businessLogicKey: await pauseImpl.getStaticResolverKey(),
        businessLogicAddress: pauseImpl.address,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas_1);

    const resolverProxy_v1 = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.address, CONFIG_ID, 1, []);

    const resolverProxy_latest = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.address, CONFIG_ID, 0, []);

    const diamondFacet_v1 = await ethers.getContractAt("DiamondFacet", resolverProxy_v1.address);

    const diamondFacet_latest = await ethers.getContractAt("DiamondFacet", resolverProxy_latest.address);

    await checkFacets(businessLogicsRegistryDatas_1, diamondFacet_v1);
    await checkFacets(businessLogicsRegistryDatas_1, diamondFacet_latest);

    await setUpResolver(businessLogicsRegistryDatas_2);

    await checkFacets(businessLogicsRegistryDatas_1, diamondFacet_v1);
    await checkFacets(businessLogicsRegistryDatas_2, diamondFacet_latest);
  });

  it("GIVEN resolverProxy and non-admin user WHEN updating version THEN fails with AccountHasNoRole", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.address,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.address,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.address, CONFIG_ID, 1, []);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.address);

    await expect(diamondCut.updateConfigVersion(0)).to.be.rejectedWith("AccountHasNoRole");
  });

  it("GIVEN resolverProxy and admin user WHEN updating to non existing version THEN fails with ResolverProxyConfigurationNoRegistered", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.address,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.address,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const rbac = [
      {
        role: ATS_ROLES._DEFAULT_ADMIN_ROLE,
        members: [signer_A.address],
      },
    ];

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.address, CONFIG_ID, 1, rbac);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.address, signer_A);

    await expect(diamondCut.updateConfigVersion(100)).to.be.rejectedWith("ResolverProxyConfigurationNoRegistered");
  });

  it("GIVEN resolverProxy and admin user WHEN updating version THEN succeeds", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.address,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.address,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const rbac = [
      {
        role: ATS_ROLES._DEFAULT_ADMIN_ROLE,
        members: [signer_A.address],
      },
    ];

    const oldVersion = 1;

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.address, CONFIG_ID, oldVersion, rbac);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.address, signer_A);

    let result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver.address);
    expect(result.configurationId_).to.equal(CONFIG_ID);
    expect(result.version_).to.equal(oldVersion);

    const newVersion = 0;

    await diamondCut.updateConfigVersion(newVersion);

    result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver.address);
    expect(result.configurationId_).to.equal(CONFIG_ID);
    expect(result.version_).to.equal(newVersion);
  });

  it("GIVEN resolverProxy and non-admin user WHEN updating configID THEN fails with AccountHasNoRole", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.address,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.address,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.address, CONFIG_ID, 1, []);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.address);

    await expect(diamondCut.updateConfig(CONFIG_ID_2, 1)).to.be.rejectedWith("AccountHasNoRole");
  });

  it("GIVEN resolverProxy and admin user WHEN updating to non existing configID THEN fails with ResolverProxyConfigurationNoRegistered", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.address,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.address,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const rbac = [
      {
        role: ATS_ROLES._DEFAULT_ADMIN_ROLE,
        members: [signer_A.address],
      },
    ];

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.address, CONFIG_ID, 1, rbac);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.address, signer_A);

    await expect(diamondCut.updateConfig(CONFIG_ID_2, 1)).to.be.rejectedWith("ResolverProxyConfigurationNoRegistered");
  });

  it("GIVEN resolverProxy and admin user WHEN updating configID THEN succeeds", async () => {
    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.address,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.address,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);
    await setUpResolver(businessLogicsRegistryDatas, CONFIG_ID_2);

    const rbac = [
      {
        role: ATS_ROLES._DEFAULT_ADMIN_ROLE,
        members: [signer_A.address],
      },
    ];

    const oldVersion = 1;

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.address, CONFIG_ID, oldVersion, rbac);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.address, signer_A);

    let result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver.address);
    expect(result.configurationId_).to.equal(CONFIG_ID);
    expect(result.version_).to.equal(oldVersion);

    const newVersion = 0;

    await diamondCut.updateConfig(CONFIG_ID_2, newVersion);

    result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver.address);
    expect(result.configurationId_).to.equal(CONFIG_ID_2);
    expect(result.version_).to.equal(newVersion);
  });

  it("GIVEN resolverProxy and non-admin user WHEN updating resolver THEN fails with AccountHasNoRole", async () => {
    resolver_2 = await deployResolver();

    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.address,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.address,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.address, CONFIG_ID, 1, []);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.address);

    await expect(diamondCut.updateResolver(resolver_2.address, CONFIG_ID_2, 1)).to.be.rejectedWith("AccountHasNoRole");
  });

  it("GIVEN resolverProxy and admin user WHEN updating to non existing resolver THEN fails with ResolverProxyConfigurationNoRegistered", async () => {
    resolver_2 = await deployResolver();

    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.address,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.address,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas, CONFIG_ID);

    const rbac = [
      {
        role: ATS_ROLES._DEFAULT_ADMIN_ROLE,
        members: [signer_A.address],
      },
    ];

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.address, CONFIG_ID, 1, rbac);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.address, signer_A);

    await expect(diamondCut.updateResolver(resolver_2.address, CONFIG_ID_2, 1)).to.be.rejectedWith(
      "ResolverProxyConfigurationNoRegistered",
    );
  });

  it("GIVEN resolverProxy and admin user WHEN updating resolver THEN succeeds", async () => {
    resolver_2 = await deployResolver();

    const businessLogicsRegistryDatas = [
      {
        businessLogicKey: await diamondFacet.getStaticResolverKey(),
        businessLogicAddress: diamondFacet.address,
      },
      {
        businessLogicKey: await accessControlImpl.getStaticResolverKey(),
        businessLogicAddress: accessControlImpl.address,
      },
    ];

    await setUpResolver(businessLogicsRegistryDatas);
    await setUpResolver(businessLogicsRegistryDatas, CONFIG_ID_2, resolver_2);

    const rbac = [
      {
        role: ATS_ROLES._DEFAULT_ADMIN_ROLE,
        members: [signer_A.address],
      },
    ];

    const oldVersion = 1;

    const resolverProxy = await (
      await ethers.getContractFactory("ResolverProxy")
    ).deploy(resolver.address, CONFIG_ID, oldVersion, rbac);

    const diamondCut = await ethers.getContractAt("DiamondFacet", resolverProxy.address, signer_A);

    let result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver.address);
    expect(result.configurationId_).to.equal(CONFIG_ID);
    expect(result.version_).to.equal(oldVersion);

    const newVersion = 0;

    await diamondCut.updateResolver(resolver_2.address, CONFIG_ID_2, newVersion);

    result = await diamondCut.getConfigInfo();

    expect(result.resolver_).to.equal(resolver_2.address);
    expect(result.configurationId_).to.equal(CONFIG_ID_2);
    expect(result.version_).to.equal(newVersion);
  });
});
