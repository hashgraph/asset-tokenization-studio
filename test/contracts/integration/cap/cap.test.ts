// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ZERO, EMPTY_STRING, dateToUnixTimestamp, ATS_ROLES, RESOLVER_KEYS } from "@lib";
import { MAX_UINT256 } from "@test";
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

export function capTests(getCtx: () => AssetMockCtx): void {
  describe("Cap Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CAP, members: [signer_A.address] },
      ]);

      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_A).setMaxSupply(maxSupply * 2);
    });

    it("GIVEN setting 0 to max supply WHEN trying to initialize THEN transaction fails", async () => {
      await asset.forceFacetNotRegistered(RESOLVER_KEYS.cap);
      await expect(asset.initializeCap(0, [])).to.be.revertedWithCustomError(asset, "NewMaxSupplyCannotBeZero");
    });

    describe("initializeCap", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeCap is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeCap(5, []))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeCap is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeCap(5, [])).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
      });
    });

    describe("initializeCap event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeCap is called THEN emits CapInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.cap);
        await expect(asset.initializeCap(5, [])).to.emit(asset, "CapInitialized");
      });
    });

    describe("Paused", () => {
      beforeEach(async () => {
        await asset.connect(signer_B).pause();
      });

      it("GIVEN a paused Token WHEN setMaxSupply THEN transaction fails with IsPaused", async () => {
        await expect(asset.connect(signer_C).setMaxSupply(maxSupply)).to.be.revertedWithCustomError(asset, "IsPaused");
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without cap role WHEN setMaxSupply THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).setMaxSupply(maxSupply)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });
    });

    describe("New Max Supply Too low or 0", () => {
      it("GIVEN a token WHEN setMaxSupply to 0 THEN transaction fails with NewMaxSupplyCannotBeZero", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CAP, signer_C.address);

        await expect(asset.connect(signer_C).setMaxSupply(0)).to.be.revertedWithCustomError(
          asset,
          "NewMaxSupplyCannotBeZero",
        );
      });

      it("GIVEN a token WHEN setMaxSupply a value that is less than the current total supply THEN transaction fails with NewMaxSupplyTooLow", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CAP, signer_C.address);

        await asset.connect(signer_C).issueByPartition({
          partition: _PARTITION_ID_1,
          tokenHolder: signer_A.address,
          value: maxSupply * 2,
          data: "0x",
        });

        await expect(asset.connect(signer_C).setMaxSupply(maxSupply)).to.be.revertedWithCustomError(
          asset,
          "NewMaxSupplyTooLow",
        );
      });
    });

    describe("New Max Supply OK", () => {
      it("GIVEN a token WHEN setMaxSupply THEN transaction succeeds", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CAP, signer_C.address);

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
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CAP, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_A.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);

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

        await asset.changeSystemTimestamp(adjustments[0].executionDate + 1);

        await expect(asset.setMaxSupply(maxSupplyByPartition)).to.be.revertedWithCustomError(
          asset,
          "NewMaxSupplyTooLow",
        );
      });

      it("GIVEN a token WHEN max supply and partition max supply are set THEN balance adjustments occur and resetting partition max supply fails with NewMaxSupplyForPartitionTooLow", async () => {
        const currentTime = dateToUnixTimestamp(`2030-01-01T00:00:00Z`);
        const adjustments = createAdjustmentData(currentTime, [TIME / 1000], [5], [0]);

        await setupScheduledBalanceAdjustments(adjustments);

        await asset.changeSystemTimestamp(adjustments[0].executionDate + 1);

        await expect(
          asset.setMaxSupplyByPartition(_PARTITION_ID_1, maxSupplyByPartition),
        ).to.be.revertedWithCustomError(asset, "NewMaxSupplyForPartitionTooLow");
      });

      it("GIVEN a token with max supply equal to MAX_UINT THEN balance adjustment occurs but max supply remains unchanged", async () => {
        const adjustmentFactor = 2n;

        await asset.setMaxSupply(MAX_UINT256 / adjustmentFactor);
        await asset.setMaxSupplyByPartition(_PARTITION_ID_1, MAX_UINT256 / adjustmentFactor);

        const currentTime = dateToUnixTimestamp(`2030-01-01T00:00:00Z`);
        const adjustments = createAdjustmentData(currentTime, [TIME / 1000], [Number(adjustmentFactor + 1n)], [0]);
        await setupScheduledBalanceAdjustments(adjustments);

        await asset.changeSystemTimestamp(adjustments[0].executionDate + 1);

        const maxSupplyAfter = await asset.getMaxSupply();
        const maxSupplyByPartitionAfter = await asset.getMaxSupplyByPartition(_PARTITION_ID_1);

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

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN setMaxSupply THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).setMaxSupply(0)).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN setMaxSupply THEN reverts with AssetNotOperational", async () => {
        await expect(asset.setMaxSupply(0)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
