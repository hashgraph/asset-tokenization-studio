// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ResolverProxy, type IAsset } from "@contract-types";
import { DEFAULT_PARTITION, ATS_ROLES, TIME_PERIODS_S, ADDRESS_ZERO, ZERO, EMPTY_STRING } from "@scripts";
import { getDltTimestamp, grantRoleAndPauseToken, deployBondTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const numberOfUnits = 1000;
let startingDate = 0;
const numberOfCoupons = 50;
const frequency = TIME_PERIODS_S.DAY;
let maturityDate = 0;
const amount = numberOfUnits;
const _PARTITION_ID = "0x0000000000000000000000000000000000000000000000000000000000000002";

const EMPTY_VC_ID = EMPTY_STRING;

describe("Maturity Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let asset: IAsset;

  async function deploySecurityFixture(isMultiPartition = false) {
    const base = await deployBondTokenFixture({
      bondDataParams: {
        securityData: {
          isMultiPartition,
        },
        bondDetails: {
          startingDate: startingDate,
          maturityDate: maturityDate,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.FREEZE_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.MATURITY_REDEEMER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.CONTROL_LIST_ROLE,
        members: [signer_D.address],
      },
      {
        role: ATS_ROLES.CLEARING_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.PROTECTED_PARTITIONS_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.AGENT_ROLE,
        members: [signer_A.address],
      },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);

    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  before(async () => {
    const currentTimestamp = await getDltTimestamp();
    startingDate = currentTimestamp + TIME_PERIODS_S.DAY;
    maturityDate = startingDate + numberOfCoupons * frequency;
  });

  beforeEach(async () => {
    await loadFixture(deploySecurityFixture);
  });

  describe("fullRedeemAtMaturity", () => {
    it("GIVEN a zero address as token holder WHEN fullRedeemAtMaturity THEN reverts with ZeroAddressNotAllowed", async () => {
      await expect(asset.connect(signer_A).fullRedeemAtMaturity(ADDRESS_ZERO)).to.be.revertedWithCustomError(
        asset,
        "ZeroAddressNotAllowed",
      );
    });

    it("GIVEN the token holder account is blocked WHEN fullRedeemAtMaturity THEN reverts with AccountIsBlocked", async () => {
      await asset.connect(signer_D).addToControlList(signer_B.address);

      await expect(asset.connect(signer_A).fullRedeemAtMaturity(signer_B.address)).to.be.revertedWithCustomError(
        asset,
        "AccountIsBlocked",
      );
    });

    it("GIVEN the caller lacks MATURITY_REDEEMER_ROLE WHEN fullRedeemAtMaturity THEN reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_B).fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN clearing is activated WHEN fullRedeemAtMaturity THEN reverts with ClearingIsActivated", async () => {
      await asset.connect(signer_A).activateClearing();

      await expect(asset.connect(signer_A).fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
        asset,
        "ClearingIsActivated",
      );
    });

    it("GIVEN the token is paused WHEN fullRedeemAtMaturity THEN reverts with IsPaused", async () => {
      await grantRoleAndPauseToken(asset, ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A, signer_B, signer_C.address);

      await expect(asset.connect(signer_C).fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
        asset,
        "IsPaused",
      );
    });

    it("GIVEN the token holder lacks valid KYC status WHEN fullRedeemAtMaturity THEN reverts with InvalidKycStatus", async () => {
      await expect(asset.connect(signer_A).fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
        asset,
        "InvalidKycStatus",
      );
    });

    it("GIVEN the current date is before maturity WHEN fullRedeemAtMaturity THEN reverts with BondMaturityDateWrong", async () => {
      await expect(asset.connect(signer_A).fullRedeemAtMaturity(signer_A.address)).to.be.revertedWithCustomError(
        asset,
        "BondMaturityDateWrong",
      );
    });

    it("GIVEN a recovered wallet WHEN fullRedeemAtMaturity THEN reverts with WalletRecovered", async () => {
      await asset.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

      await expect(asset.connect(signer_A).fullRedeemAtMaturity(signer_A.address)).to.be.revertedWithCustomError(
        asset,
        "WalletRecovered",
      );
    });

    it("GIVEN all conditions are met WHEN fullRedeemAtMaturity THEN emits RedeemedByPartition", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);

      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await asset.changeSystemTimestamp(maturityDate + 1);

      await expect(asset.connect(signer_A).fullRedeemAtMaturity(signer_A.address))
        .to.emit(asset, "RedeemedByPartition")
        .withArgs(DEFAULT_PARTITION, signer_A.address, signer_A.address, amount, "0x", "0x");
    });

    it("GIVEN a token holder with zero balance WHEN fullRedeemAtMaturity THEN succeeds without redeeming", async () => {
      const signers = await ethers.getSigners();
      const newUser = signers[10];

      await asset.connect(signer_B).grantKyc(newUser.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.changeSystemTimestamp(maturityDate + TIME_PERIODS_S.DAY);

      await expect(asset.connect(signer_A).fullRedeemAtMaturity(newUser.address)).to.not.be.reverted;
    });

    it("GIVEN a zero-amount hold creation attempt WHEN createHoldByPartition THEN reverts with InvalidHoldAmount preventing ghost partition DoS on fullRedeemAtMaturity", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);
      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      const zeroAmountHold = {
        amount: 0,
        expirationTimestamp: maturityDate,
        escrow: signer_B.address,
        to: signer_C.address,
        data: "0x",
      };

      await expect(
        asset.connect(signer_A).createHoldByPartition(DEFAULT_PARTITION, zeroAmountHold),
      ).to.be.revertedWithCustomError(asset, "InvalidHoldAmount");
    });

    it("GIVEN a multi-partition token holder WHEN fullRedeemAtMaturity THEN emits RedeemedByPartition for each partition", async () => {
      await deploySecurityFixture(true);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);

      await asset.connect(signer_C).issueByPartition({
        partition: _PARTITION_ID,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await asset.changeSystemTimestamp(maturityDate + 1);

      await expect(asset.connect(signer_A).fullRedeemAtMaturity(signer_A.address))
        .to.emit(asset, "RedeemedByPartition")
        .withArgs(_PARTITION_ID, signer_A.address, signer_A.address, amount, "0x", "0x")
        .to.emit(asset, "RedeemedByPartition")
        .withArgs(DEFAULT_PARTITION, signer_A.address, signer_A.address, amount, "0x", "0x");
    });
  });

  describe("updateMaturityDate", () => {
    it("GIVEN the caller lacks BOND_MANAGER_ROLE WHEN updateMaturityDate THEN reverts with AccountHasNoRole", async () => {
      const maturityDateBefore = (await asset.getBondDetails()).maturityDate;
      const newMaturityDate = maturityDateBefore + 86400n;

      await expect(asset.connect(signer_C).updateMaturityDate(newMaturityDate)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
      const maturityDateAfter = (await asset.getBondDetails()).maturityDate;
      expect(maturityDateAfter).to.be.equal(maturityDateBefore);
    });

    it("GIVEN the token is paused WHEN updateMaturityDate THEN reverts with IsPaused", async () => {
      await grantRoleAndPauseToken(asset, ATS_ROLES.BOND_MANAGER_ROLE, signer_A, signer_B, signer_C.address);

      const maturityDateBefore = (await asset.getBondDetails()).maturityDate;
      const newMaturityDate = maturityDateBefore + 86400n;

      await expect(asset.connect(signer_C).updateMaturityDate(newMaturityDate)).to.be.revertedWithCustomError(
        asset,
        "IsPaused",
      );
      const maturityDateAfter = (await asset.getBondDetails()).maturityDate;
      expect(maturityDateAfter).to.be.equal(maturityDateBefore);
    });

    it("GIVEN a new date earlier than current maturity WHEN updateMaturityDate THEN reverts with BondMaturityDateWrong", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.BOND_MANAGER_ROLE, signer_C.address);
      const maturityDateBefore = (await asset.getBondDetails()).maturityDate;
      const dayBeforeCurrentMaturity = maturityDateBefore - 86400n;

      await expect(asset.connect(signer_C).updateMaturityDate(dayBeforeCurrentMaturity)).to.be.revertedWithCustomError(
        asset,
        "BondMaturityDateWrong",
      );
      const maturityDateAfter = (await asset.getBondDetails()).maturityDate;
      expect(maturityDateAfter).to.be.equal(maturityDateBefore);
    });

    it("GIVEN BOND_MANAGER_ROLE and a valid future date WHEN updateMaturityDate THEN emits MaturityDateUpdated and persists new date", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.BOND_MANAGER_ROLE, signer_C.address);
      const maturityDateBefore = (await asset.getBondDetails()).maturityDate;
      const newMaturityDate = maturityDateBefore + 86400n;

      await expect(asset.connect(signer_C).updateMaturityDate(newMaturityDate))
        .to.emit(asset, "MaturityDateUpdated")
        .withArgs(asset.target, newMaturityDate, maturityDateBefore);

      const maturityDateAfter = (await asset.getBondDetails()).maturityDate;
      expect(maturityDateAfter).not.to.be.equal(maturityDateBefore);
      expect(maturityDateAfter).to.be.equal(newMaturityDate);
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN fullRedeemAtMaturity THEN transaction fails with Deactivated", async () => {
      const base = await deployBondTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.DEACTIVATE_ROLE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).fullRedeemAtMaturity(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN updateMaturityDate THEN transaction fails with Deactivated", async () => {
      const base = await deployBondTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.DEACTIVATE_ROLE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).updateMaturityDate(0)).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });
  });

  describe("initializeMaturity", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixture);
    });

    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeMaturity is called THEN it reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeMaturity()).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    describe("when already initialised", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).initializeMaturity();
      });

      it("GIVEN an already-initialised facet WHEN initializeMaturity is called again THEN it reverts with FacetAlreadyRegistered", async () => {
        await expect(asset.connect(signer_A).initializeMaturity()).to.be.revertedWithCustomError(
          asset,
          "FacetAlreadyRegistered",
        );
      });
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeMaturity is called THEN it emits MaturityInitialized", async () => {
      await expect(asset.connect(signer_A).initializeMaturity()).to.emit(asset, "MaturityInitialized");
    });
  });
});
