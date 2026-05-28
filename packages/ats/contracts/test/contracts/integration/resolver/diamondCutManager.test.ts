// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  AccessControl,
  Pause,
  BusinessLogicResolver,
  DiamondCutManager,
  IDiamondCutManager,
  IDiamondLoupe,
  DiamondCutManager__factory,
  AccessControlFacet__factory,
  Pause__factory,
} from "@contract-types";
import {
  ATS_ROLES,
  BOND_CONFIG_ID,
  BOND_FIXED_RATE_CONFIG_ID,
  BOND_KPI_LINKED_RATE_CONFIG_ID,
  EQUITY_CONFIG_ID,
  FACTORY_CONFIG_ID,
  LOAN_CONFIG_ID,
  LOANS_PORTFOLIO_CONFIG_ID,
  INITIALIZE_MOCK_CONFIG_ID,
} from "@scripts";
import { deployAtsInfrastructureFixture, registerTransferFacetFixture } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { deployContract, registerFacets } from "@scripts/infrastructure";

// Test-specific configuration IDs for negative test cases
// These are separate from EQUITY_CONFIG_ID/BOND_CONFIG_ID to avoid conflicts
const TEST_CONFIG_IDS = {
  PAUSE_TEST: "0x0000000000000000000000000000000000000000000000000000000000000004",
  PAUSE_BATCH_TEST: "0x0000000000000000000000000000000000000000000000000000000000000005",
  BLACKLIST_TEST: "0x0000000000000000000000000000000000000000000000000000000000000006",
};

