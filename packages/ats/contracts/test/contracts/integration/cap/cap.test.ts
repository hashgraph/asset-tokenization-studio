// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  type ResolverProxy,
  type IAsset,
  type IFactory,
  type BusinessLogicResolver,
  IAsset__factory,
} from "@contract-types";
import { ZERO, EMPTY_STRING, dateToUnixTimestamp, ATS_ROLES, GAS_LIMIT, EQUITY_CONFIG_ID } from "@scripts";
import { decodeEvent } from "@scripts/infrastructure";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256, getSecurityData, getEquityDetails, getRegulationData } from "@test";
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
  let factory: IFactory;
  let blr: BusinessLogicResolver;

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
    factory = base.factory as IFactory;
    blr = base.blr as BusinessLogicResolver;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.ROLE_PAUSER,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_KYC,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_SSI_MANAGER,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_CAP,
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

  describe("initializeCap", () => {
    it("GIVEN an already-initialised facet WHEN initializeCap is called again THEN it reverts with FacetAlreadyRegistered", async () => {
      await expect(asset.initializeCap(5, [])).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
    });

    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeCap is called THEN it reverts with AccountHasNoRole", async () => {
      // factory.deployProxy deploys the equity configuration without running any initializers,
      // giving us an uninitialised proxy where onlyFacetNotRegistered passes and onlyRole fires.
      const proxyTx = await factory.deployProxy(blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [signer_A.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(signer_C).initializeCap(5, [])).to.be.revertedWithCustomError(
        freshAsset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a new deployment WHEN the factory calls initializeCap THEN it emits CapInitialized", async () => {
      const equityData = {
        security: getSecurityData(blr, {
          isMultiPartition: true,
          maxSupply: maxSupply * 2,
          rbacs: [{ role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [signer_A.address] }],
        }),
        equityDetails: getEquityDetails(),
      };
      const tx = await factory.deployEquity(equityData, getRegulationData(), { gasLimit: GAS_LIMIT.high });
      const receipt = await tx.wait();
      const iface = IAsset__factory.createInterface();
      const event = receipt!.logs
        .map((log) => {
          try {
            return iface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e) => e?.name === "CapInitialized");
      expect(event).to.not.be.undefined;
      expect(event!.args.operator).to.equal(await factory.getAddress());
    });
  });

  describe("Paused", () => {
    beforeEach(async () => {
      // Pausing the token
      await asset.connect(signer_B).pause();
    });

    it("GIVEN a paused Token WHEN setMaxSupply THEN transaction fails with IsPaused", async () => {
      // transfer with data fails
      await expect(asset.connect(signer_C).setMaxSupply(maxSupply)).to.be.revertedWithCustomError(asset, "IsPaused");
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
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CAP, signer_C.address);

      // add to list fails
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

      // add to list fails
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

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN setMaxSupply THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).setMaxSupply(0)).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });
  });
});
