// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import {
  DEFAULT_PARTITION,
  EMPTY_STRING,
  ZERO,
  EMPTY_HEX_BYTES,
  ADDRESS_ZERO,
  ATS_ROLES,
  EQUITY_CONFIG_ID,
  CONTROLLER_HOLD_BY_PARTITION_RESOLVER_KEY,
} from "@scripts";
import { ResolverProxy, IAsset, IHoldTypes, MockDiamondCut } from "@contract-types";

const _WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const _AMOUNT = 1000;
const _DATA = "0x1234";
let holdIdentifier: IHoldTypes.HoldIdentifierStruct;
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
  let mockDiamondCut: MockDiamondCut;

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  let currentTimestamp = 0;
  let expirationTimestamp = 0;

  let hold: IHoldTypes.HoldStruct;

  function set_initRbacs() {
    return [
      {
        role: "ROLE_ISSUER",
        members: [signer_B.address],
      },
      {
        role: "ROLE_PAUSER",
        members: [signer_D.address],
      },
      {
        role: "ROLE_KYC",
        members: [signer_B.address],
      },
      {
        role: "ROLE_SSI_MANAGER",
        members: [signer_A.address],
      },
      {
        role: "ROLE_CLEARING",
        members: [signer_A.address],
      },
      {
        role: "ROLE_CORPORATE_ACTION",
        members: [signer_B.address],
      },
      {
        role: "ROLE_CONTROL_LIST",
        members: [signer_E.address],
      },
      {
        role: "ROLE_CONTROLLER",
        members: [signer_C.address],
      },
      {
        role: "ROLE_AGENT",
        members: [signer_A.address],
      },
    ];
  }

  async function setFacets(asset: IAsset) {
    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);

    await asset.connect(signer_B).issueByPartition({
      partition: DEFAULT_PARTITION,
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
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
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
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
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
      const heldAmount = await asset.getHeldAmountForByPartition(DEFAULT_PARTITION, signer_A.address);
      const holdCount = await asset.getHoldCountForByPartition(DEFAULT_PARTITION, signer_A.address);
      const holdIds = await asset.getHoldsIdForByPartition(DEFAULT_PARTITION, signer_A.address, 0, 100);

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
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        holdId: 1,
      };
    });

    describe("Paused", () => {
      beforeEach(async () => {
        await asset.connect(signer_D).pause();
      });

      it("GIVEN a paused Token WHEN controllerCreateHoldByPartition THEN transaction fails with IsPaused", async () => {
        await expect(
          asset.controllerCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without CONTROLLER role WHEN controllerCreateHoldByPartition THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          asset
            .connect(signer_B)
            .controllerCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });
    });

    describe("ClearingEnabled", () => {
      it("GIVEN clearing is activated WHEN controllerCreateHoldByPartition THEN transaction fails with ClearingIsActivated", async () => {
        await asset.connect(signer_A).activateClearing();
        await expect(
          asset
            .connect(signer_C)
            .controllerCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "ClearingIsActivated");
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
            .controllerCreateHoldByPartition(DEFAULT_PARTITION, ADDRESS_ZERO, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
      });

      it("Given noControllable token when controllerCreateHoldByPartition THEN transaction fails with TokenIsNotControllable", async () => {
        await asset.connect(signer_A).finalizeControllable();

        await expect(
          asset
            .connect(signer_C)
            .controllerCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
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
            .controllerCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
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
            .controllerCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
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
            .controllerCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
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
            .controllerCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold, operatorData),
        )
          .to.emit(asset, "ControllerHeldByPartition")
          .withArgs(signer_C.address, signer_A.address, DEFAULT_PARTITION, 1, Object.values(hold), operatorData)
          .to.emit(asset, "Transfer")
          .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);

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
  describe("initializeControllerHoldByPartition", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeControllerHoldByPartition is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_D).initializeControllerHoldByPartition())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_D.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeControllerHoldByPartition is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeControllerHoldByPartition())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(CONTROLLER_HOLD_BY_PARTITION_RESOLVER_KEY, 1);
    });
  });

  describe("initializeControllerHoldByPartition event", () => {
    it("GIVEN a fresh deployment WHEN initializeControllerHoldByPartition is called THEN emits ControllerHoldByPartitionInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(CONTROLLER_HOLD_BY_PARTITION_RESOLVER_KEY);
      await expect(asset.initializeControllerHoldByPartition()).to.emit(asset, "ControllerHoldByPartitionInitialized");
    });
  });

  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational WHEN controllerCreateHoldByPartition is called THEN AssetNotOperational", async () => {
      await expect(
        asset.controllerCreateHoldByPartition(
          ethers.ZeroHash,
          ethers.ZeroAddress,
          {
            amount: 0n,
            expirationTimestamp: 0n,
            escrow: ethers.ZeroAddress,
            to: ethers.ZeroAddress,
            data: "0x",
          },
          "0x",
        ),
      )
        .to.be.revertedWithCustomError(asset, "AssetNotOperational")
        .withArgs(EQUITY_CONFIG_ID, 1);
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
describe("Deactivated", () => {
  it("GIVEN a deactivated asset WHEN controllerCreateHoldByPartition THEN transaction fails with Deactivated", async () => {
    const base = await deployEquityTokenFixture();
    const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
    await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
    await deactivatedAsset.connect(base.deployer).deactivate();
    await expect(
      deactivatedAsset
        .connect(base.deployer)
        .controllerCreateHoldByPartition(
          ethers.ZeroHash,
          ethers.ZeroAddress,
          { amount: 0, expirationTimestamp: 0, escrow: ethers.ZeroAddress, to: ethers.ZeroAddress, data: "0x" },
          "0x",
        ),
    ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
  });
});
