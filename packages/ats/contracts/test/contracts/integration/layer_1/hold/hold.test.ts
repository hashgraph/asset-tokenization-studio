// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers, network } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { EMPTY_STRING, ATS_ROLES, ZERO, EMPTY_HEX_BYTES, ADDRESS_ZERO, DEFAULT_PARTITION } from "@scripts";
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

describe("Hold Tests", () => {
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

  const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "bytes32"],
    [ATS_ROLES._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, DEFAULT_PARTITION],
  );
  const packedDataWithoutPrefix = packedData.slice(2);
  const ProtectedPartitionRole_1 = ethers.keccak256("0x" + packedDataWithoutPrefix);

  function set_initRbacs() {
    return [
      {
        role: ATS_ROLES._ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_D.address],
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
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._CORPORATE_ACTION_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._CONTROL_LIST_ROLE,
        members: [signer_E.address],
      },
      {
        role: ATS_ROLES._CONTROLLER_ROLE,
        members: [signer_C.address],
      },
      {
        role: ATS_ROLES._PROTECTED_PARTITIONS_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._AGENT_ROLE,
        members: [signer_A.address],
      },
      { role: ProtectedPartitionRole_1, members: [signer_B.address] },
    ];
  }

  async function setFacets(asset: IAsset) {
    // Set the initial RBACs
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
        // Pausing the token
        await asset.connect(signer_D).pause();
      });

      it("GIVEN a paused Token WHEN operatorCreateHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          asset.operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN controllerCreateHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          asset.controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });
    });

    describe("Clearing active", () => {
      it("GIVEN a token in clearing mode THEN hold creation fails with ClearingIsActivated", async () => {
        await asset.connect(signer_A).activateClearing();
        await expect(
          asset.operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "ClearingIsActivated");
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without operator authorization WHEN operatorCreateHoldByPartition THEN transaction fails with Unauthorized", async () => {
        await expect(
          asset
            .connect(signer_B)
            .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "Unauthorized");
      });

      it("GIVEN an account without CONTROLLER role WHEN controllerCreateHoldByPartition THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          asset
            .connect(signer_B)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });
    });

    describe("Create with wrong input arguments", () => {
      it("Given a invalid _from address when operatorCreateHoldByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
        const hold_wrong = {
          amount: _AMOUNT,
          expirationTimestamp: expirationTimestamp,
          escrow: ADDRESS_ZERO,
          to: ADDRESS_ZERO,
          data: _DATA,
        };
        await expect(
          asset
            .connect(signer_B)
            .operatorCreateHoldByPartition(_DEFAULT_PARTITION, ADDRESS_ZERO, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
      });

      it("Given token with partition protected WHEN operatorCreateHoldByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        const base = await deployEquityTokenFixture({
          equityDataParams: {
            securityData: {
              isMultiPartition: false,
              arePartitionsProtected: true,
            },
          },
        });
        await executeRbac(asset, set_initRbacs());
        diamond = base.diamond;
        asset = await ethers.getContractAt("IAsset", diamond.target);
        await setFacets(asset);
        const operatorData = "0xab56";

        await asset.connect(signer_A).authorizeOperator(signer_B.address);
        await expect(
          asset
            .connect(signer_B)
            .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, operatorData),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });

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

        await asset.connect(signer_A).authorizeOperator(signer_B.address);

        await expect(
          asset
            .connect(signer_B)
            .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "InsufficientBalance");

        await asset.connect(signer_A).revokeOperator(signer_B.address);

        await expect(
          asset
            .connect(signer_C)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
      });

      it("GIVEN a Token WHEN createHoldByPartition passing empty escrow THEN transaction fails with ZeroAddressNotAllowed", async () => {
        const hold_wrong = {
          amount: _AMOUNT,
          expirationTimestamp: expirationTimestamp,
          escrow: ADDRESS_ZERO,
          to: ADDRESS_ZERO,
          data: _DATA,
        };

        await asset.connect(signer_A).authorizeOperator(signer_B.address);

        await expect(
          asset
            .connect(signer_B)
            .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");

        await asset.connect(signer_A).revokeOperator(signer_B.address);

        await expect(
          asset
            .connect(signer_C)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
      });

      it("GIVEN a Token WHEN createHoldByPartition passing wrong expirationTimestamp THEN transaction fails with WrongExpirationTimestamp", async () => {
        await asset.connect(signer_A).changeSystemTimestamp(currentTimestamp);
        const wrongExpirationTimestamp = currentTimestamp - 1;

        const hold_wrong = {
          amount: _AMOUNT,
          expirationTimestamp: wrongExpirationTimestamp,
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: _DATA,
        };

        await asset.connect(signer_A).authorizeOperator(signer_B.address);

        await expect(
          asset
            .connect(signer_B)
            .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");

        await asset.connect(signer_A).revokeOperator(signer_B.address);

        await expect(
          asset
            .connect(signer_C)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
      });

      it("GIVEN a wrong partition WHEN creating hold THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        await asset.connect(signer_A).authorizeOperator(signer_B.address);

        await expect(
          asset
            .connect(signer_B)
            .operatorCreateHoldByPartition(_WRONG_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");

        await asset.connect(signer_A).revokeOperator(signer_B.address);

        await expect(
          asset
            .connect(signer_C)
            .controllerCreateHoldByPartition(_WRONG_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
      });
    });

    describe("Create Holds OK", () => {
      // Create
      async function checkCreatedHold(
        thirdPartyType: ThirdPartyType,
        thirdPartyAddress?: string,
        operatorData?: string,
      ) {
        await checkCreatedHold_expected(
          0,
          _AMOUNT,
          1,
          hold.amount,
          hold.escrow,
          hold.data,
          operatorData ?? EMPTY_HEX_BYTES,
          hold.to,
          hold.expirationTimestamp,
          1,
          1,
          thirdPartyType,
          thirdPartyAddress ?? ADDRESS_ZERO,
        );
      }

      it("GIVEN a Token WHEN operatorCreateHoldByPartition hold THEN transaction succeeds", async () => {
        const operatorData = "0xab56";

        await asset.connect(signer_A).authorizeOperator(signer_B.address);

        await expect(
          asset
            .connect(signer_B)
            .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, operatorData),
        )
          .to.emit(asset, "OperatorHeldByPartition")
          .withArgs(signer_B.address, signer_A.address, _DEFAULT_PARTITION, 1, Object.values(hold), operatorData);

        await asset.connect(signer_A).revokeOperator(signer_B.address);

        await checkCreatedHold(ThirdPartyType.OPERATOR, ADDRESS_ZERO, operatorData);
      });

      it("GIVEN a Token WHEN controllerCreateHoldByPartition hold THEN transaction succeeds", async () => {
        const operatorData = "0xab56222233";

        await expect(
          asset
            .connect(signer_C)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, operatorData),
        )
          .to.emit(asset, "ControllerHeldByPartition")
          .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1, Object.values(hold), operatorData);

        await checkCreatedHold(ThirdPartyType.CONTROLLER, ADDRESS_ZERO, operatorData);
      });
    });

    describe("Protected Create Hold By Partition", () => {
      let protectedHold: any;
      let domain: any;

      const holdType = {
        Hold: [
          { name: "amount", type: "uint256" },
          { name: "expirationTimestamp", type: "uint256" },
          { name: "escrow", type: "address" },
          { name: "to", type: "address" },
          { name: "data", type: "bytes" },
        ],
        ProtectedHold: [
          { name: "hold", type: "Hold" },
          { name: "deadline", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
        protectedCreateHoldByPartition: [
          { name: "_partition", type: "bytes32" },
          { name: "_from", type: "address" },
          { name: "_protectedHold", type: "ProtectedHold" },
        ],
      };

      async function protectedEquityTokenFixture() {
        const base = await deployEquityTokenFixture({
          equityDataParams: {
            securityData: {
              arePartitionsProtected: true,
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

      beforeEach(async () => {
        await loadFixture(protectedEquityTokenFixture);

        const name = (await asset.getERC20Metadata()).info.name;
        const version = (await asset.getConfigInfo()).version_.toString();
        const chainId = await network.provider.send("eth_chainId");

        domain = {
          name: name,
          version: version,
          chainId: chainId,
          verifyingContract: diamond.target,
        };

        protectedHold = {
          hold: { ...hold },
          deadline: MAX_UINT256,
          nonce: 1,
        };
      });

      it("GIVEN a paused Token WHEN protectedCreateHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await asset.connect(signer_D).pause();

        const message = {
          _partition: _DEFAULT_PARTITION,
          _from: signer_A.address,
          _protectedHold: protectedHold,
        };
        const signature = await signer_A.signTypedData(domain, holdType, message);

        await expect(
          asset
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, signature),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a token in clearing mode WHEN protectedCreateHoldByPartition THEN transaction fails with ClearingIsActivated", async () => {
        await asset.connect(signer_A).activateClearing();

        const message = {
          _partition: _DEFAULT_PARTITION,
          _from: signer_A.address,
          _protectedHold: protectedHold,
        };
        const signature = await signer_A.signTypedData(domain, holdType, message);

        await expect(
          asset
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, signature),
        ).to.be.revertedWithCustomError(asset, "ClearingIsActivated");
      });

      it("GIVEN a zero _from address WHEN protectedCreateHoldByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
        await expect(
          asset
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, ADDRESS_ZERO, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
      });

      it("GIVEN a zero escrow address WHEN protectedCreateHoldByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
        protectedHold.hold.escrow = ADDRESS_ZERO;

        await expect(
          asset
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
      });

      it("GIVEN a from user recovering WHEN protectedCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
        await asset.connect(signer_A).recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

        await expect(
          asset
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });

      it("GIVEN a hold user recovering WHEN protectedCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
        await asset.connect(signer_A).recoveryAddress(protectedHold.hold.to, signer_B.address, ADDRESS_ZERO);

        await expect(
          asset
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });

      it("GIVEN a invalid timestamp WHEN protectedCreateHoldByPartition THEN transaction fails with WrongExpirationTimestamp", async () => {
        protectedHold.hold.expirationTimestamp = 0;
        const message = {
          _partition: _DEFAULT_PARTITION,
          _from: signer_A.address,
          _protectedHold: protectedHold,
        };
        // Sign the message hash
        const signature = await signer_A.signTypedData(domain, holdType, message);
        await expect(
          asset
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, signature),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
      });

      it("GIVEN an account without protected partition role WHEN protectedCreateHoldByPartition THEN transaction fails with AccountHasNoRole", async () => {
        const message = {
          _partition: _DEFAULT_PARTITION,
          _from: signer_A.address,
          _protectedHold: protectedHold,
        };
        const signature = await signer_A.signTypedData(domain, holdType, message);

        await expect(
          asset
            .connect(signer_C)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, signature),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });

      it("GIVEN valid parameters and signature WHEN protectedCreateHoldByPartition THEN transaction succeeds", async () => {
        const message = {
          _partition: _DEFAULT_PARTITION,
          _from: signer_A.address,
          _protectedHold: protectedHold,
        };
        // Sign the message hash
        const signature = await signer_A.signTypedData(domain, holdType, message);
        await expect(
          asset
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, signature),
        )
          .to.emit(asset, "ProtectedHeldByPartition")
          .withArgs(
            signer_B.address,
            signer_A.address,
            _DEFAULT_PARTITION,
            1,
            [
              protectedHold.hold.amount,
              protectedHold.hold.expirationTimestamp,
              protectedHold.hold.escrow,
              protectedHold.hold.to,
              protectedHold.hold.data,
            ],
            "0x",
          );

        // Verify hold was created correctly
        const heldAmount = await asset.getHeldAmountForByPartition(_DEFAULT_PARTITION, signer_A.address);
        expect(heldAmount).to.equal(protectedHold.hold.amount);

        const holdCount = await asset.getHoldCountForByPartition(_DEFAULT_PARTITION, signer_A.address);
        expect(holdCount).to.equal(1);

        const retrievedHold = await asset.getHoldForByPartition(holdIdentifier);
        expect(retrievedHold.amount_).to.equal(protectedHold.hold.amount);
        expect(retrievedHold.escrow_).to.equal(protectedHold.hold.escrow);
        expect(retrievedHold.destination_).to.equal(protectedHold.hold.to);
        expect(retrievedHold.expirationTimestamp_).to.equal(protectedHold.hold.expirationTimestamp);
        expect(retrievedHold.thirdPartyType_).to.equal(ThirdPartyType.PROTECTED);

        const holdThirdParty = await asset.getHoldThirdParty(holdIdentifier);
        expect(holdThirdParty).to.equal(ADDRESS_ZERO);
      });

      it("GIVEN a hold with specific destination WHEN protectedCreateHoldByPartition THEN hold is created with correct destination", async () => {
        protectedHold.hold.to = signer_C.address;

        const message = {
          _partition: _DEFAULT_PARTITION,
          _from: signer_A.address,
          _protectedHold: protectedHold,
        };
        const signature = await signer_A.signTypedData(domain, holdType, message);

        await asset
          .connect(signer_B)
          .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, signature);

        const retrievedHold = await asset.getHoldForByPartition(holdIdentifier);
        expect(retrievedHold.destination_).to.equal(signer_C.address);
      });

      it("GIVEN token without partitionsProtected WHEN protectedCreateHoldByPartition THEN revert with PartitionsAreUnProtected ", async () => {
        const base = await deployEquityTokenFixture({
          equityDataParams: {
            securityData: {
              arePartitionsProtected: false,
            },
          },
        });

        await executeRbac(asset, set_initRbacs());
        const message = {
          _partition: _DEFAULT_PARTITION,
          _from: signer_A.address,
          _protectedHold: protectedHold,
        };
        // Sign the message hash
        const signature = await signer_A.signTypedData(domain, holdType, message);
        await expect(
          (asset as any)
            .attach(base.diamond.target)
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, signature),
        ).to.revertedWithCustomError(asset, "PartitionsAreUnProtected");
      });
    });
  });

  describe("Multi-partition", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);
    });

    it("GIVEN a Token WHEN operatorCreateHoldByPartition/controllerCreateHoldByPartition for wrong partition THEN transaction fails with InvalidPartition", async () => {
      await asset.connect(signer_A).authorizeOperator(signer_B.address);

      await expect(
        asset
          .connect(signer_B)
          .operatorCreateHoldByPartition(_WRONG_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "InvalidPartition");

      await asset.connect(signer_A).revokeOperator(signer_B.address);

      await expect(
        asset
          .connect(signer_C)
          .controllerCreateHoldByPartition(_WRONG_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "InvalidPartition");
    });
  });
});
