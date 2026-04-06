// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset, type NominalValueMigrationFacetTest } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BOND_CONFIG_ID, EQUITY_CONFIG_ID } from "@scripts";
import { deployBondTokenFixture, deployEquityTokenFixture } from "@test";

async function addMigrationFacetToDiamond(base: Awaited<ReturnType<typeof deployBondTokenFixture>>, configId: string) {
  const { blr, deployer, diamond: baseDiamond } = base;

  const migrationFacetFactory = await ethers.getContractFactory("NominalValueMigrationFacetTest", deployer);
  const migrationFacetContract = await migrationFacetFactory.deploy();
  await migrationFacetContract.waitForDeployment();
  const migrationFacetAddress = await migrationFacetContract.getAddress();

  const migrationResolverKey = await migrationFacetContract.getStaticResolverKey();

  await blr.registerBusinessLogics([
    {
      businessLogicKey: migrationResolverKey,
      businessLogicAddress: migrationFacetAddress,
    },
  ]);

  const latestBLRVersion = Number(await blr.getLatestVersion());

  const asset = await ethers.getContractAt("IAsset", baseDiamond.target);
  const existingFacetIds = await asset.getFacetIds();

  const allFacetIds = [...existingFacetIds, migrationResolverKey];
  const facetConfigs = allFacetIds.map((id: string) => ({ id, version: latestBLRVersion }));

  const BATCH_SIZE = 20;
  for (let i = 0; i < facetConfigs.length; i += BATCH_SIZE) {
    const batch = facetConfigs.slice(i, i + BATCH_SIZE);
    const isLastBatch = i + BATCH_SIZE >= facetConfigs.length;
    await blr.createBatchConfiguration(configId, batch, isLastBatch);
  }

  const newConfigVersion = Number(await blr.getLatestVersionByConfiguration(configId));
  await asset.connect(deployer).updateConfigVersion(newConfigVersion);

  return base;
}

