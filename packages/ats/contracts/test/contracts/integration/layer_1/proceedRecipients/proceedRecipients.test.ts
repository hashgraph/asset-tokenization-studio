// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, ResolverProxy, MockDiamondCut } from "@contract-types";
import { ATS_ROLES, ADDRESS_ZERO, RESOLVER_KEY_PROCEED_RECIPIENTS, GAS_LIMIT } from "@scripts";
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
  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

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

    asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);

    await asset.grantRole(ATS_ROLES.ROLE_PROCEED_RECIPIENT_MANAGER, signer_A.address);
    await asset.grantRole(ATS_ROLES.ROLE_PAUSER, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureR);
  });

  describe("initializeProceedRecipients", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeProceedRecipients is called THEN AccountHasNoRole", async () => {
      await expect(
        asset.connect(signer_B).initializeProceedRecipients([PROCEED_RECIPIENT_1], [PROCEED_RECIPIENT_1_DATA]),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN already-initialised WHEN initializeProceedRecipients is called again THEN FacetAlreadyRegistered", async () => {
      await expect(
        asset.initializeProceedRecipients([PROCEED_RECIPIENT_1], [PROCEED_RECIPIENT_1_DATA]),
      ).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
    });
  });

  describe("initializeProceedRecipients event", () => {
    it("GIVEN a fresh deployment WHEN initializeProceedRecipients is called THEN emits ProceedRecipientsInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(RESOLVER_KEY_PROCEED_RECIPIENTS);
      await expect(asset.initializeProceedRecipients([PROCEED_RECIPIENT_1], [PROCEED_RECIPIENT_1_DATA])).to.emit(
        asset,
        "ProceedRecipientsInitialized",
      );
    });
  });

  describe("Add Tests", () => {
    it("GIVEN an unlisted proceed recipient WHEN unauthorized user adds it THEN it reverts with AccountHasNoRole", async () => {
      await expect(
        asset.connect(signer_B).addProceedRecipient(PROCEED_RECIPIENT_1, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN an unlisted proceed recipient WHEN user adds if token is paused THEN it reverts with IsPaused", async () => {
      await asset.pause({ gasLimit: GAS_LIMIT.default });

      await expect(
        asset.addProceedRecipient(PROCEED_RECIPIENT_1, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "IsPaused");
    });

    it("GIVEN a listed proceed recipient WHEN adding it again THEN it reverts with ProceedRecipientAlreadyExists", async () => {
      await expect(
        asset.addProceedRecipient(PROCEED_RECIPIENT_2, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "ProceedRecipientAlreadyExists");
    });

    it("GIVEN a unlisted proceed recipient WHEN authorized user adds it THEN it is listed and event is emitted", async () => {
      await expect(
        asset.addProceedRecipient(PROCEED_RECIPIENT_1, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(asset, "ProceedRecipientAdded")
        .withArgs(signer_A.address, PROCEED_RECIPIENT_1, PROCEED_RECIPIENT_1_DATA);

      expect(await asset.isProceedRecipient(PROCEED_RECIPIENT_1)).to.be.true;

      expect(await asset.getProceedRecipientData(PROCEED_RECIPIENT_1)).to.equal(PROCEED_RECIPIENT_1_DATA);

      expect(await asset.getProceedRecipientsCount()).to.equal(2);

      expect([...(await asset.getProceedRecipients(0, 100))]).to.have.same.members([
        PROCEED_RECIPIENT_2,
        PROCEED_RECIPIENT_1,
      ]);
    });

    it("GIVEN an invalid address WHEN adding it THEN it reverts with ZeroAddressNotAllowed", async () => {
      await expect(
        asset.addProceedRecipient(ADDRESS_ZERO, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });
  });

  describe("Remove Tests", () => {
    it("GIVEN a listed proceed recipient WHEN unauthorized user removes it THEN it reverts with AccountHasNoRole", async () => {
      await expect(
        asset.connect(signer_B).removeProceedRecipient(PROCEED_RECIPIENT_2, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN an listed proceed recipient WHEN user removes it if token is paused THEN it reverts with IsPaused", async () => {
      await asset.pause({ gasLimit: GAS_LIMIT.default });
      await expect(
        asset.removeProceedRecipient(PROCEED_RECIPIENT_2, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "IsPaused");
    });

    it("GIVEN a unlisted proceed recipient WHEN removing it again THEN it reverts with ProceedRecipientNotFound", async () => {
      await expect(
        asset.removeProceedRecipient(PROCEED_RECIPIENT_1, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "ProceedRecipientNotFound");
    });

    it("GIVEN a listed proceed recipient WHEN authorized user removes it THEN it is removed and event is emitted", async () => {
      await expect(
        asset.removeProceedRecipient(PROCEED_RECIPIENT_2, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(asset, "ProceedRecipientRemoved")
        .withArgs(signer_A.address, PROCEED_RECIPIENT_2);

      expect(await asset.isProceedRecipient(PROCEED_RECIPIENT_2)).to.be.false;

      expect(await asset.getProceedRecipientsCount()).to.equal(0);

      expect([...(await asset.getProceedRecipients(0, 100))]).to.have.same.members([]);
    });
  });

  describe("Update Data Tests", () => {
    it("GIVEN invalid address WHEN updated THEN it reverts with ZeroAddressNotAllowed", async () => {
      await expect(
        asset.updateProceedRecipientData(ADDRESS_ZERO, "0x", {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN a listed proceed recipient WHEN unauthorized user updates its data THEN it reverts with AccountHasNoRole", async () => {
      await expect(
        asset.connect(signer_B).updateProceedRecipientData(PROCEED_RECIPIENT_2, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN an listed proceed recipient WHEN user updates its data if token is paused THEN it reverts with IsPaused", async () => {
      await asset.pause({ gasLimit: GAS_LIMIT.default });
      await expect(
        asset.updateProceedRecipientData(PROCEED_RECIPIENT_2, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "IsPaused");
    });

    it("GIVEN a unlisted proceed recipient WHEN updating its data THEN it reverts with ProceedRecipientNotFound", async () => {
      await expect(
        asset.updateProceedRecipientData(PROCEED_RECIPIENT_1, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "ProceedRecipientNotFound");
    });

    it("GIVEN a listed proceed recipient WHEN authorized user updates its data THEN it is updated and event is emitted", async () => {
      expect(await asset.getProceedRecipientData(PROCEED_RECIPIENT_2)).to.equal(PROCEED_RECIPIENT_2_DATA);

      await expect(
        asset.updateProceedRecipientData(PROCEED_RECIPIENT_2, PROCEED_RECIPIENT_1_DATA, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(asset, "ProceedRecipientDataUpdated")
        .withArgs(signer_A.address, PROCEED_RECIPIENT_2, PROCEED_RECIPIENT_1_DATA);

      expect(await asset.getProceedRecipientData(PROCEED_RECIPIENT_2)).to.equal(PROCEED_RECIPIENT_1_DATA);
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN addProceedRecipient THEN transaction fails with Deactivated", async () => {
      const base = await deployBondTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_TEST, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).addProceedRecipient(ethers.ZeroAddress, "0x"),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN removeProceedRecipient THEN transaction fails with Deactivated", async () => {
      const base = await deployBondTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_TEST, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).removeProceedRecipient(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN updateProceedRecipientData THEN transaction fails with Deactivated", async () => {
      const base = await deployBondTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_TEST, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).updateProceedRecipientData(ethers.ZeroAddress, "0x"),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });
  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational asset WHEN addProceedRecipient THEN reverts with AssetNotOperational", async () => {
      await expect(asset.addProceedRecipient(ADDRESS_ZERO, "0x")).to.be.revertedWithCustomError(
        asset,
        "AssetNotOperational",
      );
    });

    it("GIVEN non-operational asset WHEN removeProceedRecipient THEN reverts with AssetNotOperational", async () => {
      await expect(asset.removeProceedRecipient(ADDRESS_ZERO)).to.be.revertedWithCustomError(
        asset,
        "AssetNotOperational",
      );
    });

    it("GIVEN non-operational asset WHEN updateProceedRecipientData THEN reverts with AssetNotOperational", async () => {
      await expect(asset.updateProceedRecipientData(ADDRESS_ZERO, "0x")).to.be.revertedWithCustomError(
        asset,
        "AssetNotOperational",
      );
    });
  });
});
