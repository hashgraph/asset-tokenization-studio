// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { GAS_LIMIT, ATS_ROLES, RESOLVER_KEYS } from "@scripts";
import { grantRoleAndPauseToken } from "@test";
import { IAssetMock, MockedExternalPause } from "@contract-types";
import { ethers } from "hardhat";
import type { AssetMockCtx } from "@test";

export function pauseTests(getCtx: () => AssetMockCtx): void {
  describe("Pause Tests", () => {
    let asset: IAssetMock;
    let deployer: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      deployer = ctx.deployer;
      unknownSigner = ctx.unknownSigner;
    });

    it("GIVEN an account without pause role WHEN pause THEN transaction fails with AccountHasNoRole", async () => {
      await expect(asset.connect(unknownSigner).pause()).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN an account without pause role WHEN unpause THEN transaction fails with AccountHasNoRole", async () => {
      await expect(asset.connect(unknownSigner).unpause()).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN a paused Token WHEN pause THEN transaction fails with IsPaused", async () => {
      await grantRoleAndPauseToken(asset, ATS_ROLES.ROLE_PAUSER, deployer, unknownSigner, unknownSigner.address);

      await expect(asset.connect(unknownSigner).pause()).to.be.revertedWithCustomError(asset, "IsPaused");
    });

    it("GIVEN an unpause Token WHEN unpause THEN transaction fails with IsUnpaused", async () => {
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_PAUSER, unknownSigner.address);

      await expect(asset.connect(unknownSigner).unpause()).to.be.revertedWithCustomError(asset, "IsUnpaused");
    });

    it("GIVEN an account with pause role WHEN pause and unpause THEN transaction succeeds", async () => {
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_PAUSER, unknownSigner.address);

      await expect(asset.connect(unknownSigner).pause()).to.emit(asset, "Paused").withArgs(unknownSigner.address);

      let paused = await asset.paused();
      expect(paused).to.be.equal(true);

      await expect(asset.connect(unknownSigner).unpause()).to.emit(asset, "Unpaused").withArgs(unknownSigner.address);

      paused = await asset.paused();
      expect(paused).to.be.equal(false);
    });

    describe("External Pause", () => {
      let externalPauseMock: MockedExternalPause;

      beforeEach(async () => {
        externalPauseMock = await (
          await ethers.getContractFactory("MockedExternalPause", deployer)
        ).deploy({ gasLimit: GAS_LIMIT.high });
        await externalPauseMock.waitForDeployment();
        await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_PAUSER, deployer.address);
        await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_PAUSE_MANAGER, deployer.address);
        await asset.connect(deployer).addExternalPause(externalPauseMock.target, { gasLimit: GAS_LIMIT.high });
      });

      it("GIVEN an external pause WHEN isPaused THEN it reflects the external pause state", async () => {
        let isPaused = await asset.paused();
        expect(isPaused).to.be.false;

        await externalPauseMock.setPaused(true);
        isPaused = await asset.paused();
        expect(isPaused).to.be.true;

        await externalPauseMock.setPaused(false, { gasLimit: GAS_LIMIT.default });
        isPaused = await asset.paused();
        expect(isPaused).to.be.false;
      });

      it("GIVEN an external pause WHEN token is paused THEN isPaused returns true", async () => {
        await asset.pause();

        const isPaused = await asset.paused();
        expect(isPaused).to.be.true;
      });

      it("GIVEN an external pause WHEN token is unpaused THEN isPaused reflects external pause state", async () => {
        await asset.pause();
        await asset.unpause();

        await externalPauseMock.setPaused(true);
        let isPaused = await asset.paused();
        expect(isPaused).to.be.true;

        await externalPauseMock.setPaused(false, { gasLimit: GAS_LIMIT.default });
        isPaused = await asset.paused();
        expect(isPaused).to.be.false;
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN pause THEN transaction fails with Deactivated", async () => {
        await expect(asset.pause()).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN unpause THEN transaction fails with Deactivated", async () => {
        await expect(asset.unpause()).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializePause", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializePause is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializePause())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializePause is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializePause())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.pause, 1);
      });
    });

    describe("initializePause event", () => {
      it("GIVEN a fresh deployment WHEN initializePause is called THEN emits PauseInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.pause);
        await expect(asset.initializePause()).to.emit(asset, "PauseInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN pause THEN reverts with AssetNotOperational", async () => {
        await expect(asset.pause()).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN unpause THEN reverts with AssetNotOperational", async () => {
        await expect(asset.unpause()).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
