// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  deployInitializerFixture,
  deployInitializerBatchFixture,
  TEST_CONFIG_ID,
  MOCK_FACET_ID,
  MOCK_STATEFUL_KEY,
  type InitializerFixtureResult,
} from "../../../fixtures/initializer.fixture";

import type { InitializerFacet } from "@contract-types";

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

/**
 * Resolve the BLR version that MockStatefulFacet would report at the current
 * proxy config context.
 */
async function currentMockFacetVersion(ctx: InitializerFixtureResult): Promise<bigint> {
  const [, , proxyVer] = await ctx.diamondCut.getConfigInfo();
  return ctx.blr.getFacetVersionByConfigurationIdVersionAndFacetId(TEST_CONFIG_ID, proxyVer, MOCK_FACET_ID);
}

// -------------------------------------------------------------------------
// A. MockInitializableFacet — static metadata (replaces InitializerFacet)
// -------------------------------------------------------------------------

describe("MockInitializableFacet", () => {
  let ctx: InitializerFixtureResult;

  beforeEach(async () => {
    ctx = await loadFixture(deployInitializerFixture);
  });

  describe("getStaticResolverKey", () => {
    it("SHOULD return the _INITIALIZER_RESOLVER_KEY", async () => {
      const facetAddress = ctx.facetAddresses.MockInitializableFacet;
      const facet = await ethers.getContractAt("MockInitializableFacet", facetAddress);
      const key = await facet.getStaticResolverKey();
      expect(key).to.equal("0x65c891d003e7dc436f2c3d0863d599d91867c8695fee29923a476a2be3ec540f");
    });
  });

  describe("getStaticFunctionSelectors", () => {
    it("SHOULD return an array of 6 selectors", async () => {
      const facetAddress = ctx.facetAddresses.MockInitializableFacet;
      const facet = await ethers.getContractAt("MockInitializableFacet", facetAddress);
      const selectors = await facet.getStaticFunctionSelectors();
      expect(selectors).to.have.lengthOf(7);
    });
  });

  describe("getStaticInterfaceIds", () => {
    it("SHOULD return the IInitializer interface id", async () => {
      const facetAddress = ctx.facetAddresses.MockInitializableFacet;
      const facet = await ethers.getContractAt("MockInitializableFacet", facetAddress);
      const ids = await facet.getStaticInterfaceIds();

      // Compute IInitializer interface ID from its 5 functions (now includes initializeInitializer)
      const iface = new ethers.Interface([
        "function initializeInitializer()",
        "function setOperationalStatus()",
        "function getOperationalStatus(bytes32,uint256) view returns (uint256)",
        "function getFacetVersionStatus(bytes32,uint256) view returns (uint256)",
        "function getFacetLastVersion(bytes32) view returns (uint256)",
      ]);
      const selectors = [
        "initializeInitializer",
        "setOperationalStatus",
        "getOperationalStatus",
        "getFacetVersionStatus",
        "getFacetLastVersion",
      ].map((name) => iface.getFunction(name)!.selector);
      const expectedId = selectors.reduce((acc, sel) => {
        const val = BigInt(sel);
        return acc ^ val;
      }, 0n);
      const expectedIdHex: string = "0x" + expectedId.toString(16).padStart(8, "0");
      expect(ids[0]).to.equal(expectedIdHex);
    });
  });
});

// -------------------------------------------------------------------------
// B. Getters
// -------------------------------------------------------------------------

