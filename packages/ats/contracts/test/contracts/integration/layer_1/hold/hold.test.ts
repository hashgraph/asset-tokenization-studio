import { expect } from "chai";
import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import {
  EMPTY_STRING,
  ATS_ROLES,
  ZERO,
  EMPTY_HEX_BYTES,
  ADDRESS_ZERO,
  dateToUnixTimestamp,
  DEFAULT_PARTITION,
} from "@scripts";
import {
  ResolverProxy,
  PauseFacet,
  IERC1410,
  ControlListFacet,
  ERC20Facet,
  TimeTravelFacet,
  KycFacet,
  SsiManagementFacet,
  ClearingActionsFacet,
  Equity,
  LockFacet,
  SnapshotsFacet,
  IERC3643,
  ERC1644Facet,
  AccessControlFacet,
  AdjustBalancesFacet,
  CapFacet,
  DiamondFacet,
} from "@contract-types";
import { Contract } from "ethers";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
const _AMOUNT = 1000;
const _DATA = "0x1234";
const maxSupply_Original = 1000000 * _AMOUNT;
const maxSupply_Partition_1_Original = 50000 * _AMOUNT;
const maxSupply_Partition_2_Original = 0;
const ONE_SECOND = 1;
const EMPTY_VC_ID = EMPTY_STRING;
const balanceOf_A_Original = [10 * _AMOUNT, 100 * _AMOUNT];
const balanceOf_B_Original = [20 * _AMOUNT, 200 * _AMOUNT];
const adjustFactor = 253;
const adjustDecimals = 2;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  let signer_A: SignerWithAddress;
  let signer_B: SignerWithAddress;
  let signer_C: SignerWithAddress;
  let signer_D: SignerWithAddress;
  let signer_E: SignerWithAddress;

  let holdFacet: Contract;
  let pauseFacet: PauseFacet;
  let lock: LockFacet;
  let erc1410Facet: IERC1410;
  let controlListFacet: ControlListFacet;
  let erc20Facet: ERC20Facet;
  let timeTravelFacet: TimeTravelFacet;
  let kycFacet: KycFacet;
  let ssiManagementFacet: SsiManagementFacet;
  let clearingActionsFacet: ClearingActionsFacet;
  let equityFacet: Equity;
  let accessControlFacet: AccessControlFacet;
  let capFacet: CapFacet;
  let adjustBalancesFacet: AdjustBalancesFacet;
  let snapshotFacet: SnapshotsFacet;
  let erc3643Facet: IERC3643;
  let erc1644Facet: ERC1644Facet;
  let diamondCutFacet: DiamondFacet;

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  let currentTimestamp = 0;
  let expirationTimestamp = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let hold: any;

  const packedData = ethers.utils.defaultAbiCoder.encode(
    ["bytes32", "bytes32"],
    [ATS_ROLES._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, DEFAULT_PARTITION],
  );
  const packedDataWithoutPrefix = packedData.slice(2);
  const ProtectedPartitionRole_1 = ethers.utils.keccak256("0x" + packedDataWithoutPrefix);

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

  async function setFacets({ diamond }: { diamond: ResolverProxy }) {
    const holdManagementFacet = await ethers.getContractAt("HoldManagementFacet", diamond.address, signer_A);

    const holdReadFacet = await ethers.getContractAt("HoldReadFacet", diamond.address, signer_A);
    const holdTokenHolderFacet = await ethers.getContractAt("HoldTokenHolderFacet", diamond.address, signer_A);

    const fragmentMap = new Map<string, any>();
    [
      ...holdManagementFacet.interface.fragments,
      ...holdReadFacet.interface.fragments,
      ...holdTokenHolderFacet.interface.fragments,
    ].forEach((fragment) => {
      const key = fragment.format();
      if (!fragmentMap.has(key)) {
        fragmentMap.set(key, fragment);
      }
    });

    const uniqueFragments = Array.from(fragmentMap.values());

    holdFacet = new Contract(diamond.address, uniqueFragments, signer_A);

    lock = await ethers.getContractAt("LockFacet", diamond.address, signer_A);
    pauseFacet = await ethers.getContractAt("PauseFacet", diamond.address, signer_D);
    erc1410Facet = await ethers.getContractAt("IERC1410", diamond.address, signer_B);
    kycFacet = await ethers.getContractAt("KycFacet", diamond.address, signer_B);
    ssiManagementFacet = await ethers.getContractAt("SsiManagementFacet", diamond.address, signer_A);
    equityFacet = await ethers.getContractAt("Equity", diamond.address, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.address, signer_A);
    adjustBalancesFacet = await ethers.getContractAt("AdjustBalancesFacet", diamond.address, signer_A);
    clearingActionsFacet = await ethers.getContractAt("ClearingActionsFacet", diamond.address, signer_A);
    snapshotFacet = await ethers.getContractAt("SnapshotsFacet", diamond.address);

    capFacet = await ethers.getContractAt("CapFacet", diamond.address, signer_A);
    accessControlFacet = await ethers.getContractAt("AccessControlFacet", diamond.address, signer_A);
    erc20Facet = await ethers.getContractAt("ERC20Facet", diamond.address, signer_A);
    controlListFacet = await ethers.getContractAt("ControlListFacet", diamond.address, signer_E);
    erc3643Facet = await ethers.getContractAt("IERC3643", diamond.address, signer_A);
    erc1644Facet = await ethers.getContractAt("ERC1644Facet", diamond.address, signer_A);
    diamondCutFacet = await ethers.getContractAt("DiamondFacet", diamond.address, signer_A);

    // Set the initial RBACs
    await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address);
    await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await kycFacet.grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await kycFacet.grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

    await erc1410Facet.issueByPartition({
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

    await executeRbac(base.accessControlFacet, set_initRbacs());

    await setFacets({ diamond });
  }

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;
    signer_E = base.user4;

    await executeRbac(base.accessControlFacet, set_initRbacs());

    await setFacets({ diamond });
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
      const balance = await erc1410Facet.balanceOf(signer_A.address);
      const heldAmount = await holdFacet.getHeldAmountForByPartition(_DEFAULT_PARTITION, signer_A.address);
      const holdCount = await holdFacet.getHoldCountForByPartition(_DEFAULT_PARTITION, signer_A.address);
      const holdIds = await holdFacet.getHoldsIdForByPartition(_DEFAULT_PARTITION, signer_A.address, 0, 100);

      expect(balance).to.equal(balance_expected);
      expect(heldAmount).to.equal(totalHeldAmount_expected);
      expect(holdCount).to.equal(holdCount_expected);
      expect(holdIds.length).to.equal(holdsLength_expected);

      if (holdCount_expected > 0) {
        const retrieved_hold = await holdFacet.getHoldForByPartition(holdIdentifier);
        const holdThirdParty = await holdFacet.getHoldThirdParty(holdIdentifier);

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
      currentTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
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

    describe("snapshot", () => {
      it("GIVEN an account with snapshot role WHEN takeSnapshot and Hold THEN transaction succeeds", async () => {
        const EXPIRATION_TIMESTAMP = dateToUnixTimestamp(`2030-01-01T00:00:35Z`);

        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._SNAPSHOT_ROLE, signer_A.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._LOCKER_ROLE, signer_A.address);

        // snapshot
        await snapshotFacet.connect(signer_A).takeSnapshot();

        // Operations
        const hold = {
          amount: 1,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          escrow: signer_A.address,
          to: ADDRESS_ZERO,
          data: EMPTY_HEX_BYTES,
        };
        await holdFacet.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, hold);
        await holdFacet.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, hold);
        await holdFacet.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, hold);
        await holdFacet.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, hold);

        // snapshot
        await snapshotFacet.connect(signer_A).takeSnapshot();

        // Operations
        holdIdentifier.holdId = 1;
        await holdFacet.connect(signer_A).releaseHoldByPartition(holdIdentifier, 1);
        holdIdentifier.holdId = 2;
        await holdFacet.connect(signer_A).executeHoldByPartition(holdIdentifier, signer_B.address, 1);
        await timeTravelFacet.changeSystemTimestamp(EXPIRATION_TIMESTAMP + 1);
        holdIdentifier.holdId = 3;
        await holdFacet.connect(signer_A).reclaimHoldByPartition(holdIdentifier);

        // snapshot
        await snapshotFacet.connect(signer_A).takeSnapshot();

        // checks
        const snapshot_Balance_Of_A_1 = await snapshotFacet.balanceOfAtSnapshot(1, signer_A.address);
        const snapshot_Balance_Of_B_1 = await snapshotFacet.balanceOfAtSnapshot(1, signer_B.address);
        const snapshot_HeldBalance_Of_A_1 = await snapshotFacet.heldBalanceOfAtSnapshot(1, signer_A.address);
        const snapshot_Total_Supply_1 = await snapshotFacet.totalSupplyAtSnapshot(1);

        expect(snapshot_Balance_Of_A_1).to.equal(_AMOUNT);
        expect(snapshot_Balance_Of_B_1).to.equal(0);
        expect(snapshot_HeldBalance_Of_A_1).to.equal(0);
        expect(snapshot_Total_Supply_1).to.equal(_AMOUNT);

        const snapshot_Balance_Of_A_2 = await snapshotFacet.balanceOfAtSnapshot(2, signer_A.address);
        const snapshot_Balance_Of_B_2 = await snapshotFacet.balanceOfAtSnapshot(2, signer_B.address);
        const snapshot_HeldBalance_Of_A_2 = await snapshotFacet.heldBalanceOfAtSnapshot(2, signer_A.address);
        const snapshot_Total_Supply_2 = await snapshotFacet.totalSupplyAtSnapshot(2);

        expect(snapshot_Balance_Of_A_2).to.equal(_AMOUNT - 4);
        expect(snapshot_Balance_Of_B_2).to.equal(0);
        expect(snapshot_HeldBalance_Of_A_2).to.equal(4);
        expect(snapshot_Total_Supply_2).to.equal(_AMOUNT);

        const snapshot_Balance_Of_A_3 = await snapshotFacet.balanceOfAtSnapshot(3, signer_A.address);
        const snapshot_Balance_Of_B_3 = await snapshotFacet.balanceOfAtSnapshot(3, signer_B.address);
        const snapshot_HeldBalance_Of_A_3 = await snapshotFacet.heldBalanceOfAtSnapshot(3, signer_A.address);
        const snapshot_Total_Supply_3 = await snapshotFacet.totalSupplyAtSnapshot(3);

        expect(snapshot_Balance_Of_A_3).to.equal(_AMOUNT - 2);
        expect(snapshot_Balance_Of_B_3).to.equal(1);
        expect(snapshot_HeldBalance_Of_A_3).to.equal(1);
        expect(snapshot_Total_Supply_3).to.equal(_AMOUNT);
      });
    });

    describe("Paused", () => {
      beforeEach(async () => {
        // Pausing the token
        await pauseFacet.pause();
      });

      // Create
      it("GIVEN a paused Token WHEN createHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold)).to.be.revertedWithCustomError(
          pauseFacet,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused Token WHEN createHoldFromByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          holdFacet.createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN operatorCreateHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          holdFacet.operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN controllerCreateHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          holdFacet.controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });

      // Execute
      it("GIVEN a paused Token WHEN executeHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          holdFacet.executeHoldByPartition(holdIdentifier, signer_C.address, 1),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });

      // Release
      it("GIVEN a paused Token WHEN releaseHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(holdFacet.releaseHoldByPartition(holdIdentifier, 1)).to.be.revertedWithCustomError(
          pauseFacet,
          "TokenIsPaused",
        );
      });

      // Reclaim
      it("GIVEN a paused Token WHEN reclaimHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(holdFacet.reclaimHoldByPartition(holdIdentifier)).to.be.revertedWithCustomError(
          pauseFacet,
          "TokenIsPaused",
        );
      });
    });

    describe("Clearing active", () => {
      it("GIVEN a token in clearing mode THEN hold creation fails with ClearingIsActivated", async () => {
        await clearingActionsFacet.activateClearing();
        await expect(holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold)).to.be.revertedWithCustomError(
          holdFacet,
          "ClearingIsActivated",
        );
        await expect(
          holdFacet.createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(holdFacet, "ClearingIsActivated");
        await expect(
          holdFacet.operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(holdFacet, "ClearingIsActivated");
      });
    });

    describe("AccessControl", () => {
      // Create
      it("GIVEN an account without authorization WHEN createHoldFromByPartition THEN transaction fails with InsufficientAllowance", async () => {
        await expect(
          holdFacet
            .connect(signer_D)
            .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientAllowance");
      });

      it("GIVEN an account without operator authorization WHEN operatorCreateHoldByPartition THEN transaction fails with Unauthorized", async () => {
        await expect(
          holdFacet
            .connect(signer_B)
            .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(holdFacet, "Unauthorized");
      });

      it("GIVEN an account without CONTROLLER role WHEN controllerCreateHoldByPartition THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          holdFacet
            .connect(signer_B)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(holdFacet, "AccountHasNoRole");
      });
    });

    describe("Control List", () => {
      // Execute
      it("GIVEN a blacklisted destination account WHEN executeHoldByPartition THEN transaction fails with AccountIsBlocked", async () => {
        await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);

        await controlListFacet.addToControlList(signer_C.address);

        await expect(
          holdFacet.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, 1),
        ).to.be.revertedWithCustomError(controlListFacet, "AccountIsBlocked");
      });

      it("GIVEN a blacklisted origin account WHEN executeHoldByPartition THEN transaction fails with AccountIsBlocked", async () => {
        await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);

        await controlListFacet.addToControlList(signer_A.address);

        await expect(
          holdFacet.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_B.address, 1),
        ).to.be.revertedWithCustomError(controlListFacet, "AccountIsBlocked");
      });
    });

    describe("KYC", () => {
      it("Given a non kyc account WHEN executeHoldByPartition THEN transaction fails with InvalidKycStatus", async () => {
        await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);
        await kycFacet.revokeKyc(signer_A.address);
        await expect(
          holdFacet.connect(signer_A).executeHoldByPartition(holdIdentifier, signer_B.address, 1),
        ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");
        await expect(
          holdFacet.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_A.address, 1),
        ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");
      });
    });

    describe("Create with wrong input arguments", () => {
      it("Given a invalid _from address when createHoldFromByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
        await erc20Facet.connect(signer_A).approve(signer_B.address, _AMOUNT);

        await expect(
          holdFacet
            .connect(signer_B)
            .createHoldFromByPartition(_DEFAULT_PARTITION, ADDRESS_ZERO, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(holdFacet, "ZeroAddressNotAllowed");
      });

      it("Given a invalid _from address when operatorCreateHoldByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
        const hold_wrong = {
          amount: _AMOUNT,
          expirationTimestamp: expirationTimestamp,
          escrow: ADDRESS_ZERO,
          to: ADDRESS_ZERO,
          data: _DATA,
        };
        await expect(
          holdFacet
            .connect(signer_B)
            .operatorCreateHoldByPartition(_DEFAULT_PARTITION, ADDRESS_ZERO, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(holdFacet, "ZeroAddressNotAllowed");
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
        await executeRbac(base.accessControlFacet, set_initRbacs());
        diamond = base.diamond;
        await setFacets({ diamond });
        const operatorData = "0xab56";

        await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);
        await expect(
          holdFacet
            .connect(signer_B)
            .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, operatorData),
        ).to.be.rejectedWith("PartitionsAreProtectedAndNoRole");
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
          holdFacet
            .connect(signer_B)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, ADDRESS_ZERO, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(holdFacet, "ZeroAddressNotAllowed");
      });
      it("Given noControllable token when controllerCreateHoldByPartition THEN transaction fails with TokenIsNotControllable", async () => {
        await erc1644Facet.finalizeControllable();

        await expect(
          holdFacet
            .connect(signer_C)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc1644Facet, "TokenIsNotControllable");
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

        await expect(holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold_wrong)).to.be.revertedWithCustomError(
          erc20Facet,
          "InsufficientBalance",
        );

        await erc20Facet.connect(signer_A).approve(signer_B.address, AmountLargerThanBalance);

        await expect(
          holdFacet
            .connect(signer_B)
            .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientBalance");

        await erc20Facet.connect(signer_A).decreaseAllowance(signer_B.address, AmountLargerThanBalance);

        await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);

        await expect(
          holdFacet
            .connect(signer_B)
            .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientBalance");

        await erc1410Facet.connect(signer_A).revokeOperator(signer_B.address);

        await expect(
          holdFacet
            .connect(signer_C)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientBalance");
      });

      it("GIVEN msg.sender recovering WHEN createHoldByPartition THEN transaction fails with WalletRecovered", async () => {
        await erc3643Facet.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

        await expect(holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold)).to.be.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
      });

      it("GIVEN hold.to recovering WHEN createHoldByPartition THEN transaction fails with WalletRecovered", async () => {
        const hold_with_destination = {
          amount: _AMOUNT,
          expirationTimestamp: expirationTimestamp,
          escrow: signer_B.address,
          to: signer_C.address,
          data: _DATA,
        };

        await erc3643Facet.recoveryAddress(signer_C.address, signer_B.address, ADDRESS_ZERO);

        await expect(
          holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold_with_destination),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
      });

      it("GIVEN a Token WHEN createHoldByPartition passing empty escrow THEN transaction fails with ZeroAddressNotAllowed", async () => {
        const hold_wrong = {
          amount: _AMOUNT,
          expirationTimestamp: expirationTimestamp,
          escrow: ADDRESS_ZERO,
          to: ADDRESS_ZERO,
          data: _DATA,
        };

        await expect(holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold_wrong)).to.be.revertedWithCustomError(
          holdFacet,
          "ZeroAddressNotAllowed",
        );

        await erc20Facet.connect(signer_A).approve(signer_B.address, _AMOUNT);

        await expect(
          holdFacet
            .connect(signer_B)
            .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(holdFacet, "ZeroAddressNotAllowed");

        await erc20Facet.connect(signer_A).decreaseAllowance(signer_B.address, _AMOUNT);

        await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);

        await expect(
          holdFacet
            .connect(signer_B)
            .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(holdFacet, "ZeroAddressNotAllowed");

        await erc1410Facet.connect(signer_A).revokeOperator(signer_B.address);

        await expect(
          holdFacet
            .connect(signer_C)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(holdFacet, "ZeroAddressNotAllowed");
      });

      it("GIVEN a Token WHEN createHoldByPartition passing wrong expirationTimestamp THEN transaction fails with WrongExpirationTimestamp", async () => {
        await timeTravelFacet.changeSystemTimestamp(currentTimestamp);
        const wrongExpirationTimestamp = currentTimestamp - 1;

        const hold_wrong = {
          amount: _AMOUNT,
          expirationTimestamp: wrongExpirationTimestamp,
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: _DATA,
        };

        await expect(holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold_wrong)).to.be.revertedWithCustomError(
          erc20Facet,
          "WrongExpirationTimestamp",
        );

        await erc20Facet.connect(signer_A).approve(signer_B.address, _AMOUNT);

        await expect(
          holdFacet
            .connect(signer_B)
            .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(equityFacet, "WrongExpirationTimestamp");

        await erc20Facet.connect(signer_A).decreaseAllowance(signer_B.address, _AMOUNT);

        await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);

        await expect(
          holdFacet
            .connect(signer_B)
            .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(lock, "WrongExpirationTimestamp");

        await erc1410Facet.connect(signer_A).revokeOperator(signer_B.address);

        await expect(
          holdFacet
            .connect(signer_C)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(lock, "WrongExpirationTimestamp");
      });

      it("GIVEN a wrong partition WHEN creating hold THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        await expect(holdFacet.createHoldByPartition(_WRONG_PARTITION, hold)).to.be.revertedWithCustomError(
          erc1410Facet,
          "PartitionNotAllowedInSinglePartitionMode",
        );

        await erc20Facet.connect(signer_A).approve(signer_B.address, _AMOUNT);

        await expect(
          holdFacet
            .connect(signer_B)
            .createHoldFromByPartition(_WRONG_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode");

        await erc20Facet.connect(signer_A).decreaseAllowance(signer_B.address, _AMOUNT);

        await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);

        await expect(
          holdFacet
            .connect(signer_B)
            .operatorCreateHoldByPartition(_WRONG_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode");

        await erc1410Facet.connect(signer_A).revokeOperator(signer_B.address);

        await expect(
          holdFacet
            .connect(signer_C)
            .controllerCreateHoldByPartition(_WRONG_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode");
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

      it("GIVEN a Token WHEN createHoldByPartition hold THEN transaction succeeds", async () => {
        await expect(holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold))
          .to.emit(holdFacet, "HeldByPartition")
          .withArgs(signer_A.address, signer_A.address, _DEFAULT_PARTITION, 1, Object.values(hold), EMPTY_HEX_BYTES);

        await checkCreatedHold(ThirdPartyType.NULL);
      });

      it("GIVEN a Token WHEN createHoldFromByPartition hold THEN transaction succeeds", async () => {
        await erc20Facet.connect(signer_A).approve(signer_B.address, _AMOUNT);

        const operatorData = EMPTY_HEX_BYTES;

        await expect(
          holdFacet
            .connect(signer_B)
            .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, operatorData),
        )
          .to.emit(holdFacet, "HeldFromByPartition")
          .withArgs(signer_B.address, signer_A.address, _DEFAULT_PARTITION, 1, Object.values(hold), operatorData);

        await checkCreatedHold(ThirdPartyType.AUTHORIZED, signer_B.address, operatorData);
      });

      it("GIVEN a Token WHEN operatorCreateHoldByPartition hold THEN transaction succeeds", async () => {
        const operatorData = "0xab56";

        await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);

        await expect(
          holdFacet
            .connect(signer_B)
            .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, operatorData),
        )
          .to.emit(holdFacet, "OperatorHeldByPartition")
          .withArgs(signer_B.address, signer_A.address, _DEFAULT_PARTITION, 1, Object.values(hold), operatorData);

        await erc1410Facet.connect(signer_A).revokeOperator(signer_B.address);

        await checkCreatedHold(ThirdPartyType.OPERATOR, ADDRESS_ZERO, operatorData);
      });

      it("GIVEN a Token WHEN controllerCreateHoldByPartition hold THEN transaction succeeds", async () => {
        const operatorData = "0xab56222233";

        await expect(
          holdFacet
            .connect(signer_C)
            .controllerCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, operatorData),
        )
          .to.emit(holdFacet, "ControllerHeldByPartition")
          .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1, Object.values(hold), operatorData);

        await checkCreatedHold(ThirdPartyType.CONTROLLER, ADDRESS_ZERO, operatorData);
      });
    });

    describe("Execute with wrong input arguments", () => {
      it("GIVEN a wrong hold id WHEN executeHoldByPartition THEN transaction fails with WrongHoldId", async () => {
        holdIdentifier.holdId = 999;

        await expect(
          holdFacet.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, 1),
        ).to.be.revertedWithCustomError(holdFacet, "WrongHoldId");
      });

      it("GIVEN a wrong escrow id WHEN executeHoldByPartition THEN transaction fails with IsNotEscrow", async () => {
        await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);

        await expect(
          holdFacet.connect(signer_C).executeHoldByPartition(holdIdentifier, signer_C.address, 1),
        ).to.be.revertedWithCustomError(holdFacet, "IsNotEscrow");
      });

      it("GIVEN a wrong partition WHEN executeHoldByPartition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        holdIdentifier.partition = _WRONG_PARTITION;
        await expect(
          holdFacet.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, 1),
        ).to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode");
      });

      it("GIVEN a hold WHEN executeHoldByPartition for an amount larger than the total held amount THEN transaction fails with InsufficientHoldBalance", async () => {
        await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);

        await expect(
          holdFacet.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, 2 * _AMOUNT),
        ).to.be.revertedWithCustomError(holdFacet, "InsufficientHoldBalance");
      });

      it("GIVEN a hold WHEN executeHoldByPartition after expiration date THEN transaction fails with HoldExpirationReached", async () => {
        const initDate = dateToUnixTimestamp("2030-01-01T00:00:03Z");
        const finalDate = dateToUnixTimestamp("2030-02-01T00:00:03Z");

        hold.expirationTimestamp = finalDate - 1;

        await timeTravelFacet.changeSystemTimestamp(initDate);

        await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);

        await timeTravelFacet.changeSystemTimestamp(finalDate);

        await expect(
          holdFacet.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, 1),
        ).to.be.revertedWithCustomError(holdFacet, "HoldExpirationReached");
      });

      it("GIVEN a hold with a destination WHEN executeHoldByPartition to another destination THEN transaction fails with InvalidDestinationAddress", async () => {
        hold.to = signer_D.address;

        await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);

        await expect(
          holdFacet.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, _AMOUNT),
        ).to.be.revertedWithCustomError(holdFacet, "InvalidDestinationAddress");
      });
    });

    describe("Release with wrong input arguments", () => {
      it("GIVEN a wrong hold id WHEN releaseHoldByPartition THEN transaction fails with WrongHoldId", async () => {
        holdIdentifier.holdId = 999;

        await expect(
          holdFacet.connect(signer_B).releaseHoldByPartition(holdIdentifier, 1),
        ).to.be.revertedWithCustomError(holdFacet, "WrongHoldId");
      });

      it("GIVEN a wrong escrow WHEN releaseHoldByPartition THEN transaction fails with IsNotEscrow", async () => {
        await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);

        await expect(
          holdFacet.connect(signer_C).releaseHoldByPartition(holdIdentifier, 1),
        ).to.be.revertedWithCustomError(holdFacet, "IsNotEscrow");
      });

      it("GIVEN a wrong partition WHEN releaseHoldByPartition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        holdIdentifier.partition = _WRONG_PARTITION;
        await expect(
          holdFacet.connect(signer_B).releaseHoldByPartition(holdIdentifier, 1),
        ).to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode");
      });

      it("GIVEN a hold WHEN releaseHoldByPartition for an amount larger than the total held amount THEN transaction fails with InsufficientHoldBalance", async () => {
        await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);

        await expect(
          holdFacet.connect(signer_B).releaseHoldByPartition(holdIdentifier, 2 * _AMOUNT),
        ).to.be.revertedWithCustomError(holdFacet, "InsufficientHoldBalance");
      });

      it("GIVEN hold WHEN releaseHoldByPartition after expiration date THEN transaction fails with HoldExpirationReached", async () => {
        const initDate = dateToUnixTimestamp("2030-01-01T00:00:03Z");
        const finalDate = dateToUnixTimestamp("2030-02-01T00:00:03Z");

        hold.expirationTimestamp = finalDate - 1;

        await timeTravelFacet.changeSystemTimestamp(initDate);

        await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);

        await timeTravelFacet.changeSystemTimestamp(finalDate);

        await expect(
          holdFacet.connect(signer_B).releaseHoldByPartition(holdIdentifier, 1),
        ).to.be.revertedWithCustomError(holdFacet, "HoldExpirationReached");
      });
    });

    describe("Reclaim with wrong input arguments", () => {
      it("GIVEN a wrong id WHEN reclaimHoldByPartition THEN transaction fails with WrongHoldId", async () => {
        holdIdentifier.holdId = 2;
        await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);

        await expect(holdFacet.reclaimHoldByPartition(holdIdentifier)).to.be.revertedWithCustomError(
          holdFacet,
          "WrongHoldId",
        );
      });

      it("GIVEN a wrong partition WHEN reclaimHoldByPartition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        holdIdentifier.partition = _WRONG_PARTITION;
        await expect(holdFacet.connect(signer_B).reclaimHoldByPartition(holdIdentifier)).to.be.revertedWithCustomError(
          erc1410Facet,
          "PartitionNotAllowedInSinglePartitionMode",
        );
      });

      it("GIVEN hold WHEN reclaimHoldByPartition after expiration date THEN transaction fails with HoldExpirationNotReached", async () => {
        await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);

        await expect(holdFacet.connect(signer_B).reclaimHoldByPartition(holdIdentifier)).to.be.revertedWithCustomError(
          holdFacet,
          "HoldExpirationNotReached",
        );
      });
    });

    describe("Execute OK", () => {
      it("GIVEN hold with no destination WHEN executeHoldByPartition THEN transaction succeeds", async () => {
        const balance_before = await erc1410Facet.balanceOf(signer_C.address);

        await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);

        await expect(holdFacet.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, _AMOUNT))
          .to.emit(holdFacet, "HoldByPartitionExecuted")
          .withArgs(signer_A.address, _DEFAULT_PARTITION, 1, _AMOUNT, signer_C.address);

        await checkCreatedHold_expected(
          0,
          0,
          0,
          0,
          EMPTY_STRING,
          EMPTY_HEX_BYTES,
          EMPTY_HEX_BYTES,
          EMPTY_STRING,
          EMPTY_STRING,
          0,
          0,
          ThirdPartyType.NULL,
          ADDRESS_ZERO,
        );

        const balance_after = await erc1410Facet.balanceOf(signer_C.address);

        expect(balance_after.toNumber()).to.equal(balance_before.add(_AMOUNT).toNumber());
      });
    });

    describe("Release OK", () => {
      it("GIVEN hold with no destination WHEN releaseHoldByPartition THEN transaction succeeds", async () => {
        await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);

        await expect(holdFacet.connect(signer_B).releaseHoldByPartition(holdIdentifier, _AMOUNT))
          .to.emit(holdFacet, "HoldByPartitionReleased")
          .withArgs(signer_A.address, _DEFAULT_PARTITION, 1, _AMOUNT);

        await checkCreatedHold_expected(
          _AMOUNT,
          0,
          0,
          0,
          EMPTY_STRING,
          EMPTY_HEX_BYTES,
          EMPTY_HEX_BYTES,
          EMPTY_STRING,
          EMPTY_STRING,
          0,
          0,
          ThirdPartyType.NULL,
          ADDRESS_ZERO,
        );
      });

      it("GIVEN a hold created by an approved user WHEN releaseHoldByPartition THEN allowance is restored", async () => {
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await holdFacet
          .connect(signer_B)
          .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES);

        expect(await erc20Facet.allowance(signer_A.address, signer_B.address)).to.be.equal(ZERO);

        await expect(holdFacet.connect(signer_B).releaseHoldByPartition(holdIdentifier, _AMOUNT))
          .to.emit(erc20Facet, "Approval")
          .withArgs(signer_A.address, signer_B.address, _AMOUNT);

        expect(await erc20Facet.allowance(signer_A.address, signer_B.address)).to.be.equal(_AMOUNT);
      });
    });

    describe("Reclaim OK", () => {
      it("GIVEN hold with no destination WHEN reclaimHoldByPartition THEN transaction succeeds", async () => {
        const initDate = dateToUnixTimestamp("2030-01-01T00:00:03Z");
        const finalDate = dateToUnixTimestamp("2030-02-01T00:00:03Z");

        hold.expirationTimestamp = finalDate - 1;

        await timeTravelFacet.changeSystemTimestamp(initDate);

        await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);

        await timeTravelFacet.changeSystemTimestamp(finalDate);

        await expect(holdFacet.connect(signer_B).reclaimHoldByPartition(holdIdentifier))
          .to.emit(holdFacet, "HoldByPartitionReclaimed")
          .withArgs(signer_B.address, signer_A.address, _DEFAULT_PARTITION, 1, _AMOUNT);

        await checkCreatedHold_expected(
          _AMOUNT,
          0,
          0,
          0,
          EMPTY_STRING,
          EMPTY_HEX_BYTES,
          EMPTY_HEX_BYTES,
          EMPTY_STRING,
          EMPTY_STRING,
          0,
          0,
          ThirdPartyType.NULL,
          ADDRESS_ZERO,
        );
      });
    });

    it("GIVEN a hold created by an approved user WHEN reclaimHoldByPartition THEN allowance is restored", async () => {
      await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
      await holdFacet
        .connect(signer_B)
        .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES);

      expect(await erc20Facet.allowance(signer_A.address, signer_B.address)).to.be.equal(ZERO);

      await timeTravelFacet.changeSystemTimestamp(hold.expirationTimestamp + 1);

      await expect(holdFacet.reclaimHoldByPartition(holdIdentifier))
        .to.emit(erc20Facet, "Approval")
        .withArgs(signer_A.address, signer_B.address, _AMOUNT);

      expect(await erc20Facet.allowance(signer_A.address, signer_B.address)).to.be.equal(_AMOUNT);
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

        await executeRbac(base.accessControlFacet, set_initRbacs());
        await setFacets({ diamond });
      }

      beforeEach(async () => {
        await loadFixture(protectedEquityTokenFixture);

        const name = (await erc20Facet.getERC20Metadata()).info.name;
        const version = (await diamondCutFacet.getConfigInfo()).version_.toString();
        const chainId = await network.provider.send("eth_chainId");

        domain = {
          name: name,
          version: version,
          chainId: chainId,
          verifyingContract: diamond.address,
        };

        protectedHold = {
          hold: { ...hold },
          deadline: MAX_UINT256,
          nonce: 1,
        };
      });

      it("GIVEN a paused Token WHEN protectedCreateHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await pauseFacet.pause();

        const message = {
          _partition: _DEFAULT_PARTITION,
          _from: signer_A.address,
          _protectedHold: protectedHold,
        };
        const signature = await signer_A._signTypedData(domain, holdType, message);

        await expect(
          holdFacet
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, signature),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });

      it("GIVEN a token in clearing mode WHEN protectedCreateHoldByPartition THEN transaction fails with ClearingIsActivated", async () => {
        await clearingActionsFacet.activateClearing();

        const message = {
          _partition: _DEFAULT_PARTITION,
          _from: signer_A.address,
          _protectedHold: protectedHold,
        };
        const signature = await signer_A._signTypedData(domain, holdType, message);

        await expect(
          holdFacet
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, signature),
        ).to.be.revertedWithCustomError(holdFacet, "ClearingIsActivated");
      });

      it("GIVEN a zero _from address WHEN protectedCreateHoldByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
        await expect(
          holdFacet
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, ADDRESS_ZERO, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(holdFacet, "ZeroAddressNotAllowed");
      });

      it("GIVEN a zero escrow address WHEN protectedCreateHoldByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
        protectedHold.hold.escrow = ADDRESS_ZERO;

        await expect(
          holdFacet
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(holdFacet, "ZeroAddressNotAllowed");
      });

      it("GIVEN a from user recovering WHEN protectedCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
        await erc3643Facet.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

        await expect(
          holdFacet
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
      });

      it("GIVEN a hold user recovering WHEN protectedCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
        await erc3643Facet.recoveryAddress(protectedHold.hold.to, signer_B.address, ADDRESS_ZERO);

        await expect(
          holdFacet
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
      });

      it("GIVEN a invalid timestamp WHEN protectedCreateHoldByPartition THEN transaction fails with WrongExpirationTimestamp", async () => {
        protectedHold.hold.expirationTimestamp = 0;
        const message = {
          _partition: _DEFAULT_PARTITION,
          _from: signer_A.address,
          _protectedHold: protectedHold,
        };
        // Sign the message hash
        const signature = await signer_A._signTypedData(domain, holdType, message);
        await expect(
          holdFacet
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, signature),
        ).to.be.revertedWithCustomError(lock, "WrongExpirationTimestamp");
      });

      it("GIVEN an account without protected partition role WHEN protectedCreateHoldByPartition THEN transaction fails with AccountHasNoRole", async () => {
        const message = {
          _partition: _DEFAULT_PARTITION,
          _from: signer_A.address,
          _protectedHold: protectedHold,
        };
        const signature = await signer_A._signTypedData(domain, holdType, message);

        await expect(
          holdFacet
            .connect(signer_C)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, signature),
        ).to.be.revertedWithCustomError(accessControlFacet, "AccountHasNoRole");
      });

      it("GIVEN valid parameters and signature WHEN protectedCreateHoldByPartition THEN transaction succeeds", async () => {
        const message = {
          _partition: _DEFAULT_PARTITION,
          _from: signer_A.address,
          _protectedHold: protectedHold,
        };
        // Sign the message hash
        const signature = await signer_A._signTypedData(domain, holdType, message);
        await expect(
          holdFacet
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, signature),
        )
          .to.emit(holdFacet, "ProtectedHeldByPartition")
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
        const heldAmount = await holdFacet.getHeldAmountForByPartition(_DEFAULT_PARTITION, signer_A.address);
        expect(heldAmount).to.equal(protectedHold.hold.amount);

        const holdCount = await holdFacet.getHoldCountForByPartition(_DEFAULT_PARTITION, signer_A.address);
        expect(holdCount).to.equal(1);

        const retrievedHold = await holdFacet.getHoldForByPartition(holdIdentifier);
        expect(retrievedHold.amount_).to.equal(protectedHold.hold.amount);
        expect(retrievedHold.escrow_).to.equal(protectedHold.hold.escrow);
        expect(retrievedHold.destination_).to.equal(protectedHold.hold.to);
        expect(retrievedHold.expirationTimestamp_).to.equal(protectedHold.hold.expirationTimestamp);
        expect(retrievedHold.thirdPartyType_).to.equal(ThirdPartyType.PROTECTED);

        const holdThirdParty = await holdFacet.getHoldThirdParty(holdIdentifier);
        expect(holdThirdParty).to.equal(ADDRESS_ZERO);
      });

      it("GIVEN a hold with specific destination WHEN protectedCreateHoldByPartition THEN hold is created with correct destination", async () => {
        protectedHold.hold.to = signer_C.address;

        const message = {
          _partition: _DEFAULT_PARTITION,
          _from: signer_A.address,
          _protectedHold: protectedHold,
        };
        const signature = await signer_A._signTypedData(domain, holdType, message);

        await holdFacet
          .connect(signer_B)
          .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, signature);

        const retrievedHold = await holdFacet.getHoldForByPartition(holdIdentifier);
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

        await executeRbac(base.accessControlFacet, set_initRbacs());
        const message = {
          _partition: _DEFAULT_PARTITION,
          _from: signer_A.address,
          _protectedHold: protectedHold,
        };
        // Sign the message hash
        const signature = await signer_A._signTypedData(domain, holdType, message);
        await expect(
          holdFacet
            .attach(base.diamond.address)
            .connect(signer_B)
            .protectedCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, protectedHold, signature),
        ).to.rejectedWith("PartitionsAreUnProtected");
      });
    });
  });

  describe("Multi-partition", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);
    });

    it("Given token with partition protected WHEN createHoldByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
            arePartitionsProtected: true,
          },
        },
      });
      await executeRbac(base.accessControlFacet, set_initRbacs());
      diamond = base.diamond;
      await setFacets({ diamond });

      currentTimestamp = (await ethers.provider.getBlock("latest")).timestamp;

      hold = {
        amount: _AMOUNT,
        expirationTimestamp: currentTimestamp + ONE_YEAR_IN_SECONDS,
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: _DATA,
      };

      await expect(holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold)).to.be.rejectedWith(
        "PartitionsAreProtectedAndNoRole",
      );
    });

    it("Given token with partition protected WHEN createHoldFromByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
            arePartitionsProtected: true,
          },
        },
      });
      await executeRbac(base.accessControlFacet, set_initRbacs());
      diamond = base.diamond;
      await setFacets({ diamond });

      currentTimestamp = (await ethers.provider.getBlock("latest")).timestamp;

      hold = {
        amount: _AMOUNT,
        expirationTimestamp: currentTimestamp + ONE_YEAR_IN_SECONDS,
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: _DATA,
      };

      await expect(
        holdFacet
          .connect(signer_B)
          .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
      ).to.be.rejectedWith("PartitionsAreProtectedAndNoRole");
    });

    it("GIVEN a Token WHEN createHoldByPartition for wrong partition THEN transaction fails with InvalidPartition", async () => {
      await expect(holdFacet.createHoldByPartition(_WRONG_PARTITION, hold)).to.be.revertedWithCustomError(
        erc1410Facet,
        "InvalidPartition",
      );

      await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);

      await expect(
        holdFacet
          .connect(signer_B)
          .operatorCreateHoldByPartition(_WRONG_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(erc1410Facet, "InvalidPartition");

      await erc1410Facet.connect(signer_A).revokeOperator(signer_B.address);

      await expect(
        holdFacet
          .connect(signer_C)
          .controllerCreateHoldByPartition(_WRONG_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(erc1410Facet, "InvalidPartition");
    });

    describe("Adjust balances", () => {
      async function setPreBalanceAdjustment() {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_C.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CAP_ROLE, signer_A.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_A.address);

        await capFacet.connect(signer_A).setMaxSupply(maxSupply_Original);
        await capFacet.connect(signer_A).setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply_Partition_1_Original);
        await capFacet.connect(signer_A).setMaxSupplyByPartition(_PARTITION_ID_2, maxSupply_Partition_2_Original);

        await erc1410Facet.connect(signer_A).issueByPartition({
          partition: _PARTITION_ID_1,
          tokenHolder: signer_A.address,
          value: balanceOf_A_Original[0],
          data: EMPTY_HEX_BYTES,
        });
        await erc1410Facet.connect(signer_A).issueByPartition({
          partition: _PARTITION_ID_2,
          tokenHolder: signer_A.address,
          value: balanceOf_A_Original[1],
          data: EMPTY_HEX_BYTES,
        });
        await erc1410Facet.connect(signer_A).issueByPartition({
          partition: _PARTITION_ID_1,
          tokenHolder: signer_B.address,
          value: balanceOf_B_Original[0],
          data: EMPTY_HEX_BYTES,
        });
        await erc1410Facet.connect(signer_A).issueByPartition({
          partition: _PARTITION_ID_2,
          tokenHolder: signer_B.address,
          value: balanceOf_B_Original[1],
          data: EMPTY_HEX_BYTES,
        });
      }

      it("GIVEN a hold WHEN adjustBalances THEN hold amount gets updated succeeds", async () => {
        await setPreBalanceAdjustment();

        const balance_Before = await erc1410Facet.balanceOf(signer_A.address);
        const balance_Before_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

        // HOLD
        const hold = {
          amount: _AMOUNT,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:01Z"),
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: EMPTY_HEX_BYTES,
        };

        await holdFacet.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

        const hold_TotalAmount_Before = await holdFacet.getHeldAmountFor(signer_A.address);
        const hold_TotalAmount_Before_Partition_1 = await holdFacet.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const hold_Before = await holdFacet.getHoldForByPartition(holdIdentifier);

        // adjustBalances
        await adjustBalancesFacet.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

        // scheduled two balance updates

        const balanceAdjustmentData = {
          executionDate: dateToUnixTimestamp("2030-01-01T00:00:02Z").toString(),
          factor: adjustFactor,
          decimals: adjustDecimals,
        };

        const balanceAdjustmentData_2 = {
          executionDate: dateToUnixTimestamp("2030-01-01T00:16:40Z").toString(),
          factor: adjustFactor,
          decimals: adjustDecimals,
        };
        await equityFacet.connect(signer_B).setScheduledBalanceAdjustment(balanceAdjustmentData);
        await equityFacet.connect(signer_B).setScheduledBalanceAdjustment(balanceAdjustmentData_2);

        // wait for first scheduled balance adjustment only
        await timeTravelFacet.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:03Z"));

        const hold_TotalAmount_After = await holdFacet.getHeldAmountFor(signer_A.address);
        const hold_TotalAmount_After_Partition_1 = await holdFacet.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const hold_After = await holdFacet.getHoldForByPartition(holdIdentifier);
        const balance_After = await erc1410Facet.balanceOf(signer_A.address);
        const balance_After_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

        expect(hold_TotalAmount_After).to.be.equal(hold_TotalAmount_Before.mul(adjustFactor * adjustFactor));
        expect(hold_TotalAmount_After_Partition_1).to.be.equal(
          hold_TotalAmount_Before_Partition_1.mul(adjustFactor * adjustFactor),
        );
        expect(balance_After).to.be.equal(balance_Before.sub(_AMOUNT).mul(adjustFactor * adjustFactor));
        expect(hold_TotalAmount_After).to.be.equal(hold_TotalAmount_Before.mul(adjustFactor * adjustFactor));
        expect(balance_After_Partition_1).to.be.equal(
          balance_Before_Partition_1.sub(_AMOUNT).mul(adjustFactor * adjustFactor),
        );
        expect(hold_After.amount_).to.be.equal(hold_Before.amount_.mul(adjustFactor * adjustFactor));
      });

      it("GIVEN a hold WHEN adjustBalances THEN execute succeed", async () => {
        await setPreBalanceAdjustment();
        const balance_Before_A = await erc1410Facet.balanceOf(signer_A.address);
        const balance_Before_Partition_1_A = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
        const balance_Before_C = await erc1410Facet.balanceOf(signer_C.address);
        const balance_Before_Partition_1_C = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_C.address);

        // HOLD TWICE
        const currentTimestamp = (await ethers.provider.getBlock("latest")).timestamp;

        const hold = {
          amount: _AMOUNT,
          expirationTimestamp: currentTimestamp + 10 * ONE_SECOND,
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: EMPTY_HEX_BYTES,
        };

        await holdFacet.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

        hold.expirationTimestamp = currentTimestamp + 100 * ONE_SECOND;
        await holdFacet.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

        const held_Amount_Before = await holdFacet.getHeldAmountFor(signer_A.address);
        const held_Amount_Before_Partition_1 = await holdFacet.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        // adjustBalances
        await adjustBalancesFacet.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

        // EXECUTE HOLD
        await holdFacet
          .connect(signer_B)
          .executeHoldByPartition(holdIdentifier, signer_C.address, hold.amount * adjustFactor);

        const balance_After_Execute_A = await erc1410Facet.balanceOf(signer_A.address);
        const balance_After_Execute_Partition_1_A = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const balance_After_Execute_C = await erc1410Facet.balanceOf(signer_C.address);
        const balance_After_Execute_Partition_1_C = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_C.address,
        );
        const held_Amount_After = await holdFacet.getHeldAmountFor(signer_A.address);
        const held_Amount_After_Partition_1 = await holdFacet.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        expect(balance_After_Execute_A).to.be.equal(balance_Before_A.sub(_AMOUNT).sub(_AMOUNT).mul(adjustFactor));
        expect(balance_After_Execute_C).to.be.equal(balance_Before_C.add(_AMOUNT).mul(adjustFactor));
        expect(balance_After_Execute_Partition_1_A).to.be.equal(
          balance_Before_Partition_1_A.sub(_AMOUNT).sub(_AMOUNT).mul(adjustFactor),
        );
        expect(balance_After_Execute_Partition_1_C).to.be.equal(
          balance_Before_Partition_1_C.add(_AMOUNT).mul(adjustFactor),
        );
        expect(held_Amount_After).to.be.equal(held_Amount_Before.sub(_AMOUNT).mul(adjustFactor));
        expect(held_Amount_After_Partition_1).to.be.equal(
          held_Amount_Before_Partition_1.sub(_AMOUNT).mul(adjustFactor),
        );
        expect(balance_After_Execute_A.add(held_Amount_After)).to.be.equal(
          balance_Before_A.sub(_AMOUNT).mul(adjustFactor),
        );
        expect(balance_After_Execute_Partition_1_A.add(held_Amount_After_Partition_1)).to.be.equal(
          balance_Before_Partition_1_A.sub(_AMOUNT).mul(adjustFactor),
        );
      });

      it("GIVEN a hold WHEN adjustBalances THEN release succeed", async () => {
        await setPreBalanceAdjustment();
        const balance_Before = await erc1410Facet.balanceOf(signer_A.address);
        const balance_Before_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

        // HOLD TWICE
        const currentTimestamp = (await ethers.provider.getBlock("latest")).timestamp;

        const hold = {
          amount: _AMOUNT,
          expirationTimestamp: currentTimestamp + 10 * ONE_SECOND,
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: EMPTY_HEX_BYTES,
        };

        await holdFacet.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

        hold.expirationTimestamp = currentTimestamp + 100 * ONE_SECOND;
        await holdFacet.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

        const held_Amount_Before = await holdFacet.getHeldAmountFor(signer_A.address);
        const held_Amount_Before_Partition_1 = await holdFacet.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        // adjustBalances
        await adjustBalancesFacet.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

        // RELEASE HOLD
        await holdFacet.connect(signer_B).releaseHoldByPartition(holdIdentifier, hold.amount * adjustFactor);

        const balance_After_Release = await erc1410Facet.balanceOf(signer_A.address);
        const balance_After_Release_Partition_1 = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const held_Amount_After = await holdFacet.getHeldAmountFor(signer_A.address);
        const held_Amount_After_Partition_1 = await holdFacet.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        expect(balance_After_Release).to.be.equal(balance_Before.sub(_AMOUNT).mul(adjustFactor));
        expect(balance_After_Release_Partition_1).to.be.equal(
          balance_Before_Partition_1.sub(_AMOUNT).mul(adjustFactor),
        );
        expect(held_Amount_After).to.be.equal(held_Amount_Before.sub(_AMOUNT).mul(adjustFactor));
        expect(held_Amount_After_Partition_1).to.be.equal(
          held_Amount_Before_Partition_1.sub(_AMOUNT).mul(adjustFactor),
        );
        expect(balance_After_Release.add(held_Amount_After)).to.be.equal(balance_Before.mul(adjustFactor));
        expect(balance_After_Release_Partition_1.add(held_Amount_After_Partition_1)).to.be.equal(
          balance_Before_Partition_1.mul(adjustFactor),
        );
      });

      it("GIVEN a hold WHEN adjustBalances THEN reclaim succeed", async () => {
        await setPreBalanceAdjustment();
        const balance_Before = await erc1410Facet.balanceOf(signer_A.address);
        const balance_Before_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

        // HOLD TWICE
        const currentTimestamp = (await ethers.provider.getBlock("latest")).timestamp;

        const hold = {
          amount: _AMOUNT,
          expirationTimestamp: currentTimestamp + ONE_SECOND,
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: EMPTY_HEX_BYTES,
        };

        await holdFacet.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

        hold.expirationTimestamp = currentTimestamp + 100 * ONE_SECOND;
        await holdFacet.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

        const held_Amount_Before = await holdFacet.getHeldAmountFor(signer_A.address);
        const held_Amount_Before_Partition_1 = await holdFacet.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        // adjustBalances
        await adjustBalancesFacet.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

        // RECLAIM HOLD
        await timeTravelFacet.changeSystemTimestamp(
          (await ethers.provider.getBlock("latest")).timestamp + 2 * ONE_SECOND,
        );
        await holdFacet.connect(signer_B).reclaimHoldByPartition(holdIdentifier);

        const balance_After_Release = await erc1410Facet.balanceOf(signer_A.address);
        const balance_After_Release_Partition_1 = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const held_Amount_After = await holdFacet.getHeldAmountFor(signer_A.address);
        const held_Amount_After_Partition_1 = await holdFacet.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        expect(balance_After_Release).to.be.equal(balance_Before.sub(_AMOUNT).mul(adjustFactor));
        expect(balance_After_Release_Partition_1).to.be.equal(
          balance_Before_Partition_1.sub(_AMOUNT).mul(adjustFactor),
        );
        expect(held_Amount_After).to.be.equal(held_Amount_Before.sub(_AMOUNT).mul(adjustFactor));
        expect(held_Amount_After_Partition_1).to.be.equal(
          held_Amount_Before_Partition_1.sub(_AMOUNT).mul(adjustFactor),
        );
        expect(balance_After_Release.add(held_Amount_After)).to.be.equal(balance_Before.mul(adjustFactor));
        expect(balance_After_Release_Partition_1.add(held_Amount_After_Partition_1)).to.be.equal(
          balance_Before_Partition_1.mul(adjustFactor),
        );
      });

      it("GIVEN a hold WHEN adjustBalances THEN hold succeeds", async () => {
        await setPreBalanceAdjustment();
        const balance_Before = await erc1410Facet.balanceOf(signer_A.address);
        const balance_Before_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

        // HOLD BEFORE BALANCE ADJUSTMENT
        const currentTimestamp = (await ethers.provider.getBlock("latest")).timestamp;

        const hold = {
          amount: _AMOUNT,
          expirationTimestamp: currentTimestamp + 100 * ONE_SECOND,
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: EMPTY_HEX_BYTES,
        };

        await holdFacet.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

        const held_Amount_Before = await holdFacet.getHeldAmountFor(signer_A.address);
        const held_Amount_Before_Partition_1 = await holdFacet.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        // adjustBalances
        await adjustBalancesFacet.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

        // HOLD AFTER BALANCE ADJUSTMENT
        await holdFacet.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

        const balance_After_Hold = await erc1410Facet.balanceOf(signer_A.address);
        const balance_After_Hold_Partition_1 = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const held_Amount_After = await holdFacet.getHeldAmountFor(signer_A.address);
        const held_Amount_After_Partition_1 = await holdFacet.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        expect(balance_After_Hold).to.be.equal(balance_Before.sub(_AMOUNT).mul(adjustFactor).sub(_AMOUNT));
        expect(balance_After_Hold_Partition_1).to.be.equal(
          balance_Before_Partition_1.sub(_AMOUNT).mul(adjustFactor).sub(_AMOUNT),
        );
        expect(held_Amount_After).to.be.equal(held_Amount_Before.mul(adjustFactor).add(_AMOUNT));
        expect(held_Amount_After_Partition_1).to.be.equal(
          held_Amount_Before_Partition_1.mul(adjustFactor).add(_AMOUNT),
        );
        expect(balance_After_Hold.add(held_Amount_After)).to.be.equal(balance_Before.mul(adjustFactor));
        expect(balance_After_Hold_Partition_1.add(held_Amount_After_Partition_1)).to.be.equal(
          balance_Before_Partition_1.mul(adjustFactor),
        );
      });
    });
  });
});
