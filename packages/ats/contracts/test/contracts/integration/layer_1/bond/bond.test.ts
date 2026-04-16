// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  ResolverProxy,
  BondUSAFacet,
  AccessControl,
  Pause,
  type IERC1410,
  Kyc,
  SsiManagement,
  ControlList,
  ClearingActionsFacet,
  BondUSAReadFacet,
  TimeTravelFacet as TimeTravel,
  IERC3643,
} from "@contract-types";
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

  let bondFacet: BondUSAFacet;
  let bondReadFacet: BondUSAReadFacet;
  let accessControlFacet: AccessControl;
  let pauseFacet: Pause;
  let erc1410Facet: IERC1410;
  let timeTravelFacet: TimeTravel;
  let kycFacet: Kyc;
  let ssiManagementFacet: SsiManagement;
  let controlListFacet: ControlList;
  let clearingActionsFacet: ClearingActionsFacet;
  let erc3643Facet: IERC3643;

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

    await executeRbac(base.asset, [
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

    bondFacet = await ethers.getContractAt("BondUSAFacetTimeTravel", diamond.target, signer_A);
    bondReadFacet = await ethers.getContractAt("BondUSAReadFacetTimeTravel", diamond.target, signer_A);

    accessControlFacet = await ethers.getContractAt("AccessControl", diamond.target, signer_A);
    pauseFacet = await ethers.getContractAt("Pause", diamond.target, signer_A);

    erc1410Facet = await ethers.getContractAt("IERC1410", diamond.target, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.target, signer_A);
    kycFacet = await ethers.getContractAt("Kyc", diamond.target, signer_B);
    ssiManagementFacet = await ethers.getContractAt("SsiManagement", diamond.target, signer_A);
    erc3643Facet = await ethers.getContractAt("IERC3643", diamond.target);

    await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address);

    controlListFacet = await ethers.getContractAt("ControlList", diamond.target, signer_D);
    clearingActionsFacet = await ethers.getContractAt("ClearingActionsFacet", diamond.target, signer_A);

    await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
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
      const erc20Facet = await ethers.getContractAt("ERC20", diamond.target);
      const metadata = await erc20Facet.getERC20Metadata();
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
        bondFacet._initialize_bondUSA(await getBondDetails(), regulationData, additionalSecurityData),
      ).to.be.rejectedWith("AlreadyInitialized");
    });
  });

  describe("Single Partition", () => {
    it("GIVEN token holder WHEN getting principal For THEN succeeds", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      const principalFor = await bondReadFacet.getPrincipalFor(signer_A.address);
      const bondDetails = await bondReadFacet.getBondDetails();

      expect(principalFor.numerator).to.equal(bondDetails.nominalValue * BigInt(amount));
      expect(principalFor.denominator).to.equal(10n ** (bondDetails.nominalValueDecimals + BigInt(DECIMALS)));
    });

    describe("Redeem At Maturity", () => {
      it("GIVEN a zero address as token holder WHEN redeeming at maturity THEN transaction fails with ZeroAddressNotAllowed", async () => {
        await expect(
          bondFacet.redeemAtMaturityByPartition(ADDRESS_ZERO, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "ZeroAddressNotAllowed");

        await expect(bondFacet.fullRedeemAtMaturity(ADDRESS_ZERO)).to.be.revertedWithCustomError(
          bondFacet,
          "ZeroAddressNotAllowed",
        );
      });

      it("GIVEN single partition mode WHEN redeeming from a non-default partition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        await expect(
          bondFacet.redeemAtMaturityByPartition(signer_C.address, _PARTITION_ID, amount),
        ).to.be.revertedWithCustomError(bondFacet, "PartitionNotAllowedInSinglePartitionMode");
      });

      it("GIVEN the token holder account is blocked WHEN redeeming at maturity THEN transaction fails with AccountIsBlocked", async () => {
        await controlListFacet.addToControlList(signer_B.address);

        await expect(
          bondFacet.connect(signer_A).redeemAtMaturityByPartition(signer_B.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "AccountIsBlocked");

        await expect(bondFacet.connect(signer_A).fullRedeemAtMaturity(signer_B.address)).to.be.revertedWithCustomError(
          bondFacet,
          "AccountIsBlocked",
        );
      });

      it("GIVEN the caller lacks the Maturity Redeemer role WHEN redeeming at maturity THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          bondFacet.connect(signer_B).redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "AccountHasNoRole");

        await expect(bondFacet.connect(signer_B).fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
          bondFacet,
          "AccountHasNoRole",
        );
      });
      it("GIVEN clearing is activated WHEN redeeming at maturity THEN transaction fails with ClearingIsActivated", async () => {
        await clearingActionsFacet.activateClearing();

        await expect(
          bondFacet.redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "ClearingIsActivated");

        await expect(bondFacet.fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
          bondFacet,
          "ClearingIsActivated",
        );
      });

      it("GIVEN the token is paused WHEN redeeming at maturity THEN transaction fails with TokenIsPaused", async () => {
        await grantRoleAndPauseToken(
          accessControlFacet,
          pauseFacet,
          ATS_ROLES._CORPORATE_ACTION_ROLE,
          signer_A,
          signer_B,
          signer_C.address,
        );

        await expect(
          bondFacet.connect(signer_C).redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "TokenIsPaused");

        await expect(bondFacet.connect(signer_C).fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
          bondFacet,
          "TokenIsPaused",
        );
      });

      it("GIVEN the token holder lacks valid KYC status WHEN redeeming at maturity THEN transaction fails with InvalidKycStatus", async () => {
        await expect(
          bondFacet.redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "InvalidKycStatus");

        await expect(bondFacet.fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
          bondFacet,
          "InvalidKycStatus",
        );
      });

      it("GIVEN the current date is before maturity WHEN redeeming at maturity THEN transaction fails with BondMaturityDateWrong", async () => {
        await expect(
          bondFacet.redeemAtMaturityByPartition(signer_A.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "BondMaturityDateWrong");

        await expect(bondFacet.fullRedeemAtMaturity(signer_A.address)).to.be.revertedWithCustomError(
          bondFacet,
          "BondMaturityDateWrong",
        );
      });

      it("GIVEN a recovered wallet WHEN redeeming at maturity THEN transaction fails with WalletRecovered", async () => {
        await erc3643Facet.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

        await expect(
          bondFacet.redeemAtMaturityByPartition(signer_A.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "WalletRecovered");

        await expect(bondFacet.fullRedeemAtMaturity(signer_A.address)).to.be.revertedWithCustomError(
          bondFacet,
          "WalletRecovered",
        );
      });

      it("GIVEN all conditions are met WHEN redeeming at maturity THEN transaction succeeds and emits RedeemedByPartition", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

        await erc1410Facet.connect(signer_C).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await timeTravelFacet.changeSystemTimestamp(maturityDate + 1);

        await expect(bondFacet.redeemAtMaturityByPartition(signer_A.address, DEFAULT_PARTITION, amount))
          .to.emit(bondFacet, "RedeemedByPartition")
          .withArgs(DEFAULT_PARTITION, signer_A.address, signer_A.address, amount, "0x", "0x");
      });

      it("GIVEN all conditions are met WHEN redeeming all at maturity THEN transaction succeeds and emits RedeemedByPartition", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

        await erc1410Facet.connect(signer_C).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await timeTravelFacet.changeSystemTimestamp(maturityDate + 1);

        await expect(bondFacet.fullRedeemAtMaturity(signer_A.address))
          .to.emit(bondFacet, "RedeemedByPartition")
          .withArgs(DEFAULT_PARTITION, signer_A.address, signer_A.address, amount, "0x", "0x");
      });
    });

    describe("Multi Partition", () => {
      it("GIVEN token holder WHEN getting principal For THEN succeeds", async () => {
        await deploySecurityFixture(true);

        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

        await erc1410Facet.connect(signer_C).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await erc1410Facet.connect(signer_C).issueByPartition({
          partition: _PARTITION_ID,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        const principalFor = await bondReadFacet.getPrincipalFor(signer_A.address);
        const bondDetails = await bondReadFacet.getBondDetails();

        expect(principalFor.numerator).to.equal(bondDetails.nominalValue * BigInt(amount) * 2n);
        expect(principalFor.denominator).to.equal(10n ** (bondDetails.nominalValueDecimals + BigInt(DECIMALS)));
      });

      it("GIVEN a new diamond contract with multi-partition WHEN redeemAtMaturityByPartition is called THEN transaction success", async () => {
        await deploySecurityFixture(true);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
        await erc1410Facet.connect(signer_C).issueByPartition({
          partition: _PARTITION_ID,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await timeTravelFacet.changeSystemTimestamp(maturityDate + 1);

        await expect(bondFacet.redeemAtMaturityByPartition(signer_A.address, _PARTITION_ID, amount))
          .to.emit(bondFacet, "RedeemedByPartition")
          .withArgs(_PARTITION_ID, signer_A.address, signer_A.address, amount, "0x", "0x");
      });

      it("GIVEN a new diamond contract with multi-partition WHEN redeemAtMaturityByPartition is called THEN transaction success", async () => {
        await deploySecurityFixture(true);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
        await erc1410Facet.connect(signer_C).issueByPartition({
          partition: _PARTITION_ID,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        await erc1410Facet.connect(signer_C).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await timeTravelFacet.changeSystemTimestamp(maturityDate + 1);

        await expect(bondFacet.fullRedeemAtMaturity(signer_A.address))
          .to.emit(bondFacet, "RedeemedByPartition")
          .withArgs(_PARTITION_ID, signer_A.address, signer_A.address, amount, "0x", "0x")
          .to.emit(bondFacet, "RedeemedByPartition")
          .withArgs(DEFAULT_PARTITION, signer_A.address, signer_A.address, amount, "0x", "0x");
      });
    });
    describe("Uncovered Branch Tests", () => {
      it("GIVEN a token holder with zero balance WHEN fullRedeemAtMaturity is called THEN succeeds without redeeming", async () => {
        // Create a new user with no tokens
        const signers = await ethers.getSigners();
        const newUser = signers[10]; // Use a signer that hasn't been used yet

        // Grant KYC to new user
        await kycFacet.grantKyc(newUser.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

        // Move time past maturity
        await timeTravelFacet.changeSystemTimestamp(maturityDate + TIME_PERIODS_S.DAY);

        // Call fullRedeemAtMaturity on account with zero balance (signer_A has _MATURITY_REDEEMER_ROLE)
        await expect(bondFacet.connect(signer_A).fullRedeemAtMaturity(newUser.address)).to.not.be.reverted;
      });
    });
  });
});
