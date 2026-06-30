// SPDX-License-Identifier: Apache-2.0

// TEST-ONLY: integration tests for the InitializeMock domain. Loads the full
// ATS infrastructure fixture (which, with useTimeTravel=true, deploys three
// distinct BLR versions of each of MockFacet1/2/3 — all backed by identical
// bytecode — and creates two versions of the InitializeMock configuration:
//   v1 = { InitializerFacet:1, DiamondFacet:1, MockFacet1:1, MockFacet2:2, MockFacet3:1 }
//   v2 = { InitializerFacet:1, DiamondFacet:1, MockFacet1:3, MockFacet2:3, MockFacet3:3 }
// and deploys a ResolverProxy against INITIALIZE_MOCK_CONFIG_ID to exercise
// the initializer-versioning flow on the five facets of that configuration.
// `DiamondFacet` is the same shared production facet every other domain config
// registers under `RESOLVER_KEY_DIAMOND`; its `initializeDiamondCut()` hook lets
// it participate in the initializer flow just like the MockFacets.

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ethers } from "hardhat";
import {
  IFactory,
  IDiamondFacet__factory,
  InitializerFacet,
  InitializerFacet__factory,
  DiamondFacet,
  DiamondFacet__factory,
  MockFacet1,
  MockFacet1__factory,
  MockFacet2,
  MockFacet2__factory,
  MockFacet3,
  MockFacet3__factory,
} from "@contract-types";
import { deployAtsInfrastructureFixture } from "@test";
import { ATS_ROLES, CONFIG_IDS, RESOLVER_KEYS } from "@scripts";
import { INITIALIZE_MOCK_CONFIG_ID } from "@scripts/domain";
import { decodeEvent } from "@scripts/infrastructure";