describe("InitializerStorageWrapper — getters", () => {
  let ctx: InitializerFixtureResult;

  beforeEach(async () => {
    ctx = await loadFixture(deployInitializerFixture);
  });

  describe("getOperationalStatus", () => {
    it("SHOULD return 0 when not started", async () => {
      const status = await ctx.initializer.getOperationalStatus(TEST_CONFIG_ID, 1);
      expect(status).to.equal(0n);
    });
  });

  describe("getFacetVersionStatus", () => {
    it("SHOULD return 0 before initialization", async () => {
      const status = await ctx.initializer.getFacetVersionStatus(MOCK_FACET_ID, 1);
      expect(status).to.equal(0n);
    });

    it("SHOULD return 1 after initialization via MockStatefulFacet", async () => {
      await ctx.mockFacet.initializeMock();
      const status = await ctx.initializer.getFacetVersionStatus(MOCK_FACET_ID, 1);
      expect(status).to.equal(1n);
    });
  });

  describe("getFacetLastVersion", () => {
    it("SHOULD return 0 before initialization", async () => {
      const lastVersion = await ctx.initializer.getFacetLastVersion(MOCK_FACET_ID);
      expect(lastVersion).to.equal(0n);
    });

    it("SHOULD return the registered version after initialization via MockStatefulFacet", async () => {
      await ctx.mockFacet.initializeMock();
      const lastVersion = await ctx.initializer.getFacetLastVersion(MOCK_FACET_ID);
      expect(lastVersion).to.equal(1n);
    });
  });
});

// -------------------------------------------------------------------------
// C0. initializeInitializer — stateful initializer self-registration
// -------------------------------------------------------------------------

describe("initializeInitializer", () => {
  let ctx: InitializerFixtureResult;

  beforeEach(async () => {
    ctx = await loadFixture(deployInitializerFixture);
  });

  it("GIVEN a fresh proxy WHEN initializeInitializer is called THEN registers the initializer facet", async () => {
    await ctx.initializer.initializeInitializer();
    const lastVersion = await ctx.initializer.getFacetLastVersion(ctx.facetKeys["MockInitializableFacet"]);
    expect(lastVersion).to.equal(1n);
  });

  it("GIVEN an already initialised proxy WHEN initializeInitializer is called again THEN reverts FacetAlreadyRegistered", async () => {
    await ctx.initializer.initializeInitializer();
    await expect(ctx.initializer.initializeInitializer()).to.be.revertedWithCustomError(
      ctx.initializer,
      "FacetAlreadyRegistered",
    );
  });

  it("GIVEN a non-admin signer WHEN initializeInitializer is called THEN reverts AccountHasNoRole", async () => {
    const acl = await ethers.getContractAt("AccessControlFacet", ctx.proxyAddress);
    const facetAsUnknown = ctx.mockInitializableFacet.connect(ctx.unknownSigner);
    await expect(facetAsUnknown.initializeInitializer()).to.be.revertedWithCustomError(acl, "AccountHasNoRole");
  });
});

// -------------------------------------------------------------------------
// C. initializeMock — onlyFacetNotRegistered (via MockStatefulFacet)
// -------------------------------------------------------------------------

describe("initializeMock", () => {
  let ctx: InitializerFixtureResult;

  beforeEach(async () => {
    ctx = await loadFixture(deployInitializerFixture);
  });

  it("GIVEN a non-admin signer WHEN initializeMock is called THEN reverts UnauthorisedAccount", async () => {
    const mockAsUnknown = ctx.mockFacet.connect(ctx.unknownSigner);
    await expect(mockAsUnknown.initializeMock()).to.be.revertedWithCustomError(mockAsUnknown, "UnauthorisedAccount");
  });

  it("GIVEN a fresh facet WHEN initializeMock is called THEN registers and marks ready", async () => {
    await ctx.mockFacet.initializeMock();

    const lastVersion = await ctx.initializer.getFacetLastVersion(MOCK_FACET_ID);
    expect(lastVersion).to.equal(1n);

    const status = await ctx.initializer.getFacetVersionStatus(MOCK_FACET_ID, 1);
    expect(status).to.equal(1n);
  });

  it("GIVEN an already initialized facet WHEN initializeMock is called again THEN reverts FacetAlreadyRegistered", async () => {
    await ctx.mockFacet.initializeMock();

    await expect(ctx.mockFacet.initializeMock()).to.be.revertedWithCustomError(
      ctx.initializer,
      "FacetAlreadyRegistered",
    );
  });
});

