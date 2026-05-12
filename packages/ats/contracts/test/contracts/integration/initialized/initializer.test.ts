// SPDX-License-Identifier: Apache-2.0

// TEST-ONLY: integration tests for the InitializeMock domain. Loads the full
// ATS infrastructure fixture (which, with useTimeTravel=true, also deploys the
// 3 MockFacets and creates 4 versions of the InitializeMock configuration) and
// deploys a ResolverProxy against INITIALIZE_MOCK_CONFIG_ID to exercise the
// initializer-versioning flow on the four facets of that configuration.

import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  IFactory,
  InitializerFacet,
  InitializerFacet__factory,
  MockFacet1,
  MockFacet1__factory,
  MockFacet2,
  MockFacet2__factory,
  MockFacet3,
  MockFacet3__factory,
} from "@contract-types";
import { deployAtsInfrastructureFixture } from "@test";
import { INITIALIZE_MOCK_CONFIG_ID, ATS_ROLES } from "@scripts";
import { decodeEvent } from "@scripts/infrastructure";

describe("Initializer — InitializeMock domain", () => {
  // TEST-ONLY: mirrors `_INITIALIZER_RESOLVER_KEY` declared in
  // `contracts/constants/resolverKeys.sol`.
  const initializerFacetId = "0x65c891d003e7dc436f2c3d0863d599d91867c8695fee29923a476a2be3ec540f";
  // TEST-ONLY: mirrors the `_MOCK_FACET_N_RESOLVER_KEY = bytes32("MockFacetN")`
  // constants declared in `contracts/test/mocks/MockFacets.sol`.
  const mockFacet1Id = "0x4d6f636b46616365743100000000000000000000000000000000000000000000";
  const mockFacet2Id = "0x4d6f636b46616365743200000000000000000000000000000000000000000000";
  const mockFacet3Id = "0x4d6f636b46616365743300000000000000000000000000000000000000000000";

  let factory: IFactory;
  let blrAddress: string;
  let deployer: HardhatEthersSigner;

  // TEST-ONLY: facet handles bound to the freshly-deployed ResolverProxy.
  let mockFacet1: MockFacet1;
  let mockFacet2: MockFacet2;
  let mockFacet3: MockFacet3;
  let initializerFacet: InitializerFacet;

  const setupEnvironment = async () => {
    const base = await deployAtsInfrastructureFixture();
    factory = base.factory;
    blrAddress = base.deployment.infrastructure.blr.proxy;
    deployer = base.deployer;
  };

  // TEST-ONLY: shape used by `expectFacetStates` — operational status of the
  // InitializeMock configId at version 1, plus one entry per facet expressing
  // the expected `getFacetVersionStatus` and `getFacetLastVersion` readings.
  type ExpectedFacetState = { versionStatus: number; lastVersion: number };
  type ExpectedFacetStates = {
    operationalStatus: number;
    initializer: ExpectedFacetState;
    mockFacet1: ExpectedFacetState;
    mockFacet2: ExpectedFacetState;
    mockFacet3: ExpectedFacetState;
  };

  // TEST-ONLY helper: asserts the configId's `getOperationalStatus` and each
  // facet's `getFacetVersionStatus` (always queried at version 1) plus
  // `getFacetLastVersion` readings match the given expected values. Resolves
  // the bytes32 facet IDs from the registries used at deployment time so the
  // assertions stay aligned with on-chain state. Reads `initializerFacet` from
  // the enclosing scope — only call after a successful `deployMockAsset(...)`.
  const expectFacetStates = async (expected: ExpectedFacetStates) => {
    expect(await initializerFacet.getOperationalStatus(INITIALIZE_MOCK_CONFIG_ID, 1)).to.equal(
      expected.operationalStatus,
    );

    expect(await initializerFacet.getFacetVersionStatus(initializerFacetId, 1)).to.equal(
      expected.initializer.versionStatus,
    );
    expect(await initializerFacet.getFacetVersionStatus(mockFacet1Id, 1)).to.equal(expected.mockFacet1.versionStatus);
    expect(await initializerFacet.getFacetVersionStatus(mockFacet2Id, 1)).to.equal(expected.mockFacet2.versionStatus);
    expect(await initializerFacet.getFacetVersionStatus(mockFacet3Id, 1)).to.equal(expected.mockFacet3.versionStatus);

    expect(await initializerFacet.getFacetLastVersion(initializerFacetId)).to.equal(expected.initializer.lastVersion);
    expect(await initializerFacet.getFacetLastVersion(mockFacet1Id)).to.equal(expected.mockFacet1.lastVersion);
    expect(await initializerFacet.getFacetLastVersion(mockFacet2Id)).to.equal(expected.mockFacet2.lastVersion);
    expect(await initializerFacet.getFacetLastVersion(mockFacet3Id)).to.equal(expected.mockFacet3.lastVersion);
  };

  // TEST-ONLY helper: deploy a fresh ResolverProxy at the InitializeMock configId
  // at the given version, then connect the four facet handles to its address.
  // Each test gets its own proxy so initializer state never leaks between them.
  const deployMockAsset = async (version: number) => {
    const rbacs = [{ role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [deployer.address] }];
    const tx = await factory.deployProxy(blrAddress, INITIALIZE_MOCK_CONFIG_ID, version, rbacs);
    const receipt = await tx.wait();
    const proxyAddress = (await decodeEvent(factory, "ProxyDeployed", receipt!)).proxyAddress as string;

    mockFacet1 = MockFacet1__factory.connect(proxyAddress, deployer);
    mockFacet2 = MockFacet2__factory.connect(proxyAddress, deployer);
    mockFacet3 = MockFacet3__factory.connect(proxyAddress, deployer);
    initializerFacet = InitializerFacet__factory.connect(proxyAddress, deployer);
  };

  beforeEach(async () => {
    await loadFixture(setupEnvironment);
  });

  describe("Mock asset at version 1", () => {
    beforeEach(async () => {
      await deployMockAsset(1);
    });

    it("GIVEN a freshly-deployed asset WHEN calling mockFacet1Method THEN reverts with AssetNotOperational AND every facet + operational status reads as 0", async () => {
      await expect(mockFacet1.mockFacet1Method()).to.be.revertedWithCustomError(
        initializerFacet,
        "AssetNotOperational",
      );

      await expectFacetStates({
        operationalStatus: 0,
        initializer: { versionStatus: 0, lastVersion: 0 },
        mockFacet1: { versionStatus: 0, lastVersion: 0 },
        mockFacet2: { versionStatus: 0, lastVersion: 0 },
        mockFacet3: { versionStatus: 0, lastVersion: 0 },
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
        operationalStatus: 0,
        initializer: { versionStatus: 0, lastVersion: 0 },
        mockFacet1: { versionStatus: 1, lastVersion: 1 },
        mockFacet2: { versionStatus: 0, lastVersion: 0 },
        mockFacet3: { versionStatus: 0, lastVersion: 0 },
      });
    });

    it("GIVEN initializeMockFacet3 WHEN called multiple times with different status steps THEN succeeds", async () => {
      await expect(mockFacet3.initializeMockFacet3(1)).to.not.be.reverted;

      await expectFacetStates({
        operationalStatus: 0,
        initializer: { versionStatus: 0, lastVersion: 0 },
        mockFacet1: { versionStatus: 0, lastVersion: 0 },
        mockFacet2: { versionStatus: 0, lastVersion: 0 },
        mockFacet3: { versionStatus: 2, lastVersion: 0 },
      });

      await expect(mockFacet3.initializeMockFacet3(50)).to.not.be.reverted;

      await expectFacetStates({
        operationalStatus: 0,
        initializer: { versionStatus: 0, lastVersion: 0 },
        mockFacet1: { versionStatus: 0, lastVersion: 0 },
        mockFacet2: { versionStatus: 0, lastVersion: 0 },
        mockFacet3: { versionStatus: 51, lastVersion: 0 },
      });

      await expect(mockFacet3.initializeMockFacet3(0)).to.not.be.reverted;

      await expectFacetStates({
        operationalStatus: 0,
        initializer: { versionStatus: 0, lastVersion: 0 },
        mockFacet1: { versionStatus: 0, lastVersion: 0 },
        mockFacet2: { versionStatus: 0, lastVersion: 0 },
        mockFacet3: { versionStatus: 1, lastVersion: 1 },
      });
    });

    it("GIVEN all four initializers called once successfully WHEN calling mockFacet1Method THEN reverts with AssetNotOperational AND getOperationalStatus returns 0", async () => {
      // TEST-ONLY: max-initializer index is an arbitrary positive number for this scenario.
      const maxInitializerFacetIndex = 3;

      await expect(mockFacet1.initializeMockFacet1()).to.not.be.reverted;
      await expect(mockFacet2.initializeMockFacet2()).to.not.be.reverted;
      await expect(mockFacet3.initializeMockFacet3(0)).to.not.be.reverted;
      await expect(initializerFacet.initializeInitializer(maxInitializerFacetIndex)).to.not.be.reverted;

      await expect(mockFacet1.mockFacet1Method()).to.be.revertedWithCustomError(
        initializerFacet,
        "AssetNotOperational",
      );

      await expectFacetStates({
        operationalStatus: 0,
        initializer: { versionStatus: 1, lastVersion: 1 },
        mockFacet1: { versionStatus: 1, lastVersion: 1 },
        mockFacet2: { versionStatus: 1, lastVersion: 1 },
        mockFacet3: { versionStatus: 1, lastVersion: 1 },
      });
    });

    it("GIVEN all four initializers called once successfully AND setOperationalStatus called once WHEN calling mockFacet1Method THEN reverts with AssetNotOperational AND getOperationalStatus returns 4", async () => {
      // TEST-ONLY: same max-initializer index as the previous test for consistency.
      const maxInitializerFacetIndex = 3;

      await expect(mockFacet1.initializeMockFacet1()).to.not.be.reverted;
      await expect(mockFacet2.initializeMockFacet2()).to.not.be.reverted;
      await expect(mockFacet3.initializeMockFacet3(0)).to.not.be.reverted;
      await expect(initializerFacet.initializeInitializer(maxInitializerFacetIndex)).to.not.be.reverted;

      await expect(initializerFacet.setOperationalStatus()).to.not.be.reverted;

      expect(await initializerFacet.getMaxInitializerFacetIndex()).to.equal(maxInitializerFacetIndex);

      await expect(mockFacet1.mockFacet1Method()).to.be.revertedWithCustomError(
        initializerFacet,
        "AssetNotOperational",
      );

      await expectFacetStates({
        operationalStatus: 4,
        initializer: { versionStatus: 1, lastVersion: 1 },
        mockFacet1: { versionStatus: 1, lastVersion: 1 },
        mockFacet2: { versionStatus: 1, lastVersion: 1 },
        mockFacet3: { versionStatus: 1, lastVersion: 1 },
      });
    });

    it("GIVEN all four initializers called once successfully AND setOperationalStatus called twice WHEN calling mockFacet1Method THEN succeeds", async () => {
      // TEST-ONLY: same max-initializer index as the previous test for consistency.
      const maxInitializerFacetIndex = 3;

      await expect(mockFacet1.initializeMockFacet1()).to.not.be.reverted;
      await expect(mockFacet2.initializeMockFacet2()).to.not.be.reverted;
      await expect(mockFacet3.initializeMockFacet3(0)).to.not.be.reverted;
      await expect(initializerFacet.initializeInitializer(maxInitializerFacetIndex)).to.not.be.reverted;

      await expect(initializerFacet.setOperationalStatus()).to.not.be.reverted;
      await expect(initializerFacet.setOperationalStatus()).to.not.be.reverted;

      let response = await mockFacet1.mockFacet1Method();
      expect(response).to.equal("MockFacet1 method called");

      await expectFacetStates({
        operationalStatus: 1,
        initializer: { versionStatus: 1, lastVersion: 1 },
        mockFacet1: { versionStatus: 1, lastVersion: 1 },
        mockFacet2: { versionStatus: 1, lastVersion: 1 },
        mockFacet3: { versionStatus: 1, lastVersion: 1 },
      });
    });
  });
});
