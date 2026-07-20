// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { DEFAULT_PARTITION, PARTITION_ID_2, executeRbac, MAX_UINT256 } from "@test";
import { ADDRESS_ZERO, ATS_ROLES, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO, RESOLVER_KEYS } from "@lib";

const _AMOUNT = 1000;
const _DATA = "0x1234";
const EMPTY_VC_ID = EMPTY_STRING;

interface Hold {
  amount: bigint | number;
  expirationTimestamp: bigint | number;
  escrow: string;
  to: string;
  data: string;
}

export function holdTests(getCtx: () => AssetMockCtx): void {
  describe("Hold Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;

    const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
    let expirationTimestamp = 0;
    let hold: Hold;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      asset = ctx.asset;
    });

    function baseRbacs() {
      return [
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CONTROLLER, members: [signer_C.address] },
      ];
    }

    async function grantKycAndIssue(partition: string, amount: number) {
      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.connect(signer_B).issueByPartition({
        partition,
        tokenHolder: signer_A.address,
        value: amount,
        data: EMPTY_HEX_BYTES,
      });
    }

    describe("Single partition mode", () => {
      beforeEach(async () => {
        await executeRbac(asset, baseRbacs());
        await grantKycAndIssue(DEFAULT_PARTITION, _AMOUNT);
        expirationTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp + ONE_YEAR_IN_SECONDS;
        hold = {
          amount: _AMOUNT / 2,
          expirationTimestamp,
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: _DATA,
        };
      });

      describe("getHeldAmountFor", () => {
        it("GIVEN an account without holds WHEN getHeldAmountFor THEN returns zero", async () => {
          const heldAmount = await asset.getHeldAmountFor(signer_A.address);

          expect(heldAmount).to.equal(0);
        });

        it("GIVEN a created hold WHEN getHeldAmountFor THEN returns the hold amount", async () => {
          await asset.connect(signer_A).createHoldByPartition(DEFAULT_PARTITION, hold);

          const heldAmount = await asset.getHeldAmountFor(signer_A.address);

          expect(heldAmount).to.equal(hold.amount);
        });

        it("GIVEN multiple holds on the same partition WHEN getHeldAmountFor THEN returns the aggregated amount", async () => {
          await asset.connect(signer_A).createHoldByPartition(DEFAULT_PARTITION, hold);
          await asset.connect(signer_A).createHoldByPartition(DEFAULT_PARTITION, hold);

          const heldAmount = await asset.getHeldAmountFor(signer_A.address);

          expect(heldAmount).to.equal(Number(hold.amount) * 2);
        });

        it("GIVEN a released hold WHEN getHeldAmountFor THEN the released amount is no longer held", async () => {
          await asset.connect(signer_A).createHoldByPartition(DEFAULT_PARTITION, hold);
          const holdIdentifier = {
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            holdId: 1,
          };

          await asset.connect(signer_B).releaseHoldByPartition(holdIdentifier, hold.amount);

          const heldAmount = await asset.getHeldAmountFor(signer_A.address);

          expect(heldAmount).to.equal(0);
        });
      });

      describe("getHoldThirdParty", () => {
        it("GIVEN a hold created by the token holder WHEN getHoldThirdParty THEN returns the zero address", async () => {
          await asset.connect(signer_A).createHoldByPartition(DEFAULT_PARTITION, hold);
          const holdIdentifier = {
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            holdId: 1,
          };

          const thirdParty = await asset.getHoldThirdParty(holdIdentifier);

          expect(thirdParty).to.equal(ADDRESS_ZERO);
        });

        it("GIVEN an authorized hold WHEN getHoldThirdParty THEN returns the spender address", async () => {
          await asset.connect(signer_A).approve(signer_B.address, _AMOUNT);
          await asset
            .connect(signer_B)
            .createHoldFromByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES);
          const holdIdentifier = {
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            holdId: 1,
          };

          const thirdParty = await asset.getHoldThirdParty(holdIdentifier);

          expect(thirdParty).to.equal(signer_B.address);
        });

        it("GIVEN a non-existent hold WHEN getHoldThirdParty THEN returns the zero address", async () => {
          const holdIdentifier = {
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            holdId: 999,
          };

          const thirdParty = await asset.getHoldThirdParty(holdIdentifier);

          expect(thirdParty).to.equal(ADDRESS_ZERO);
        });
      });
    });

    describe("Multi partition mode", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);
        await executeRbac(asset, baseRbacs());
        await asset.forceControllable(true);
        await grantKycAndIssue(DEFAULT_PARTITION, _AMOUNT);
        await asset.connect(signer_B).issueByPartition({
          partition: PARTITION_ID_2,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: EMPTY_HEX_BYTES,
        });
        expirationTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp + ONE_YEAR_IN_SECONDS;
        hold = {
          amount: _AMOUNT / 2,
          expirationTimestamp,
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: _DATA,
        };
      });

      describe("getHeldAmountFor", () => {
        it("GIVEN holds on different partitions WHEN getHeldAmountFor THEN returns the aggregated amount across partitions", async () => {
          await asset.connect(signer_A).createHoldByPartition(DEFAULT_PARTITION, hold);
          await asset.connect(signer_A).createHoldByPartition(PARTITION_ID_2, hold);

          const heldAmount = await asset.getHeldAmountFor(signer_A.address);

          expect(heldAmount).to.equal(Number(hold.amount) * 2);
        });
      });

      describe("getHoldThirdParty", () => {
        it("GIVEN a controller-created hold WHEN getHoldThirdParty THEN returns the zero address", async () => {
          await asset
            .connect(signer_C)
            .controllerCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES);
          const holdIdentifier = {
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            holdId: 1,
          };

          const thirdParty = await asset.getHoldThirdParty(holdIdentifier);

          expect(thirdParty).to.equal(ADDRESS_ZERO);
        });
      });

      describe("initializeHold", () => {
        it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeHold is called THEN AccountHasNoRole", async () => {
          await expect(asset.connect(signer_C).initializeHold())
            .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
            .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
        });

        it("GIVEN already-initialised WHEN initializeHold is called again THEN FacetAlreadyRegistered", async () => {
          await expect(asset.initializeHold())
            .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
            .withArgs(RESOLVER_KEYS.hold, 1);
        });
      });

      describe("initializeHold event", () => {
        it("GIVEN a fresh deployment WHEN initializeHold is called THEN emits HoldInitialized", async () => {
          await asset.forceFacetNotRegistered(RESOLVER_KEYS.hold);
          await expect(asset.initializeHold()).to.emit(asset, "HoldInitialized");
        });
      });
    });
  });
}