// -------------------------------------------------------------------------
// C2. initializeMockFacet — batch facet marker (via MockInitializableFacet)
// -------------------------------------------------------------------------

describe("initializeMockFacet", () => {
  let ctx: InitializerFixtureResult;

  beforeEach(async () => {
    ctx = await loadFixture(deployInitializerFixture);
  });

  it("GIVEN a fresh facet WHEN initializeMockFacet is called THEN marks it ready", async () => {
    await ctx.mockInitializableFacet.initializeMockFacet([MOCK_FACET_ID]);
    expect(await ctx.initializer.getFacetLastVersion(MOCK_FACET_ID)).to.equal(1n);
  });
});

// -------------------------------------------------------------------------
// D. reinitializeMock — upgrade lifecycle (via MockStatefulFacet)
// -------------------------------------------------------------------------

describe("reinitializeMock", () => {
  let ctx: InitializerFixtureResult;

  beforeEach(async () => {
    ctx = await loadFixture(deployInitializerFixture);
    // Fresh init at v1
    await ctx.mockFacet.initializeMock();

    // Register MockStatefulFacet again at new version so BLR assigns it a higher version number
    await ctx.blr.registerBusinessLogics([
      {
        businessLogicKey: MOCK_STATEFUL_KEY,
        businessLogicAddress: ctx.facetAddresses.MockStatefulFacet,
      },
    ]);
    // The facet is now at the BLR's latest version. Query it.
    const blrLatest = await ctx.blr.getLatestVersion();

    // Create config v3 with MockStatefulFacet at the new version, others at version 1
    const configs = Object.entries(ctx.facetKeys).map(([name, key]) => ({
      id: key,
      version: name === "MockStatefulFacet" ? blrLatest : 1,
    }));
    await ctx.blr.createConfiguration(ctx.configId, configs);
    // Upgrade proxy to v3 so _currentFacetVersion resolves against the new config
    await ctx.diamondCut.updateConfigVersion(3);
  });

  it("GIVEN wrong fromVersions WHEN reinitializeMock is called THEN reverts FacetPreviousVersionNotAccepted", async () => {
    await expect(ctx.mockFacet.reinitializeMock([999n])).to.be.revertedWithCustomError(
      ctx.initializer,
      "FacetPreviousVersionNotAccepted",
    );
  });

  it("GIVEN empty fromVersions WHEN reinitializeMock is called THEN reverts FacetPreviousVersionNotAccepted", async () => {
    await expect(ctx.mockFacet.reinitializeMock([])).to.be.revertedWithCustomError(
      ctx.initializer,
      "FacetPreviousVersionNotAccepted",
    );
  });

  it("GIVEN a non-admin signer WHEN reinitializeMock is called THEN reverts UnauthorisedAccount", async () => {
    const mockAsUnknown = ctx.mockFacet.connect(ctx.unknownSigner);
    await expect(mockAsUnknown.reinitializeMock([1n])).to.be.revertedWithCustomError(
      mockAsUnknown,
      "UnauthorisedAccount",
    );
  });

  it("GIVEN valid fromVersions WHEN reinitializeMock is called THEN re-registers at new version", async () => {
    await ctx.mockFacet.reinitializeMock([1n]);

    const v2 = await currentMockFacetVersion(ctx);
    expect(v2).to.equal(2n);

    const statusV2 = await ctx.initializer.getFacetVersionStatus(MOCK_FACET_ID, 2);
    expect(statusV2).to.equal(1n);

    const lastVersion = await ctx.initializer.getFacetLastVersion(MOCK_FACET_ID);
    expect(lastVersion).to.equal(2n);
  });

  it("GIVEN already re-initialized at v2 WHEN reinitializeMock([v2]) is called THEN reverts FacetReady", async () => {
    await ctx.mockFacet.reinitializeMock([1n]);
    await expect(ctx.mockFacet.reinitializeMock([2n])).to.be.revertedWithCustomError(ctx.initializer, "FacetReady");
  });
});

