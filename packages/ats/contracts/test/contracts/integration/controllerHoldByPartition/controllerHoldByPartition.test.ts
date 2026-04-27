// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { EMPTY_STRING, ZERO, EMPTY_HEX_BYTES, ADDRESS_ZERO } from "@scripts";
import { ResolverProxy, IAsset } from "@contract-types";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const _AMOUNT = 1000;
const _DATA = "0x1234";
const EMPTY_VC_ID = EMPTY_STRING;
let holdIdentifier: any;
enum ThirdPartyType {
  NULL,
  AUTHORIZED,
  OPERATOR,
  PROTECTED,
  CONTROLLER,
  CLEARING,
}

describe("ControllerHoldByPartition Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;

  let asset: IAsset;

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  let currentTimestamp = 0;
  let expirationTimestamp = 0;

  let hold: any;

  function set_initRbacs() {
    return [
      {
        role: "ISSUER_ROLE",
        members: [signer_B.address],
      },
      {
        role: "PAUSER_ROLE",
        members: [signer_D.address],
      },
      {
        role: "KYC_ROLE",
        members: [signer_B.address],
      },
      {
        role: "SSI_MANAGER_ROLE",
        members: [signer_A.address],
      },
      {
        role: "CLEARING_ROLE",
        members: [signer_A.address],
      },
      {
        role: "CORPORATE_ACTION_ROLE",
        members: [signer_B.address],
      },
      {
        role: "CONTROL_LIST_ROLE",
        members: [signer_E.address],
      },
      {
        role: "CONTROLLER_ROLE",
        members: [signer_C.address],
      },
      {
        role: "AGENT_ROLE",
        members: [signer_A.address],
      },
    ];
  }

  async function setFacets(asset: IAsset) {
    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

    await asset.connect(signer_B).issueByPartition({
      partition: _DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: _AMOUNT,
      data: EMPTY_HEX_BYTES,
    });
  }

  async function deploySecurityFixtureMultiPartition() {
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
    signer_D = base.user3;
    signer_E = base.user4;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, set_initRbacs());

    await setFacets(asset);
  }

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;
    signer_E = base.user4;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, set_initRbacs());

    await setFacets(asset);
  }

  describe("singlePartition", () => {
    async function checkCreatedHold_expected(
      balance_expected: number,
      totalHeldAmount_expected: number,
      holdCount_expected: number,
      holdAmount_expected: number,
      holdEscrow_expected: string,
      holdData_expected: string,
      holdOperatorData_expected: string,
      holdDestination_expected: string,
      holdExpirationTimestamp_expected: string,
      holdsLength_expected: number,
      holdId_expected: number,
      holdThirdPartyType_expected: ThirdPartyType,
      holdThirdPartyAddress_expected: string,
    ) {
      const balance = await asset.balanceOf(signer_A.address);
      const heldAmount = await asset.getHeldAmountForByPartition(_DEFAULT_PARTITION, signer_A.address);
      const holdCount = await asset.getHoldCountForByPartition(_DEFAULT_PARTITION, signer_A.address);
      const holdIds = await asset.getHoldsIdForByPartition(_DEFAULT_PARTITION, signer_A.address, 0, 100);

      expect(balance).to.equal(balance_expected);
      expect(heldAmount).to.equal(totalHeldAmount_expected);
      expect(holdCount).to.equal(holdCount_expected);
      expect(holdIds.length).to.equal(holdsLength_expected);

      if (holdCount_expected > 0) {
        const retrieved_hold = await asset.getHoldForByPartition(holdIdentifier);
        const holdThirdParty = await asset.getHoldThirdParty(holdIdentifier);

        expect(retrieved_hold.amount_).to.equal(holdAmount_expected);
        expect(retrieved_hold.escrow_).to.equal(holdEscrow_expected);
        expect(retrieved_hold.data_).to.equal(holdData_expected);
        expect(retrieved_hold.operatorData_).to.equal(holdOperatorData_expected);
        expect(retrieved_hold.destination_).to.equal(holdDestination_expected);
        expect(retrieved_hold.expirationTimestamp_).to.equal(holdExpirationTimestamp_expected);
        expect(holdIds[0]).to.equal(holdId_expected);
        expect(retrieved_hold.thirdPartyType_).to.equal(holdThirdPartyType_expected);
        expect(holdThirdParty).to.equal(holdThirdPartyAddress_expected);
      }
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
      currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;
      expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS;

      hold = {
        amount: _AMOUNT,
        expirationTimestamp: expirationTimestamp,
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: _DATA,
      };
      holdIdentifier = {
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        holdId: 1,
      };
    });

    describe("Paused", () => {
      beforeEach(async () => {
        await asset.connect(signer_D).pause();
      });

      it("GIVEN a paused Token WHEN controllerCreateHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          asset.controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without CONTROLLER role WHEN controllerCreateHoldByPartition THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          asset
            .connect(signer_B)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });
    });

    describe("Create with wrong input arguments", () => {
      it("Given a invalid _from address when controllerCreateHoldByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
        const hold_wrong = {
          amount: _AMOUNT,
          expirationTimestamp: expirationTimestamp,
          escrow: ADDRESS_ZERO,
          to: ADDRESS_ZERO,
          data: _DATA,
        };
        await expect(
          asset
            .connect(signer_C)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, ADDRESS_ZERO, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
      });

      it("Given noControllable token when controllerCreateHoldByPartition THEN transaction fails with TokenIsNotControllable", async () => {
        await asset.connect(signer_A).finalizeControllable();

        await expect(
          asset
            .connect(signer_C)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "TokenIsNotControllable");
      });

      it("GIVEN a Token WHEN creating hold with amount bigger than balance THEN transaction fails with InsufficientBalance", async () => {
        const AmountLargerThanBalance = 1000 * _AMOUNT;

        const hold_wrong = {
          amount: AmountLargerThanBalance,
          expirationTimestamp: expirationTimestamp,
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: _DATA,
        };

        await expect(
          asset
            .connect(signer_C)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
      });

      it("GIVEN a Token WHEN controllerCreateHoldByPartition passing empty escrow THEN transaction fails with ZeroAddressNotAllowed", async () => {
        const hold_wrong = {
          amount: _AMOUNT,
          expirationTimestamp: expirationTimestamp,
          escrow: ADDRESS_ZERO,
          to: ADDRESS_ZERO,
          data: _DATA,
        };

        await expect(
          asset
            .connect(signer_C)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
      });

      it("GIVEN a Token WHEN controllerCreateHoldByPartition passing wrong expirationTimestamp THEN transaction fails with WrongExpirationTimestamp", async () => {
        await asset.connect(signer_A).changeSystemTimestamp(currentTimestamp);
        const wrongExpirationTimestamp = currentTimestamp - 1;

        const hold_wrong = {
          amount: _AMOUNT,
          expirationTimestamp: wrongExpirationTimestamp,
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: _DATA,
        };

        await expect(
          asset
            .connect(signer_C)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
      });

      it("GIVEN a wrong partition WHEN controllerCreateHoldByPartition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        await expect(
          asset
            .connect(signer_C)
            .controllerCreateHoldByPartition(_WRONG_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
      });
    });

    describe("Create Holds OK", () => {
      it("GIVEN a Token WHEN controllerCreateHoldByPartition hold THEN transaction succeeds", async () => {
        const operatorData = "0xab56222233";

        await expect(
          asset
            .connect(signer_C)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, operatorData),
        )
          .to.emit(asset, "ControllerHeldByPartition")
          .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1, Object.values(hold), operatorData);

        await checkCreatedHold_expected(
          0,
          _AMOUNT,
          1,
          hold.amount,
          hold.escrow,
          hold.data,
          operatorData,
          hold.to,
          hold.expirationTimestamp,
          1,
          1,
          ThirdPartyType.CONTROLLER,
          ADDRESS_ZERO,
        );
      });
    });
  });

  describe("Multi-partition", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);
      currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;
      expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS;

      hold = {
        amount: _AMOUNT,
        expirationTimestamp: expirationTimestamp,
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: _DATA,
      };
    });

    it("GIVEN a Token WHEN controllerCreateHoldByPartition for wrong partition THEN transaction fails with InvalidPartition", async () => {
      await expect(
        asset
          .connect(signer_C)
          .controllerCreateHoldByPartition(_WRONG_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "InvalidPartition");
    });
  });
});
