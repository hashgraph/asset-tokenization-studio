import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import {
  type ResolverProxy,
  type Pause,
  type ERC1594,
  type AccessControl,
  type ControlList,
  type IERC1410,
  ERC20,
  Kyc,
  SsiManagement,
  ClearingActionsFacet,
} from "@contract-types";
import { deployEquityTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { EMPTY_STRING, ZERO, EIP1066_CODES, DEFAULT_PARTITION, ATS_ROLES } from "@scripts";
import { getSelector } from "@scripts/infrastructure";
const AMOUNT = 1000;
const BALANCE_OF_C_ORIGINAL = 2 * AMOUNT;
const DATA = "0x1234";
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("ERC1594 Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: SignerWithAddress;
  let signer_B: SignerWithAddress;
  let signer_C: SignerWithAddress;
  let signer_D: SignerWithAddress;
  let signer_E: SignerWithAddress;

  let erc1594Facet: ERC1594;
  let accessControlFacet: AccessControl;
  let pauseFacet: Pause;
  let controlList: ControlList;
  let kycFacet: Kyc;
  let ssiManagementFacet: SsiManagement;
  let clearingActionsFacet: ClearingActionsFacet;

  describe("Multi partition mode", () => {
    async function deploySecurityFixtureMultiPartition() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
            internalKycActivated: true,
          },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;
      signer_E = base.user4;

      await executeRbac(base.accessControlFacet, [
        {
          role: ATS_ROLES._PAUSER_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._CLEARING_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._KYC_ROLE,
          members: [signer_B.address],
        },
      ]);
      accessControlFacet = await ethers.getContractAt("AccessControl", diamond.address);

      erc1594Facet = await ethers.getContractAt("ERC1594", diamond.address);

      pauseFacet = await ethers.getContractAt("Pause", diamond.address);

      controlList = await ethers.getContractAt("ControlList", diamond.address);

      clearingActionsFacet = await ethers.getContractAt("ClearingActionsFacet", diamond.address, signer_B);
      kycFacet = await ethers.getContractAt("Kyc", diamond.address, signer_B);

      accessControlFacet = accessControlFacet.connect(signer_A);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);
    });

    it("GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized", async () => {
      await expect(erc1594Facet.initialize_ERC1594()).to.be.rejectedWith("AlreadyInitialized");
    });

    describe("NotAllowedInMultiPartitionMode", () => {
      it("GIVEN an initialized token WHEN transferWithData THEN fails with NotAllowedInMultiPartitionMode", async () => {
        // transfer with data fails
        await expect(
          erc1594Facet.connect(signer_C).transferWithData(signer_D.address, 2 * BALANCE_OF_C_ORIGINAL, DATA),
        ).to.be.revertedWithCustomError(erc1594Facet, "NotAllowedInMultiPartitionMode");
      });

      it("GIVEN an initialized token WHEN transferFromWithData THEN fails with NotAllowedInMultiPartitionMode", async () => {
        // transfer with data fails
        await expect(
          erc1594Facet
            .connect(signer_C)
            .transferFromWithData(signer_B.address, signer_D.address, 2 * BALANCE_OF_C_ORIGINAL, DATA),
        ).to.be.revertedWithCustomError(erc1594Facet, "NotAllowedInMultiPartitionMode");
      });

      it("GIVEN an initialized token WHEN issue THEN fails with NotAllowedInMultiPartitionMode", async () => {
        // transfer with data fails
        expect(await erc1594Facet.connect(signer_A).isIssuable()).to.be.true;
        await expect(
          erc1594Facet.connect(signer_A).issue(signer_D.address, 2 * BALANCE_OF_C_ORIGINAL, DATA),
        ).to.be.revertedWithCustomError(erc1594Facet, "NotAllowedInMultiPartitionMode");
      });

      it("GIVEN an initialized token WHEN redeem THEN fails with NotAllowedInMultiPartitionMode", async () => {
        // transfer with data fails
        await expect(
          erc1594Facet.connect(signer_C).redeem(2 * BALANCE_OF_C_ORIGINAL, DATA),
        ).to.be.revertedWithCustomError(erc1594Facet, "NotAllowedInMultiPartitionMode");
      });

      it("GIVEN an initialized token WHEN redeemFrom THEN fails with NotAllowedInMultiPartitionMode", async () => {
        // transfer with data fails
        await expect(
          erc1594Facet.connect(signer_C).redeemFrom(signer_D.address, 2 * BALANCE_OF_C_ORIGINAL, DATA),
        ).to.be.revertedWithCustomError(erc1594Facet, "NotAllowedInMultiPartitionMode");
      });

      it("GIVEN an initialized token WHEN canTransfer THEN fails with NotAllowedInMultiPartitionMode", async () => {
        // transfer with data fails
        await expect(
          erc1594Facet.connect(signer_C).canTransfer(signer_D.address, 2 * BALANCE_OF_C_ORIGINAL, DATA),
        ).to.revertedWithCustomError(erc1594Facet, "NotAllowedInMultiPartitionMode");
      });

      it("GIVEN an initialized token WHEN canTransferFrom THEN fails with NotAllowedInMultiPartitionMode", async () => {
        // transfer with data fails
        await expect(
          erc1594Facet
            .connect(signer_C)
            .canTransferFrom(signer_B.address, signer_D.address, 2 * BALANCE_OF_C_ORIGINAL, DATA),
        ).to.revertedWithCustomError(erc1594Facet, "NotAllowedInMultiPartitionMode");
      });
    });
  });

  describe("Single partition mode", () => {
    let erc1594Issuer: ERC1594;
    let erc1594Transferor: ERC1594;
    let erc1594Approved: ERC1594;
    let erc1410SnapshotFacet: IERC1410;
    let erc20Facet: ERC20;

    async function deploySecurityFixtureSinglePartition() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            internalKycActivated: true,
            maxSupply: MAX_SUPPLY,
          },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;
      signer_E = base.user4;
      await executeRbac(base.accessControlFacet, [
        {
          role: ATS_ROLES._PAUSER_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._ISSUER_ROLE,
          members: [signer_C.address],
        },
        {
          role: ATS_ROLES._KYC_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._SSI_MANAGER_ROLE,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES._CLEARING_ROLE,
          members: [signer_B.address],
        },
      ]);

      accessControlFacet = await ethers.getContractAt("AccessControl", diamond.address);

      erc1594Facet = await ethers.getContractAt("ERC1594", diamond.address);
      erc1594Issuer = erc1594Facet.connect(signer_C);
      erc1594Transferor = erc1594Facet.connect(signer_E);
      erc1594Approved = erc1594Facet.connect(signer_D);
      erc20Facet = await ethers.getContractAt("ERC20", diamond.address, signer_E);
      erc1410SnapshotFacet = await ethers.getContractAt("IERC1410", diamond.address);

      pauseFacet = await ethers.getContractAt("Pause", diamond.address);

      controlList = await ethers.getContractAt("ControlList", diamond.address);

      kycFacet = await ethers.getContractAt("Kyc", diamond.address, signer_B);
      ssiManagementFacet = await ethers.getContractAt("SsiManagement", diamond.address, signer_A);

      accessControlFacet = accessControlFacet.connect(signer_A);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
      await ssiManagementFacet.addIssuer(signer_E.address);
      await kycFacet.grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await kycFacet.grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      clearingActionsFacet = await ethers.getContractAt("ClearingActionsFacet", diamond.address, signer_B);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });
    describe("Cap", () => {
      it("GIVEN a max supply WHEN issue more than the max supply THEN transaction fails with MaxSupplyReached", async () => {
        // add to list fails
        await expect(erc1594Facet.connect(signer_A).issue(signer_E.address, MAX_SUPPLY + 1, DATA)).to.be.rejectedWith(
          "MaxSupplyReached",
        );
      });
    });

    describe("ControlList", () => {
      it("GIVEN blocked accounts (sender, to, from) WHEN transfer THEN transaction fails with AccountIsBlocked", async () => {
        // Blacklisting accounts

        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROL_LIST_ROLE, signer_A.address);
        await controlList.connect(signer_A).addToControlList(signer_C.address);

        // transfer with data fails
        await expect(
          erc1594Facet.connect(signer_C).transferWithData(signer_D.address, AMOUNT, DATA),
        ).to.be.rejectedWith("AccountIsBlocked");

        // transfer from with data fails
        await expect(
          erc1594Facet.connect(signer_C).transferFromWithData(signer_E.address, signer_D.address, AMOUNT, DATA),
        ).to.be.rejectedWith("AccountIsBlocked");

        // Update blacklist
        await controlList.connect(signer_A).removeFromControlList(signer_C.address);
        await controlList.connect(signer_A).addToControlList(signer_D.address);

        // transfer with data fails
        await expect(
          erc1594Facet.connect(signer_C).transferWithData(signer_D.address, AMOUNT, DATA),
        ).to.be.rejectedWith("AccountIsBlocked");

        // transfer from with data fails
        await expect(
          erc1594Facet.connect(signer_C).transferFromWithData(signer_E.address, signer_D.address, AMOUNT, DATA),
        ).to.be.rejectedWith("AccountIsBlocked");

        // Update blacklist
        await controlList.connect(signer_A).removeFromControlList(signer_D.address);
        await controlList.connect(signer_A).addToControlList(signer_E.address);

        // transfer from with data fails
        await expect(
          erc1594Facet.connect(signer_C).transferFromWithData(signer_E.address, signer_D.address, AMOUNT, DATA),
        ).to.be.rejectedWith("AccountIsBlocked");
      });

      it("GIVEN blocked accounts (to) USING WHITELIST WHEN issue THEN transaction fails with AccountIsBlocked", async () => {
        // First deploy a new token using white list
        const newTokenFixture = await deployEquityTokenFixture({
          equityDataParams: {
            securityData: {
              internalKycActivated: true,
              isWhiteList: true,
            },
          },
        });

        // accounts are blacklisted by default (white list)
        await accessControlFacet
          .attach(newTokenFixture.diamond.address)
          .connect(signer_A)
          .grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await accessControlFacet
          .attach(newTokenFixture.diamond.address)
          .connect(signer_A)
          .grantRole(ATS_ROLES._KYC_ROLE, signer_B.address);
        await accessControlFacet
          .attach(newTokenFixture.diamond.address)
          .connect(signer_A)
          .grantRole(ATS_ROLES._SSI_MANAGER_ROLE, signer_A.address);

        await ssiManagementFacet.attach(newTokenFixture.diamond.address).connect(signer_A).addIssuer(signer_E.address);

        await kycFacet
          .attach(newTokenFixture.diamond.address)
          .connect(signer_B)
          .grantKyc(signer_E.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_E.address);

        // issue fails
        await expect(
          erc1594Facet.attach(newTokenFixture.diamond.address).connect(signer_A).issue(signer_E.address, AMOUNT, DATA),
        ).to.be.revertedWithCustomError(erc1594Facet, "AccountIsBlocked");
      });

      it("GIVEN blocked accounts (sender, from) WHEN redeem THEN transaction fails with AccountIsBlocked", async () => {
        // Blacklisting accounts
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROL_LIST_ROLE, signer_A.address);
        await controlList.connect(signer_A).addToControlList(signer_C.address);

        // redeem with data fails
        await expect(erc1594Facet.connect(signer_C).redeem(AMOUNT, DATA)).to.be.rejectedWith("AccountIsBlocked");

        // redeem from with data fails
        await expect(erc1594Facet.connect(signer_C).redeemFrom(signer_E.address, AMOUNT, DATA)).to.be.rejectedWith(
          "AccountIsBlocked",
        );

        // Update blacklist
        await controlList.connect(signer_A).removeFromControlList(signer_C.address);
        await controlList.connect(signer_A).addToControlList(signer_E.address);

        // redeem from with data fails
        await expect(erc1594Facet.connect(signer_C).redeemFrom(signer_E.address, AMOUNT, DATA)).to.be.rejectedWith(
          "AccountIsBlocked",
        );
      });
    });
    describe("Clearing", () => {
      beforeEach(async () => {
        await clearingActionsFacet.activateClearing();
      });
      it("GIVEN a token with clearing mode active WHEN transfer THEN transaction fails with ClearingIsActivated", async () => {
        const clearingInterface = await ethers.getContractAt("IClearing", diamond.address);

        // transfer with data fails
        await expect(
          erc1594Facet.connect(signer_C).transferWithData(signer_D.address, AMOUNT, DATA),
        ).to.be.revertedWithCustomError(clearingInterface, "ClearingIsActivated");

        // transfer from with data fails
        await expect(
          erc1594Facet.connect(signer_C).transferFromWithData(signer_E.address, signer_D.address, AMOUNT, DATA),
        ).to.be.revertedWithCustomError(clearingInterface, "ClearingIsActivated");
      });

      it("GIVEN a token with clearing mode active WHEN redeem THEN transaction fails with ClearingIsActivated", async () => {
        const clearingInterface = await ethers.getContractAt("IClearing", diamond.address);

        await expect(erc1594Facet.connect(signer_C).redeem(AMOUNT, DATA)).to.be.revertedWithCustomError(
          clearingInterface,
          "ClearingIsActivated",
        );

        await expect(
          erc1594Facet.connect(signer_C).redeemFrom(signer_E.address, AMOUNT, DATA),
        ).to.be.revertedWithCustomError(clearingInterface, "ClearingIsActivated");
      });
    });
    describe("Paused", () => {
      beforeEach(async () => {
        await kycFacet.grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await erc1594Issuer.issue(signer_C.address, AMOUNT, DATA);
        await erc1594Issuer.issue(signer_E.address, AMOUNT, DATA);
        await erc20Facet.connect(signer_E).increaseAllowance(signer_C.address, AMOUNT);
        await pauseFacet.connect(signer_B).pause();
      });

      it("GIVEN a paused Token WHEN transfer THEN transaction fails with TokenIsPaused", async () => {
        expect(await erc1594Facet.connect(signer_C).canTransfer(signer_D.address, AMOUNT, DATA)).to.be.deep.equal([
          false,
          EIP1066_CODES.PAUSED,
          getSelector(erc1594Facet, "TokenIsPaused"),
        ]);

        expect(
          await erc1594Facet.connect(signer_C).canTransferFrom(signer_E.address, signer_D.address, AMOUNT, DATA),
        ).to.be.deep.equal([false, EIP1066_CODES.PAUSED, getSelector(erc1594Facet, "TokenIsPaused")]);
      });
      it("GIVEN a paused Token WHEN transfer THEN transaction fails with TokenIsPaused", async () => {
        // transfer with data fails
        await expect(
          erc1594Facet.connect(signer_C).transferWithData(signer_D.address, AMOUNT, DATA),
        ).to.be.rejectedWith("TokenIsPaused");

        // transfer from with data fails
        await expect(
          erc1594Facet.connect(signer_C).transferFromWithData(signer_E.address, signer_D.address, AMOUNT, DATA),
        ).to.be.rejectedWith("TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN issue THEN transaction fails with TokenIsPaused", async () => {
        // issue fails
        await expect(
          erc1594Facet.connect(signer_C).issue(signer_E.address, AMOUNT, DATA),
        ).to.be.revertedWithCustomError(erc1594Facet, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN redeem THEN transaction fails with TokenIsPaused", async () => {
        // transfer with data fails
        await expect(erc1594Facet.connect(signer_C).redeem(AMOUNT, DATA)).to.be.rejectedWith("TokenIsPaused");

        // transfer from with data fails
        await expect(erc1594Facet.connect(signer_C).redeemFrom(signer_E.address, AMOUNT, DATA)).to.be.rejectedWith(
          "TokenIsPaused",
        );
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without issuer role WHEN issue THEN transaction fails with AccountHasNoRole", async () => {
        // add to list fails
        await expect(erc1594Facet.connect(signer_B).issue(signer_E.address, AMOUNT, DATA)).to.be.rejectedWith(
          "AccountHasNoRole",
        );
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without issuer role WHEN issue THEN transaction fails with AccountHasNoRole", async () => {
        // add to list fails
        await expect(erc1594Facet.connect(signer_B).issue(signer_E.address, AMOUNT, DATA)).to.be.rejectedWith(
          "AccountHasNoRole",
        );
      });
    });

    it(
      "GIVEN blocked accounts (sender, to, from) " +
        "WHEN canTransfer or canTransferFrom " +
        "THEN transaction returns _OPERATOR_signer_B.addressLOCKED_ERROR_ID, " +
        "_FROM_signer_B.addressLOCKED_ERROR_ID or _TO_signer_B.addressLOCKED_ERROR_ID",
      async () => {
        await kycFacet.grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await erc1594Issuer.issue(signer_C.address, AMOUNT, DATA);
        await erc20Facet.connect(signer_C).increaseAllowance(signer_A.address, AMOUNT);
        await erc20Facet.connect(signer_E).increaseAllowance(signer_C.address, AMOUNT);
        // Blacklisting accounts
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROL_LIST_ROLE, signer_A.address);
        await controlList.connect(signer_A).addToControlList(signer_C.address);

        expect(await erc1594Facet.connect(signer_C).canTransfer(signer_D.address, AMOUNT, DATA)).to.be.deep.equal([
          false,
          EIP1066_CODES.DISALLOWED_OR_STOP,
          getSelector(erc1594Facet, "AccountIsBlocked"),
        ]);
        await erc1594Issuer.issue(signer_D.address, AMOUNT, DATA);
        expect(
          await erc1594Facet.connect(signer_D.address).canTransfer(signer_C.address, AMOUNT, DATA),
        ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(erc1594Facet, "AccountIsBlocked")]);

        await erc1594Issuer.issue(signer_E.address, AMOUNT, DATA);
        expect(
          await erc1594Facet.connect(signer_C).canTransferFrom(signer_E.address, signer_D.address, AMOUNT, DATA),
        ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(erc1594Facet, "AccountIsBlocked")]);

        expect(
          await erc1594Facet.connect(signer_A).canTransferFrom(signer_C.address, signer_D.address, AMOUNT, DATA),
        ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(erc1594Facet, "AccountIsBlocked")]);
        await erc20Facet.connect(signer_E).increaseAllowance(signer_A.address, AMOUNT);
        expect(
          await erc1594Facet.connect(signer_A).canTransferFrom(signer_E.address, signer_C.address, AMOUNT, DATA),
        ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(erc1594Facet, "AccountIsBlocked")]);
      },
    );
    describe("Kyc", () => {
      it(
        "GIVEN non kyc accounts (to, from) " +
          "WHEN canTransfer or canTransferFrom " +
          "THEN transaction returns _FROM_signer_K.addressYC_ERROR_ID or _TO_signer_K.addressYC_ERROR_ID",
        async () => {
          await erc1594Issuer.issue(signer_E.address, AMOUNT, DATA);
          await erc20Facet.connect(signer_E).increaseAllowance(signer_B.address, AMOUNT);
          await kycFacet.revokeKyc(signer_E.address);
          // non kyc'd sender
          expect(
            await erc1594Facet.connect(signer_E.address).canTransfer(signer_D.address, AMOUNT, DATA),
          ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(kycFacet, "InvalidKycStatus")]);
          expect(
            await erc1594Facet
              .connect(signer_B.address)
              .canTransferFrom(signer_E.address, signer_A.address, AMOUNT, DATA),
          ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(kycFacet, "InvalidKycStatus")]);
          // non kyc'd receiver
          await erc1594Issuer.issue(signer_D.address, AMOUNT, DATA);
          expect(
            await erc1594Facet.connect(signer_D.address).canTransfer(signer_E.address, AMOUNT, DATA),
          ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(kycFacet, "InvalidKycStatus")]);
          await erc20Facet.connect(signer_D).increaseAllowance(signer_A.address, AMOUNT);
          expect(
            await erc1594Facet
              .connect(signer_A.address)
              .canTransferFrom(signer_D.address, signer_E.address, AMOUNT, DATA),
          ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(kycFacet, "InvalidKycStatus")]);
        },
      );
      it(
        "GIVEN non kyc accounts (to, from) " +
          "WHEN transfer or transferFrom " +
          "THEN transaction reverts with InvalidKycStatus",
        async () => {
          await kycFacet.revokeKyc(signer_E.address);
          // non kyc'd sender
          await expect(
            erc1594Facet.connect(signer_E).transferWithData(signer_D.address, AMOUNT, DATA),
          ).to.revertedWithCustomError(kycFacet, "InvalidKycStatus");
          await expect(
            erc1594Facet.connect(signer_B).transferFromWithData(signer_E.address, signer_A.address, AMOUNT, DATA),
          ).to.revertedWithCustomError(kycFacet, "InvalidKycStatus");
          // non kyc'd receiver
          await expect(
            erc1594Facet.connect(signer_D).transferWithData(signer_E.address, AMOUNT, DATA),
          ).to.revertedWithCustomError(kycFacet, "InvalidKycStatus");
          await expect(
            erc1594Facet.connect(signer_A).transferFromWithData(signer_D.address, signer_E.address, AMOUNT, DATA),
          ).to.revertedWithCustomError(kycFacet, "InvalidKycStatus");
        },
      );
      it(
        "GIVEN non kyc account " + "WHEN redeem or redeemFrom " + "THEN transaction reverts with InvalidKycStatus",
        async () => {
          await kycFacet.revokeKyc(signer_E.address);
          await expect(erc1594Facet.connect(signer_E).redeem(AMOUNT, DATA)).to.revertedWithCustomError(
            kycFacet,
            "InvalidKycStatus",
          );
          await expect(
            erc1594Facet.connect(signer_B).redeemFrom(signer_E.address, AMOUNT, DATA),
          ).to.revertedWithCustomError(kycFacet, "InvalidKycStatus");
        },
      );
      it("GIVEN non kyc account " + "WHEN issue " + "THEN transaction reverts with InvalidKycStatus", async () => {
        await kycFacet.revokeKyc(signer_E.address);
        await expect(erc1594Issuer.issue(signer_E.address, AMOUNT, DATA)).to.revertedWithCustomError(
          kycFacet,
          "InvalidKycStatus",
        );
      });
    });

    it("GIVEN a zero address in to WHEN canTransfer and canTransferFrom THEN responds _TO_signer_N.addressULL_ERROR_ID", async () => {
      await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await erc1594Issuer.issue(signer_A.address, AMOUNT, DATA);
      expect(await erc1594Facet.canTransfer(ethers.constants.AddressZero, AMOUNT, DATA)).to.be.deep.equal([
        false,
        EIP1066_CODES.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
        getSelector(erc1594Facet, "ZeroAddressNotAllowed"),
      ]);
      await erc1594Issuer.issue(signer_D.address, AMOUNT, DATA);
      await erc20Facet.connect(signer_D).increaseAllowance(signer_A.address, AMOUNT);
      expect(
        await erc1594Facet.canTransferFrom(signer_D.address, ethers.constants.AddressZero, AMOUNT, DATA),
      ).to.be.deep.equal([
        false,
        EIP1066_CODES.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
        getSelector(erc1594Facet, "ZeroAddressNotAllowed"),
      ]);
    });

    it("GIVEN a non allowed WHEN canTransferFrom THEN responds _ALLOWANCE_REACHED_ERROR_ID", async () => {
      expect(await erc1594Facet.canTransferFrom(signer_B.address, signer_D.address, AMOUNT, DATA)).to.be.deep.equal([
        false,
        EIP1066_CODES.DISALLOWED_OR_STOP,
        getSelector(kycFacet, "InvalidKycStatus"),
      ]);
    });

    it("GIVEN a non funds account WHEN canTransfer & canTransferFrom THEN responds NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID", async () => {
      expect(await erc1594Facet.canTransfer(signer_D.address, AMOUNT, DATA)).to.be.deep.equal([
        false,
        EIP1066_CODES.DISALLOWED_OR_STOP,
        getSelector(kycFacet, "InvalidKycStatus"),
      ]);

      await kycFacet.grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await erc20Facet.connect(signer_C).approve(signer_A.address, AMOUNT);
      expect(await erc1594Facet.canTransferFrom(signer_C.address, signer_D.address, AMOUNT, DATA)).to.be.deep.equal([
        false,
        EIP1066_CODES.INSUFFICIENT_FUNDS,
        getSelector(erc1594Facet, "InvalidPartition"),
      ]);
    });

    it("GIVEN an account with issuer role WHEN issue THEN transaction succeeds", async () => {
      // issue succeeds
      expect(await erc1594Issuer.issue(signer_E.address, AMOUNT / 2, DATA))
        .to.emit(erc1594Issuer, "Issued")
        .withArgs(signer_C.address, signer_E.address, AMOUNT / 2);
      expect(await erc1410SnapshotFacet.totalSupply()).to.be.equal(AMOUNT / 2);
      expect(await erc1410SnapshotFacet.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
      expect(await erc1410SnapshotFacet.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(
        AMOUNT / 2,
      );
      expect(await erc1410SnapshotFacet.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
    });

    it("GIVEN an account with balance WHEN transferWithData THEN transaction success", async () => {
      await erc1594Issuer.issue(signer_E.address, AMOUNT, DATA);

      expect(await erc1594Transferor.canTransfer(signer_D.address, AMOUNT / 2, DATA)).to.be.deep.equal([
        true,
        EIP1066_CODES.SUCCESS,
        ethers.constants.HashZero,
      ]);
      expect(await erc1594Transferor.transferWithData(signer_D.address, AMOUNT / 2, DATA))
        .to.emit(erc1594Transferor, "Transferred")
        .withArgs(signer_E.address, signer_D.address, AMOUNT / 2);

      expect(await erc1410SnapshotFacet.totalSupply()).to.be.equal(AMOUNT);
      expect(await erc1410SnapshotFacet.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
      expect(await erc1410SnapshotFacet.balanceOf(signer_D.address)).to.be.equal(AMOUNT / 2);
      expect(await erc1410SnapshotFacet.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(
        AMOUNT / 2,
      );
      expect(await erc1410SnapshotFacet.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.be.equal(
        AMOUNT / 2,
      );
      expect(await erc1410SnapshotFacet.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT);
    });

    it(
      "GIVEN an account with balance and another with allowance " +
        "WHEN transferFromWithData " +
        "THEN transaction success",
      async () => {
        await erc1594Issuer.issue(signer_E.address, AMOUNT, DATA);
        await erc20Facet.approve(signer_D.address, AMOUNT / 2);

        expect(
          await erc1594Approved.canTransferFrom(signer_E.address, signer_D.address, AMOUNT / 2, DATA),
        ).to.be.deep.equal([true, EIP1066_CODES.SUCCESS, ethers.constants.HashZero]);
        expect(await erc1594Approved.transferFromWithData(signer_E.address, signer_D.address, AMOUNT / 2, DATA))
          .to.emit(erc1594Transferor, "Transferred")
          .withArgs(signer_E.address, signer_D.address, AMOUNT / 2);

        expect(await erc20Facet.allowance(signer_E.address, signer_D.address)).to.be.equal(0);
        expect(await erc1410SnapshotFacet.totalSupply()).to.be.equal(AMOUNT);
        expect(await erc1410SnapshotFacet.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await erc1410SnapshotFacet.balanceOf(signer_D.address)).to.be.equal(AMOUNT / 2);
        expect(await erc1410SnapshotFacet.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(
          AMOUNT / 2,
        );
        expect(await erc1410SnapshotFacet.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.be.equal(
          AMOUNT / 2,
        );
        expect(await erc1410SnapshotFacet.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT);
      },
    );

    it("GIVEN an account with balance WHEN redeem THEN transaction succeeds", async () => {
      // issue succeeds
      await erc1594Issuer.issue(signer_E.address, AMOUNT, DATA);

      expect(await erc1594Transferor.redeem(AMOUNT / 2, DATA))
        .to.emit(erc1594Issuer, "Redeemed")
        .withArgs(signer_E.address, signer_E.address, AMOUNT / 2);
      expect(await erc1410SnapshotFacet.totalSupply()).to.be.equal(AMOUNT / 2);
      expect(await erc1410SnapshotFacet.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
      expect(await erc1410SnapshotFacet.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(
        AMOUNT / 2,
      );
      expect(await erc1410SnapshotFacet.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
    });

    it(
      "GIVEN an account with balance and another with allowance " + "WHEN redeemFrom " + "THEN transaction succeeds",
      async () => {
        // issue succeeds
        await erc1594Issuer.issue(signer_E.address, AMOUNT, DATA);

        await erc20Facet.connect(signer_E).approve(signer_D.address, AMOUNT / 2);

        expect(await erc1594Approved.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA))
          .to.emit(erc1594Issuer, "Redeemed")
          .withArgs(signer_D.address, signer_E.address, AMOUNT / 2);

        expect(await erc20Facet.connect(signer_E).allowance(signer_E.address, signer_D.address)).to.be.equal(0);
        expect(await erc1410SnapshotFacet.totalSupply()).to.be.equal(AMOUNT / 2);
        expect(await erc1410SnapshotFacet.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await erc1410SnapshotFacet.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(
          AMOUNT / 2,
        );
        expect(await erc1410SnapshotFacet.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
      },
    );
  });
});