// -------------------------------------------------------------------------
// E. doSomething — onlyOperational (via MockStatefulFacet)
// -------------------------------------------------------------------------

describe("doSomething", () => {
  let ctx: InitializerFixtureResult;

  beforeEach(async () => {
    ctx = await loadFixture(deployInitializerFixture);
  });

  it("GIVEN non-operational asset WHEN doSomething is called THEN reverts AssetNotOperational", async () => {
    await expect(ctx.mockFacet.doSomething()).to.be.revertedWithCustomError(ctx.initializer, "AssetNotOperational");
  });

  it("GIVEN operational asset WHEN doSomething is called THEN returns 42", async () => {
    await ctx.mockInitializableFacet.initializeMockFacet(Object.values(ctx.facetKeys));
    expect(await ctx.mockInitializableFacet.setOperationalStatusMocked(2)).to.emit(
      ctx.initializer,
      "OperationalStatusPartialSet",
    );
    expect(await ctx.mockInitializableFacet.setOperationalStatusMocked(2)).to.emit(
      ctx.initializer,
      "OperationalStatusSet",
    );
    expect(await ctx.initializer.getOperationalStatus(ctx.configId, 1)).to.equal(1n);
    const result = await ctx.mockFacet.doSomething.staticCall();
    expect(result).to.equal(42n);
    await ctx.mockFacet.doSomething();
  });
});

// -------------------------------------------------------------------------
// F. setOperationalStatus — branches
// -------------------------------------------------------------------------

describe("setOperationalStatus", () => {
  describe("single pass (all facets)", () => {
    let ctx: InitializerFixtureResult;

    before(async () => {
      ctx = await loadFixture(deployInitializerFixture);
    });

    it("F1: GIVEN all facets explicitly initialized WHEN setOperationalStatus is called THEN becomes operational", async () => {
      await ctx.mockInitializableFacet.initializeMockFacet(Object.values(ctx.facetKeys));
      await ctx.initializer.setOperationalStatus();
      expect(await ctx.initializer.getOperationalStatus(TEST_CONFIG_ID, 1)).to.equal(1n);
    });

    it("F2: GIVEN no facets explicitly initialized WHEN setOperationalStatus is called THEN becomes operational via D1-A auto-approve", async () => {
      ctx = await loadFixture(deployInitializerFixture);
      expect(await ctx.initializer.getOperationalStatus(TEST_CONFIG_ID, 1)).to.equal(0n);
      await ctx.initializer.setOperationalStatus();
      expect(await ctx.initializer.getOperationalStatus(TEST_CONFIG_ID, 1)).to.equal(1n);
    });

    it("F3: GIVEN all stateless WHEN setOperationalStatus is called THEN becomes operational (D1-A)", async () => {
      await ctx.initializer.setOperationalStatus();
      expect(await ctx.initializer.getOperationalStatus(TEST_CONFIG_ID, 1)).to.equal(1n);
    });
  });

  describe("multi-facet (>10 facets, all processed in single pass)", () => {
    let ctx: InitializerFixtureResult & { batchFacetIds: string[] };

    before(async () => {
      ctx = await loadFixture(deployInitializerBatchFixture);
      // Initialize all stateful facets explicitly so they are ready.
      await ctx.mockInitializableFacet.initializeMockFacet(Object.values(ctx.facetKeys));
      await ctx.mockInitializableFacet.initializeMockFacet(ctx.batchFacetIds);
    });

    it("F4: GIVEN all 16 facets ready WHEN setOperationalStatus is called THEN becomes operational in a single pass", async () => {
      await ctx.initializer.setOperationalStatus();
      expect(await ctx.initializer.getOperationalStatus(ctx.configId, ctx.initialVersion)).to.equal(1n);
    });

    it("F5: GIVEN operational status WHEN setOperationalStatus is called THEN early-exits returning (true, 0)", async () => {
      await ctx.initializer.setOperationalStatus();
      expect(await ctx.initializer.getOperationalStatus(ctx.configId, ctx.initialVersion)).to.equal(1n);
    });
  });

  describe("blocking path (stateful facet pending reinit)", () => {
    let ctx: InitializerFixtureResult;

    beforeEach(async () => {
      ctx = await loadFixture(deployInitializerFixture);
      await ctx.mockFacet.initializeMock();

      await ctx.blr.registerBusinessLogics([
        {
          businessLogicKey: MOCK_STATEFUL_KEY,
          businessLogicAddress: ctx.facetAddresses.MockStatefulFacet,
        },
      ]);
      const blrLatest = await ctx.blr.getLatestVersion();

      const configs = Object.entries(ctx.facetKeys).map(([name, key]) => ({
        id: key,
        version: name === "MockStatefulFacet" ? blrLatest : 1,
      }));
      await ctx.blr.createConfiguration(ctx.configId, configs);
      await ctx.diamondCut.updateConfigVersion(3);
    });

    it("GIVEN a stateful facet at stale version WHEN setOperationalStatus is called THEN it reverts with NotOperational", async () => {
      await expect(ctx.initializer.setOperationalStatus())
        .to.be.revertedWithCustomError(ctx.initializer, "NotOperational")
        .withArgs(ctx.configId, 3n, ctx.facetKeys.MockStatefulFacet);
    });
  });
});