describe("DiamondCutManager", () => {
  function createFacetConfigurations(ids: string[], versions: number[]): IDiamondCutManager.FacetConfigurationStruct[] {
    return ids.map((id, index) => ({
      id,
      version: versions[index],
    }));
  }

  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;

  let businessLogicResolver: BusinessLogicResolver;
  let diamondCutManager: DiamondCutManager;
  let accessControl: AccessControl;
  let pause: Pause;
  let equityFacetIdList: string[] = [];
  let bondFacetIdList: string[] = [];
  let bondFixedRateFacetIdList: string[] = [];
  let bondKpiLinkedRateFacetIdList: string[] = [];
  let loanFacetIdList: string[] = [];
  let loansPortfolioFacetIdList: string[] = [];
  let factoryFacetIdList: string[] = [];
  let equityFacetVersionList: number[] = [];
  let configToFacetIdsMap: Record<string, string[]>;

  async function atsInfrastructureFixture() {
    return await deployAtsInfrastructureFixture();
  }

  beforeEach(async () => {
    const infrastructure = await loadFixture(atsInfrastructureFixture);

    businessLogicResolver = infrastructure.blr;

    signer_A = infrastructure.deployer;
    signer_B = infrastructure.user2;

    // Use TypeChain factories instead of ethers.getContractAt for proper ABI resolution
    accessControl = AccessControlFacet__factory.connect(businessLogicResolver.target.toString(), signer_A);
    await accessControl.grantRole(ATS_ROLES.ROLE_PAUSER, signer_B.address);

    pause = Pause__factory.connect(businessLogicResolver.target.toString(), signer_A);

    diamondCutManager = DiamondCutManager__factory.connect(businessLogicResolver.target.toString(), signer_A);
    equityFacetIdList = Object.values(infrastructure.equityFacetKeys);
    bondFacetIdList = Object.values(infrastructure.bondFacetKeys);
    bondFixedRateFacetIdList = Object.values(infrastructure.bondFixedRateFacetKeys);
    bondKpiLinkedRateFacetIdList = Object.values(infrastructure.bondKpiLinkedRateFacetKeys);
    loanFacetIdList = Object.values(infrastructure.loanFacetKeys);
    loansPortfolioFacetIdList = Object.values(infrastructure.loansPortfolioFacetKeys);
    factoryFacetIdList = Object.values(infrastructure.factoryFacetKeys);
    equityFacetVersionList = Array(equityFacetIdList.length).fill(1);

    configToFacetIdsMap = {
      [EQUITY_CONFIG_ID]: equityFacetIdList,
      [BOND_CONFIG_ID]: bondFacetIdList,
      [BOND_FIXED_RATE_CONFIG_ID]: bondFixedRateFacetIdList,
      [BOND_KPI_LINKED_RATE_CONFIG_ID]: bondKpiLinkedRateFacetIdList,
      [LOAN_CONFIG_ID]: loanFacetIdList,
      [LOANS_PORTFOLIO_CONFIG_ID]: loansPortfolioFacetIdList,
      [FACTORY_CONFIG_ID]: factoryFacetIdList,
    };
  });

  afterEach(async () => {
    const isPaused = await pause.paused();
    if (isPaused) {
      await pause.connect(signer_B).unpause();
    }
    const pauseSelector = "0x8456cb59";
    const configIdsToCleanup = [
      EQUITY_CONFIG_ID,
      TEST_CONFIG_IDS.PAUSE_TEST,
      TEST_CONFIG_IDS.PAUSE_BATCH_TEST,
      TEST_CONFIG_IDS.BLACKLIST_TEST,
    ];

    for (const configId of configIdsToCleanup) {
      try {
        await businessLogicResolver.removeSelectorsFromBlacklist(configId, [pauseSelector]);
      } catch (_error) {
        // Ignore errors if selector wasn't blacklisted - contract may be in different state
      }
    }
  });

  async function validateConfiguration(configId: string) {
    for (let configVersion = 1; configVersion <= 1; configVersion++) {
      await validateFacets(configId, configVersion);
    }
  }

  async function validateFacets(configId: string, configVersion: number) {
    const facetsLength = Number(
      await diamondCutManager.getFacetsLengthByConfigurationIdAndVersion(configId, configVersion),
    );

    const facets = await diamondCutManager.getFacetsByConfigurationIdAndVersion(
      configId,
      configVersion,
      0,
      facetsLength,
    );

    const facetIds: string[] = [];
    const facetAddresses: string[] = [];

    for (const facet of facets) {
      facetIds.push(facet.id);
      facetAddresses.push(facet.addr);
      await validateFacetDetails(configId, configVersion, facet);
    }

    await validateFacetIdsAndAddresses(configId, configVersion, facetsLength, facetIds, facetAddresses);
  }

  async function validateFacetDetails(configId: string, configVersion: number, facet: IDiamondLoupe.FacetStructOutput) {
    const selectorsLength = Number(
      await diamondCutManager.getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
        configId,
        configVersion,
        facet.id,
      ),
    );

    const selectors = await diamondCutManager.getFacetSelectorsByConfigurationIdVersionAndFacetId(
      configId,
      configVersion,
      facet.id,
      0,
      selectorsLength,
    );

    const address = await diamondCutManager.getFacetAddressByConfigurationIdVersionAndFacetId(
      configId,
      configVersion,
      facet.id,
    );

    const facet_2 = await diamondCutManager.getFacetByConfigurationIdVersionAndFacetId(
      configId,
      configVersion,
      facet.id,
    );

    expect(facet.addr).to.exist;
    expect(facet.addr).to.not.be.empty;
    expect(facet.addr).to.equal(address);
    expect(facet.addr).to.not.equal("0x0000000000000000000000000000000000000000");
    expect(facet.selectors).to.exist;
    expect(facet.selectors).to.not.be.empty;
    expect([...facet.selectors]).to.have.members([...selectors]);

    expect(facet.interfaceIds).to.exist;
    expect(facet.interfaceIds).to.not.be.empty;
    expect({
      id: facet.id,
      addr: facet.addr,
      selectors: [...facet.selectors],
      interfaceIds: [...facet.interfaceIds],
    }).to.deep.equal({
      id: facet_2.id,
      addr: facet_2.addr,
      selectors: [...facet_2.selectors],
      interfaceIds: [...facet_2.interfaceIds],
    });

    await validateSelectors(configId, configVersion, facet, selectorsLength);
    await validateInterfaces(configId, configVersion, facet);
  }

  async function validateSelectors(
    configId: string,
    configVersion: number,
    facet: IDiamondLoupe.FacetStructOutput,
    selectorsLength: number,
  ) {
    /*
     * Problematic selectors:
     * - getStaticInterfaceIdsSelector ('0xb378cf37'):
     *     This selector is known to sometimes appear unexpectedly in facet selector arrays due to
     *     misconfiguration or incorrect facet registration. It should only be present for facets that
     *     implement the corresponding static interface method.
     * - getStaticResolverKeySelector ('0x1ef2fdc8'):
     *     Similar to the above, this selector should only be present for facets that implement the
     *     static resolver key method. Its unexpected presence may indicate a bug in facet setup.
     * - nullSelector ('0x00000000'):
     *     The null selector is used as a sentinel value and should never appear in the selectors array.
     *     Its presence typically indicates an array length mismatch or that the selectors array was
     *     not properly populated. The validation logic checks for this to catch such errors early.
     *
     * Expected behavior:
     * - Only valid selectors for the facet should be present in the selectors array.
     * - The null selector should never be present.
     * - The static selectors should only be present for facets that implement the corresponding methods.
     */
    const getStaticInterfaceIdsSelector = "0xb378cf37";
    const getStaticResolverKeySelector = "0x1ef2fdc8";
    const nullSelector = "0x00000000";

    for (let selectorIndex = 0; selectorIndex < selectorsLength; selectorIndex++) {
      const selectorId = facet.selectors[selectorIndex];

      expect(selectorId).to.not.equal(
        nullSelector,
        `Null selector (0x00000000) found at index ${selectorIndex} in facet ${facet.id} (${facet.addr}). ` +
          `This indicates a length mismatch in the getStaticFunctionSelectors() method. ` +
          `The array size is larger than the number of selectors being populated.`,
      );

      expect(selectorId).to.not.equal(
        getStaticInterfaceIdsSelector,
        `getStaticInterfaceIds() selector (${getStaticInterfaceIdsSelector}) should NOT be registered in getStaticFunctionSelectors(). ` +
          `Found in facet ${facet.id} (${facet.addr}). ` +
          `This function is part of the IStaticFunctionSelectors interface but should not be exposed as a callable function.`,
      );

      expect(selectorId).to.not.equal(
        getStaticResolverKeySelector,
        `getStaticResolverKey() selector (${getStaticResolverKeySelector}) should NOT be registered in getStaticFunctionSelectors(). ` +
          `Found in facet ${facet.id} (${facet.addr}). ` +
          `This function is part of the IStaticFunctionSelectors interface but should not be exposed as a callable function.`,
      );

      const id = await diamondCutManager.getFacetIdByConfigurationIdVersionAndSelector(
        configId,
        configVersion,
        selectorId,
      );

      const facetAddressForSelector = await diamondCutManager.resolveResolverProxyCall(
        configId,
        configVersion,
        selectorId,
      );

      expect(facetAddressForSelector).to.not.equal("0x0000000000000000000000000000000000000000");
      expect(id).to.equal(facet.id);
      expect(facetAddressForSelector).to.equal(facet.addr);
    }
  }

  async function validateInterfaces(configId: string, configVersion: number, facet: IDiamondLoupe.FacetStructOutput) {
    for (const interfaceId of facet.interfaceIds) {
      const interfaceExists = await diamondCutManager.resolveSupportsInterface(configId, configVersion, interfaceId);
      expect(interfaceExists).to.be.true;
    }
  }

  async function validateFacetIdsAndAddresses(
    configId: string,
    configVersion: number,
    facetsLength: number,
    facetIds: string[],
    facetAddresses: string[],
  ) {
    const facetIds_2 = await diamondCutManager.getFacetIdsByConfigurationIdAndVersion(
      configId,
      configVersion,
      0,
      facetsLength,
    );

    const facetAddresses_2 = await diamondCutManager.getFacetAddressesByConfigurationIdAndVersion(
      configId,
      configVersion,
      0,
      facetsLength,
    );

    expect([...facetIds]).to.have.members([...facetIds_2]);
    expect([...facetAddresses]).to.have.members([...facetAddresses_2]);

    const expectedFacetIdList = configToFacetIdsMap[configId];

    if (!expectedFacetIdList) {
      expect.fail("Unknown configId");
    }

    expect(facetsLength).to.equal(expectedFacetIdList.length);
    expect([...facetIds]).to.have.members(expectedFacetIdList);
  }

  it("GIVEN a resolver WHEN reading configuration information THEN everything matches", async () => {
    const configLength = Number(await diamondCutManager.getConfigurationsLength());
    expect(configLength).to.equal(8);

    const configIds = await diamondCutManager.getConfigurations(0, configLength);
    expect([...configIds]).to.have.members([
      EQUITY_CONFIG_ID,
      BOND_CONFIG_ID,
      BOND_FIXED_RATE_CONFIG_ID,
      BOND_KPI_LINKED_RATE_CONFIG_ID,
      LOAN_CONFIG_ID,
      LOANS_PORTFOLIO_CONFIG_ID,
      FACTORY_CONFIG_ID,
      INITIALIZE_MOCK_CONFIG_ID,
    ]);

    for (const configId of configIds) {
      if (configId == INITIALIZE_MOCK_CONFIG_ID) continue;
      const configLatestVersion = Number(await diamondCutManager.getLatestVersionByConfiguration(configId));
      expect(configLatestVersion).to.equal(1);

      await validateConfiguration(configId);
    }
  });

  it("GIVEN a resolver WHEN resolving calls THEN success", async () => {
    const facets = await diamondCutManager.getFacetsByConfigurationIdAndVersion(
      EQUITY_CONFIG_ID,
      1,
      0,
      equityFacetIdList.length,
    );

    expect(facets.length).to.be.greaterThan(0);

    const configVersionDoesNotExist = await diamondCutManager.isResolverProxyConfigurationRegistered(
      EQUITY_CONFIG_ID,
      2,
    );
    expect(configVersionDoesNotExist).to.be.false;
    await expect(
      diamondCutManager.checkResolverProxyConfigurationRegistered(EQUITY_CONFIG_ID, 2),
    ).to.be.revertedWithCustomError(diamondCutManager, "ResolverProxyConfigurationNoRegistered");

    const configDoesNotExist = await diamondCutManager.isResolverProxyConfigurationRegistered(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      1,
    );
    expect(configDoesNotExist).to.equal(false);
    await expect(
      diamondCutManager.checkResolverProxyConfigurationRegistered(
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        1,
      ),
    ).to.be.revertedWithCustomError(diamondCutManager, "ResolverProxyConfigurationNoRegistered");

    const noFacetAddress = await diamondCutManager.resolveResolverProxyCall(EQUITY_CONFIG_ID, 1, "0x00000001");
    expect(noFacetAddress).to.equal("0x0000000000000000000000000000000000000000");

    const interfaceDoesnotExist = await diamondCutManager.resolveSupportsInterface(EQUITY_CONFIG_ID, 1, "0x00000001");
    expect(interfaceDoesnotExist).to.equal(false);
  });

  it("GIVEN a resolver WHEN adding a new configuration with configId at 0 THEN fails with DefaultValueForConfigurationIdNotPermitted", async () => {
    const facetConfigurations = createFacetConfigurations(equityFacetIdList, equityFacetVersionList);

    await expect(
      diamondCutManager
        .connect(signer_A)
        .createConfiguration("0x0000000000000000000000000000000000000000000000000000000000000000", facetConfigurations),
    ).to.be.revertedWithCustomError(diamondCutManager, "DefaultValueForConfigurationIdNotPermitted");
  });

  it.skip("GIVEN a resolver and a non admin user WHEN adding a new configuration THEN fails with AccountHasNoRole", async () => {
    const facetConfigurations = createFacetConfigurations(equityFacetIdList, equityFacetVersionList);

    await expect(
      diamondCutManager.connect(signer_B).createConfiguration(EQUITY_CONFIG_ID, facetConfigurations),
    ).to.be.revertedWithCustomError(diamondCutManager, "AccountHasNoRole");
  });

  it("GIVEN a paused resolver WHEN adding a new configuration THEN fails with IsPaused", async () => {
    await pause.connect(signer_B).pause();

    const facetConfigurations = createFacetConfigurations(equityFacetIdList, equityFacetVersionList);

    await expect(
      diamondCutManager.connect(signer_A).createConfiguration(TEST_CONFIG_IDS.PAUSE_TEST, facetConfigurations),
    ).to.be.revertedWithCustomError(diamondCutManager, "IsPaused");

    await pause.connect(signer_B).unpause();
  });

  it("GIVEN a resolver WHEN adding a new configuration with a non registered facet THEN fails with FacetIdNotRegistered", async () => {
    const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = [
      {
        id: "0x0000000000000000000000000000000000000000000000000000000000000000",
        version: 1,
      },
    ];

    await expect(
      diamondCutManager.connect(signer_A).createConfiguration(EQUITY_CONFIG_ID, facetConfigurations),
    ).to.be.revertedWithCustomError(diamondCutManager, "FacetIdNotRegistered");
  });

  it("GIVEN a resolver WHEN adding a new configuration with a duplicated facet THEN fails with DuplicatedFacetInConfiguration", async () => {
    const facetsIds = [...equityFacetIdList, equityFacetIdList[0]];
    const facetVersions = [...equityFacetVersionList, equityFacetVersionList[0]];

    const facetConfigurations = createFacetConfigurations(facetsIds, facetVersions);

    await expect(
      diamondCutManager
        .connect(signer_A)
        .createConfiguration(EQUITY_CONFIG_ID, facetConfigurations, { gasLimit: 60_000_000 }),
    ).to.be.revertedWithCustomError(diamondCutManager, "DuplicatedFacetInConfiguration");
  });

  it("GIVEN a batch deploying WHEN run cancelBatchConfiguration THEN all the related information is removed", async () => {
    const testConfigId = "0x0000000000000000000000000000000000000000000000000000000000000030";

    // Create a batch configuration with one facet, but don't mark it as complete (partialBatch: false)
    const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = [
      {
        id: equityFacetIdList[0],
        version: 1,
      },
    ];

    await diamondCutManager.connect(signer_A).createBatchConfiguration(testConfigId, facetConfigurations, false);

    // With partialBatch: false, the batch is incomplete, so getLatestVersionByConfiguration returns 0
    const configLatestVersion = Number(await diamondCutManager.getLatestVersionByConfiguration(testConfigId));
    expect(configLatestVersion).to.equal(0);

    // However, facets are being prepared in version 1 and can be queried
    const facetsLength = Number(await diamondCutManager.getFacetsLengthByConfigurationIdAndVersion(testConfigId, 1));
    expect(facetsLength).to.equal(1);

    // Cancel the incomplete batch configuration and verify event is emitted
    await expect(diamondCutManager.connect(signer_A).cancelBatchConfiguration(testConfigId))
      .to.emit(diamondCutManager, "DiamondBatchConfigurationCanceled")
      .withArgs(testConfigId, 1);

    // Verify all information is removed
    expect(await diamondCutManager.getFacetsLengthByConfigurationIdAndVersion(testConfigId, 1)).to.equal(0);
    expect(await diamondCutManager.getLatestVersionByConfiguration(testConfigId)).to.equal(0);
  });

  it("GIVEN a resolver WHEN adding a new configuration with configId at 0 with createBatchConfiguration THEN fails with DefaultValueForConfigurationIdNotPermitted", async () => {
    const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = [];
    equityFacetIdList.forEach((id, index) =>
      facetConfigurations.push({
        id,
        version: equityFacetVersionList[index],
      }),
    );

    await expect(
      diamondCutManager
        .connect(signer_A)
        .createBatchConfiguration(
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          facetConfigurations,
          false,
        ),
    ).to.be.revertedWithCustomError(diamondCutManager, "DefaultValueForConfigurationIdNotPermitted");
  });

  it("GIVEN a resolver and a non admin user WHEN adding a new configuration with createBatchConfiguration THEN fails with AccountHasNoRole", async () => {
    const facetConfigurations = createFacetConfigurations(equityFacetIdList, equityFacetVersionList);

    await expect(
      diamondCutManager.connect(signer_B).createBatchConfiguration(EQUITY_CONFIG_ID, facetConfigurations, false),
    ).to.be.revertedWithCustomError(diamondCutManager, "AccountHasNoRole");
  });

  it("GIVEN a paused resolver WHEN adding a new configuration with createBatchConfiguration THEN fails with IsPaused", async () => {
    await pause.connect(signer_B).pause();

    const facetConfigurations = createFacetConfigurations(equityFacetIdList, equityFacetVersionList);

    await expect(
      diamondCutManager
        .connect(signer_A)
        .createBatchConfiguration(TEST_CONFIG_IDS.PAUSE_BATCH_TEST, facetConfigurations, false),
    ).to.be.revertedWithCustomError(diamondCutManager, "IsPaused");

    await pause.connect(signer_B).unpause();
  });

  it("GIVEN a resolver WHEN adding a new configuration with a non registered facet using createBatchConfiguration THEN fails with FacetIdNotRegistered", async () => {
    const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = [
      {
        id: "0x0000000000000000000000000000000000000000000000000000000000000000",
        version: 1,
      },
    ];

    await expect(
      diamondCutManager.connect(signer_A).createBatchConfiguration(EQUITY_CONFIG_ID, facetConfigurations, false),
    ).to.be.revertedWithCustomError(diamondCutManager, "FacetIdNotRegistered");
  });

  it("GIVEN a resolver WHEN adding a new configuration with a duplicated facet using createBatchConfiguration THEN fails with DuplicatedFacetInConfiguration", async () => {
    const facetsIds = [...equityFacetIdList, equityFacetIdList[0]];
    const facetVersions = [...equityFacetVersionList, equityFacetVersionList[0]];

    const facetConfigurations = createFacetConfigurations(facetsIds, facetVersions);

    await expect(
      diamondCutManager
        .connect(signer_A)
        .createBatchConfiguration(EQUITY_CONFIG_ID, facetConfigurations, false, { gasLimit: 60_000_000 }),
    ).to.be.revertedWithCustomError(diamondCutManager, "DuplicatedFacetInConfiguration");
  });

  it("GIVEN a resolver WHEN a selector is blacklisted THEN transaction fails with SelectorBlacklisted", async () => {
    const blackListedSelectors = ["0x8456cb59"];

    await businessLogicResolver.addSelectorsToBlacklist(TEST_CONFIG_IDS.BLACKLIST_TEST, blackListedSelectors);

    const facetConfigurations = createFacetConfigurations(equityFacetIdList, equityFacetVersionList);

    await expect(
      diamondCutManager
        .connect(signer_A)
        .createConfiguration(TEST_CONFIG_IDS.BLACKLIST_TEST, facetConfigurations, { gasLimit: 60_000_000 }),
    )
      .to.be.revertedWithCustomError(diamondCutManager, "SelectorBlacklisted")
      .withArgs(blackListedSelectors[0]);
  });

  it("GIVEN a resolver WHEN creating configuration on an ongoing batch THEN fails with OngoingBatchConfigurationNotPermitted", async () => {
    const testConfigId = "0x0000000000000000000000000000000000000000000000000000000000000010";

    const firstBatchFacets: IDiamondCutManager.FacetConfigurationStruct[] = [
      {
        id: equityFacetIdList[0],
        version: 1,
      },
    ];

    await diamondCutManager.connect(signer_A).createBatchConfiguration(testConfigId, firstBatchFacets, false);

    const secondBatchFacets: IDiamondCutManager.FacetConfigurationStruct[] = [
      {
        id: equityFacetIdList[1],
        version: 1,
      },
    ];

    await expect(diamondCutManager.connect(signer_A).createConfiguration(testConfigId, secondBatchFacets))
      .to.be.revertedWithCustomError(diamondCutManager, "OngoingBatchConfigurationNotPermitted")
      .withArgs(testConfigId);
  });

  it("GIVEN a resolver and a non admin user WHEN canceling a batch configuration THEN fails with AccountHasNoRole", async () => {
    const testConfigId = "0x0000000000000000000000000000000000000000000000000000000000000011";

    const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = [
      {
        id: equityFacetIdList[0],
        version: 1,
      },
    ];

    await diamondCutManager.connect(signer_A).createBatchConfiguration(testConfigId, facetConfigurations, false);

    await expect(
      diamondCutManager.connect(signer_B).cancelBatchConfiguration(testConfigId),
    ).to.be.revertedWithCustomError(diamondCutManager, "AccountHasNoRole");
  });

  it("GIVEN a paused resolver WHEN canceling a batch configuration THEN fails with IsPaused", async () => {
    const testConfigId = "0x0000000000000000000000000000000000000000000000000000000000000012";

    const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = [
      {
        id: equityFacetIdList[0],
        version: 1,
      },
    ];

    await diamondCutManager.connect(signer_A).createBatchConfiguration(testConfigId, facetConfigurations, false);

    await pause.connect(signer_B).pause();

    await expect(
      diamondCutManager.connect(signer_A).cancelBatchConfiguration(testConfigId),
    ).to.be.revertedWithCustomError(diamondCutManager, "IsPaused");
  });

  it("GIVEN a resolver WHEN canceling a batch configuration with configId at 0 THEN fails with DefaultValueForConfigurationIdNotPermitted", async () => {
    await expect(
      diamondCutManager
        .connect(signer_A)
        .cancelBatchConfiguration("0x0000000000000000000000000000000000000000000000000000000000000000"),
    ).to.be.revertedWithCustomError(diamondCutManager, "DefaultValueForConfigurationIdNotPermitted");
  });

  it("GIVEN a configuration WHEN creating a new version (v2) THEN the configuration is already active", async () => {
    const testConfigId = "0x0000000000000000000000000000000000000000000000000000000000000013";

    const firstVersionFacets: IDiamondCutManager.FacetConfigurationStruct[] = [
      {
        id: equityFacetIdList[0],
        version: 1,
      },
    ];

    await diamondCutManager.connect(signer_A).createConfiguration(testConfigId, firstVersionFacets);

    const version1 = Number(await diamondCutManager.getLatestVersionByConfiguration(testConfigId));
    expect(version1).to.equal(1);

    const isRegisteredV1 = await diamondCutManager.isResolverProxyConfigurationRegistered(testConfigId, 1);
    expect(isRegisteredV1).to.be.true;

    const secondVersionFacets: IDiamondCutManager.FacetConfigurationStruct[] = [
      {
        id: equityFacetIdList[1],
        version: 1,
      },
    ];

    await diamondCutManager.connect(signer_A).createConfiguration(testConfigId, secondVersionFacets);

    const version2 = Number(await diamondCutManager.getLatestVersionByConfiguration(testConfigId));
    expect(version2).to.equal(2);

    const isRegisteredV2 = await diamondCutManager.isResolverProxyConfigurationRegistered(testConfigId, 2);
    expect(isRegisteredV2).to.be.true;

    const configLength = Number(await diamondCutManager.getConfigurationsLength());
    const configIds = await diamondCutManager.getConfigurations(0, configLength);
    const countOfTestConfigId = configIds.filter((id: string) => id === testConfigId).length;
    expect(countOfTestConfigId).to.equal(1);
  });

  it("GIVEN a non-existent configuration WHEN checking if registered THEN returns false", async () => {
    const nonExistentConfigId = "0x0000000000000000000000000000000000000000000000000000000000000099";

    const latestVersion = Number(await diamondCutManager.getLatestVersionByConfiguration(nonExistentConfigId));
    expect(latestVersion).to.equal(0);

    const isRegistered = await diamondCutManager.isResolverProxyConfigurationRegistered(nonExistentConfigId, 1);
    expect(isRegistered).to.be.false;

    await expect(
      diamondCutManager.checkResolverProxyConfigurationRegistered(nonExistentConfigId, 1),
    ).to.be.revertedWithCustomError(diamondCutManager, "ResolverProxyConfigurationNoRegistered");
  });

  it("GIVEN an existing configuration WHEN checking if registered THEN returns true and does not revert", async () => {
    const configId = EQUITY_CONFIG_ID;

    const latestVersion = Number(await diamondCutManager.getLatestVersionByConfiguration(configId));
    expect(latestVersion).to.equal(1);

    const isRegistered = await diamondCutManager.isResolverProxyConfigurationRegistered(configId, 1);
    expect(isRegistered).to.be.true;

    await expect(diamondCutManager.checkResolverProxyConfigurationRegistered(configId, 1)).to.not.be.reverted;
    const isRegisteredV0 = await diamondCutManager.isResolverProxyConfigurationRegistered(configId, 0);
    expect(isRegisteredV0).to.be.false;
  });

  it("GIVEN an existing configuration WHEN checking registration with version 0 THEN reverts with VersionZero", async () => {
    await expect(diamondCutManager.checkResolverProxyConfigurationRegistered(EQUITY_CONFIG_ID, 0))
      .to.be.revertedWithCustomError(diamondCutManager, "VersionZero")
      .withArgs(EQUITY_CONFIG_ID);
  });

  it("GIVEN an existing configuration WHEN resolving a call with version 0 THEN reverts with VersionZero", async () => {
    const pauseSelector = "0x8456cb59";
    await expect(diamondCutManager.resolveResolverProxyCall(EQUITY_CONFIG_ID, 0, pauseSelector))
      .to.be.revertedWithCustomError(diamondCutManager, "VersionZero")
      .withArgs(EQUITY_CONFIG_ID);
  });

  it("GIVEN an existing configuration WHEN resolveSupportsInterface called with version 0 THEN reverts with VersionZero", async () => {
    await expect(diamondCutManager.resolveSupportsInterface(EQUITY_CONFIG_ID, 0, "0x01ffc9a7"))
      .to.be.revertedWithCustomError(diamondCutManager, "VersionZero")
      .withArgs(EQUITY_CONFIG_ID);
  });

  it("GIVEN an existing configuration WHEN getFacetsByConfigurationIdAndVersion called with version 0 THEN reverts with VersionZero", async () => {
    await expect(diamondCutManager.getFacetsByConfigurationIdAndVersion(EQUITY_CONFIG_ID, 0, 0, 10))
      .to.be.revertedWithCustomError(diamondCutManager, "VersionZero")
      .withArgs(EQUITY_CONFIG_ID);
  });

  it("GIVEN a registered configuration WHEN getFacetVersionByConfigurationIdVersionAndFacetId called with non-existent facetId THEN reverts with FacetIdNotRegistered", async () => {
    const nonExistentFacetId = "0x1234567890123456789012345678901234567890123456789012345678901234";

    await expect(
      diamondCutManager.getFacetVersionByConfigurationIdVersionAndFacetId(EQUITY_CONFIG_ID, 1, nonExistentFacetId),
    ).to.be.revertedWithCustomError(diamondCutManager, "FacetIdNotRegistered");
  });

  it("GIVEN a resolver WHEN creating a configuration with empty facet array THEN fails with EmptyFacetConfigurationNotPermitted", async () => {
    const emptyConfigId = "0x0000000000000000000000000000000000000000000000000000000000000040";

    await expect(diamondCutManager.connect(signer_A).createConfiguration(emptyConfigId, []))
      .to.be.revertedWithCustomError(diamondCutManager, "EmptyFacetConfigurationNotPermitted")
      .withArgs(emptyConfigId);
  });

  it("GIVEN a resolver WHEN finalising a batch configuration with no facets accumulated THEN fails with EmptyFacetConfigurationNotPermitted", async () => {
    const emptyBatchConfigId = "0x0000000000000000000000000000000000000000000000000000000000000041";

    await expect(diamondCutManager.connect(signer_A).createBatchConfiguration(emptyBatchConfigId, [], true))
      .to.be.revertedWithCustomError(diamondCutManager, "EmptyFacetConfigurationNotPermitted")
      .withArgs(emptyBatchConfigId);
  });

  it("GIVEN a resolver WHEN adding configuration with overlapping selectors from different facets THEN fails with SelectorAlreadyRegistered", async () => {
    // Use the lightweight fixture that includes TransferFacet
    const fixture = await loadFixture(registerTransferFacetFixture);
    const { deployer, blr, transferResolverKey } = fixture;

    // Deploy DuplicateSelectorFacetTest which has the same transfer.selector (0xa9059cbb) as TransferFacet
    const duplicateFactory = await ethers.getContractFactory("DuplicateSelectorFacetTest", deployer);
    const duplicateResult = await deployContract(duplicateFactory, {
      confirmations: 0,
      verifyDeployment: false,
    });
    const duplicateFacetAddress = duplicateResult.address!;

    // Generate a unique resolver key for the duplicate selector facet
    const duplicateResolverKey = ethers.keccak256(ethers.toUtf8Bytes("DuplicateSelectorFacetTest"));

    // Register the duplicate facet in BLR
    await registerFacets(blr, {
      facets: [
        {
          name: "DuplicateSelectorFacetTest",
          address: duplicateFacetAddress,
          resolverKey: duplicateResolverKey,
        },
      ],
    });

    // Connect DiamondCutManager to the BLR
    const testDiamondCutManager = DiamondCutManager__factory.connect(await blr.getAddress(), deployer);

    // Try to create configuration with both TransferFacet and DuplicateSelectorFacetTest
    // Both have the same transfer.selector (0xa9059cbb)
    const testConfigId = "0x0000000000000000000000000000000000000000000000000000000000000020";
    const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = [
      { id: transferResolverKey, version: 1 },
      { id: duplicateResolverKey, version: 1 },
    ];

    // Expect the transaction to revert with SelectorAlreadyRegistered error
    // The error should contain: configurationId, version, facetId, selector
    const transferSelector = "0xa9059cbb"; // transfer(address,uint256).selector
    await expect(testDiamondCutManager.createConfiguration(testConfigId, facetConfigurations))
      .to.be.revertedWithCustomError(testDiamondCutManager, "SelectorAlreadyRegistered")
      .withArgs(testConfigId, 1, duplicateResolverKey, transferSelector);
  });
});
