import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ProceedRecipientsFacet, ResolverProxy, AccessControl, PauseFacet } from "@contract-types";
import { GAS_LIMIT, ATS_ROLES, ADDRESS_ZERO } from "@scripts";
import { deployBondTokenFixture } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const PROCEED_RECIPIENT_1 = "0x1234567890123456789012345678901234567890";
const PROCEED_RECIPIENT_1_DATA = "0xabcdef";
const PROCEED_RECIPIENT_2 = "0x2345678901234567890123456789012345678901";
const PROCEED_RECIPIENT_2_DATA = "0x88888888";

describe("Proceed Recipients Tests", () => {
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;

  let diamond: ResolverProxy;
  let proceedRecipientsFacet: ProceedRecipientsFacet;
  let accessControlFacet: AccessControl;
  let pauseFacet: PauseFacet;

  async function deploySecurityFixtureR() {
    const base = await deployBondTokenFixture({
      bondDataParams: {
        proceedRecipients: [PROCEED_RECIPIENT_2],
        proceedRecipientsData: [PROCEED_RECIPIENT_2_DATA],
      },
    });

    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;

    proceedRecipientsFacet = await ethers.getContractAt("ProceedRecipientsFacet", diamond.target, signer_A);

    accessControlFacet = await ethers.getContractAt("AccessControlFacet", diamond.target, signer_A);
    pauseFacet = await ethers.getContractAt("PauseFacet", diamond.target, signer_A);

    await accessControlFacet.grantRole(ATS_ROLES._PROCEED_RECIPIENT_MANAGER_ROLE, signer_A.address);

    await accessControlFacet.grantRole(ATS_ROLES._PAUSER_ROLE, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureR);
  });

  describe("Initialization Tests", () => {
    it("GIVEN a token WHEN initializing the proceed recipient again THEN it reverts with AlreadyInitialized", async () => {
      await expect(
        proceedRecipientsFacet.initialize_ProceedRecipients([PROCEED_RECIPIENT_1], [PROCEED_RECIPIENT_1_DATA], {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(proceedRecipientsFacet, "AlreadyInitialized");
    });
  });

  describe("Add Tests", () => {
    it("GIVEN an unlisted proceed recipient WHEN unauthorized user adds it THEN it reverts with AccountHasNoRole", async () => {
      await expect(
        proceedRecipientsFacet.connect(signer_B).addProceedRecipient(PROCEED_RECIPIENT_1, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(proceedRecipientsFacet, "AccountHasNoRole");
    });

    it("GIVEN an unlisted proceed recipient WHEN user adds if token is paused THEN it reverts with TokenIsPaused", async () => {
      await pauseFacet.pause({ gasLimit: GAS_LIMIT.default });

      await expect(
        proceedRecipientsFacet.addProceedRecipient(PROCEED_RECIPIENT_1, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(proceedRecipientsFacet, "TokenIsPaused");
    });

    it("GIVEN a listed proceed recipient WHEN adding it again THEN it reverts with ProceedRecipientAlreadyExists", async () => {
      await expect(
        proceedRecipientsFacet.addProceedRecipient(PROCEED_RECIPIENT_2, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(proceedRecipientsFacet, "ProceedRecipientAlreadyExists");
    });

    it("GIVEN a unlisted proceed recipient WHEN authorized user adds it THEN it is listed and event is emitted", async () => {
      await expect(
        proceedRecipientsFacet.addProceedRecipient(PROCEED_RECIPIENT_1, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(proceedRecipientsFacet, "ProceedRecipientAdded")
        .withArgs(signer_A.address, PROCEED_RECIPIENT_1, PROCEED_RECIPIENT_1_DATA);

      expect(await proceedRecipientsFacet.isProceedRecipient(PROCEED_RECIPIENT_1)).to.be.true;

      expect(await proceedRecipientsFacet.getProceedRecipientData(PROCEED_RECIPIENT_1)).to.equal(
        PROCEED_RECIPIENT_1_DATA,
      );

      expect(await proceedRecipientsFacet.getProceedRecipientsCount()).to.equal(2);

      expect([...(await proceedRecipientsFacet.getProceedRecipients(0, 100))]).to.have.same.members([
        PROCEED_RECIPIENT_2,
        PROCEED_RECIPIENT_1,
      ]);
    });

    it("GIVEN an invalid address WHEN adding it THEN it reverts with ZeroAddressNotAllowed", async () => {
      await expect(
        proceedRecipientsFacet.addProceedRecipient(ADDRESS_ZERO, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(proceedRecipientsFacet, "ZeroAddressNotAllowed");
    });
  });

  describe("Remove Tests", () => {
    it("GIVEN a listed proceed recipient WHEN unauthorized user removes it THEN it reverts with AccountHasNoRole", async () => {
      await expect(
        proceedRecipientsFacet.connect(signer_B).removeProceedRecipient(PROCEED_RECIPIENT_2, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(proceedRecipientsFacet, "AccountHasNoRole");
    });

    it("GIVEN an listed proceed recipient WHEN user removes it if token is paused THEN it reverts with TokenIsPaused", async () => {
      await pauseFacet.pause({ gasLimit: GAS_LIMIT.default });
      await expect(
        proceedRecipientsFacet.removeProceedRecipient(PROCEED_RECIPIENT_2, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(proceedRecipientsFacet, "TokenIsPaused");
    });

    it("GIVEN a unlisted proceed recipient WHEN removing it again THEN it reverts with ProceedRecipientNotFound", async () => {
      await expect(
        proceedRecipientsFacet.removeProceedRecipient(PROCEED_RECIPIENT_1, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(proceedRecipientsFacet, "ProceedRecipientNotFound");
    });

    it("GIVEN a listed proceed recipient WHEN authorized user removes it THEN it is removed and event is emitted", async () => {
      await expect(
        proceedRecipientsFacet.removeProceedRecipient(PROCEED_RECIPIENT_2, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(proceedRecipientsFacet, "ProceedRecipientRemoved")
        .withArgs(signer_A.address, PROCEED_RECIPIENT_2);

      expect(await proceedRecipientsFacet.isProceedRecipient(PROCEED_RECIPIENT_2)).to.be.false;

      expect(await proceedRecipientsFacet.getProceedRecipientsCount()).to.equal(0);

      expect([...(await proceedRecipientsFacet.getProceedRecipients(0, 100))]).to.have.same.members([]);
    });
  });

  describe("Update Data Tests", () => {
    it("GIVEN invalid address WHEN updated THEN it reverts with ZeroAddressNotAllowed", async () => {
      await expect(
        proceedRecipientsFacet.updateProceedRecipientData(ADDRESS_ZERO, "0x", {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(proceedRecipientsFacet, "ZeroAddressNotAllowed");
    });

    it("GIVEN a listed proceed recipient WHEN unauthorized user updates its data THEN it reverts with AccountHasNoRole", async () => {
      await expect(
        proceedRecipientsFacet
          .connect(signer_B)
          .updateProceedRecipientData(PROCEED_RECIPIENT_2, PROCEED_RECIPIENT_1_DATA, {
            gasLimit: GAS_LIMIT.default,
          }),
      ).to.be.revertedWithCustomError(proceedRecipientsFacet, "AccountHasNoRole");
    });

    it("GIVEN an listed proceed recipient WHEN user updates its data if token is paused THEN it reverts with TokenIsPaused", async () => {
      await pauseFacet.pause({ gasLimit: GAS_LIMIT.default });
      await expect(
        proceedRecipientsFacet.updateProceedRecipientData(PROCEED_RECIPIENT_2, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(proceedRecipientsFacet, "TokenIsPaused");
    });

    it("GIVEN a unlisted proceed recipient WHEN updating its data THEN it reverts with ProceedRecipientNotFound", async () => {
      await expect(
        proceedRecipientsFacet.updateProceedRecipientData(PROCEED_RECIPIENT_1, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(proceedRecipientsFacet, "ProceedRecipientNotFound");
    });

    it("GIVEN a listed proceed recipient WHEN authorized user updates its data THEN it is updated and event is emitted", async () => {
      expect(await proceedRecipientsFacet.getProceedRecipientData(PROCEED_RECIPIENT_2)).to.equal(
        PROCEED_RECIPIENT_2_DATA,
      );

      await expect(
        proceedRecipientsFacet.updateProceedRecipientData(PROCEED_RECIPIENT_2, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(proceedRecipientsFacet, "ProceedRecipientDataUpdated")
        .withArgs(signer_A.address, PROCEED_RECIPIENT_2, PROCEED_RECIPIENT_1_DATA);

      expect(await proceedRecipientsFacet.getProceedRecipientData(PROCEED_RECIPIENT_2)).to.equal(
        PROCEED_RECIPIENT_1_DATA,
      );
    });
  });
});
