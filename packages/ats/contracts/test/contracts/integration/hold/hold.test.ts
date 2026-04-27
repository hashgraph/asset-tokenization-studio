// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { ADDRESS_ZERO, ATS_ROLES, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO } from "@scripts";
import { IAsset, ResolverProxy } from "@contract-types";

const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
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

describe("Hold Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  let expirationTimestamp = 0;
  let hold: Hold;

  function baseRbacs() {
    return [
      { role: ATS_ROLES._ISSUER_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES._KYC_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES._SSI_MANAGER_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES._CONTROLLER_ROLE, members: [signer_C.address] },
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
    async function deploySingleFixture() {
      const base = await deployEquityTokenFixture();
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;

      asset = await ethers.getContractAt("IAsset", diamond.target);
      await executeRbac(asset, baseRbacs());
      await grantKycAndIssue(_PARTITION_ID_1, _AMOUNT);
    }

    beforeEach(async () => {
      await loadFixture(deploySingleFixture);
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
        await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

        const heldAmount = await asset.getHeldAmountFor(signer_A.address);

        expect(heldAmount).to.equal(hold.amount);
      });

      it("GIVEN multiple holds on the same partition WHEN getHeldAmountFor THEN returns the aggregated amount", async () => {
        await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);
        await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

        const heldAmount = await asset.getHeldAmountFor(signer_A.address);

        expect(heldAmount).to.equal(Number(hold.amount) * 2);
      });

      it("GIVEN a released hold WHEN getHeldAmountFor THEN the released amount is no longer held", async () => {
        await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);
        const holdIdentifier = {
          partition: _PARTITION_ID_1,
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
        await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);
        const holdIdentifier = {
          partition: _PARTITION_ID_1,
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
          .createHoldFromByPartition(_PARTITION_ID_1, signer_A.address, hold, EMPTY_HEX_BYTES);
        const holdIdentifier = {
          partition: _PARTITION_ID_1,
          tokenHolder: signer_A.address,
          holdId: 1,
        };

        const thirdParty = await asset.getHoldThirdParty(holdIdentifier);

        expect(thirdParty).to.equal(signer_B.address);
      });

      it("GIVEN a non-existent hold WHEN getHoldThirdParty THEN returns the zero address", async () => {
        const holdIdentifier = {
          partition: _PARTITION_ID_1,
          tokenHolder: signer_A.address,
          holdId: 999,
        };

        const thirdParty = await asset.getHoldThirdParty(holdIdentifier);

        expect(thirdParty).to.equal(ADDRESS_ZERO);
      });
    });
  });

  describe("Multi partition mode", () => {
    async function deployMultiFixture() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
          },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;

      asset = await ethers.getContractAt("IAsset", diamond.target);
      await executeRbac(asset, baseRbacs());
      await grantKycAndIssue(_PARTITION_ID_1, _AMOUNT);
      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_2,
        tokenHolder: signer_A.address,
        value: _AMOUNT,
        data: EMPTY_HEX_BYTES,
      });
    }

    beforeEach(async () => {
      await loadFixture(deployMultiFixture);
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
        await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);
        await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_2, hold);

        const heldAmount = await asset.getHeldAmountFor(signer_A.address);

        expect(heldAmount).to.equal(Number(hold.amount) * 2);
      });
    });

    describe("getHoldThirdParty", () => {
      it("GIVEN a controller-created hold WHEN getHoldThirdParty THEN returns the zero address", async () => {
        await asset
          .connect(signer_C)
          .controllerCreateHoldByPartition(_PARTITION_ID_1, signer_A.address, hold, EMPTY_HEX_BYTES);
        const holdIdentifier = {
          partition: _PARTITION_ID_1,
          tokenHolder: signer_A.address,
          holdId: 1,
        };

        const thirdParty = await asset.getHoldThirdParty(holdIdentifier);

        expect(thirdParty).to.equal(ADDRESS_ZERO);
      });
    });
  });
});
