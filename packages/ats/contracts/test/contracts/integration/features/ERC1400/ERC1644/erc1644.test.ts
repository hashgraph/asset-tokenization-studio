import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  type ResolverProxy,
  type ERC1644Facet,
  type PauseFacet,
  type IAccessControl,
  type IERC1410,
  SsiManagementFacet,
  KycFacet,
} from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { grantRoleAndPauseToken } from "../../../../../common";
import { deployEquityTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { EMPTY_STRING, ZERO, DEFAULT_PARTITION, ATS_ROLES } from "@scripts";

const amount = 1;
const data = "0x1234";
const operatorData = "0x5678";
const EMPTY_VC_ID = EMPTY_STRING;
describe("ERC1644 Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;

  let erc1644Facet: ERC1644Facet;
  let accessControlFacet: IAccessControl;
  let pauseFacet: PauseFacet;
  let erc1410Facet: IERC1410;
  let kycFacet: KycFacet;
  let ssiManagementFacet: SsiManagementFacet;

  describe("single partition", () => {
    async function deploySecurityFixtureSinglePartition() {
      const base = await deployEquityTokenFixture();
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
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._CONTROLLER_ROLE,
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

      accessControlFacet = await ethers.getContractAt("IAccessControl", diamond.target);

      erc1644Facet = await ethers.getContractAt("ERC1644Facet", diamond.target);

      pauseFacet = await ethers.getContractAt("PauseFacet", diamond.target);

      erc1410Facet = await ethers.getContractAt("IERC1410", diamond.target, signer_B);
      kycFacet = await ethers.getContractAt("KycFacet", diamond.target, signer_B);
      ssiManagementFacet = await ethers.getContractAt("SsiManagementFacet", diamond.target, signer_A);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    it("GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized", async () => {
      await expect(erc1644Facet.initialize_ERC1644(false)).to.be.rejectedWith("AlreadyInitialized");
    });

    describe("Paused", () => {
      beforeEach(async () => {
        // Granting Role to account C and Pause
        await grantRoleAndPauseToken(
          accessControlFacet,
          pauseFacet,
          ATS_ROLES._CONTROLLER_ROLE,
          signer_A,
          signer_B,
          signer_C.address,
        );
      });
      it("GIVEN a paused Token WHEN controllerTransfer THEN transaction fails with TokenIsPaused", async () => {
        // controller transfer fails
        await expect(
          erc1644Facet.connect(signer_C).controllerTransfer(signer_D.address, signer_E.address, amount, "0x", "0x"),
        ).to.be.revertedWithCustomError(erc1644Facet, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN controllerRedeem THEN transaction fails with TokenIsPaused", async () => {
        // remove document
        await expect(
          erc1644Facet.connect(signer_C).controllerRedeem(signer_D.address, amount, "0x", "0x"),
        ).to.be.revertedWithCustomError(erc1644Facet, "TokenIsPaused");
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without admin role WHEN finalizeControllable THEN transaction fails with AccountHasNoRole", async () => {
        // controller finalize fails
        await expect(erc1644Facet.connect(signer_C).finalizeControllable()).to.be.rejectedWith("AccountHasNoRole");
      });

      it("GIVEN an account without controller role WHEN controllerTransfer THEN transaction fails with AccountHasNoRole", async () => {
        // controller transfer fails
        await expect(
          erc1644Facet
            .connect(signer_C)
            .controllerTransfer(signer_D.address, signer_E.address, amount, data, operatorData),
        ).to.be.rejectedWith("AccountHasNoRole");
      });

      it("GIVEN an account without controller role WHEN controllerRedeem THEN transaction fails with AccountHasNoRole", async () => {
        // controller redeem fails
        await expect(
          erc1644Facet.connect(signer_C).controllerRedeem(signer_D.address, amount, data, operatorData),
        ).to.be.rejectedWith("AccountHasNoRole");
      });
    });

    describe("Controllable", () => {
      beforeEach(async () => {
        // BEFORE SCHEDULED SNAPSHOTS ------------------------------------------------------------------
        // Granting Role to account C
        await ssiManagementFacet.addIssuer(signer_E.address);
        await kycFacet.grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await erc1410Facet.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_D.address,
          value: amount * 2,
          data: data,
        });
      });

      it("GIVEN a controllable token " + "WHEN controllerTransfer " + "THEN transaction succeeds", async () => {
        expect(
          await erc1644Facet
            .connect(signer_B)
            .controllerTransfer(signer_D.address, signer_E.address, amount, data, operatorData),
        )
          .to.emit(erc1644Facet, "ControllerTransfer")
          .withArgs(signer_B.address, signer_D.address, signer_E.address, amount, data, data);
        expect(await erc1410Facet.totalSupply()).to.equal(amount * 2);
        expect(await erc1410Facet.balanceOf(signer_D.address)).to.equal(amount);
        expect(await erc1410Facet.balanceOf(signer_E.address)).to.equal(amount);
        expect(await erc1410Facet.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(amount * 2);
        expect(await erc1410Facet.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.equal(amount);
        expect(await erc1410Facet.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.equal(amount);
      });

      it("GIVEN a controllable token " + "WHEN controllerRedeem " + "THEN transaction succeeds", async () => {
        expect(await erc1644Facet.connect(signer_B).controllerRedeem(signer_D.address, amount, data, operatorData))
          .to.emit(erc1644Facet, "ControllerRedemption")
          .withArgs(signer_B.address, signer_D.address, amount, data, data);
        expect(await erc1410Facet.totalSupply()).to.equal(amount);
        expect(await erc1410Facet.balanceOf(signer_D.address)).to.equal(amount);
        expect(await erc1410Facet.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(amount);
        expect(await erc1410Facet.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.equal(amount);
      });
    });

    describe("finalizeControllable", () => {
      beforeEach(async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_A.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
        await expect(erc1644Facet.connect(signer_A).finalizeControllable())
          .to.emit(erc1644Facet, "FinalizedControllerFeature")
          .withArgs(signer_A.address);
      });

      it("GIVEN an account with admin role WHEN finalizeControllable THEN transaction succeeds", async () => {
        const isControllable = await erc1644Facet.isControllable();
        expect(isControllable).to.equal(false);
      });

      it("GIVEN finalizeControllable WHEN controllerTransfer THEN TokenIsNotControllable", async () => {
        await expect(
          erc1644Facet.controllerTransfer(signer_D.address, signer_E.address, amount, data, operatorData),
        ).to.revertedWithCustomError(erc1644Facet, "TokenIsNotControllable");
      });

      it("GIVEN finalizeControllable WHEN controllerRedeem THEN TokenIsNotControllable", async () => {
        await expect(
          erc1644Facet.controllerRedeem(signer_E.address, amount, data, operatorData),
        ).to.revertedWithCustomError(erc1644Facet, "TokenIsNotControllable");
      });

      it("GIVEN finalizeControllable WHEN finalizeControllable THEN TokenIsNotControllable", async () => {
        await expect(erc1644Facet.finalizeControllable()).to.revertedWithCustomError(
          erc1644Facet,
          "TokenIsNotControllable",
        );
      });
    });
  });

  describe("multi partition", () => {
    async function deploySecurityFixtureMultiPartition() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: { isMultiPartition: true },
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
      ]);

      accessControlFacet = await ethers.getContractAt("IAccessControl", diamond.target);

      erc1644Facet = await ethers.getContractAt("ERC1644Facet", diamond.target);

      pauseFacet = await ethers.getContractAt("PauseFacet", diamond.target);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);
    });

    describe("NotAllowedInMultiPartitionMode", () => {
      beforeEach(async () => {
        // BEFORE SCHEDULED SNAPSHOTS ------------------------------------------------------------------
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_C.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      });

      it("GIVEN an account with controller role WHEN controllerTransfer THEN NotAllowedInMultiPartitionMode", async () => {
        // check is controllable
        const isControllable = await erc1644Facet.isControllable();
        expect(isControllable).to.equal(true);

        // controller transfer
        await expect(
          erc1644Facet.controllerTransfer(signer_D.address, signer_E.address, amount, data, operatorData),
        ).to.revertedWithCustomError(erc1644Facet, "NotAllowedInMultiPartitionMode");
      });

      it("GIVEN an account with controller role WHEN controllerRedeem THEN NotAllowedInMultiPartitionMode", async () => {
        // check is controllable
        const isControllable = await erc1644Facet.isControllable();
        expect(isControllable).to.equal(true);

        // controller transfer
        await expect(
          erc1644Facet.controllerRedeem(signer_D.address, amount, data, operatorData),
        ).to.revertedWithCustomError(erc1644Facet, "NotAllowedInMultiPartitionMode");
      });
    });
  });
});