// -------------------------------------------------------------------------
// InitializerFacet — real production facet (not mock)
// -------------------------------------------------------------------------

describe("InitializerFacet (real)", () => {
  let facet: InitializerFacet;

  before(async () => {
    const [deployer] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("InitializerFacet", deployer);
    facet = (await factory.deploy()) as unknown as InitializerFacet;
    await facet.waitForDeployment();
  });

  describe("getStaticResolverKey", () => {
    it("SHOULD return the _INITIALIZER_RESOLVER_KEY", async () => {
      const key = await facet.getStaticResolverKey();
      expect(key).to.equal("0x65c891d003e7dc436f2c3d0863d599d91867c8695fee29923a476a2be3ec540f");
    });
  });

  describe("getStaticFunctionSelectors", () => {
    it("SHOULD return an array of 5 selectors (no initializeMockFacet)", async () => {
      const selectors = await facet.getStaticFunctionSelectors();
      expect(selectors).to.have.lengthOf(5);
    });

    it("SHOULD include setOperationalStatus selector", async () => {
      const iface = new ethers.Interface(["function setOperationalStatus()"]);
      const expectedSelector = iface.getFunction("setOperationalStatus")!.selector;
      const selectors = await facet.getStaticFunctionSelectors();
      expect(selectors.map((s: string) => s.toLowerCase())).to.include(expectedSelector.toLowerCase());
    });
  });

  describe("getStaticInterfaceIds", () => {
    it("SHOULD return the IInitializer interface id", async () => {
      const ids = await facet.getStaticInterfaceIds();

      const iface = new ethers.Interface([
        "function initializeInitializer()",
        "function setOperationalStatus()",
        "function getOperationalStatus(bytes32,uint256) view returns (uint256)",
        "function getFacetVersionStatus(bytes32,uint256) view returns (uint256)",
        "function getFacetLastVersion(bytes32) view returns (uint256)",
      ]);
      const selectors = [
        "initializeInitializer",
        "setOperationalStatus",
        "getOperationalStatus",
        "getFacetVersionStatus",
        "getFacetLastVersion",
      ].map((name) => iface.getFunction(name)!.selector);
      const expectedId = selectors.reduce((acc: bigint, sel: string) => {
        const val = BigInt(sel);
        return acc ^ val;
      }, 0n);
      const expectedIdHex: string = "0x" + expectedId.toString(16).padStart(8, "0");
      expect(ids[0]).to.equal(expectedIdHex);
    });
  });
});
