// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ResolverProxy, type IAsset } from "@contract-types";
import { DEFAULT_PARTITION, ATS_ROLES, TIME_PERIODS_S, ADDRESS_ZERO, ZERO, EMPTY_STRING } from "@scripts";
import { SecurityType } from "@scripts/domain";
import { getBondDetails, getDltTimestamp, grantRoleAndPauseToken } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";

const numberOfUnits = 1000;
let startingDate = 0;
const numberOfCoupons = 50;
const frequency = TIME_PERIODS_S.DAY;
let maturityDate = 0;
const amount = numberOfUnits;
const _PARTITION_ID = "0x0000000000000000000000000000000000000000000000000000000000000002";

const EMPTY_VC_ID = EMPTY_STRING;
const DECIMALS = 6;

describe("Bond Tests", () => {
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
        role: ATS_ROLES._FREEZE_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._MATURITY_REDEEMER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._CONTROL_LIST_ROLE,
        members: [signer_D.address],
      },
      {
        role: ATS_ROLES._CLEARING_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._PROTECTED_PARTITIONS_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._AGENT_ROLE,
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

  describe("Initialization", () => {
    it("GIVEN a bond variable rate WHEN deployed THEN securityType is BOND_VARIABLE_RATE", async () => {
      const metadata = await asset.getERC20Metadata();
      expect(metadata.securityType).to.be.equal(SecurityType.BOND_VARIABLE_RATE);
    });

    it("GIVEN an initialized bond WHEN trying to initialize again THEN transaction fails with AlreadyInitialized", async () => {
      const regulationData = {
        regulationType: 1, // REG_S
        regulationSubType: 0, // NONE
        dealSize: 0,
        accreditedInvestors: 1, // ACCREDITATION_REQUIRED
        maxNonAccreditedInvestors: 0,
        manualInvestorVerification: 1, // VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED
        internationalInvestors: 1, // ALLOWED
        resaleHoldPeriod: 0, // NOT_APPLICABLE
      };

      const additionalSecurityData = {
        countriesControlListType: false,
        listOfCountries: "",
        info: "",
      };
      await expect(
        asset.connect(signer_A)._initialize_bondUSA(await getBondDetails(), regulationData, additionalSecurityData),
      ).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
    });
  });

  describe("Single Partition", () => {
    it("GIVEN token holder WHEN getting principal For THEN succeeds", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      const principalFor = await asset.getPrincipalFor(signer_A.address);
      const bondDetails = await asset.getBondDetails();

      expect(principalFor.numerator).to.equal(bondDetails.nominalValue * BigInt(amount));
      expect(principalFor.denominator).to.equal(10n ** (bondDetails.nominalValueDecimals + BigInt(DECIMALS)));
    });

    describe("Redeem At Maturity", () => {
      it("GIVEN a zero address as token holder WHEN redeeming at maturity THEN transaction fails with ZeroAddressNotAllowed", async () => {
        await expect(
          asset.connect(signer_A).redeemAtMaturityByPartition(ADDRESS_ZERO, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");

        await expect(asset.connect(signer_A).fullRedeemAtMaturity(ADDRESS_ZERO)).to.be.revertedWithCustomError(
          asset,
          "ZeroAddressNotAllowed",
        );
      });

      it("GIVEN single partition mode WHEN redeeming from a non-default partition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        await expect(
          asset.connect(signer_A).redeemAtMaturityByPartition(signer_C.address, _PARTITION_ID, amount),
        ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
      });

      it("GIVEN the token holder account is blocked WHEN redeeming at maturity THEN transaction fails with AccountIsBlocked", async () => {
        await asset.connect(signer_D).addToControlList(signer_B.address);

        await expect(
          asset.connect(signer_A).redeemAtMaturityByPartition(signer_B.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");

        await expect(asset.connect(signer_A).fullRedeemAtMaturity(signer_B.address)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );
      });

      it("GIVEN the caller lacks the Maturity Redeemer role WHEN redeeming at maturity THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          asset.connect(signer_B).redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");

        await expect(asset.connect(signer_B).fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });
      it("GIVEN clearing is activated WHEN redeeming at maturity THEN transaction fails with ClearingIsActivated", async () => {
        await asset.connect(signer_A).activateClearing();

        await expect(
          asset.connect(signer_A).redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(asset, "ClearingIsActivated");

        await expect(asset.connect(signer_A).fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
          asset,
          "ClearingIsActivated",
        );
      });

      it("GIVEN the token is paused WHEN redeeming at maturity THEN transaction fails with TokenIsPaused", async () => {
        await grantRoleAndPauseToken(asset, ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A, signer_B, signer_C.address);

        await expect(
          asset.connect(signer_C).redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");

        await expect(asset.connect(signer_C).fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN the token holder lacks valid KYC status WHEN redeeming at maturity THEN transaction fails with InvalidKycStatus", async () => {
        await expect(
          asset.connect(signer_A).redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(asset, "InvalidKycStatus");

        await expect(asset.connect(signer_A).fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
          asset,
          "InvalidKycStatus",
        );
      });

      it("GIVEN the current date is before maturity WHEN redeeming at maturity THEN transaction fails with BondMaturityDateWrong", async () => {
        await expect(
          asset.connect(signer_A).redeemAtMaturityByPartition(signer_A.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(asset, "BondMaturityDateWrong");

        await expect(asset.connect(signer_A).fullRedeemAtMaturity(signer_A.address)).to.be.revertedWithCustomError(
          asset,
          "BondMaturityDateWrong",
        );
      });

      it("GIVEN a recovered wallet WHEN redeeming at maturity THEN transaction fails with WalletRecovered", async () => {
        await asset.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

        await expect(
          asset.connect(signer_A).redeemAtMaturityByPartition(signer_A.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");

        await expect(asset.connect(signer_A).fullRedeemAtMaturity(signer_A.address)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
      });

      it("GIVEN all conditions are met WHEN redeeming at maturity THEN transaction succeeds and emits RedeemedByPartition", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

        await asset.connect(signer_C).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await asset.changeSystemTimestamp(maturityDate + 1);

        await expect(asset.connect(signer_A).redeemAtMaturityByPartition(signer_A.address, DEFAULT_PARTITION, amount))
          .to.emit(asset, "RedeemedByPartition")
          .withArgs(DEFAULT_PARTITION, signer_A.address, signer_A.address, amount, "0x", "0x");
      });

      it("GIVEN all conditions are met WHEN redeeming all at maturity THEN transaction succeeds and emits RedeemedByPartition", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

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
    });

    describe("Multi Partition", () => {
      it("GIVEN token holder WHEN getting principal For THEN succeeds", async () => {
        await deploySecurityFixture(true);

        await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

        await asset.connect(signer_C).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await asset.connect(signer_C).issueByPartition({
          partition: _PARTITION_ID,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        const principalFor = await asset.getPrincipalFor(signer_A.address);
        const bondDetails = await asset.getBondDetails();

        expect(principalFor.numerator).to.equal(bondDetails.nominalValue * BigInt(amount) * 2n);
        expect(principalFor.denominator).to.equal(10n ** (bondDetails.nominalValueDecimals + BigInt(DECIMALS)));
      });

      it("GIVEN a new diamond contract with multi-partition WHEN redeemAtMaturityByPartition is called THEN transaction success", async () => {
        await deploySecurityFixture(true);
        await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
        await asset.connect(signer_C).issueByPartition({
          partition: _PARTITION_ID,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await asset.changeSystemTimestamp(maturityDate + 1);

        await expect(asset.connect(signer_A).redeemAtMaturityByPartition(signer_A.address, _PARTITION_ID, amount))
          .to.emit(asset, "RedeemedByPartition")
          .withArgs(_PARTITION_ID, signer_A.address, signer_A.address, amount, "0x", "0x");
      });

      it("GIVEN a new diamond contract with multi-partition WHEN redeemAtMaturityByPartition is called THEN transaction success", async () => {
        await deploySecurityFixture(true);
        await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
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
    describe("Uncovered Branch Tests", () => {
      it("GIVEN a token holder with zero balance WHEN fullRedeemAtMaturity is called THEN succeeds without redeeming", async () => {
        // Create a new user with no tokens
        const signers = await ethers.getSigners();
        const newUser = signers[10]; // Use a signer that hasn't been used yet

        // Grant KYC to new user
        await asset.connect(signer_B).grantKyc(newUser.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

        // Move time past maturity
        await asset.changeSystemTimestamp(maturityDate + TIME_PERIODS_S.DAY);

        // Call fullRedeemAtMaturity on account with zero balance (signer_A has _MATURITY_REDEEMER_ROLE)
        await expect(asset.connect(signer_A).fullRedeemAtMaturity(newUser.address)).to.not.be.reverted;
      });
    });
  });
});
