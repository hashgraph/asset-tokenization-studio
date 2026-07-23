// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEYS } from "@scripts";
import { executeRbac, getDltTimestamp } from "@test";
import type { AssetMockCtx } from "@test";

const CURRENCY_ZERO = "0x000000";
const CURRENCY_EUR = "0x455552";
const TIME_HOUR = 3600;

export function nominalValueTests(getCtx: () => AssetMockCtx): void {
  describe("NominalValue Tests", () => {
    let asset: IAssetMock;
    let deployer: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      deployer = ctx.deployer;
      const signers = await ethers.getSigners();
      unknownSigner = signers[signers.length - 1];
    });

    describe("initializeNominalValue", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeNominalValue THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeNominalValue(1, 6, CURRENCY_ZERO, 1, true))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised (force-readied by the mock) WHEN initializeNominalValue THEN FacetAlreadyRegistered", async () => {
        const past = (await getDltTimestamp()) - 3600;
        await expect(asset.initializeNominalValue(1, 6, CURRENCY_ZERO, past, true))
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.nominalValue, 1);
      });

      describe("once force-unregistered", () => {
        beforeEach(async () => {
          await asset.forceFacetNotRegistered(RESOLVER_KEYS.nominalValue);
        });

        it("GIVEN a zero effective datetime WHEN initializeNominalValue THEN stores the initial value", async () => {
          await expect(asset.initializeNominalValue(1, 6, CURRENCY_ZERO, 0, true))
            .to.emit(asset, "NominalValueInitialized")
            .withArgs(1, 6, CURRENCY_ZERO);
          expect(await asset.getNominalValue()).to.equal(1n);
        });

        it("GIVEN an effective datetime equal to now WHEN initializeNominalValue THEN reverts with WrongTimestamp", async () => {
          const now = (await getDltTimestamp()) + 1000;
          await asset.changeSystemTimestamp(now);
          await expect(asset.initializeNominalValue(1, 6, CURRENCY_ZERO, now, true))
            .to.be.revertedWithCustomError(asset, "WrongTimestamp")
            .withArgs(now);
        });

        it("GIVEN an effective datetime in the future WHEN initializeNominalValue THEN reverts with WrongTimestamp", async () => {
          const future = (await getDltTimestamp()) + TIME_HOUR;
          await expect(asset.initializeNominalValue(1, 6, CURRENCY_ZERO, future, true))
            .to.be.revertedWithCustomError(asset, "WrongTimestamp")
            .withArgs(future);
        });

        it("GIVEN a valid past effective datetime WHEN initializeNominalValue THEN stores all five fields and emits NominalValueInitialized", async () => {
          const past = (await getDltTimestamp()) - TIME_HOUR;
          await expect(asset.initializeNominalValue(1, 6, CURRENCY_EUR, past, true))
            .to.emit(asset, "NominalValueInitialized")
            .withArgs(1, 6, CURRENCY_EUR);

          expect(await asset.getNominalValue()).to.equal(1n);
          expect(await asset.getNominalValueDecimals()).to.equal(6);
          expect(await asset.getNominalValueCurrency()).to.equal(CURRENCY_EUR);
          expect(await asset.getIsUnitNominalValue()).to.equal(true);
        });

        it("GIVEN _isUnitNominalValue = false WHEN initializeNominalValue THEN getIsUnitNominalValue returns false", async () => {
          const past = (await getDltTimestamp()) - TIME_HOUR;
          await asset.initializeNominalValue(1, 6, CURRENCY_ZERO, past, false);
          expect(await asset.getIsUnitNominalValue()).to.equal(false);
        });
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN publishNominalValue THEN AssetNotOperational", async () => {
        await expect(asset.publishNominalValue(0, 1)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN republishNominalValue THEN AssetNotOperational", async () => {
        await expect(asset.republishNominalValue(0, 1)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN publishNominalValue THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(deployer).publishNominalValue(0, 1)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN republishNominalValue THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(deployer).republishNominalValue(0, 1)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("publishNominalValue", () => {
      let signer_B: HardhatEthersSigner;
      let signer_D: HardhatEthersSigner;

      beforeEach(async () => {
        const ctx = getCtx();
        asset = ctx.asset;
        deployer = ctx.deployer;
        signer_B = ctx.user1;
        signer_D = ctx.user3;
        unknownSigner = ctx.unknownSigner;

        await executeRbac(asset, [
          { role: ATS_ROLES.ROLE_NOMINAL_VALUE, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_PAUSER, members: [signer_D.address] },
        ]);
      });

      it("GIVEN a caller with ROLE_NOMINAL_VALUE and a valid window WHEN publishNominalValue THEN emits NominalValuePublished and updates storage", async () => {
        // Storage starts uninitialised (stored effectiveDatetime == 0) on the mock asset.
        const effectiveDatetime = (await getDltTimestamp()) - TIME_HOUR;
        await expect(asset.connect(signer_B).publishNominalValue(200n, effectiveDatetime))
          .to.emit(asset, "NominalValuePublished")
          .withArgs(signer_B.address, 200n, effectiveDatetime);
        expect(await asset.getNominalValue()).to.equal(200n);
      });

      it("GIVEN a caller without ROLE_NOMINAL_VALUE WHEN publishNominalValue THEN fails with AccountHasNoRole", async () => {
        const effectiveDatetime = (await getDltTimestamp()) - TIME_HOUR;
        await expect(asset.connect(unknownSigner).publishNominalValue(200n, effectiveDatetime))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.ROLE_NOMINAL_VALUE);
      });

      it("GIVEN a paused token WHEN publishNominalValue THEN fails with IsPaused", async () => {
        await asset.connect(signer_D).pause();
        const effectiveDatetime = (await getDltTimestamp()) - TIME_HOUR;
        await expect(
          asset.connect(signer_B).publishNominalValue(200n, effectiveDatetime),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN a zero effective datetime WHEN publishNominalValue THEN reverts with InvalidTimestamp", async () => {
        await expect(asset.connect(signer_B).publishNominalValue(200n, 0)).to.be.revertedWithCustomError(
          asset,
          "InvalidTimestamp",
        );
      });

      describe("date boundaries with a stored effective datetime", () => {
        let stored: number;

        beforeEach(async () => {
          stored = (await getDltTimestamp()) - 2 * TIME_HOUR;
          await asset.connect(signer_B).publishNominalValue(100n, stored);
        });

        it("GIVEN effectiveDatetime equal to the stored one WHEN publishNominalValue THEN reverts with NominalValueEffectiveDatetimeNotAfterCurrent", async () => {
          await expect(asset.connect(signer_B).publishNominalValue(150n, stored))
            .to.be.revertedWithCustomError(asset, "NominalValueEffectiveDatetimeNotAfterCurrent")
            .withArgs(stored, stored);
        });

        it("GIVEN effectiveDatetime before the stored one WHEN publishNominalValue THEN reverts with NominalValueEffectiveDatetimeNotAfterCurrent", async () => {
          const earlier = stored - 1000;
          await expect(asset.connect(signer_B).publishNominalValue(150n, earlier))
            .to.be.revertedWithCustomError(asset, "NominalValueEffectiveDatetimeNotAfterCurrent")
            .withArgs(earlier, stored);
        });

        it("GIVEN effectiveDatetime equal to now WHEN publishNominalValue THEN reverts with WrongTimestamp", async () => {
          const now = (await getDltTimestamp()) + 1000;
          await asset.changeSystemTimestamp(now);
          await expect(asset.connect(signer_B).publishNominalValue(150n, now))
            .to.be.revertedWithCustomError(asset, "WrongTimestamp")
            .withArgs(now);
        });

        it("GIVEN effectiveDatetime in the future WHEN publishNominalValue THEN reverts with WrongTimestamp", async () => {
          const future = (await getDltTimestamp()) + TIME_HOUR;
          await expect(asset.connect(signer_B).publishNominalValue(150n, future))
            .to.be.revertedWithCustomError(asset, "WrongTimestamp")
            .withArgs(future);
        });

        it("GIVEN effectiveDatetime strictly between stored and now WHEN publishNominalValue THEN succeeds and advances effectiveDatetime", async () => {
          const advanced = stored + TIME_HOUR;
          await expect(asset.connect(signer_B).publishNominalValue(150n, advanced))
            .to.emit(asset, "NominalValuePublished")
            .withArgs(signer_B.address, 150n, advanced);
          expect(await asset.getNominalValue()).to.equal(150n);
        });

        it("GIVEN a subsequent publish WHEN it succeeds THEN decimals remain unchanged", async () => {
          const before = await asset.getNominalValueDecimals();
          const advanced = stored + TIME_HOUR;
          await asset.connect(signer_B).publishNominalValue(150n, advanced);
          expect(await asset.getNominalValueDecimals()).to.equal(before);
        });
      });
    });

    describe("republishNominalValue", () => {
      let signer_B: HardhatEthersSigner;
      let signer_D: HardhatEthersSigner;

      beforeEach(async () => {
        const ctx = getCtx();
        asset = ctx.asset;
        deployer = ctx.deployer;
        signer_B = ctx.user1;
        signer_D = ctx.user3;
        unknownSigner = ctx.unknownSigner;

        await executeRbac(asset, [
          { role: ATS_ROLES.ROLE_NOMINAL_VALUE, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_PAUSER, members: [signer_D.address] },
        ]);
      });

      it("GIVEN a caller without ROLE_NOMINAL_VALUE WHEN republishNominalValue THEN fails with AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).republishNominalValue(0, 0))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.ROLE_NOMINAL_VALUE);
      });

      it("GIVEN a paused token WHEN republishNominalValue THEN fails with IsPaused", async () => {
        const effectiveDatetime = (await getDltTimestamp()) - TIME_HOUR;
        await asset.connect(signer_B).publishNominalValue(1, effectiveDatetime);
        await asset.connect(signer_D).pause();
        await expect(asset.connect(signer_B).republishNominalValue(0, effectiveDatetime)).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
      });

      it("GIVEN initialization with zero and no valid publish WHEN republishNominalValue uses zero THEN reverts with InvalidTimestamp", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.nominalValue);
        await asset.initializeNominalValue(1, 6, CURRENCY_ZERO, 0, true);

        await expect(asset.connect(signer_B).republishNominalValue(2, 0)).to.be.revertedWithCustomError(
          asset,
          "InvalidTimestamp",
        );
      });

      describe("with a stored effective datetime", () => {
        let stored: number;

        beforeEach(async () => {
          stored = (await getDltTimestamp()) - 2 * TIME_HOUR;
          await asset.connect(signer_B).publishNominalValue(100n, stored);
        });

        it("GIVEN effectiveDatetime equal to the stored one WHEN republishNominalValue THEN succeeds, corrects the value, and emits NominalValueRepublished", async () => {
          await expect(asset.connect(signer_B).republishNominalValue(999n, stored))
            .to.emit(asset, "NominalValueRepublished")
            .withArgs(signer_B.address, 999n, stored);
          expect(await asset.getNominalValue()).to.equal(999n);
        });

        it("GIVEN effectiveDatetime earlier than the stored one WHEN republishNominalValue THEN reverts with NominalValueEffectiveDatetimeMismatch", async () => {
          const earlier = stored - 1000;
          await expect(asset.connect(signer_B).republishNominalValue(999n, earlier))
            .to.be.revertedWithCustomError(asset, "NominalValueEffectiveDatetimeMismatch")
            .withArgs(earlier, stored);
        });

        it("GIVEN effectiveDatetime later than the stored one WHEN republishNominalValue THEN reverts with NominalValueEffectiveDatetimeMismatch", async () => {
          const later = stored + 1000;
          await expect(asset.connect(signer_B).republishNominalValue(999n, later))
            .to.be.revertedWithCustomError(asset, "NominalValueEffectiveDatetimeMismatch")
            .withArgs(later, stored);
        });

        it("GIVEN a matching republish WHEN it succeeds THEN the effectiveDatetime is unchanged", async () => {
          await asset.connect(signer_B).republishNominalValue(999n, stored);
          // A second republish with the SAME stored datetime must still match (unchanged).
          await expect(asset.connect(signer_B).republishNominalValue(1000n, stored))
            .to.emit(asset, "NominalValueRepublished")
            .withArgs(signer_B.address, 1000n, stored);
        });

        it("GIVEN a matching republish WHEN it succeeds THEN decimals remain unchanged", async () => {
          const before = await asset.getNominalValueDecimals();
          await asset.connect(signer_B).republishNominalValue(999n, stored);
          expect(await asset.getNominalValueDecimals()).to.equal(before);
        });
      });
    });

    describe("getIsUnitNominalValue", () => {
      it("GIVEN the facet is force-unregistered and re-initialised WHEN getIsUnitNominalValue THEN returns the initialised flag, unaffected by publish/republish", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.nominalValue);
        const initDate = (await getDltTimestamp()) - 3 * TIME_HOUR;
        await asset.initializeNominalValue(1, 6, CURRENCY_ZERO, initDate, true);
        expect(await asset.getIsUnitNominalValue()).to.equal(true);

        const signer_B = (await ethers.getSigners())[1];
        await executeRbac(asset, [{ role: ATS_ROLES.ROLE_NOMINAL_VALUE, members: [signer_B.address] }]);

        const publishDate = initDate + TIME_HOUR;
        await asset.connect(signer_B).publishNominalValue(5, publishDate);
        expect(await asset.getIsUnitNominalValue()).to.equal(true);

        await asset.connect(signer_B).republishNominalValue(6, publishDate);
        expect(await asset.getIsUnitNominalValue()).to.equal(true);
      });
    });
  });
}
