// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset, type MigrationFacetTest } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ATS_ROLES, dateToUnixTimestamp, EQUITY_CONFIG_ID } from "@scripts";
import { deployEquityTokenFixture, MAX_UINT256, executeRbac, grantRoleAndPauseToken } from "@test";

const amount = 1;
const balanceOf_B_Original = [20 * amount, 200 * amount];
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
const adjustFactor = 253;
const adjustDecimals = 2;
const EMPTY_VC_ID = "";

describe("Adjust Balances Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deploySecurityFixtureMultiPartition() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, [
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ]);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureMultiPartition);
  });

  it("GIVEN an account without adjustBalances role WHEN adjustBalances THEN transaction fails with AccountHasNoRole", async () => {
    // adjustBalances fails
    await expect(asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals)).to.be.revertedWithCustomError(
      asset,
      "AccountHasNoRole",
    );
  });

  it("GIVEN a paused Token WHEN adjustBalances THEN transaction fails with TokenIsPaused", async () => {
    // Granting Role to account C and Pause
    await grantRoleAndPauseToken(asset, ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_A, signer_B, signer_C.address);

    // adjustBalances fails
    await expect(asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals)).to.be.revertedWithCustomError(
      asset,
      "TokenIsPaused",
    );
  });

  it("GIVEN a Token WHEN adjustBalances with factor set at 0 THEN transaction fails with FactorIsZero", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_C.address);

    // adjustBalances fails
    await expect(asset.connect(signer_C).adjustBalances(0, adjustDecimals)).to.be.revertedWithCustomError(
      asset,
      "FactorIsZero",
    );
  });

  it("GIVEN an account with adjustBalance role WHEN adjustBalances THEN scheduled tasks get executed succeeds", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_A.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, 0, MAX_UINT256, signer_A.address);

    await asset.connect(signer_A).issueByPartition({
      partition: _PARTITION_ID_2,
      tokenHolder: signer_B.address,
      value: balanceOf_B_Original[0],
      data: "0x",
    });

    // schedule tasks
    const dividendsRecordDateInSeconds_1 = dateToUnixTimestamp(`2030-01-01T00:00:06Z`);
    const dividendsExecutionDateInSeconds = dateToUnixTimestamp(`2030-01-01T00:01:00Z`);
    const dividendsAmountPerEquity = 1;
    const dividendAmountDecimalsPerEquity = 2;
    const dividendData_1 = {
      recordDate: dividendsRecordDateInSeconds_1.toString(),
      executionDate: dividendsExecutionDateInSeconds.toString(),
      amount: dividendsAmountPerEquity,
      amountDecimals: dividendAmountDecimalsPerEquity,
    };

    await asset.connect(signer_A).setDividend(dividendData_1);

    const balanceAdjustmentExecutionDateInSeconds_1 = dateToUnixTimestamp(`2030-01-01T00:00:07Z`);

    const balanceAdjustmentData_1 = {
      executionDate: balanceAdjustmentExecutionDateInSeconds_1.toString(),
      factor: adjustFactor,
      decimals: adjustDecimals,
    };

    await asset.connect(signer_A).setScheduledBalanceAdjustment(balanceAdjustmentData_1);

    const tasks_count_Before = await asset.scheduledCrossOrderedTaskCount();

    //-------------------------
    await asset.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds_1 + 1);

    // balance adjustment
    await asset.connect(signer_A).adjustBalances(1, 0);

    const tasks_count_After = await asset.scheduledCrossOrderedTaskCount();

    expect(tasks_count_Before).to.be.equal(2);
    expect(tasks_count_After).to.be.equal(0);
  });

  describe("Migration Tests", () => {
    let migrationFacet: MigrationFacetTest;

    async function deploySecurityFixtureMultiPartitionWithMigration() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
          },
        },
        useLoadFixture: false,
      });

      const { blr, deployer, diamond: baseDiamond } = base;

      // Deploy MigrationFacetTest
      const migrationFacetFactory = await ethers.getContractFactory("MigrationFacetTest", deployer);
      const migrationFacetContract = await migrationFacetFactory.deploy();
      await migrationFacetContract.waitForDeployment();
      const migrationFacetAddress = await migrationFacetContract.getAddress();

      // Get the resolver key directly from the contract
      const migrationResolverKey = await migrationFacetContract.getStaticResolverKey();

      // Register MigrationFacetTest with the BLR
      await blr.registerBusinessLogics([
        {
          businessLogicKey: migrationResolverKey,
          businessLogicAddress: migrationFacetAddress,
        },
      ]);

      // Get the BLR's latest global version after registering MigrationFacetTest
      const latestBLRVersion = Number(await blr.getLatestVersion());

      // Get current facet IDs from the diamond to build the new configuration version
      asset = await ethers.getContractAt("IAsset", baseDiamond.target);
      const existingFacetIds = await asset.getFacetIds();

      // All facets use latestBLRVersion (mirrors the scripts' createBatchConfiguration approach)
      const allFacetIds = [...existingFacetIds, migrationResolverKey];
      const facetConfigs = allFacetIds.map((id: string) => ({ id, version: latestBLRVersion }));

      // Use batched createBatchConfiguration to avoid gas limit issues (same as scripts use batch of 20)
      const BATCH_SIZE = 20;
      for (let i = 0; i < facetConfigs.length; i += BATCH_SIZE) {
        const batch = facetConfigs.slice(i, i + BATCH_SIZE);
        const isLastBatch = i + BATCH_SIZE >= facetConfigs.length;
        await blr.createBatchConfiguration(EQUITY_CONFIG_ID, batch, isLastBatch);
      }

      // Dynamically get the new config version and upgrade the diamond
      const newConfigVersion = Number(await blr.getLatestVersionByConfiguration(EQUITY_CONFIG_ID));
      await asset.connect(deployer).updateConfigVersion(newConfigVersion);

      // Set up standard roles
      await executeRbac(asset, [
        { role: ATS_ROLES._PAUSER_ROLE, members: [base.user1.address] },
        { role: ATS_ROLES._KYC_ROLE, members: [base.user1.address] },
        { role: ATS_ROLES._SSI_MANAGER_ROLE, members: [base.deployer.address] },
      ]);

      return {
        ...base,
        asset,
        migrationFacet: (await ethers.getContractAt("MigrationFacetTest", baseDiamond.target)) as MigrationFacetTest,
      };
    }

    beforeEach(async () => {
      const result = await loadFixture(deploySecurityFixtureMultiPartitionWithMigration);
      diamond = result.diamond;
      signer_A = result.deployer;
      signer_B = result.user1;
      signer_C = result.user2;
      migrationFacet = result.migrationFacet;
      asset = result.asset;
    });

    it("GIVEN non-migrated totalSupply and balance WHEN adjustBalances is called THEN totalSupply migrates and balance migrates on next interaction", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);

      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, 0, MAX_UINT256, signer_A.address);

      const legacyTotalSupply = 1000 * amount;
      const legacyBalance_B = 200 * amount;
      const newIssuanceAmount = 50 * amount;

      // Set up legacy state using MigrationFacetTest (simulates pre-migration storage)
      await migrationFacet.setLegacyTotalSupply(legacyTotalSupply);
      await migrationFacet.setLegacyBalance(signer_B.address, legacyBalance_B);

      // Verify legacy state is set and new storage is empty before adjustBalances
      expect(await migrationFacet.getLegacyTotalSupply()).to.equal(legacyTotalSupply);
      expect(await migrationFacet.getLegacyBalance(signer_B.address)).to.equal(legacyBalance_B);
      expect(await migrationFacet.getNewTotalSupply()).to.equal(0n);
      expect(await migrationFacet.getNewBalance(signer_B.address)).to.equal(0n);

      // Call adjustBalances - triggers _adjustTotalSupply which calls _migrateTotalSupplyIfNeeded
      await asset.connect(signer_A).adjustBalances(1, 0);

      // Verify totalSupply has been migrated from legacy to new storage
      expect(await migrationFacet.getLegacyTotalSupply()).to.equal(0n);
      expect(await migrationFacet.getNewTotalSupply()).to.equal(BigInt(legacyTotalSupply));

      // Balance migration is lazy - signer_B's legacy balance is not migrated yet
      expect(await migrationFacet.getLegacyBalance(signer_B.address)).to.equal(legacyBalance_B);

      // Trigger lazy balance migration by issuing tokens to signer_B
      // issueByPartition calls _increaseBalance which calls _migrateBalanceIfNeeded
      await asset.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_2,
        tokenHolder: signer_B.address,
        value: newIssuanceAmount,
        data: "0x",
      });

      // Verify balance has been migrated and new tokens added on top
      expect(await migrationFacet.getLegacyBalance(signer_B.address)).to.equal(0n);
      expect(await migrationFacet.getNewBalance(signer_B.address)).to.equal(
        BigInt(legacyBalance_B) + BigInt(newIssuanceAmount),
      );
    });
  });
});
