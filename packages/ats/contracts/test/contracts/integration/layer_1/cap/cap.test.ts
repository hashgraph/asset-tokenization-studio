// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ZERO, EMPTY_STRING, dateToUnixTimestamp, ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const maxSupply = 3;
const maxSupplyByPartition = 2;
const issueAmount = 2;
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
const TIME = 6000;
const EMPTY_VC_ID = EMPTY_STRING;

interface Adjustment {
  executionDate: string;
  factor: number;
  decimals: number;
}

describe("Cap Tests", () => {
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
          maxSupply: maxSupply * 2,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.CAP_ROLE,
        members: [signer_A.address],
      },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureMultiPartition);
  });

  it("GIVEN setting 0 to max supply WHEN trying to initialize THEN transaction fails", async () => {
    await expect(
      deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
            maxSupply: 0,
          },
        },
      }),
    ).to.be.revertedWithCustomError(asset, "NewMaxSupplyCannotBeZero");
  });

  it("GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized", async () => {
    await expect(asset.initialize_Cap(5, [])).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
  });

  describe("Paused", () => {
    beforeEach(async () => {
      // Pausing the token
      await asset.connect(signer_B).pause();
    });

    it("GIVEN a paused Token WHEN setMaxSupply THEN transaction fails with TokenIsPaused", async () => {
      // transfer with data fails
      await expect(asset.connect(signer_C).setMaxSupply(maxSupply)).to.be.revertedWithCustomError(
        asset,
        "TokenIsPaused",
      );
    });
  });

  describe("AccessControl", () => {
    it("GIVEN an account without cap role WHEN setMaxSupply THEN transaction fails with AccountHasNoRole", async () => {
      // add to list fails
      await expect(asset.connect(signer_C).setMaxSupply(maxSupply)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });
  });

  describe("New Max Supply Too low or 0", () => {
    it("GIVEN a token WHEN setMaxSupply to 0 THEN transaction fails with NewMaxSupplyCannotBeZero", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CAP_ROLE, signer_C.address);

      // add to list fails
      await expect(asset.connect(signer_C).setMaxSupply(0)).to.be.revertedWithCustomError(
        asset,
        "NewMaxSupplyCannotBeZero",
      );
    });
    it("GIVEN a token WHEN setMaxSupply a value that is less than the current total supply THEN transaction fails with NewMaxSupplyTooLow", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.CAP_ROLE, signer_C.address);

      await asset.connect(signer_C).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: maxSupply * 2,
        data: "0x",
      });

      // add to list fails
      await expect(asset.connect(signer_C).setMaxSupply(maxSupply)).to.be.revertedWithCustomError(
        asset,
        "NewMaxSupplyTooLow",
      );
    });
  });

  describe("New Max Supply OK", () => {
    it("GIVEN a token WHEN setMaxSupply THEN transaction succeeds", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CAP_ROLE, signer_C.address);

      await expect(asset.connect(signer_C).setMaxSupply(maxSupply * 4))
        .to.emit(asset, "MaxSupplySet")
        .withArgs(signer_C.address, maxSupply * 4, maxSupply * 2);

      const currentMaxSupply = await asset.getMaxSupply();

      expect(currentMaxSupply).to.equal(maxSupply * 4);
    });
  });

  describe("Adjust balances", () => {
    beforeEach(async () => {
      await setPreBalanceAdjustment();
    });

    const setupScheduledBalanceAdjustments = async (adjustments: Adjustment[]) => {
      for (const adjustment of adjustments) {
        await asset.connect(signer_C).setScheduledBalanceAdjustment(adjustment);
      }
    };

    const createAdjustmentData = (
      currentTime: number,
      intervals: number[],
      factors: number[],
      decimals: number[],
    ): Adjustment[] => {
      return intervals.map((interval, index) => ({
        executionDate: (currentTime + interval).toString(),
        factor: factors[index],
        decimals: decimals[index],
      }));
    };

    const testBalanceAdjustments = async (adjustments: Adjustment[], expectedFactors: number[]) => {
      await setupScheduledBalanceAdjustments(adjustments);

      // Execute adjustments and verify
      for (let i = 0; i < adjustments.length; i++) {
        await asset.changeSystemTimestamp(dateToUnixTimestamp(`2030-01-01T00:00:00Z`) + ((i + 1) * TIME) / 1000 + 1);
        await asset.connect(signer_A).takeSnapshot();
      }

      const currentMaxSupply = await asset.getMaxSupply();
      const currentMaxSupplyByPartition_1 = await asset.getMaxSupplyByPartition(_PARTITION_ID_1);

      const adjustmentFactor = expectedFactors.reduce((acc, val) => acc * val, 1);
      expect(currentMaxSupply).to.equal(maxSupply * adjustmentFactor);
      expect(currentMaxSupplyByPartition_1).to.equal(maxSupplyByPartition * adjustmentFactor);
    };

    async function setPreBalanceAdjustment() {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CAP_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.SNAPSHOT_ROLE, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);

      await asset.connect(signer_C).setMaxSupply(maxSupply);
      await asset.connect(signer_C).setMaxSupplyByPartition(_PARTITION_ID_1, maxSupplyByPartition);

      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_C).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_C.address,
        value: issueAmount,
        data: "0x",
      });
    }

    it("GIVEN a token WHEN getMaxSupply or getMaxSupplyByPartition THEN balance adjustments are included", async () => {
      const adjustments = createAdjustmentData(
        dateToUnixTimestamp("2030-01-01T00:00:00Z"),
        [TIME / 1000, (2 * TIME) / 1000, (3 * TIME) / 1000],
        [5, 6, 7],
        [2, 0, 1],
      );
      const currentMaxSupplyByPartition_2 = await asset.getMaxSupplyByPartition(_PARTITION_ID_2);
      expect(currentMaxSupplyByPartition_2).to.equal(0);
      await testBalanceAdjustments(adjustments, [5, 6, 7]);
    });

    it("GIVEN a token WHEN setMaxSupply THEN balance adjustments are included", async () => {
      const currentTime = dateToUnixTimestamp(`2030-01-01T00:00:00Z`);
      const adjustments = createAdjustmentData(currentTime, [TIME / 1000], [5], [0]);

      await setupScheduledBalanceAdjustments(adjustments);

      // Execute adjustments and verify reversion case
      await asset.changeSystemTimestamp(adjustments[0].executionDate + 1);

      await expect(asset.setMaxSupply(maxSupplyByPartition)).to.be.revertedWithCustomError(asset, "NewMaxSupplyTooLow");
    });

    it("GIVEN a token WHEN max supply and partition max supply are set THEN balance adjustments occur and resetting partition max supply fails with NewMaxSupplyForPartitionTooLow", async () => {
      // scheduled balance adjustments
      const currentTime = dateToUnixTimestamp(`2030-01-01T00:00:00Z`);
      const adjustments = createAdjustmentData(currentTime, [TIME / 1000], [5], [0]);

      await setupScheduledBalanceAdjustments(adjustments);
      //-------------------------
      // wait for first balance adjustment
      await asset.changeSystemTimestamp(adjustments[0].executionDate + 1);

      // Attempt to change the max supply by partition with the same value as before
      await expect(asset.setMaxSupplyByPartition(_PARTITION_ID_1, maxSupplyByPartition)).to.be.revertedWithCustomError(
        asset,
        "NewMaxSupplyForPartitionTooLow",
      );
    });

    it("GIVEN a token with max supply equal to MAX_UINT THEN balance adjustment occurs but max supply remains unchanged", async () => {
      const adjustmentFactor = 2n;

      // Before
      await asset.setMaxSupply(MAX_UINT256 / adjustmentFactor);
      await asset.setMaxSupplyByPartition(_PARTITION_ID_1, MAX_UINT256 / adjustmentFactor);

      // First adjustment
      const currentTime = dateToUnixTimestamp(`2030-01-01T00:00:00Z`);
      const adjustments = createAdjustmentData(currentTime, [TIME / 1000], [Number(adjustmentFactor + 1n)], [0]);
      await setupScheduledBalanceAdjustments(adjustments);

      await asset.changeSystemTimestamp(adjustments[0].executionDate + 1);

      const maxSupplyAfter = await asset.getMaxSupply();
      const maxSupplyByPartitionAfter = await asset.getMaxSupplyByPartition(_PARTITION_ID_1);

      // Second adjustment
      const currentTime_2 = parseInt(adjustments[0].executionDate + 2);
      const adjustments_2 = createAdjustmentData(currentTime_2, [TIME / 1000], [5], [1]);
      await setupScheduledBalanceAdjustments(adjustments_2);

      await asset.changeSystemTimestamp(adjustments_2[0].executionDate + 1);

      const maxSupplyAfter_2 = await asset.getMaxSupply();
      const maxSupplyByPartitionAfter_2 = await asset.getMaxSupplyByPartition(_PARTITION_ID_1);

      expect(maxSupplyAfter).to.equal(MAX_UINT256);
      expect(maxSupplyByPartitionAfter).to.equal(MAX_UINT256);
      expect(maxSupplyAfter_2).to.equal(MAX_UINT256);
      expect(maxSupplyByPartitionAfter_2).to.equal(MAX_UINT256);
    });
  });
});
