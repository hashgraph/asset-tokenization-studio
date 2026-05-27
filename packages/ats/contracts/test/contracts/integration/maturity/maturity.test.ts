// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ResolverProxy, type IAsset, MockDiamondCut } from "@contract-types";
import {
  DEFAULT_PARTITION,
  ATS_ROLES,
  TIME_PERIODS_S,
  ADDRESS_ZERO,
  ZERO,
  EMPTY_STRING,
  MATURITY_RESOLVER_KEY,
} from "@scripts";
import { grantRoleAndPauseToken, deployBondTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const numberOfUnits = 1000;
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
  let mockDiamondCut: MockDiamondCut;

  async function deploySecurityFixture(multiPartition = false) {
    const base = await deployBondTokenFixture(
      multiPartition ? { bondDataParams: { securityData: { isMultiPartition: true } } } : undefined,
    );
    diamond = base.diamond;
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    maturityDate = Number((await asset.getBondDetails()).maturityDate);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.ROLE_FREEZE_MANAGER,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_PAUSER,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_KYC,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_MATURITY_REDEEMER,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_SSI_MANAGER,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_CONTROL_LIST,
        members: [signer_D.address],
      },
      {
        role: ATS_ROLES.ROLE_CLEARING,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_PROTECTED_PARTITIONS,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_AGENT,
        members: [signer_A.address],
      },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);

    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

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

    it("GIVEN the caller lacks ROLE_MATURITY_REDEEMER WHEN fullRedeemAtMaturity THEN reverts with AccountHasNoRole", async () => {
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
      await grantRoleAndPauseToken(asset, ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A, signer_B, signer_C.address);

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
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);

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
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);
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
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);

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
    it("GIVEN the caller lacks ROLE_BOND_MANAGER WHEN updateMaturityDate THEN reverts with AccountHasNoRole", async () => {
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
      await grantRoleAndPauseToken(asset, ATS_ROLES.ROLE_BOND_MANAGER, signer_A, signer_B, signer_C.address);

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
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_BOND_MANAGER, signer_C.address);
      const maturityDateBefore = (await asset.getBondDetails()).maturityDate;
      const dayBeforeCurrentMaturity = maturityDateBefore - 86400n;

      await expect(asset.connect(signer_C).updateMaturityDate(dayBeforeCurrentMaturity)).to.be.revertedWithCustomError(
        asset,
        "BondMaturityDateWrong",
      );
      const maturityDateAfter = (await asset.getBondDetails()).maturityDate;
      expect(maturityDateAfter).to.be.equal(maturityDateBefore);
    });

    it("GIVEN ROLE_BOND_MANAGER and a valid future date WHEN updateMaturityDate THEN emits MaturityDateUpdated and persists new date", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_BOND_MANAGER, signer_C.address);
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
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).fullRedeemAtMaturity(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN updateMaturityDate THEN transaction fails with Deactivated", async () => {
      const base = await deployBondTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).updateMaturityDate(0)).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });
  });

  describe("initializeMaturity", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeMaturity is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeMaturity())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeMaturity is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeMaturity())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(MATURITY_RESOLVER_KEY, 1);
    });
  });

  describe("initializeMaturity event", () => {
    it("GIVEN a fresh deployment WHEN initializeMaturity is called THEN emits MaturityInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(MATURITY_RESOLVER_KEY);
      await expect(asset.initializeMaturity()).to.emit(asset, "MaturityInitialized");
    });
  });
  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational asset WHEN fullRedeemAtMaturity THEN reverts with AssetNotOperational", async () => {
      await expect(asset.fullRedeemAtMaturity(ADDRESS_ZERO)).to.be.revertedWithCustomError(
        asset,
        "AssetNotOperational",
      );
    });

    it("GIVEN non-operational asset WHEN updateMaturityDate THEN reverts with AssetNotOperational", async () => {
      await expect(asset.updateMaturityDate(0)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
    });
  });
});