describe("Initializer — InitializeMock domain", () => {
  // TEST-ONLY: mirrors `RESOLVER_KEYS.initializer` declared file-scope in
  // `contracts/facets/initializer/IInitializer.sol`. Sourced from the
  // auto-generated atsRegistry so the test stays in sync with the codegen.
  const initializerFacetId = RESOLVER_KEYS.initializer;
  // TEST-ONLY: mirrors the `_MOCK_FACET_N = bytes32("MockFacetN")`
  // constants declared in `contracts/test/mocks/MockFacets.sol`.
  const mockFacet1Id = "0x4d6f636b46616365743100000000000000000000000000000000000000000000";
  const mockFacet2Id = "0x4d6f636b46616365743200000000000000000000000000000000000000000000";
  const mockFacet3Id = "0x4d6f636b46616365743300000000000000000000000000000000000000000000";
  // TEST-ONLY: the production `_DIAMOND` resolver key from
  // `contracts/constants/resolverKeys.sol`, shared with every other domain config.
  const diamondFacetId = RESOLVER_KEYS.diamond;

  let factory: IFactory;
  let blrAddress: string;
  let deployer: HardhatEthersSigner;
  let unknownSigner: HardhatEthersSigner;

  // TEST-ONLY: facet handles bound to the freshly-deployed ResolverProxy.
  let mockFacet1: MockFacet1;
  let mockFacet2: MockFacet2;
  let mockFacet3: MockFacet3;
  let diamondFacet: DiamondFacet;
  let initializerFacet: InitializerFacet;

  const setupEnvironment = async () => {
    const base = await deployAtsInfrastructureFixture();
    factory = base.factory;
    blrAddress = base.deployment.infrastructure.blr.proxy;
    deployer = base.deployer;
    unknownSigner = base.unknownSigner;
  };

  // TEST-ONLY: shape used by `expectFacetStates` — operational status of the
  // InitializeMock configId at version 1, plus one entry per facet. Each entry
  // carries the BLR `version` to query for `getFacetVersionStatus` and the
  // expected `versionStatus` / `lastVersion` readings at that version.
  type ExpectedFacetState = { version: number; versionStatus: number; lastVersion: number };
  type ExpectedFacetStates = {
    configVersion: number;
    operationalStatus: number;
    initializer: ExpectedFacetState;
    diamondFacet: ExpectedFacetState;
    mockFacet1: ExpectedFacetState;
    mockFacet2: ExpectedFacetState;
    mockFacet3: ExpectedFacetState;
  };

  // TEST-ONLY helper: asserts the configId's `getOperationalStatus` and each
  // facet's `getFacetVersionStatus` (queried at the per-facet `version` passed
  // in `expected`) plus `getFacetLastVersion` readings match the given expected
  // values. Resolves the bytes32 facet IDs from the registries used at
  // deployment time so the assertions stay aligned with on-chain state. Reads
  // `initializerFacet` from the enclosing scope — only call after a successful
  // `deployMockAsset(...)`.
  const expectFacetStates = async (expected: ExpectedFacetStates) => {
    expect(await initializerFacet.getOperationalStatus(INITIALIZE_MOCK_CONFIG_ID, expected.configVersion)).to.equal(
      expected.operationalStatus,
    );

    expect(await initializerFacet.getFacetVersionStatus(initializerFacetId, expected.initializer.version)).to.equal(
      expected.initializer.versionStatus,
    );
    expect(await initializerFacet.getFacetVersionStatus(diamondFacetId, expected.diamondFacet.version)).to.equal(
      expected.diamondFacet.versionStatus,
    );
    expect(await initializerFacet.getFacetVersionStatus(mockFacet1Id, expected.mockFacet1.version)).to.equal(
      expected.mockFacet1.versionStatus,
    );
    expect(await initializerFacet.getFacetVersionStatus(mockFacet2Id, expected.mockFacet2.version)).to.equal(
      expected.mockFacet2.versionStatus,
    );
    expect(await initializerFacet.getFacetVersionStatus(mockFacet3Id, expected.mockFacet3.version)).to.equal(
      expected.mockFacet3.versionStatus,
    );

    expect(await initializerFacet.getFacetLastVersion(initializerFacetId)).to.equal(expected.initializer.lastVersion);
    expect(await initializerFacet.getFacetLastVersion(diamondFacetId)).to.equal(expected.diamondFacet.lastVersion);
    expect(await initializerFacet.getFacetLastVersion(mockFacet1Id)).to.equal(expected.mockFacet1.lastVersion);
    expect(await initializerFacet.getFacetLastVersion(mockFacet2Id)).to.equal(expected.mockFacet2.lastVersion);
    expect(await initializerFacet.getFacetLastVersion(mockFacet3Id)).to.equal(expected.mockFacet3.lastVersion);
  };

  // TEST-ONLY helper: deploy a fresh ResolverProxy at the InitializeMock configId
  // at the given version, then connect the four facet handles to its address.
  // Each test gets its own proxy so initializer state never leaks between them.
  const deployMockAsset = async (version: number) => {
    const rbacs = [{ role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [deployer.address] }];
    const tx = await factory.deployProxy(
      blrAddress,
      { configurationId: INITIALIZE_MOCK_CONFIG_ID, configurationVersion: version, replacementEnabled: false },
      rbacs,
      "0x",
    );
    const receipt = await tx.wait();
    const proxyAddress = (await decodeEvent(factory, "ProxyDeployed", receipt!)).proxyAddress as string;

    mockFacet1 = MockFacet1__factory.connect(proxyAddress, deployer);
    mockFacet2 = MockFacet2__factory.connect(proxyAddress, deployer);
    mockFacet3 = MockFacet3__factory.connect(proxyAddress, deployer);
    diamondFacet = DiamondFacet__factory.connect(proxyAddress, deployer);
    initializerFacet = InitializerFacet__factory.connect(proxyAddress, deployer);
  };

  beforeEach(async () => {
    await loadFixture(setupEnvironment);
  });

  describe("Mock asset at version 1", () => {
    beforeEach(async () => {
      await deployMockAsset(1);
    });

    describe("initializeInitializer", () => {
      it("GIVEN an asset WHEN non admin initializes THEN reverts with AccountHasNoRole", async () => {
        await expect(initializerFacet.connect(unknownSigner).initializeInitializer(1)).to.be.revertedWithCustomError(
          initializerFacet,
          "AccountHasNoRole",
        );
      });

      it("GIVEN an admin WHEN initializeInitializer is called with zero THEN reverts with ZeroValueNotAllowed", async () => {
        await expect(initializerFacet.initializeInitializer(0)).to.be.revertedWithCustomError(
          initializerFacet,
          "ZeroValueNotAllowed",
        );
      });

      it("GIVEN an asset whose initializer has been initialized WHEN initialized again THEN reverts with FacetAlreadyRegistered", async () => {
        await expect(initializerFacet.initializeInitializer(1)).to.not.be.reverted;

        await expect(initializerFacet.initializeInitializer(1)).to.be.revertedWithCustomError(
          initializerFacet,
          "FacetAlreadyRegistered",
        );
      });
    });

    describe("updateMaxInitializerFacetIndex", () => {
      it("GIVEN a freshly-deployed asset WHEN non admin updateMaxInitializerFacetIndex THEN reverts with AccountHasNoRole", async () => {
        await expect(
          initializerFacet.connect(unknownSigner).updateMaxInitializerFacetIndex(5),
        ).to.be.revertedWithCustomError(initializerFacet, "AccountHasNoRole");
      });

      it("GIVEN an admin WHEN updateMaxInitializerFacetIndex is called with zero THEN reverts with ZeroValueNotAllowed", async () => {
        await expect(initializerFacet.updateMaxInitializerFacetIndex(0)).to.be.revertedWithCustomError(
          initializerFacet,
          "ZeroValueNotAllowed",
        );
      });

      it("GIVEN a freshly-deployed asset WHEN admin updateMaxInitializerFacetIndex THEN succeeds", async () => {
        const maxInitializerFacetIndex = 3;

        expect(await initializerFacet.getMaxInitializerFacetIndex()).to.equal(0);

        await expect(initializerFacet.updateMaxInitializerFacetIndex(maxInitializerFacetIndex))
          .to.emit(initializerFacet, "MaxInitializerFacetIndexUpdated")
          .withArgs(await deployer.getAddress(), maxInitializerFacetIndex);
      });
    });

    describe("setOperationalStatus", () => {
      it("GIVEN a freshly-deployed asset WHEN non admin calls setOperationalStatus THEN reverts with AccountHasNoRole", async () => {
        await expect(initializerFacet.connect(unknownSigner).setOperationalStatus()).to.be.revertedWithCustomError(
          initializerFacet,
          "AccountHasNoRole",
        );
      });
    });

    it("GIVEN a freshly-deployed asset WHEN calling mockFacet1Method THEN reverts with AssetNotOperational AND every facet + operational status reads as 0", async () => {
      await expect(mockFacet1.mockFacet1Method()).to.be.revertedWithCustomError(
        initializerFacet,
        "AssetNotOperational",
      );

      await expectFacetStates({
        configVersion: 1,
        operationalStatus: 0,
        initializer: { version: 1, versionStatus: 0, lastVersion: 0 },
        diamondFacet: { version: 1, versionStatus: 0, lastVersion: 0 },
        mockFacet1: { version: 1, versionStatus: 0, lastVersion: 0 },
        mockFacet2: { version: 2, versionStatus: 0, lastVersion: 0 },
        mockFacet3: { version: 1, versionStatus: 0, lastVersion: 0 },
      });
    });

    it("GIVEN a freshly-deployed asset WHEN calling upgrade methods THEN reverts with FacetPreviousVersionNotAccepted AND every facet + operational status reads as 0", async () => {
      await expect(mockFacet1.upgradeMockFacet1())
        .to.be.revertedWithCustomError(initializerFacet, "FacetPreviousVersionNotAccepted")
        .withArgs(mockFacet1Id, 0, [1, 2]);
    });

    it("GIVEN initializeMockFacet1 called once THEN succeeds, WHEN called a second time THEN reverts with FacetAlreadyRegistered, AND mockFacet1Method still reverts with AssetNotOperational AND getOperationalStatus returns 0", async () => {
      await expect(mockFacet1.initializeMockFacet1()).to.not.be.reverted;

      await expect(mockFacet1.initializeMockFacet1()).to.be.revertedWithCustomError(
        initializerFacet,
        "FacetAlreadyRegistered",
      );

      await expect(mockFacet1.mockFacet1Method()).to.be.revertedWithCustomError(
        initializerFacet,
        "AssetNotOperational",
      );

      await expectFacetStates({
        configVersion: 1,
        operationalStatus: 0,
        initializer: { version: 1, versionStatus: 0, lastVersion: 0 },
        diamondFacet: { version: 1, versionStatus: 0, lastVersion: 0 },
        mockFacet1: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet2: { version: 2, versionStatus: 0, lastVersion: 0 },
        mockFacet3: { version: 1, versionStatus: 0, lastVersion: 0 },
      });
    });

    it("GIVEN initializeMockFacet3 WHEN called multiple times with different status steps THEN succeeds", async () => {
      await expect(mockFacet3.initializeMockFacet3(1)).to.not.be.reverted;

      await expectFacetStates({
        configVersion: 1,
        operationalStatus: 0,
        initializer: { version: 1, versionStatus: 0, lastVersion: 0 },
        diamondFacet: { version: 1, versionStatus: 0, lastVersion: 0 },
        mockFacet1: { version: 1, versionStatus: 0, lastVersion: 0 },
        mockFacet2: { version: 2, versionStatus: 0, lastVersion: 0 },
        mockFacet3: { version: 1, versionStatus: 2, lastVersion: 0 },
      });

      await expect(mockFacet3.initializeMockFacet3(50)).to.not.be.reverted;

      await expectFacetStates({
        configVersion: 1,
        operationalStatus: 0,
        initializer: { version: 1, versionStatus: 0, lastVersion: 0 },
        diamondFacet: { version: 1, versionStatus: 0, lastVersion: 0 },
        mockFacet1: { version: 1, versionStatus: 0, lastVersion: 0 },
        mockFacet2: { version: 2, versionStatus: 0, lastVersion: 0 },
        mockFacet3: { version: 1, versionStatus: 51, lastVersion: 0 },
      });

      await expect(mockFacet3.initializeMockFacet3(0)).to.not.be.reverted;

      await expectFacetStates({
        configVersion: 1,
        operationalStatus: 0,
        initializer: { version: 1, versionStatus: 0, lastVersion: 0 },
        diamondFacet: { version: 1, versionStatus: 0, lastVersion: 0 },
        mockFacet1: { version: 1, versionStatus: 0, lastVersion: 0 },
        mockFacet2: { version: 2, versionStatus: 0, lastVersion: 0 },
        mockFacet3: { version: 1, versionStatus: 1, lastVersion: 1 },
      });
    });

    it("GIVEN all initializers called once successfully WHEN calling mockFacet1Method THEN reverts with AssetNotOperational AND getOperationalStatus returns 0", async () => {
      // TEST-ONLY: max-initializer index is an arbitrary positive number for this scenario.
      const maxInitializerFacetIndex = 3;

      await expect(mockFacet1.initializeMockFacet1()).to.not.be.reverted;
      await expect(mockFacet2.initializeMockFacet2()).to.not.be.reverted;
      await expect(mockFacet3.initializeMockFacet3(0)).to.not.be.reverted;
      await expect(diamondFacet.initializeDiamondCut()).to.not.be.reverted;
      await expect(initializerFacet.initializeInitializer(maxInitializerFacetIndex)).to.not.be.reverted;

      await expect(mockFacet1.mockFacet1Method()).to.be.revertedWithCustomError(
        initializerFacet,
        "AssetNotOperational",
      );

      await expectFacetStates({
        configVersion: 1,
        operationalStatus: 0,
        initializer: { version: 1, versionStatus: 1, lastVersion: 1 },
        diamondFacet: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet1: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet2: { version: 2, versionStatus: 1, lastVersion: 2 },
        mockFacet3: { version: 1, versionStatus: 1, lastVersion: 1 },
      });
    });

    it("GIVEN all initializers called once successfully AND setOperationalStatus called once WHEN calling mockFacet1Method THEN reverts with AssetNotOperational AND getOperationalStatus returns 4", async () => {
      // TEST-ONLY: same max-initializer index as the previous test for consistency.
      const maxInitializerFacetIndex = 3;

      await expect(mockFacet1.initializeMockFacet1()).to.not.be.reverted;
      await expect(mockFacet2.initializeMockFacet2()).to.not.be.reverted;
      await expect(mockFacet3.initializeMockFacet3(0)).to.not.be.reverted;
      await expect(diamondFacet.initializeDiamondCut()).to.not.be.reverted;
      await expect(initializerFacet.initializeInitializer(maxInitializerFacetIndex)).to.not.be.reverted;

      await expect(initializerFacet.setOperationalStatus())
        .to.emit(initializerFacet, "OperationalStatusPartialSet")
        .withArgs(await deployer.getAddress(), INITIALIZE_MOCK_CONFIG_ID, 1, 3);

      expect(await initializerFacet.getMaxInitializerFacetIndex()).to.equal(maxInitializerFacetIndex);

      await expect(mockFacet1.mockFacet1Method()).to.be.revertedWithCustomError(
        initializerFacet,
        "AssetNotOperational",
      );

      await expectFacetStates({
        configVersion: 1,
        operationalStatus: 4,
        initializer: { version: 1, versionStatus: 1, lastVersion: 1 },
        diamondFacet: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet1: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet2: { version: 2, versionStatus: 1, lastVersion: 2 },
        mockFacet3: { version: 1, versionStatus: 1, lastVersion: 1 },
      });
    });

    it("GIVEN all initializers called once successfully AND setOperationalStatus called twice WHEN calling mockFacet1Method THEN succeeds", async () => {
      // TEST-ONLY: same max-initializer index as the previous test for consistency.
      const maxInitializerFacetIndex = 4;

      await expect(mockFacet1.initializeMockFacet1()).to.not.be.reverted;
      await expect(mockFacet2.initializeMockFacet2()).to.not.be.reverted;
      await expect(mockFacet3.initializeMockFacet3(0)).to.not.be.reverted;
      await expect(diamondFacet.initializeDiamondCut()).to.not.be.reverted;
      await expect(initializerFacet.initializeInitializer(maxInitializerFacetIndex)).to.not.be.reverted;

      await expect(initializerFacet.setOperationalStatus())
        .to.emit(initializerFacet, "OperationalStatusPartialSet")
        .withArgs(await deployer.getAddress(), INITIALIZE_MOCK_CONFIG_ID, 1, 4);
      await expect(initializerFacet.setOperationalStatus())
        .to.emit(initializerFacet, "OperationalStatusSet")
        .withArgs(await deployer.getAddress(), INITIALIZE_MOCK_CONFIG_ID, 1);

      const response = await mockFacet1.mockFacet1Method();
      expect(response).to.equal("MockFacet1 method called");

      await expectFacetStates({
        configVersion: 1,
        operationalStatus: 1,
        initializer: { version: 1, versionStatus: 1, lastVersion: 1 },
        diamondFacet: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet1: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet2: { version: 2, versionStatus: 1, lastVersion: 2 },
        mockFacet3: { version: 1, versionStatus: 1, lastVersion: 1 },
      });
    });

    it("GIVEN all initializers called once successfully when maxInitializerFacetIndex > 4 AND setOperationalStatus called once WHEN calling mockFacet1Method THEN succeeds", async () => {
      // TEST-ONLY: same max-initializer index as the previous test for consistency.
      const maxInitializerFacetIndex = 30;

      await expect(mockFacet1.initializeMockFacet1()).to.not.be.reverted;
      await expect(mockFacet2.initializeMockFacet2()).to.not.be.reverted;
      await expect(mockFacet3.initializeMockFacet3(0)).to.not.be.reverted;
      await expect(diamondFacet.initializeDiamondCut()).to.not.be.reverted;
      await expect(initializerFacet.initializeInitializer(maxInitializerFacetIndex)).to.not.be.reverted;

      await expect(initializerFacet.setOperationalStatus()).to.not.be.reverted;

      const response = await mockFacet1.mockFacet1Method();
      expect(response).to.equal("MockFacet1 method called");

      await expectFacetStates({
        configVersion: 1,
        operationalStatus: 1,
        initializer: { version: 1, versionStatus: 1, lastVersion: 1 },
        diamondFacet: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet1: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet2: { version: 2, versionStatus: 1, lastVersion: 2 },
        mockFacet3: { version: 1, versionStatus: 1, lastVersion: 1 },
      });
    });

    it("GIVEN a freshly-deployed asset WHEN calling mockFacet1NotReadyMethod THEN succeeds", async () => {
      await expect(mockFacet1.mockFacet1NotReadyMethod()).to.not.be.reverted;
    });

    it("GIVEN initializeMockFacet1 already called WHEN calling mockFacet1NotReadyMethod THEN reverts with FacetReady", async () => {
      await expect(mockFacet1.initializeMockFacet1()).to.not.be.reverted;

      await expect(mockFacet1.mockFacet1NotReadyMethod()).to.be.revertedWithCustomError(initializerFacet, "FacetReady");
    });

    it("GIVEN fully operational asset WHEN calling setOperationalStatus again THEN returns (true, 0) and emits OperationalStatusSet", async () => {
      const maxInitializerFacetIndex = 30;

      await expect(mockFacet1.initializeMockFacet1()).to.not.be.reverted;
      await expect(mockFacet2.initializeMockFacet2()).to.not.be.reverted;
      await expect(mockFacet3.initializeMockFacet3(0)).to.not.be.reverted;
      await expect(diamondFacet.initializeDiamondCut()).to.not.be.reverted;
      await expect(initializerFacet.initializeInitializer(maxInitializerFacetIndex)).to.not.be.reverted;
      await expect(initializerFacet.setOperationalStatus())
        .to.emit(initializerFacet, "OperationalStatusSet")
        .withArgs(await deployer.getAddress(), INITIALIZE_MOCK_CONFIG_ID, 1);

      // Second call on an already-operational config triggers the early-return path.
      await expect(initializerFacet.setOperationalStatus())
        .to.emit(initializerFacet, "OperationalStatusSet")
        .withArgs(await deployer.getAddress(), INITIALIZE_MOCK_CONFIG_ID, 1);

      const [isOperational, lastFacetIndex] = await initializerFacet.setOperationalStatus.staticCall();
      expect(isOperational).to.be.true;
      expect(lastFacetIndex).to.equal(0);
    });

    it("GIVEN only initializer and diamondFacet initialized WHEN setOperationalStatus called with large batch THEN breaks at first unready facet", async () => {
      // TEST-ONLY: batch large enough to cover all 5 facets in one pass.
      const maxInitializerFacetIndex = 10;

      await expect(diamondFacet.initializeDiamondCut()).to.not.be.reverted;
      await expect(initializerFacet.initializeInitializer(maxInitializerFacetIndex)).to.not.be.reverted;

      // MockFacet1/2/3 are NOT initialised — setOperationalStatus must break at the
      // first unready facet (mockFacet1, index 2) and report lastFacetIndex_ = 2.
      await expect(initializerFacet.setOperationalStatus())
        .to.emit(initializerFacet, "OperationalStatusPartialSet")
        .withArgs(await deployer.getAddress(), INITIALIZE_MOCK_CONFIG_ID, 1, 2);
    });

    it.only("BUG: GIVEN initializeInitializer never called (maxInitializerFacetIndex=0) WHEN setOperationalStatus is called THEN configVersionStatus is set to 1 via encoding collision, bypassing onlyOperational", async () => {
      // ┌─────────────────────────────────────────────────────────────────────┐
      // │  ROOT CAUSE — encoding collision in InitializerStorageWrapper       │
      // │                                                                     │
      // │  configVersionStatus encoding:                                      │
      // │    0   → not started                                                │
      // │    1   → fully operational          ← sentinel                     │
      // │    >1  → resume facet index + 1     ← progress pointer             │
      // │                                                                     │
      // │  Normal flow (max > 0):                                             │
      // │    setOperationalStatus processes facets 0..max, hits an unready    │
      // │    facet at index N, stores N+1 (always ≥ 2 on partial progress).  │
      // │                                                                     │
      // │  Bug flow (max = 0, initializeInitializer never called):            │
      // │    lastFacetIndex_ = max(0) + nextFacetIndex(0) = 0                │
      // │    fetches empty slice → _checkFacetsReady returns (false, 0)      │
      // │    stores: isOperational_=false → lastFacetIndex_(0) + 1 = 1       │
      // │                              ↑                                      │
      // │                              collides with the "operational" value! │
      // │                                                                     │
      // │  Consequence: onlyOperational passes on the very next call, even   │
      // │  though zero facets have been initialized.                          │
      // └─────────────────────────────────────────────────────────────────────┘

      // Precondition: maxInitializerFacetIndex is 0 because initializeInitializer was never called.
      expect(await initializerFacet.getMaxInitializerFacetIndex()).to.equal(0);

      // The facet correctly emits PartialSet (isOperational_=false from _checkFacetsReady),
      // but the library has already written 1 to configVersionStatus — storage is corrupted.
      await expect(initializerFacet.setOperationalStatus())
        .to.emit(initializerFacet, "OperationalStatusPartialSet")
        .withArgs(await deployer.getAddress(), INITIALIZE_MOCK_CONFIG_ID, 1, 0);

      // BUG: status reads as 1 (fully operational) despite zero facets having been verified.
      expect(await initializerFacet.getOperationalStatus(INITIALIZE_MOCK_CONFIG_ID, 1)).to.equal(1);

      // BUG: onlyOperational now passes — business logic is accessible with no initialized facets.
      const response = await mockFacet1.mockFacet1Method();
      expect(response).to.equal("MockFacet1 method called");

      // Every facet is still uninitialized — none were examined by setOperationalStatus.
      await expectFacetStates({
        configVersion: 1,
        operationalStatus: 1, // BUG: should not be 1 — no facets were verified
        initializer: { version: 1, versionStatus: 0, lastVersion: 0 },
        mockDiamondCut: { version: 1, versionStatus: 0, lastVersion: 0 },
        mockFacet1: { version: 1, versionStatus: 0, lastVersion: 0 },
        mockFacet2: { version: 2, versionStatus: 0, lastVersion: 0 },
        mockFacet3: { version: 1, versionStatus: 0, lastVersion: 0 },
      });
    });
  });

  describe("Mock asset at version 2", () => {
    beforeEach(async () => {
      await deployMockAsset(1);
      await mockFacet1.initializeMockFacet1();
      await mockFacet2.initializeMockFacet2();
      await mockFacet3.initializeMockFacet3(0);
      await diamondFacet.initializeDiamondCut();
      await initializerFacet.initializeInitializer(100);
      await initializerFacet.setOperationalStatus();
    });

    it("GIVEN deployed mock asset version 1 WHEN upgrading to version 2 THEN all methods are disabledand initializer fail with FacetAlreadyRegistered", async () => {
      const response = await mockFacet2.mockFacet2Method();
      expect(response).to.equal("MockFacet2 method called");

      await diamondFacet.updateConfigVersion(2);

      await expect(mockFacet1.initializeMockFacet1())
        .to.be.revertedWithCustomError(initializerFacet, "FacetAlreadyRegistered")
        .withArgs(mockFacet1Id, 1);

      await expect(mockFacet2.mockFacet2Method()).to.be.revertedWithCustomError(
        initializerFacet,
        "AssetNotOperational",
      );

      await expectFacetStates({
        configVersion: 2,
        operationalStatus: 0,
        initializer: { version: 1, versionStatus: 1, lastVersion: 1 },
        diamondFacet: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet1: { version: 3, versionStatus: 0, lastVersion: 1 },
        mockFacet2: { version: 3, versionStatus: 0, lastVersion: 2 },
        mockFacet3: { version: 3, versionStatus: 0, lastVersion: 1 },
      });
    });

    it("GIVEN deployed mock asset upgrade to version 2 WHEN upgrading facets THEN succeeds", async () => {
      await diamondFacet.updateConfigVersion(2);

      await expect(mockFacet1.upgradeMockFacet1()).to.not.be.reverted;

      await expectFacetStates({
        configVersion: 2,
        operationalStatus: 0,
        initializer: { version: 1, versionStatus: 1, lastVersion: 1 },
        diamondFacet: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet1: { version: 3, versionStatus: 1, lastVersion: 3 },
        mockFacet2: { version: 3, versionStatus: 0, lastVersion: 2 },
        mockFacet3: { version: 3, versionStatus: 0, lastVersion: 1 },
      });
    });

    it("GIVEN deployed mock asset upgrade to version 2 WHEN upgrading facets with multi steps THEN succeeds", async () => {
      await diamondFacet.updateConfigVersion(2);

      await expect(mockFacet3.upgradeMockFacet3(40)).to.not.be.reverted;

      await expectFacetStates({
        configVersion: 2,
        operationalStatus: 0,
        initializer: { version: 1, versionStatus: 1, lastVersion: 1 },
        diamondFacet: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet1: { version: 3, versionStatus: 0, lastVersion: 1 },
        mockFacet2: { version: 3, versionStatus: 0, lastVersion: 2 },
        mockFacet3: { version: 3, versionStatus: 41, lastVersion: 1 },
      });

      await expect(mockFacet3.upgradeMockFacet3(0)).to.not.be.reverted;

      await expectFacetStates({
        configVersion: 2,
        operationalStatus: 0,
        initializer: { version: 1, versionStatus: 1, lastVersion: 1 },
        diamondFacet: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet1: { version: 3, versionStatus: 0, lastVersion: 1 },
        mockFacet2: { version: 3, versionStatus: 0, lastVersion: 2 },
        mockFacet3: { version: 3, versionStatus: 1, lastVersion: 3 },
      });
    });

    it("GIVEN deployed mock asset version 2 WHEN initializing it THEN succeeds", async () => {
      const maxInitializerFacetIndex = 30;

      await deployMockAsset(2);

      await expectFacetStates({
        configVersion: 1,
        operationalStatus: 0,
        initializer: { version: 1, versionStatus: 0, lastVersion: 0 },
        diamondFacet: { version: 1, versionStatus: 0, lastVersion: 0 },
        mockFacet1: { version: 1, versionStatus: 0, lastVersion: 0 },
        mockFacet2: { version: 2, versionStatus: 0, lastVersion: 0 },
        mockFacet3: { version: 1, versionStatus: 0, lastVersion: 0 },
      });

      await expectFacetStates({
        configVersion: 2,
        operationalStatus: 0,
        initializer: { version: 1, versionStatus: 0, lastVersion: 0 },
        diamondFacet: { version: 1, versionStatus: 0, lastVersion: 0 },
        mockFacet1: { version: 3, versionStatus: 0, lastVersion: 0 },
        mockFacet2: { version: 3, versionStatus: 0, lastVersion: 0 },
        mockFacet3: { version: 3, versionStatus: 0, lastVersion: 0 },
      });

      await expect(mockFacet1.initializeMockFacet1()).to.not.be.reverted;
      await expect(mockFacet2.initializeMockFacet2()).to.not.be.reverted;
      await expect(mockFacet3.initializeMockFacet3(0)).to.not.be.reverted;
      await expect(diamondFacet.initializeDiamondCut()).to.not.be.reverted;
      await expect(initializerFacet.initializeInitializer(maxInitializerFacetIndex)).to.not.be.reverted;

      await expect(initializerFacet.setOperationalStatus())
        .to.emit(initializerFacet, "OperationalStatusSet")
        .withArgs(await deployer.getAddress(), INITIALIZE_MOCK_CONFIG_ID, 2);

      await expectFacetStates({
        configVersion: 2,
        operationalStatus: 1,
        initializer: { version: 1, versionStatus: 1, lastVersion: 1 },
        diamondFacet: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet1: { version: 3, versionStatus: 1, lastVersion: 3 },
        mockFacet2: { version: 3, versionStatus: 1, lastVersion: 3 },
        mockFacet3: { version: 3, versionStatus: 1, lastVersion: 3 },
      });
    });

    it("GIVEN deployed mock asset upgrade to version 2 WHEN upgrading facets THEN succeeds", async () => {
      await diamondFacet.updateConfigVersion(2);

      await expect(mockFacet1.upgradeMockFacet1()).to.not.be.reverted;
      await expect(mockFacet2.upgradeMockFacet2()).to.not.be.reverted;
      await expect(mockFacet3.upgradeMockFacet3(0)).to.not.be.reverted;

      await expectFacetStates({
        configVersion: 2,
        operationalStatus: 0,
        initializer: { version: 1, versionStatus: 1, lastVersion: 1 },
        diamondFacet: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet1: { version: 3, versionStatus: 1, lastVersion: 3 },
        mockFacet2: { version: 3, versionStatus: 1, lastVersion: 3 },
        mockFacet3: { version: 3, versionStatus: 1, lastVersion: 3 },
      });

      await expect(initializerFacet.setOperationalStatus()).to.not.be.reverted;

      await expectFacetStates({
        configVersion: 2,
        operationalStatus: 1,
        initializer: { version: 1, versionStatus: 1, lastVersion: 1 },
        diamondFacet: { version: 1, versionStatus: 1, lastVersion: 1 },
        mockFacet1: { version: 3, versionStatus: 1, lastVersion: 3 },
        mockFacet2: { version: 3, versionStatus: 1, lastVersion: 3 },
        mockFacet3: { version: 3, versionStatus: 1, lastVersion: 3 },
      });

      const response = await mockFacet2.mockFacet2Method();
      expect(response).to.equal("MockFacet2 method called");
    });
  });

  describe("initializeDiamondCut", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeDiamondCut is called THEN AccountHasNoRole", async () => {
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(
        infra.blr.target as string,
        { configurationId: CONFIG_IDS.equity, configurationVersion: 1, replacementEnabled: false },
        [{ role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] }],
        "0x",
      );
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", (await proxyTx.wait())!);
      const diamond = IDiamondFacet__factory.connect(proxyAddress as string, infra.deployer);
      const asset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(diamond.connect(infra.unknownSigner).initializeDiamondCut()).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN already-initialised WHEN initializeDiamondCut is called again THEN FacetAlreadyRegistered", async () => {
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(
        infra.blr.target as string,
        { configurationId: CONFIG_IDS.equity, configurationVersion: 1, replacementEnabled: false },
        [{ role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] }],
        "0x",
      );
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", (await proxyTx.wait())!);
      const diamond = IDiamondFacet__factory.connect(proxyAddress as string, infra.deployer);
      const asset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await diamond.connect(infra.deployer).initializeDiamondCut();
      await expect(diamond.connect(infra.deployer).initializeDiamondCut()).to.be.revertedWithCustomError(
        asset,
        "FacetAlreadyRegistered",
      );
    });
  });

  describe("initializeDiamondCut event", () => {
    it("GIVEN a fresh deployment WHEN initializeDiamondCut is called THEN emits DiamondCutInitialized", async () => {
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(
        infra.blr.target as string,
        { configurationId: CONFIG_IDS.equity, configurationVersion: 1, replacementEnabled: false },
        [{ role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] }],
        "0x",
      );
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", (await proxyTx.wait())!);
      const diamond = IDiamondFacet__factory.connect(proxyAddress as string, infra.deployer);
      await expect(diamond.connect(infra.deployer).initializeDiamondCut()).to.emit(diamond, "DiamondCutInitialized");
    });
  });
});