describe("NominalValue Tests", () => {
  describe("Bond NominalValue Migration", () => {
    let diamond: ResolverProxy;
    let signer_A: HardhatEthersSigner;

    let asset: IAsset;
    let migrationFacet: NominalValueMigrationFacetTest;

    async function deployBondWithMigrationFacet() {
      const base = await deployBondTokenFixture({ useLoadFixture: false });
      await addMigrationFacetToDiamond(base, BOND_CONFIG_ID);

      diamond = base.diamond;
      signer_A = base.deployer;

      asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
      migrationFacet = await ethers.getContractAt("NominalValueMigrationFacetTest", diamond.target, signer_A);
    }

    beforeEach(async () => {
      await loadFixture(deployBondWithMigrationFacet);
    });

    it("GIVEN a bond with initialized nominalValue WHEN getNominalValue THEN returns correct value", async () => {
      const nominalValue = await asset.getNominalValue();
      const nominalValueDecimals = await asset.getNominalValueDecimals();

      // Default bond params: nominalValue=100, nominalValueDecimals=2
      expect(nominalValue).to.equal(100);
      expect(nominalValueDecimals).to.equal(2);
    });

    it("GIVEN a bond with initialized nominalValue WHEN legacy bond storage is checked THEN deprecated fields are cleared", async () => {
      const [legacyValue, legacyDecimals] = await migrationFacet.getLegacyBondNominalValue();

      // After initialize_NominalValue (called by factory), deprecated fields should be cleared
      expect(legacyValue).to.equal(0);
      expect(legacyDecimals).to.equal(0);
    });

    it("GIVEN legacy bond nominalValue WHEN setNominalValue is called THEN legacy values are migrated and new value is set", async () => {
      // Simulate legacy state by writing directly to deprecated storage
      await migrationFacet.setLegacyBondNominalValue(500, 3);

      // Verify legacy data exists
      let [legacyValue, legacyDecimals] = await migrationFacet.getLegacyBondNominalValue();
      expect(legacyValue).to.equal(500);
      expect(legacyDecimals).to.equal(3);

      // Aggregated value should include legacy + new storage
      const aggregatedBefore = await migrationFacet.getAggregatedNominalValue();
      expect(aggregatedBefore).to.equal(100 + 500); // new storage (100) + legacy bond (500)

      // Call setNominalValue to trigger migration
      await asset.connect(signer_A).setNominalValue(200, 4);

      // Verify legacy data is cleared
      [legacyValue, legacyDecimals] = await migrationFacet.getLegacyBondNominalValue();
      expect(legacyValue).to.equal(0);
      expect(legacyDecimals).to.equal(0);

      // Verify new value is set correctly (not aggregated with legacy)
      expect(await asset.getNominalValue()).to.equal(200);
      expect(await asset.getNominalValueDecimals()).to.equal(4);
    });

    it("GIVEN no legacy bond nominalValue WHEN setNominalValue is called THEN only new value is updated", async () => {
      await asset.connect(signer_A).setNominalValue(300, 5);

      expect(await asset.getNominalValue()).to.equal(300);
      expect(await asset.getNominalValueDecimals()).to.equal(5);

      const [legacyValue, legacyDecimals] = await migrationFacet.getLegacyBondNominalValue();
      expect(legacyValue).to.equal(0);
      expect(legacyDecimals).to.equal(0);
    });
  });

  describe("Equity NominalValue Migration", () => {
    let diamond: ResolverProxy;
    let signer_A: HardhatEthersSigner;

    let asset: IAsset;
    let migrationFacet: NominalValueMigrationFacetTest;

    async function deployEquityWithMigrationFacet() {
      const base = await deployEquityTokenFixture({ useLoadFixture: false });
      await addMigrationFacetToDiamond(base, EQUITY_CONFIG_ID);

      diamond = base.diamond;
      signer_A = base.deployer;

      asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
      migrationFacet = await ethers.getContractAt("NominalValueMigrationFacetTest", diamond.target, signer_A);
    }

    beforeEach(async () => {
      await loadFixture(deployEquityWithMigrationFacet);
    });

    it("GIVEN an equity with initialized nominalValue WHEN getNominalValue THEN returns correct value", async () => {
      const nominalValue = await asset.getNominalValue();
      const nominalValueDecimals = await asset.getNominalValueDecimals();

      // Default equity params: nominalValue=100, nominalValueDecimals=2
      expect(nominalValue).to.equal(100);
      expect(nominalValueDecimals).to.equal(2);
    });

    it("GIVEN an equity with initialized nominalValue WHEN legacy equity storage is checked THEN deprecated fields are cleared", async () => {
      const [legacyValue, legacyDecimals] = await migrationFacet.getLegacyEquityNominalValue();

      // After initialize_NominalValue (called by factory), deprecated fields should be cleared
      expect(legacyValue).to.equal(0);
      expect(legacyDecimals).to.equal(0);
    });

    it("GIVEN legacy equity nominalValue WHEN setNominalValue is called THEN legacy values are migrated and new value is set", async () => {
      // Simulate legacy state
      await migrationFacet.setLegacyEquityNominalValue(750, 6);

      // Verify legacy data exists
      let [legacyValue, legacyDecimals] = await migrationFacet.getLegacyEquityNominalValue();
      expect(legacyValue).to.equal(750);
      expect(legacyDecimals).to.equal(6);

      // Aggregated value should include both
      const aggregatedBefore = await migrationFacet.getAggregatedNominalValue();
      expect(aggregatedBefore).to.equal(100 + 750);

      // Trigger migration via setNominalValue
      await asset.connect(signer_A).setNominalValue(400, 3);

      // Verify legacy cleared
      [legacyValue, legacyDecimals] = await migrationFacet.getLegacyEquityNominalValue();
      expect(legacyValue).to.equal(0);
      expect(legacyDecimals).to.equal(0);

      // Verify new value
      expect(await asset.getNominalValue()).to.equal(400);
      expect(await asset.getNominalValueDecimals()).to.equal(3);
    });
  });

  describe("Cross-storage Migration", () => {
    let diamond: ResolverProxy;
    let signer_A: HardhatEthersSigner;

    let asset: IAsset;
    let migrationFacet: NominalValueMigrationFacetTest;

    async function deployBondWithMigrationFacet() {
      const base = await deployBondTokenFixture({ useLoadFixture: false });
      await addMigrationFacetToDiamond(base, BOND_CONFIG_ID);

      diamond = base.diamond;
      signer_A = base.deployer;

      asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
      migrationFacet = await ethers.getContractAt("NominalValueMigrationFacetTest", diamond.target, signer_A);
    }

    beforeEach(async () => {
      await loadFixture(deployBondWithMigrationFacet);
    });

    it("GIVEN both legacy bond and equity nominalValue WHEN setNominalValue is called THEN both are cleared", async () => {
      // Set both legacy storages
      await migrationFacet.setLegacyBondNominalValue(100, 2);
      await migrationFacet.setLegacyEquityNominalValue(200, 3);

      // Aggregated should be: new(100) + bond(100) + equity(200)
      expect(await migrationFacet.getAggregatedNominalValue()).to.equal(400);

      // Trigger migration
      await asset.connect(signer_A).setNominalValue(500, 4);

      // Both legacy storages should be cleared
      const [bondValue, bondDecimals] = await migrationFacet.getLegacyBondNominalValue();
      expect(bondValue).to.equal(0);
      expect(bondDecimals).to.equal(0);

      const [equityValue, equityDecimals] = await migrationFacet.getLegacyEquityNominalValue();
      expect(equityValue).to.equal(0);
      expect(equityDecimals).to.equal(0);

      // Only new storage value
      expect(await asset.getNominalValue()).to.equal(500);
      expect(await asset.getNominalValueDecimals()).to.equal(4);
    });

    it("GIVEN legacy values WHEN setNominalValue is called twice THEN second call has no migration side effects", async () => {
      // Set legacy
      await migrationFacet.setLegacyBondNominalValue(100, 2);

      // First set - migrates
      await asset.connect(signer_A).setNominalValue(300, 3);
      expect(await asset.getNominalValue()).to.equal(300);

      // Second set - no legacy to migrate
      await asset.connect(signer_A).setNominalValue(400, 4);
      expect(await asset.getNominalValue()).to.equal(400);
      expect(await asset.getNominalValueDecimals()).to.equal(4);
    });
  });

  describe("NominalValue Initialization", () => {
    let diamond: ResolverProxy;
    let signer_A: HardhatEthersSigner;

    let asset: IAsset;
    let migrationFacet: NominalValueMigrationFacetTest;

    async function deployBondWithMigrationFacet() {
      const base = await deployBondTokenFixture({ useLoadFixture: false });
      await addMigrationFacetToDiamond(base, BOND_CONFIG_ID);

      diamond = base.diamond;
      signer_A = base.deployer;

      asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
      migrationFacet = await ethers.getContractAt("NominalValueMigrationFacetTest", diamond.target, signer_A);
    }

    beforeEach(async () => {
      await loadFixture(deployBondWithMigrationFacet);
    });

    it("GIVEN an already initialized nominalValue WHEN initialize_NominalValue is called THEN reverts with AlreadyInitialized", async () => {
      await expect(asset.initialize_NominalValue(200, 4)).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
    });

    it("GIVEN an uninitialized nominalValue WHEN setNominalValue is called THEN it initializes and sets value", async () => {
      // Reset initialized flag to simulate a legacy token
      await migrationFacet.resetNominalValueInitialized();

      // setNominalValue should trigger _initialize_NominalValue internally
      await asset.connect(signer_A).setNominalValue(600, 5);

      expect(await asset.getNominalValue()).to.equal(600);
      expect(await asset.getNominalValueDecimals()).to.equal(5);
    });
  });

  describe("NominalValueFacet Static Selectors", () => {
    it("GIVEN the NominalValueFacet WHEN getStaticFunctionSelectors is called THEN returns 4 selectors", async () => {
      const factory = await ethers.getContractFactory("NominalValueFacet");
      const facet = await factory.deploy();
      await facet.waitForDeployment();

      const selectors = await facet.getStaticFunctionSelectors();
      expect(selectors.length).to.equal(4);
    });

    it("GIVEN the NominalValueFacet WHEN getStaticInterfaceIds is called THEN returns 1 interface id", async () => {
      const factory = await ethers.getContractFactory("NominalValueFacet");
      const facet = await factory.deploy();
      await facet.waitForDeployment();

      const interfaceIds = await facet.getStaticInterfaceIds();
      expect(interfaceIds.length).to.equal(1);
    });

    it("GIVEN the NominalValueFacet WHEN getStaticResolverKey is called THEN returns the correct key", async () => {
      const factory = await ethers.getContractFactory("NominalValueFacet");
      const facet = await factory.deploy();
      await facet.waitForDeployment();

      const resolverKey = await facet.getStaticResolverKey();
      expect(resolverKey).to.not.equal(ethers.ZeroHash);
    });
  });

  describe("NominalValue Access Control", () => {
    let diamond: ResolverProxy;
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;

    let asset: IAsset;

    async function deployBondFixture() {
      const base = await deployBondTokenFixture({ useLoadFixture: false });

      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;

      asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
    }

    beforeEach(async () => {
      await loadFixture(deployBondFixture);
    });

    it("GIVEN a user with _NOMINAL_VALUE_ROLE WHEN setNominalValue THEN succeeds", async () => {
      await asset.connect(signer_A).setNominalValue(500, 4);

      expect(await asset.getNominalValue()).to.equal(500);
      expect(await asset.getNominalValueDecimals()).to.equal(4);
    });

    it("GIVEN a user without _NOMINAL_VALUE_ROLE WHEN setNominalValue THEN reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_B).setNominalValue(500, 4)).to.be.rejectedWith("AccountHasNoRole");
    });
  });
});
