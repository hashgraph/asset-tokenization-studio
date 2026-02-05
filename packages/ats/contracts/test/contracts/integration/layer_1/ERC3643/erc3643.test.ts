import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { isinGenerator } from "@thomaschaplin/isin-generator";
import {
  type ResolverProxy,
  type ERC20,
  type PauseFacet,
  type KycFacet,
  type ControlListFacet,
  type SsiManagementFacet,
  type ClearingActionsFacet,
  type AccessControl,
  type IERC1410,
  AdjustBalancesFacet,
  CapFacet,
  EquityUSAFacet,
  ERC1644Facet,
  ERC1594Facet,
  LockFacet,
  IHold,
  ProtectedPartitions,
  DiamondFacet,
  FreezeFacet,
  ComplianceMock,
  IdentityRegistryMock,
  IERC3643,
  TimeTravelFacet,
  Snapshots,
} from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Contract } from "ethers";
import { deployEquityTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import {
  EMPTY_STRING,
  ATS_ROLES,
  ZERO,
  DEFAULT_PARTITION,
  ADDRESS_ZERO,
  EMPTY_HEX_BYTES,
  dateToUnixTimestamp,
  EIP1066_CODES,
} from "@scripts";

const name = "TEST";
const symbol = "TAC";
const newName = "TEST_ERC3643";
const newSymbol = "TAC_ERC3643";
const decimals = 6;
const version = "1";
const isin = isinGenerator();
const AMOUNT = 1000;
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;
const BALANCE_OF_C_ORIGINAL = 2 * AMOUNT;
const onchainId = ethers.Wallet.createRandom().address;

describe("ERC3643 Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;
  let signer_F: HardhatEthersSigner;

  let erc3643Facet: IERC3643;
  let erc1410Facet: IERC1410;
  let timeTravelFacet: TimeTravelFacet;
  let adjustBalancesFacet: AdjustBalancesFacet;
  let capFacet: CapFacet;
  let equityFacet: EquityUSAFacet;

  let pauseFacet: PauseFacet;
  let kycFacet: KycFacet;
  let controlList: ControlListFacet;
  let clearingActionsFacet: ClearingActionsFacet;
  let ssiManagementFacet: SsiManagementFacet;
  let accessControlFacet: AccessControl;
  let erc1644Facet: ERC1644Facet;
  let erc1594Facet: ERC1594Facet;
  let lockFacet: LockFacet;
  let clearingFacet: Contract;
  let holdFacet: IHold;
  let protectedPartitionsFacet: ProtectedPartitions;
  let diamondFacet: DiamondFacet;
  let freezeFacet: FreezeFacet;
  let snapshotFacet: Snapshots;

  let identityRegistryMock: IdentityRegistryMock;
  let complianceMock: ComplianceMock;

  enum ClearingOperationType {
    Transfer,
    Redeem,
    HoldCreation,
  }

  describe("single partition", () => {
    let erc3643Issuer: IERC3643;
    let erc3643Transferor: IERC3643;
    let erc1410SnapshotFacet: IERC1410;
    let erc20Facet: ERC20;
    async function deploySecurityFixtureSinglePartition() {
      complianceMock = await (await ethers.getContractFactory("ComplianceMock", signer_A)).deploy(true, false);
      await complianceMock.waitForDeployment();

      identityRegistryMock = await (
        await ethers.getContractFactory("IdentityRegistryMock", signer_A)
      ).deploy(true, false);
      await identityRegistryMock.waitForDeployment();

      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            compliance: complianceMock.target as string,
            identityRegistry: identityRegistryMock.target as string,
            maxSupply: MAX_SUPPLY,
            erc20MetadataInfo: { name, symbol, decimals, isin },
          },
        },
        useLoadFixture: false, // Avoid nested loadFixture to prevent mock state pollution
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;
      signer_E = base.user4;
      signer_F = base.user5;

      await executeRbac(base.accessControlFacet, [
        {
          role: ATS_ROLES._PAUSER_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._ISSUER_ROLE,
          members: [signer_C.address],
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
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._CLEARING_VALIDATOR_ROLE,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES._AGENT_ROLE,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES._TREX_OWNER_ROLE,
          members: [signer_A.address],
        },
      ]);
      accessControlFacet = await ethers.getContractAt("AccessControl", diamond.target);

      erc20Facet = await ethers.getContractAt("ERC20", diamond.target);

      erc3643Facet = await ethers.getContractAt("IERC3643", diamond.target);

      pauseFacet = await ethers.getContractAt("PauseFacet", diamond.target, signer_B);

      erc3643Issuer = erc3643Facet.connect(signer_C);
      erc3643Transferor = erc3643Facet.connect(signer_E);

      erc20Facet = await ethers.getContractAt("ERC20", diamond.target, signer_E);
      erc1410SnapshotFacet = await ethers.getContractAt("IERC1410", diamond.target);

      controlList = await ethers.getContractAt("ControlListFacet", diamond.target);

      kycFacet = await ethers.getContractAt("KycFacet", diamond.target, signer_B);
      ssiManagementFacet = await ethers.getContractAt("SsiManagementFacet", diamond.target);
      erc1410Facet = await ethers.getContractAt("IERC1410", diamond.target);
      accessControlFacet = await ethers.getContractAt("AccessControl", diamond.target);
      timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.target);
      adjustBalancesFacet = await ethers.getContractAt("AdjustBalancesFacet", diamond.target, signer_A);
      capFacet = await ethers.getContractAt("CapFacet", diamond.target, signer_A);
      equityFacet = await ethers.getContractAt("EquityUSAFacet", diamond.target, signer_A);

      clearingActionsFacet = await ethers.getContractAt("ClearingActionsFacet", diamond.target, signer_B);
      erc1594Facet = await ethers.getContractAt("ERC1594Facet", diamond.target);
      erc1644Facet = await ethers.getContractAt("ERC1644Facet", diamond.target);
      lockFacet = await ethers.getContractAt("LockFacet", diamond.target);
      snapshotFacet = await ethers.getContractAt("SnapshotsFacet", diamond.target);

      const clearingRedeemFacet = await ethers.getContractAt("ClearingRedeemFacet", diamond.target, signer_A);
      const clearingHoldCreationFacet = await ethers.getContractAt(
        "ClearingHoldCreationFacet",
        diamond.target,
        signer_A,
      );
      const clearingTransferFacet = await ethers.getContractAt("ClearingTransferFacet", diamond.target, signer_A);

      const fragmentMap = new Map<string, any>();
      [
        ...clearingTransferFacet.interface.fragments,
        ...clearingRedeemFacet.interface.fragments,
        ...clearingHoldCreationFacet.interface.fragments,
        ...clearingActionsFacet.interface.fragments,
      ].forEach((fragment) => {
        const key = fragment.format();
        if (!fragmentMap.has(key)) {
          fragmentMap.set(key, fragment);
        }
      });

      const uniqueFragments = Array.from(fragmentMap.values());
      clearingFacet = new Contract(diamond.target, uniqueFragments, signer_A);
      holdFacet = await ethers.getContractAt("IHold", diamond.target, signer_A);
      protectedPartitionsFacet = await ethers.getContractAt("ProtectedPartitions", diamond.target);
      diamondFacet = await ethers.getContractAt("DiamondFacet", diamond.target);
      freezeFacet = await ethers.getContractAt("FreezeFacet", diamond.target);

      accessControlFacet = accessControlFacet.connect(signer_A);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
      await ssiManagementFacet.addIssuer(signer_E.address);
      await kycFacet.grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await kycFacet.grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await kycFacet.grantKyc(signer_F.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await accessControlFacet.grantRole(ATS_ROLES._FREEZE_MANAGER_ROLE, signer_A.address);
      await accessControlFacet.grantRole(ATS_ROLES._PAUSER_ROLE, signer_A.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    it("GIVEN a paused token WHEN attempting to update name or symbol THEN transactions revert with TokenIsPaused error", async () => {
      await pauseFacet.connect(signer_B).pause();

      await expect(erc3643Facet.setName(newName)).to.be.rejectedWith("TokenIsPaused");
      await expect(erc3643Facet.setName(newSymbol)).to.be.rejectedWith("TokenIsPaused");
    });

    it("GIVEN an initialized token WHEN retrieving the version THEN returns the right version", async () => {
      const json = await erc3643Facet.version();
      const parsed = JSON.parse(json);

      const [configResolver, configId, configVersion] = await diamondFacet.getConfigInfo();

      expect(parsed["Resolver"].toLowerCase()).to.equal(configResolver.toLowerCase());
      expect(parsed["Config ID"].toLowerCase()).to.equal(configId.toLowerCase());
      expect(parsed["Version"]).to.equal(configVersion.toString());
    });

    describe("initialize", () => {
      it("GIVEN an already initialized token WHEN attempting to initialize again THEN transaction fails with AlreadyInitialized", async () => {
        await expect(
          erc3643Facet.initialize_ERC3643(complianceMock.target as string, identityRegistryMock.target as string),
        ).to.be.rejectedWith("AlreadyInitialized");
      });
    });

    describe("mint", () => {
      it("GIVEN an account with issuer role WHEN mint THEN transaction succeeds", async () => {
        // issue succeeds
        expect(await erc3643Issuer.mint(signer_E.address, AMOUNT / 2))
          .to.emit(erc3643Issuer, "Issued")
          .withArgs(signer_C.address, signer_E.address, AMOUNT / 2);
        expect(await erc1410SnapshotFacet.totalSupply()).to.be.equal(AMOUNT / 2);
        expect(await erc1410SnapshotFacet.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await erc1410SnapshotFacet.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(
          AMOUNT / 2,
        );
        expect(await erc1410SnapshotFacet.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
      });
      it("GIVEN a paused token WHEN attempting to mint TokenIsPaused error", async () => {
        await ssiManagementFacet.addIssuer(signer_A.address);
        await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

        await pauseFacet.connect(signer_B).pause();

        await expect(erc3643Facet.mint(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(
          pauseFacet,
          "TokenIsPaused",
        );
      });
      it("GIVEN a max supply WHEN mint more than the max supply THEN transaction fails with MaxSupplyReached", async () => {
        await expect(erc3643Facet.connect(signer_A).mint(signer_E.address, MAX_SUPPLY + 1)).to.be.rejectedWith(
          "MaxSupplyReached",
        );
      });
      it("GIVEN blocked account USING WHITELIST WHEN mint THEN transaction fails with AccountIsBlocked", async () => {
        // Blacklisting accounts
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROL_LIST_ROLE, signer_A.address);
        await controlList.connect(signer_A).addToControlList(signer_C.address);

        await ssiManagementFacet.addIssuer(signer_C.address);
        await kycFacet.grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_C.address);

        // mint fails
        await expect(erc3643Facet.connect(signer_C).mint(signer_C.address, AMOUNT)).to.be.revertedWithCustomError(
          controlList,
          "AccountIsBlocked",
        );
      });
      it("GIVEN non kyc account WHEN mint THEN transaction reverts with InvalidKycStatus", async () => {
        await kycFacet.revokeKyc(signer_E.address);
        await expect(erc3643Facet.mint(signer_E.address, AMOUNT)).to.revertedWithCustomError(
          kycFacet,
          "InvalidKycStatus",
        );
      });
    });

    describe("burn", () => {
      it("GIVEN an initialized token WHEN burning THEN transaction success", async () => {
        //happy path
        await erc3643Facet.mint(signer_E.address, AMOUNT);

        expect(await erc3643Facet.burn(signer_E.address, AMOUNT / 2))
          .to.emit(erc3643Facet, "Redeemed")
          .withArgs(signer_D.address, signer_E.address, AMOUNT / 2);

        expect(await erc20Facet.allowance(signer_E.address, signer_D.address)).to.be.equal(0);
        expect(await erc1410SnapshotFacet.totalSupply()).to.be.equal(AMOUNT / 2);
        expect(await erc1410SnapshotFacet.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await erc1410SnapshotFacet.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(
          AMOUNT / 2,
        );
        expect(await erc1410SnapshotFacet.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
      });
      it("GIVEN a paused token WHEN attempting to burn TokenIsPaused error", async () => {
        await pauseFacet.connect(signer_B).pause();

        await expect(erc3643Facet.burn(signer_A.address, AMOUNT)).to.be.rejectedWith("TokenIsPaused");
      });
    });

    describe("ForcedTransfer", () => {
      beforeEach(async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_A.address);
      });
      it("GIVEN an account with balance WHEN forcedTransfer THEN transaction success", async () => {
        //Happy path
        await erc3643Issuer.mint(signer_E.address, AMOUNT);

        //Grant ATS_ROLES._CONTROLLER_ROLE role to account E
        await accessControlFacet.grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_E.address);

        expect(await erc3643Transferor.forcedTransfer(signer_E.address, signer_D.address, AMOUNT / 2))
          .to.emit(erc3643Transferor, "Transferred")
          .withArgs(signer_E.address, signer_D.address, AMOUNT / 2);

        expect(await erc1410SnapshotFacet.totalSupply()).to.be.equal(AMOUNT);
        expect(await erc1410SnapshotFacet.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await erc1410SnapshotFacet.balanceOf(signer_D.address)).to.be.equal(AMOUNT / 2);
        expect(await erc1410SnapshotFacet.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(
          AMOUNT / 2,
        );
        expect(await erc1410SnapshotFacet.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.be.equal(
          AMOUNT / 2,
        );
        expect(await erc1410SnapshotFacet.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT);
      });
      it("GIVEN a paused token WHEN attempting to forcedTransfer TokenIsPaused error", async () => {
        await pauseFacet.connect(signer_B).pause();

        await expect(erc3643Facet.forcedTransfer(signer_A.address, signer_B.address, AMOUNT - 1)).to.be.rejectedWith(
          "TokenIsPaused",
        );
      });
      it("GIVEN an account without ATS_ROLES._CONTROLLER_ROLE WHEN forcedTransfer is called THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          erc3643Facet.connect(signer_B).forcedTransfer(signer_D.address, signer_E.address, AMOUNT),
        ).to.be.rejectedWith("AccountHasNoRole");
      });
    });

    describe("setName", () => {
      it("GIVEN an initialized token WHEN updating the name THEN setName emits UpdatedTokenInformation with updated name and current metadata", async () => {
        const retrieved_name = await erc20Facet.name();
        expect(retrieved_name).to.equal(name);

        //Update name
        expect(await erc3643Facet.setName(newName))
          .to.emit(erc3643Facet, "UpdatedTokenInformation")
          .withArgs(newName, symbol, decimals, version, ADDRESS_ZERO);

        const retrieved_newName = await erc20Facet.name();
        expect(retrieved_newName).to.equal(newName);
      });

      it("GIVEN an initialized token WHEN updating the symbol THEN setSymbol emits UpdatedTokenInformation with updated symbol and current metadata", async () => {
        const retrieved_symbol = await erc20Facet.symbol();
        expect(retrieved_symbol).to.equal(symbol);

        //Update symbol
        expect(await erc3643Facet.setSymbol(newSymbol))
          .to.emit(erc3643Facet, "UpdatedTokenInformation")
          .withArgs(name, newSymbol, decimals, version, ADDRESS_ZERO);

        const retrieved_newSymbol = await erc20Facet.symbol();
        expect(retrieved_newSymbol).to.equal(newSymbol);
      });
    });

    describe("Freeze", () => {
      describe("snapshot", () => {
        it("GIVEN an account with snapshot role WHEN takeSnapshot and Freeze THEN transaction succeeds", async () => {
          const AMOUNT = 10;

          await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._SNAPSHOT_ROLE, signer_A.address);

          await erc1410Facet.connect(signer_A).issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_E.address,
            value: AMOUNT,
            data: "0x",
          });

          // snapshot
          await snapshotFacet.connect(signer_A).takeSnapshot();

          // Operations
          await freezeFacet.connect(signer_A).freezePartialTokens(signer_E.address, 1);
          await freezeFacet.connect(signer_A).freezePartialTokens(signer_E.address, 1);

          // snapshot
          await snapshotFacet.connect(signer_A).takeSnapshot();

          // Operations
          await freezeFacet.connect(signer_A).unfreezePartialTokens(signer_E.address, 1);

          // snapshot
          await snapshotFacet.connect(signer_A).takeSnapshot();

          // checks
          const snapshot_Balance_Of_E_1 = await snapshotFacet.balanceOfAtSnapshot(1, signer_E.address);
          const snapshot_FrozenBalance_Of_E_1 = await snapshotFacet.frozenBalanceOfAtSnapshot(1, signer_E.address);
          const snapshot_Total_Supply_1 = await snapshotFacet.totalSupplyAtSnapshot(1);

          expect(snapshot_Balance_Of_E_1).to.equal(AMOUNT);
          expect(snapshot_FrozenBalance_Of_E_1).to.equal(0);
          expect(snapshot_Total_Supply_1).to.equal(AMOUNT);

          const snapshot_Balance_Of_E_2 = await snapshotFacet.balanceOfAtSnapshot(2, signer_E.address);
          const snapshot_FrozenBalance_Of_E_2 = await snapshotFacet.frozenBalanceOfAtSnapshot(2, signer_E.address);
          const snapshot_Total_Supply_2 = await snapshotFacet.totalSupplyAtSnapshot(2);

          expect(snapshot_Balance_Of_E_2).to.equal(AMOUNT - 2);
          expect(snapshot_FrozenBalance_Of_E_2).to.equal(2);
          expect(snapshot_Total_Supply_2).to.equal(AMOUNT);

          const snapshot_Balance_Of_E_3 = await snapshotFacet.balanceOfAtSnapshot(3, signer_E.address);
          const snapshot_FrozenBalance_Of_E_3 = await snapshotFacet.frozenBalanceOfAtSnapshot(3, signer_E.address);
          const snapshot_Total_Supply_3 = await snapshotFacet.totalSupplyAtSnapshot(3);

          expect(snapshot_Balance_Of_E_3).to.equal(AMOUNT - 1);
          expect(snapshot_FrozenBalance_Of_E_3).to.equal(1);
          expect(snapshot_Total_Supply_3).to.equal(AMOUNT);
        });

        it("GIVEN frozen tokens WHEN querying historical snapshot THEN balance and frozen amounts are tracked separately", async () => {
          await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._SNAPSHOT_ROLE, signer_A.address);

          await erc1410Facet.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_E.address,
            value: AMOUNT,
            data: "0x",
          });

          // snapshot
          await snapshotFacet.connect(signer_A).takeSnapshot();

          // Freeze some tokens
          await freezeFacet.connect(signer_A).freezePartialTokens(signer_E.address, 100);

          // snapshot
          await snapshotFacet.connect(signer_A).takeSnapshot();

          // Check snapshots track balance and frozen separately
          const balance1 = await snapshotFacet.balanceOfAtSnapshot(1, signer_E.address);
          const frozen1 = await snapshotFacet.frozenBalanceOfAtSnapshot(1, signer_E.address);
          const balance2 = await snapshotFacet.balanceOfAtSnapshot(2, signer_E.address);
          const frozen2 = await snapshotFacet.frozenBalanceOfAtSnapshot(2, signer_E.address);

          expect(balance1).to.equal(AMOUNT); // Full balance, no frozen
          expect(frozen1).to.equal(0); // No frozen tokens yet
          expect(balance2).to.equal(AMOUNT - 100); // Balance reduced
          expect(frozen2).to.equal(100); // Frozen tokens tracked
          expect(balance2 + frozen2).to.equal(AMOUNT); // Total remains same
        });
      });

      it("GIVEN a invalid address WHEN attempting to setAddressFrozen THEN transactions revert with ZeroAddressNotAllowed error", async () => {
        await expect(freezeFacet.setAddressFrozen(ADDRESS_ZERO, true)).to.be.rejectedWith("ZeroAddressNotAllowed");
      });

      it("GIVEN a valid address WHEN setAddressFrozen AND blacklist THEN address should be added (freeze) and removed (unfreeze) from control list", async () => {
        await expect(freezeFacet.setAddressFrozen(signer_B.address, true))
          .to.emit(freezeFacet, "AddressFrozen")
          .withArgs(signer_B.address, true, signer_A.address);

        let isInControlList = await controlList.isInControlList(signer_B.address);
        expect(isInControlList).to.equal(true);
        await expect(freezeFacet.setAddressFrozen(signer_B.address, false))
          .to.emit(freezeFacet, "AddressFrozen")
          .withArgs(signer_B.address, false, signer_A.address);
        isInControlList = await controlList.isInControlList(signer_B.address);
        expect(isInControlList).to.equal(false);
      });

      it("GIVEN a valid address WHEN setAddressFrozen AND whitelist THEN address should be removed (freeze) and added (unfreeze) to control list", async () => {
        const newTokenFixture = await deployEquityTokenFixture({
          equityDataParams: {
            securityData: {
              isWhiteList: true,
              maxSupply: MAX_SUPPLY,
            },
          },
        });
        await executeRbac(newTokenFixture.accessControlFacet, [
          {
            role: ATS_ROLES._FREEZE_MANAGER_ROLE,
            members: [signer_A.address],
          },
          {
            role: ATS_ROLES._CONTROL_LIST_ROLE,
            members: [signer_A.address],
          },
        ]);
        const newControlList = newTokenFixture.controlListFacet;
        const newFreezeFacet = await ethers.getContractAt("FreezeFacet", newTokenFixture.diamond.target);

        await newControlList.addToControlList(signer_B.address);
        await expect(newFreezeFacet.setAddressFrozen(signer_B.address, true))
          .to.emit(newFreezeFacet, "AddressFrozen")
          .withArgs(signer_B.address, true, signer_A.address);

        let isInControlList = await newControlList.isInControlList(signer_B.address);
        expect(isInControlList).to.equal(false);
        await expect(newFreezeFacet.setAddressFrozen(signer_B.address, false))
          .to.emit(newFreezeFacet, "AddressFrozen")
          .withArgs(signer_B.address, false, signer_A.address);
        isInControlList = await newControlList.isInControlList(signer_B.address);
        expect(isInControlList).to.equal(true);
      });

      it("GIVEN a invalid address WHEN attempting to freezePartialTokens THEN transactions revert with ZeroAddressNotAllowed error", async () => {
        await expect(freezeFacet.freezePartialTokens(ADDRESS_ZERO, 10)).to.be.rejectedWith("ZeroAddressNotAllowed");
      });

      it("GIVEN a valid address WHEN attempting to freezePartialTokens THEN transactions succeed", async () => {
        const amount = 1000;

        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        });
        await expect(freezeFacet.freezePartialTokens(signer_E.address, amount))
          .to.emit(freezeFacet, "TokensFrozen")
          .withArgs(signer_E.address, amount, DEFAULT_PARTITION);
        expect(await freezeFacet.getFrozenTokens(signer_E.address)).to.be.equal(amount);
        expect(await erc1410Facet.balanceOf(signer_E.address)).to.be.equal(0);
      });

      it("GIVEN a freeze amount greater than balance WHEN attempting to freezePartialTokens THEN transactions revert with InsufficientBalance error", async () => {
        const amount = 1000;
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        });
        await expect(freezeFacet.freezePartialTokens(signer_E.address, amount + 1)).to.be.revertedWithCustomError(
          erc1410Facet,
          "InsufficientBalance",
        );
      });

      it("GIVEN a invalid address WHEN attempting to unfreezePartialTokens THEN transactions revert with ZeroAddressNotAllowed error", async () => {
        await expect(freezeFacet.unfreezePartialTokens(ADDRESS_ZERO, 10)).to.be.rejectedWith("ZeroAddressNotAllowed");
      });

      it("GIVEN a valid address WHEN attempting to unfreezePartialTokens THEN transactions succeed", async () => {
        const amount = 1000;
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        });
        await freezeFacet.freezePartialTokens(signer_E.address, amount);

        expect(await freezeFacet.getFrozenTokens(signer_E.address)).to.be.equal(amount);
        expect(await erc1410Facet.balanceOf(signer_E.address)).to.be.equal(0);

        await expect(freezeFacet.unfreezePartialTokens(signer_E.address, amount))
          .to.emit(freezeFacet, "TokensUnfrozen")
          .withArgs(signer_E.address, amount, DEFAULT_PARTITION);
        expect(await freezeFacet.getFrozenTokens(signer_E.address)).to.be.equal(0);
        expect(await erc1410Facet.balanceOf(signer_E.address)).to.be.equal(amount);
      });

      it("GIVEN a freeze amount greater than balance WHEN attempting to unfreezePartialTokens THEN transactions revert with InsufficientFrozenBalance error", async () => {
        const amount = 1000;
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        });
        await freezeFacet.freezePartialTokens(signer_E.address, amount);
        await expect(freezeFacet.unfreezePartialTokens(signer_E.address, amount + 1))
          .to.be.revertedWithCustomError(erc3643Facet, "InsufficientFrozenBalance")
          .withArgs(signer_E.address, amount + 1, amount, DEFAULT_PARTITION);
      });
    });

    describe("Identity", () => {
      it("GIVEN an initialized token WHEN updating the onChanId THEN UpdatedTokenInformation emits OnchainIDUpdated with updated onchainId and current metadata", async () => {
        const retrieved_onChainId = await erc3643Facet.onchainID();
        expect(retrieved_onChainId).to.equal(ADDRESS_ZERO);

        //Update onChainId
        expect(await erc3643Facet.setOnchainID(onchainId))
          .to.emit(erc3643Facet, "UpdatedTokenInformation")
          .withArgs(name, symbol, decimals, version, onchainId);

        const retrieved_newOnChainId = await erc3643Facet.onchainID();
        expect(retrieved_newOnChainId).to.equal(onchainId);
      });

      it("GIVEN an initialized token WHEN updating the identityRegistry THEN setIdentityRegistry emits IdentityRegistryAdded with updated identityRegistry", async () => {
        const retrieved_identityRegistry = await erc3643Facet.identityRegistry();
        expect(retrieved_identityRegistry).to.equal(identityRegistryMock.target as string);

        //Update identityRegistry
        expect(await erc3643Facet.setIdentityRegistry(identityRegistryMock.target as string))
          .to.emit(erc3643Facet, "IdentityRegistryAdded")
          .withArgs(identityRegistryMock.target as string);

        const retrieved_newIdentityRegistry = await erc3643Facet.identityRegistry();
        expect(retrieved_newIdentityRegistry).to.equal(identityRegistryMock.target as string);
      });

      it("GIVEN non verified account with balance WHEN transfer THEN reverts with AddressNotVerified", async () => {
        // Setup
        await erc3643Facet.mint(signer_E.address, 2 * AMOUNT);
        await erc20Facet.connect(signer_E).approve(signer_D.address, MAX_UINT256);
        await erc1410Facet.connect(signer_E).authorizeOperator(signer_D.address);

        await identityRegistryMock.setFlags(false, false); // canTransfer = false

        // Transfers
        await expect(erc20Facet.connect(signer_E).transfer(signer_D.address, AMOUNT)).to.be.revertedWithCustomError(
          erc3643Facet,
          "AddressNotVerified",
        );
        await expect(
          erc20Facet.connect(signer_D).transferFrom(signer_E.address, signer_D.address, AMOUNT),
        ).to.be.revertedWithCustomError(erc3643Facet, "AddressNotVerified");

        const basicTransferInfo = {
          to: signer_D.address,
          value: AMOUNT,
        };
        await expect(
          erc1410Facet.connect(signer_E).transferByPartition(DEFAULT_PARTITION, basicTransferInfo, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "AddressNotVerified");

        const operatorTransferData = {
          partition: DEFAULT_PARTITION,
          from: signer_E.address,
          to: signer_D.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
          operatorData: EMPTY_HEX_BYTES,
        };
        await expect(
          erc1410Facet.connect(signer_D).operatorTransferByPartition(operatorTransferData),
        ).to.be.revertedWithCustomError(erc3643Facet, "AddressNotVerified");
        await expect(
          erc1594Facet.connect(signer_E).transferWithData(signer_D.address, AMOUNT, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "AddressNotVerified");
        await expect(
          erc1594Facet
            .connect(signer_D)
            .transferFromWithData(signer_E.address, signer_D.address, AMOUNT, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "AddressNotVerified");
        await expect(
          erc3643Facet.connect(signer_E).batchTransfer([signer_D.address], [AMOUNT]),
        ).to.be.revertedWithCustomError(erc3643Facet, "AddressNotVerified");
      });

      it("GIVEN non verified account WHEN issue THEN reverts with AddressNotVerified", async () => {
        await identityRegistryMock.setFlags(false, false); // canTransfer = false

        // Issue
        await expect(erc3643Facet.batchMint([signer_E.address], [AMOUNT])).to.be.revertedWithCustomError(
          erc3643Facet,
          "AddressNotVerified",
        );
        await expect(erc3643Facet.mint(signer_E.address, AMOUNT)).to.be.revertedWithCustomError(
          erc3643Facet,
          "AddressNotVerified",
        );
        await expect(
          erc1410Facet.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_E.address,
            value: AMOUNT,
            data: EMPTY_HEX_BYTES,
          }),
        ).to.be.revertedWithCustomError(erc3643Facet, "AddressNotVerified");
        await expect(erc1594Facet.issue(signer_E.address, AMOUNT, EMPTY_HEX_BYTES)).to.be.revertedWithCustomError(
          erc3643Facet,
          "AddressNotVerified",
        );
      });

      it("GIVEN non verified account WHEN redeem THEN reverts with AddressNotVerified", async () => {
        await identityRegistryMock.setFlags(false, false); // canTransfer = false

        //Redeem
        await expect(
          erc1410Facet.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "AddressNotVerified");
        await expect(erc1594Facet.connect(signer_E).redeem(AMOUNT, EMPTY_HEX_BYTES)).to.be.revertedWithCustomError(
          erc3643Facet,
          "AddressNotVerified",
        );
        await expect(
          erc1594Facet.connect(signer_D).redeemFrom(signer_E.address, AMOUNT, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "AddressNotVerified");
      });

      it("GIVEN non verified account WHEN Revoke THEN reverts with AddressNotVerified", async () => {
        // Setup: mint tokens
        await erc3643Facet.mint(signer_E.address, 2 * AMOUNT);

        await identityRegistryMock.setFlags(false, false); // canTransfer = false

        // Clearings
        await clearingActionsFacet.activateClearing();
        const clearingOperation = {
          partition: DEFAULT_PARTITION,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:09Z"),
          data: EMPTY_HEX_BYTES,
        };
        await clearingFacet.connect(signer_E).clearingTransferByPartition(clearingOperation, AMOUNT, signer_D.address);
        const clearingIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          clearingId: 1,
          clearingOperationType: ClearingOperationType.Transfer,
        };
        await expect(
          clearingFacet.approveClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(erc3643Facet, "AddressNotVerified");
      });
    });

    describe("ERC3643 canTransfer Compliance Integration", () => {
      it("GIVEN ComplianceMock.canTransfer returns false THEN transfers fail with ComplianceNotAllowed", async () => {
        // Setup: mint tokens and set compliance to return false for canTransfer
        await erc3643Facet.mint(signer_E.address, AMOUNT);
        await complianceMock.setFlags(false, false); // canTransfer = false

        await expect(erc20Facet.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.be.revertedWithCustomError(
          erc3643Facet,
          "ComplianceNotAllowed",
        );
      });

      it("GIVEN ComplianceMock.canTransfer returns true THEN transfers succeed", async () => {
        // Setup: mint tokens and set compliance to return true for canTransfer
        await erc3643Facet.mint(signer_E.address, AMOUNT);
        await complianceMock.setFlags(true, false); // canTransfer = true

        await expect(erc20Facet.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.not.be.reverted;

        expect(await erc1410SnapshotFacet.balanceOf(signer_E.address)).to.equal(AMOUNT / 2);
        expect(await erc1410SnapshotFacet.balanceOf(signer_D.address)).to.equal(AMOUNT / 2);
      });

      it("GIVEN zero address compliance THEN transfers succeed without compliance checks", async () => {
        // Deploy token without compliance contract (zero address)
        const newTokenFixture = await deployEquityTokenFixture();
        await executeRbac(newTokenFixture.accessControlFacet, [
          {
            role: ATS_ROLES._ISSUER_ROLE,
            members: [signer_A.address],
          },
          { role: ATS_ROLES._KYC_ROLE, members: [signer_B.address] },
        ]);

        const erc3643NoCompliance = await ethers.getContractAt("IERC3643", newTokenFixture.diamond.target);
        const kycNoCompliance = await ethers.getContractAt("Kyc", newTokenFixture.diamond.target, signer_B);
        const erc20NoCompliance = await ethers.getContractAt("ERC20", newTokenFixture.diamond.target, signer_E);
        const ssiNoCompliance = await ethers.getContractAt("SsiManagement", newTokenFixture.diamond.target);

        // Grant ATS_ROLES._SSI_MANAGER_ROLE to signer_A.address first, then add signer_E.address as an issuer
        const accessControlNoCompliance = await ethers.getContractAt("AccessControl", newTokenFixture.diamond.target);
        await accessControlNoCompliance.grantRole(ATS_ROLES._SSI_MANAGER_ROLE, signer_A.address);
        await ssiNoCompliance.addIssuer(signer_E.address);
        await kycNoCompliance.grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await kycNoCompliance.grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

        await erc3643NoCompliance.mint(signer_E.address, AMOUNT);

        await expect(erc20NoCompliance.transfer(signer_D.address, AMOUNT / 2)).to.not.be.reverted;
      });
    });

    describe("ERC3643 canTransfer Compliance Integration", () => {
      it("GIVEN ComplianceMock.canTransfer returns false THEN transfers fail with ComplianceNotAllowed", async () => {
        // Setup: mint tokens and set compliance to return false for canTransfer
        await erc3643Facet.mint(signer_E.address, AMOUNT);
        await complianceMock.setFlags(false, false); // canTransfer = false

        await expect(erc20Facet.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.be.revertedWithCustomError(
          erc3643Facet,
          "ComplianceNotAllowed",
        );
      });

      it("GIVEN ComplianceMock.canTransfer returns true THEN transfers succeed", async () => {
        // Setup: mint tokens and set compliance to return true for canTransfer
        await erc3643Facet.mint(signer_E.address, AMOUNT);
        await complianceMock.setFlags(true, false); // canTransfer = true

        await expect(erc20Facet.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.not.be.reverted;

        expect(await erc1410SnapshotFacet.balanceOf(signer_E.address)).to.equal(AMOUNT / 2);
        expect(await erc1410SnapshotFacet.balanceOf(signer_D.address)).to.equal(AMOUNT / 2);
      });

      it("GIVEN zero address compliance THEN transfers succeed without compliance checks", async () => {
        const newTokenFixture = await deployEquityTokenFixture();
        await executeRbac(newTokenFixture.accessControlFacet, [
          {
            role: ATS_ROLES._ISSUER_ROLE,
            members: [signer_A.address],
          },
          { role: ATS_ROLES._KYC_ROLE, members: [signer_B.address] },
        ]);
        // Deploy token without compliance contract (zero address)

        const erc3643NoCompliance = await ethers.getContractAt("IERC3643", newTokenFixture.diamond.target);
        const kycNoCompliance = await ethers.getContractAt("Kyc", newTokenFixture.diamond.target, signer_B);
        const erc20NoCompliance = await ethers.getContractAt("ERC20", newTokenFixture.diamond.target, signer_E);
        const ssiNoCompliance = await ethers.getContractAt("SsiManagement", newTokenFixture.diamond.target);

        // Grant ATS_ROLES._SSI_MANAGER_ROLE to signer_A.address first, then add signer_E.address as an issuer
        const accessControlNoCompliance = await ethers.getContractAt("AccessControl", newTokenFixture.diamond.target);
        await accessControlNoCompliance.grantRole(ATS_ROLES._SSI_MANAGER_ROLE, signer_A.address);
        await ssiNoCompliance.addIssuer(signer_E.address);
        await kycNoCompliance.grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await kycNoCompliance.grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

        await erc3643NoCompliance.mint(signer_E.address, AMOUNT);

        await expect(erc20NoCompliance.transfer(signer_D.address, AMOUNT / 2)).to.not.be.reverted;
      });
    });

    describe("Compliance", () => {
      it("GIVEN an initialized token WHEN updating the compliance THEN setCompliance emits ComplianceAdded with updated compliance", async () => {
        const retrieved_compliance = await erc3643Facet.compliance();
        expect(retrieved_compliance).to.equal(complianceMock.target as string);
        const newComplianceMock = await (
          await ethers.getContractFactory("ComplianceMock", signer_A)
        ).deploy(true, false);
        await newComplianceMock.waitForDeployment();

        expect(await erc3643Facet.setCompliance(newComplianceMock.target as string))
          .to.emit(erc3643Facet, "ComplianceAdded")
          .withArgs(newComplianceMock);

        const retrieved_newCompliance = await erc3643Facet.compliance();
        expect(retrieved_newCompliance).to.equal(newComplianceMock.target as string);
      });

      it("GIVEN ComplianceMock flag set to true THEN canTransfer returns true", async () => {
        expect(
          await complianceMock.canTransfer(
            ethers.Wallet.createRandom().address,
            ethers.Wallet.createRandom().address,
            ZERO,
          ),
        ).to.be.true;
      });

      it("GIVEN ComplianceMock flag set to false THEN canTransfer returns false", async () => {
        await complianceMock.setFlags(false, false);
        expect(
          await complianceMock.canTransfer(
            ethers.Wallet.createRandom().address,
            ethers.Wallet.createRandom().address,
            ZERO,
          ),
        ).to.be.false;
      });

      it("GIVEN a successful transfer THEN transferred is called in compliance contract", async () => {
        // Setup
        // Grant mutual approvals to interacting accounts
        await erc20Facet.connect(signer_D).approve(signer_E.address, MAX_UINT256);
        await erc20Facet.connect(signer_E).approve(signer_D.address, MAX_UINT256);
        await erc1410Facet.connect(signer_E).authorizeOperator(signer_D.address);
        await erc1410Facet.connect(signer_D).authorizeOperator(signer_E.address);
        // Issue
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: "0x",
        });
        const basicTransferInfo = {
          to: signer_D.address,
          value: AMOUNT,
        };
        let transfersCounter = 0;
        // Standard transfers
        await erc1410Facet.connect(signer_E).transferByPartition(DEFAULT_PARTITION, basicTransferInfo, EMPTY_HEX_BYTES);
        transfersCounter++;
        await erc20Facet.connect(signer_E).transferFrom(signer_D.address, signer_E.address, AMOUNT);
        transfersCounter++;
        await erc20Facet.connect(signer_E).transfer(signer_D.address, AMOUNT);
        transfersCounter++;
        const operatorTransferData = {
          partition: DEFAULT_PARTITION,
          from: signer_D.address,
          to: signer_E.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
          operatorData: EMPTY_HEX_BYTES,
        };
        await erc1410Facet.connect(signer_E).operatorTransferByPartition(operatorTransferData);
        transfersCounter++;
        await erc1594Facet.connect(signer_E).transferWithData(signer_D.address, AMOUNT, EMPTY_HEX_BYTES);
        transfersCounter++;
        await erc1594Facet
          .connect(signer_E)
          .transferFromWithData(signer_D.address, signer_E.address, AMOUNT, EMPTY_HEX_BYTES);
        transfersCounter++;
        await erc3643Facet.connect(signer_E).batchTransfer([signer_D.address], [AMOUNT]);
        transfersCounter++;
        // Clearing transfer
        await clearingFacet.connect(signer_B).activateClearing();
        const clearingOperation = {
          partition: DEFAULT_PARTITION,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:03Z"),
          data: EMPTY_HEX_BYTES,
        };
        await clearingFacet.connect(signer_D).clearingTransferByPartition(clearingOperation, AMOUNT, signer_E.address);
        transfersCounter++;
        const clearingIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_D.address,
          clearingId: 1,
          clearingOperationType: ClearingOperationType.Transfer,
        };
        await clearingFacet.approveClearingOperationByPartition(clearingIdentifier);
        const clearingOperationFrom = {
          clearingOperation: clearingOperation,
          from: signer_E.address,
          operatorData: EMPTY_HEX_BYTES,
        };
        await clearingFacet
          .connect(signer_D)
          .clearingTransferFromByPartition(clearingOperationFrom, AMOUNT, signer_D.address);
        clearingIdentifier.tokenHolder = signer_E.address;
        await clearingFacet.approveClearingOperationByPartition(clearingIdentifier);
        transfersCounter++;
        await clearingFacet.connect(signer_B).deactivateClearing();
        // Hold execute
        const hold = {
          amount: AMOUNT,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:03Z"),
          escrow: signer_E.address,
          to: signer_E.address,
          data: EMPTY_HEX_BYTES,
        };
        await holdFacet.connect(signer_D).createHoldByPartition(DEFAULT_PARTITION, hold);
        const holdIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_D.address,
          holdId: 1,
        };
        await holdFacet.connect(signer_E).executeHoldByPartition(holdIdentifier, signer_E.address, AMOUNT);
        transfersCounter++;
        expect(await complianceMock.transferredHit()).to.be.equal(transfersCounter);
      });

      it("GIVEN a successful mint THEN created is called in compliance contract", async () => {
        let mintCounter = 0;

        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: "0x",
        });
        mintCounter++;
        await erc3643Facet.mint(signer_E.address, AMOUNT);
        mintCounter++;
        await erc3643Facet.batchMint([signer_E.address], [AMOUNT]);
        mintCounter++;
        await erc1594Facet.issue(signer_E.address, AMOUNT, EMPTY_HEX_BYTES);
        mintCounter++;
        expect(await complianceMock.createdHit()).to.be.equal(mintCounter);
      });

      it("GIVEN a successful burn THEN destroyed is called in compliance contract", async () => {
        let burnCounter = 0;
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: 10 * AMOUNT,
          data: "0x",
        });
        await erc1410Facet.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT, "0x");
        burnCounter++;
        await erc3643Facet.burn(signer_E.address, AMOUNT);
        burnCounter++;
        await erc3643Facet.batchBurn([signer_E.address], [AMOUNT]);
        burnCounter++;
        await erc1594Facet.connect(signer_E).redeem(AMOUNT, EMPTY_HEX_BYTES);
        burnCounter++;
        expect(await complianceMock.destroyedHit()).to.be.equal(burnCounter);
      });

      it("GIVEN a failed mint call THEN transaction reverts with custom error", async () => {
        const hash = ethers.keccak256(ethers.toUtf8Bytes("created"));
        await complianceMock.setFlagsByMethod([], [], [true], [hash]);
        let caught;
        try {
          await erc1410Facet.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_E.address,
            value: AMOUNT,
            data: "0x",
          });
        } catch (err: any) {
          caught = err;
        }
        const returnedSelector = (caught.data as string).slice(0, 10);
        const outerSelector = erc3643Facet.interface.getError("ComplianceCallFailed")!.selector;
        expect(returnedSelector).to.equal(outerSelector);
        const targetErrorSelector = complianceMock.interface.getError("MockErrorMint")!.selector;
        const targetErrorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256"],
          [signer_E.address, AMOUNT],
        );
        const args = ethers.solidityPacked(["bytes4", "bytes"], [targetErrorSelector, targetErrorArgs]);
        const returnedArgs = (caught.data as string).slice(10); // Skip custom error selector
        expect(returnedArgs).to.equal(args.slice(2));
      });

      it("GIVEN a failed transfer call THEN transaction reverts with custom error", async () => {
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: "0x",
        });
        const hash = ethers.keccak256(ethers.toUtf8Bytes("transferred"));
        await complianceMock.setFlagsByMethod([], [], [true], [hash]);
        const basicTransferInfo = {
          to: signer_D.address,
          value: AMOUNT,
        };
        let caught;
        try {
          await erc1410Facet
            .connect(signer_E)
            .transferByPartition(DEFAULT_PARTITION, basicTransferInfo, EMPTY_HEX_BYTES);
        } catch (err: any) {
          caught = err;
        }
        const returnedSelector = (caught.data as string).slice(0, 10);
        const outerSelector = erc3643Facet.interface.getError("ComplianceCallFailed")!.selector;
        expect(returnedSelector).to.equal(outerSelector);
        const targetErrorSelector = complianceMock.interface.getError("MockErrorTransfer")!.selector;
        const targetErrorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "address", "uint256"],
          [signer_E.address, signer_D.address, AMOUNT],
        );
        const args = ethers.solidityPacked(["bytes4", "bytes"], [targetErrorSelector, targetErrorArgs]);
        const returnedArgs = (caught.data as string).slice(10); // Skip custom error selector
        expect(returnedArgs).to.equal(args.slice(2));
      });

      it("GIVEN a failed burn call THEN transaction reverts with custom error", async () => {
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: "0x",
        });
        const hash = ethers.keccak256(ethers.toUtf8Bytes("destroyed"));
        await complianceMock.setFlagsByMethod([], [], [true], [hash]);
        let caught;
        try {
          await erc1410Facet.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT, EMPTY_HEX_BYTES);
        } catch (err: any) {
          caught = err;
        }
        const returnedSelector = (caught.data as string).slice(0, 10);
        const outerSelector = erc3643Facet.interface.getError("ComplianceCallFailed")!.selector;
        expect(returnedSelector).to.equal(outerSelector);
        const targetErrorSelector = complianceMock.interface.getError("MockErrorBurn")!.selector;
        const targetErrorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256"],
          [signer_E.address, AMOUNT],
        );
        const args = ethers.solidityPacked(["bytes4", "bytes"], [targetErrorSelector, targetErrorArgs]);
        const returnedArgs = (caught.data as string).slice(10); // Skip custom error selector
        expect(returnedArgs).to.equal(args.slice(2));
      });

      it("GIVEN a failed canTransfer call THEN transaction reverts with custom error", async () => {
        const hash = ethers.keccak256(ethers.toUtf8Bytes("canTransfer"));
        await complianceMock.setFlagsByMethod([], [], [true], [hash]);
        let caught;
        try {
          await erc20Facet.connect(signer_E).approve(signer_D.address, AMOUNT);
        } catch (err: any) {
          caught = err;
        }
        const returnedSelector = (caught.data as string).slice(0, 10);
        const outerSelector = erc3643Facet.interface.getError("ComplianceCallFailed")!.selector;
        expect(returnedSelector).to.equal(outerSelector);
        const targetErrorSelector = complianceMock.interface.getError("MockErrorCanTransfer")!.selector;
        const targetErrorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "address", "uint256"],
          [signer_E.address, signer_D.address, ZERO], // During approvals amount is not checked
        );
        const args = ethers.solidityPacked(["bytes4", "bytes"], [targetErrorSelector, targetErrorArgs]);
        const returnedArgs = (caught.data as string).slice(10);
        expect(returnedArgs).to.equal(args.slice(2));
      });

      //TODO: we should test when canTransfer returns false for the FROM, TO and SENDER separately
      it("GIVEN ComplianceMock::canTransfer returns false THEN operations fail with ComplianceNotAllowed", async () => {
        // Setup: mint tokens and set compliance to return false for canTransfer
        await erc3643Facet.mint(signer_E.address, 2 * AMOUNT);
        await erc20Facet.connect(signer_E).approve(signer_D.address, MAX_UINT256);
        await erc1410Facet.connect(signer_E).authorizeOperator(signer_D.address);

        await complianceMock.setFlags(false, false); // canTransfer = false

        // Transfers
        await expect(erc20Facet.connect(signer_E).transfer(signer_D.address, AMOUNT)).to.be.revertedWithCustomError(
          erc3643Facet,
          "ComplianceNotAllowed",
        );
        await expect(
          erc20Facet.connect(signer_D).transferFrom(signer_E.address, signer_D.address, AMOUNT),
        ).to.be.revertedWithCustomError(erc3643Facet, "ComplianceNotAllowed");
        const basicTransferInfo = {
          to: signer_D.address,
          value: AMOUNT,
        };
        await expect(
          erc1410Facet.connect(signer_E).transferByPartition(DEFAULT_PARTITION, basicTransferInfo, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "ComplianceNotAllowed");
        const operatorTransferData = {
          partition: DEFAULT_PARTITION,
          from: signer_E.address,
          to: signer_D.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
          operatorData: EMPTY_HEX_BYTES,
        };
        await expect(
          erc1410Facet.connect(signer_D).operatorTransferByPartition(operatorTransferData),
        ).to.be.revertedWithCustomError(erc3643Facet, "ComplianceNotAllowed");
        await expect(
          erc1594Facet.connect(signer_E).transferWithData(signer_D.address, AMOUNT, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "ComplianceNotAllowed");
        await expect(
          erc1594Facet
            .connect(signer_D)
            .transferFromWithData(signer_E.address, signer_D.address, AMOUNT, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "ComplianceNotAllowed");
        await expect(
          erc3643Facet.connect(signer_E).batchTransfer([signer_D.address], [AMOUNT]),
        ).to.be.revertedWithCustomError(erc3643Facet, "ComplianceNotAllowed");

        // Issue
        await expect(erc3643Facet.batchMint([signer_E.address], [AMOUNT])).to.be.revertedWithCustomError(
          erc3643Facet,
          "ComplianceNotAllowed",
        );
        await expect(erc3643Facet.mint(signer_E.address, AMOUNT)).to.be.revertedWithCustomError(
          erc3643Facet,
          "ComplianceNotAllowed",
        );
        await expect(
          erc1410Facet.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_E.address,
            value: AMOUNT,
            data: EMPTY_HEX_BYTES,
          }),
        ).to.be.revertedWithCustomError(erc3643Facet, "ComplianceNotAllowed");
        await expect(erc1594Facet.issue(signer_E.address, AMOUNT, EMPTY_HEX_BYTES)).to.be.revertedWithCustomError(
          erc3643Facet,
          "ComplianceNotAllowed",
        );

        // Redeem
        await expect(
          erc1410Facet.redeemByPartition(DEFAULT_PARTITION, AMOUNT, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "ComplianceNotAllowed");
        await expect(erc1594Facet.connect(signer_E).redeem(AMOUNT, EMPTY_HEX_BYTES)).to.be.revertedWithCustomError(
          erc3643Facet,
          "ComplianceNotAllowed",
        );
        await expect(
          erc1594Facet.connect(signer_D).redeemFrom(signer_E.address, AMOUNT, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "ComplianceNotAllowed");

        // Approves
        await expect(erc20Facet.connect(signer_E).approve(signer_D.address, AMOUNT)).to.be.revertedWithCustomError(
          erc3643Facet,
          "ComplianceNotAllowed",
        );
        await expect(erc1410Facet.connect(signer_E).authorizeOperator(signer_D.address)).to.be.revertedWithCustomError(
          erc3643Facet,
          "ComplianceNotAllowed",
        );
        await expect(
          erc1410Facet.connect(signer_E).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_D.address),
        ).to.be.revertedWithCustomError(erc3643Facet, "ComplianceNotAllowed");
        await expect(
          erc20Facet.connect(signer_E).increaseAllowance(signer_D.address, AMOUNT),
        ).to.be.revertedWithCustomError(erc3643Facet, "ComplianceNotAllowed");

        // Revoke
        await expect(erc1410Facet.connect(signer_E).revokeOperator(signer_D.address)).to.be.revertedWithCustomError(
          erc3643Facet,
          "ComplianceNotAllowed",
        );
        await expect(
          erc1410Facet.connect(signer_E).revokeOperatorByPartition(DEFAULT_PARTITION, signer_D.address),
        ).to.be.revertedWithCustomError(erc3643Facet, "ComplianceNotAllowed");

        // Holds
        const hold = {
          amount: AMOUNT,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:03Z"),
          escrow: signer_D.address,
          to: signer_D.address,
          data: EMPTY_HEX_BYTES,
        };
        await holdFacet.connect(signer_E).createHoldByPartition(DEFAULT_PARTITION, hold);
        const holdIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          holdId: 1,
        };
        await expect(
          holdFacet.connect(signer_D).executeHoldByPartition(holdIdentifier, signer_E.address, AMOUNT),
        ).to.be.revertedWithCustomError(erc3643Facet, "ComplianceNotAllowed");

        // Clearings
        await clearingActionsFacet.activateClearing();
        const clearingOperation = {
          partition: DEFAULT_PARTITION,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:09Z"),
          data: EMPTY_HEX_BYTES,
        };
        await clearingFacet.connect(signer_E).clearingTransferByPartition(clearingOperation, AMOUNT, signer_D.address);
        const clearingIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          clearingId: 1,
          clearingOperationType: ClearingOperationType.Transfer,
        };
        await expect(
          clearingFacet.approveClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(erc3643Facet, "ComplianceNotAllowed");
      });
    });

    describe("Batch Operations", () => {
      describe("batchMint", () => {
        it("GIVEN an account with issuer role WHEN batchMint THEN transaction succeeds and balances are updated", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address, signer_E.address];
          const amounts = [mintAmount, mintAmount];

          const initialBalanceD = await erc1410SnapshotFacet.balanceOf(signer_D.address);
          const initialBalanceE = await erc1410SnapshotFacet.balanceOf(signer_E.address);
          const initialTotalSupply = await erc1410SnapshotFacet.totalSupply();

          await expect(erc3643Issuer.batchMint(toList, amounts)).to.not.be.reverted;

          const finalBalanceD = await erc1410SnapshotFacet.balanceOf(signer_D.address);
          const finalBalanceE = await erc1410SnapshotFacet.balanceOf(signer_E.address);
          const finalTotalSupply = await erc1410SnapshotFacet.totalSupply();

          expect(finalBalanceD).to.be.equal(initialBalanceD + BigInt(mintAmount));
          expect(finalBalanceE).to.be.equal(initialBalanceE + BigInt(mintAmount));
          expect(finalTotalSupply).to.be.equal(initialTotalSupply + BigInt(mintAmount * 2));
        });

        it("GIVEN an account without issuer role WHEN batchMint THEN transaction fails with AccountHasNoRole", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address, signer_E.address];
          const amounts = [mintAmount, mintAmount];

          // signer_B does not have ATS_ROLES._ISSUER_ROLE
          await expect(erc3643Facet.connect(signer_B).batchMint(toList, amounts)).to.be.rejectedWith(
            "AccountHasNoRole",
          );
        });

        it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const amounts = [mintAmount, mintAmount];

          await expect(erc3643Facet.batchMint(toList, amounts)).to.be.rejectedWith("InputAmountsArrayLengthMismatch");
        });

        it("GIVEN a paused token WHEN batchMint THEN transaction fails with TokenIsPaused", async () => {
          await pauseFacet.pause();

          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const amounts = [mintAmount];

          await expect(erc3643Facet.batchMint(toList, amounts)).to.be.revertedWithCustomError(
            pauseFacet,
            "TokenIsPaused",
          );
        });
      });

      describe("batchTransfer", () => {
        const transferAmount = AMOUNT / 4;
        const initialMintAmount = AMOUNT;

        beforeEach(async () => {
          // Mint initial tokens to the sender (signer_E)
          await erc3643Issuer.mint(signer_E.address, initialMintAmount);
        });

        it("GIVEN a valid sender WHEN batchTransfer THEN transaction succeeds and balances are updated", async () => {
          const toList = [signer_F.address, signer_D.address];
          const amounts = [transferAmount, transferAmount];

          const initialBalanceSender = await erc1410SnapshotFacet.balanceOf(signer_E.address);
          const initialBalanceF = await erc1410SnapshotFacet.balanceOf(signer_F.address);
          const initialBalanceD = await erc1410SnapshotFacet.balanceOf(signer_D.address);

          await expect(erc3643Facet.connect(signer_E).batchTransfer(toList, amounts)).to.not.be.reverted;

          const finalBalanceSender = await erc1410SnapshotFacet.balanceOf(signer_E.address);
          const finalBalanceF = await erc1410SnapshotFacet.balanceOf(signer_F.address);
          const finalBalanceD = await erc1410SnapshotFacet.balanceOf(signer_D.address);

          expect(finalBalanceSender).to.equal(initialBalanceSender - BigInt(transferAmount * 2));
          expect(finalBalanceF).to.equal(initialBalanceF + BigInt(transferAmount));
          expect(finalBalanceD).to.equal(initialBalanceD + BigInt(transferAmount));
        });

        it("GIVEN insufficient balance WHEN batchTransfer THEN transaction fails", async () => {
          const toList = [signer_F.address, signer_D.address];
          // Total amount > balance
          const amounts = [initialMintAmount, transferAmount];

          await expect(erc3643Facet.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            erc1410Facet,
            "InvalidPartition",
          );
        });

        it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const amounts = [mintAmount, mintAmount];

          await expect(erc3643Facet.batchTransfer(toList, amounts)).to.be.rejectedWith(
            "InputAmountsArrayLengthMismatch",
          );
        });

        it("GIVEN a paused token WHEN batchTransfer THEN transaction fails with TokenIsPaused", async () => {
          await pauseFacet.pause();

          const toList = [signer_F.address];
          const amounts = [transferAmount];

          await expect(erc3643Facet.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            pauseFacet,
            "TokenIsPaused",
          );
        });

        it("GIVEN clearing is activated WHEN batchTransfer THEN transaction fails with ClearingIsActivated", async () => {
          await clearingActionsFacet.activateClearing();

          const toList = [signer_F.address];
          const amounts = [transferAmount];

          await expect(erc3643Facet.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            clearingFacet,
            "ClearingIsActivated",
          );
        });

        it("GIVEN protected partitions without wildcard role WHEN batchTransfer THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
          await accessControlFacet.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
          await protectedPartitionsFacet.protectPartitions();

          const toList = [signer_F.address];
          const amounts = [transferAmount];

          await expect(erc3643Facet.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            clearingFacet,
            "PartitionsAreProtectedAndNoRole",
          );
        });

        it("GIVEN non-verified sender WHEN batchTransfer THEN transaction fails with AddressNotVerified", async () => {
          await identityRegistryMock.setFlags(false, false);

          const toList = [signer_F.address];
          const amounts = [transferAmount];

          await expect(erc3643Facet.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            erc3643Facet,
            "AddressNotVerified",
          );
        });

        it("GIVEN compliance returns false WHEN batchTransfer THEN transaction fails with ComplianceNotAllowed", async () => {
          await complianceMock.setFlags(false, false);

          const toList = [signer_F.address];
          const amounts = [transferAmount];

          await expect(erc3643Facet.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            erc3643Facet,
            "ComplianceNotAllowed",
          );
        });
      });

      describe("batchForcedTransfer", () => {
        const transferAmount = AMOUNT / 2;

        beforeEach(async () => {
          await erc3643Issuer.mint(signer_F.address, transferAmount);
          await erc3643Issuer.mint(signer_D.address, transferAmount);
          await accessControlFacet.grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_A.address);
        });

        it("GIVEN controller role WHEN batchForcedTransfer THEN transaction succeeds", async () => {
          const fromList = [signer_F.address, signer_D.address];
          const toList = [signer_E.address, signer_E.address];
          const amounts = [transferAmount, transferAmount];

          const initialBalanceF = await erc1410SnapshotFacet.balanceOf(signer_F.address);
          const initialBalanceD = await erc1410SnapshotFacet.balanceOf(signer_D.address);
          const initialBalanceE = await erc1410SnapshotFacet.balanceOf(signer_E.address);

          await expect(erc3643Facet.connect(signer_A).batchForcedTransfer(fromList, toList, amounts)).to.not.be
            .reverted;

          const finalBalanceF = await erc1410SnapshotFacet.balanceOf(signer_F.address);
          const finalBalanceD = await erc1410SnapshotFacet.balanceOf(signer_D.address);
          const finalBalanceE = await erc1410SnapshotFacet.balanceOf(signer_E.address);

          expect(finalBalanceF).to.equal(initialBalanceF - BigInt(transferAmount));
          expect(finalBalanceD).to.equal(initialBalanceD - BigInt(transferAmount));
          expect(finalBalanceE).to.equal(initialBalanceE + BigInt(transferAmount * 2));
        });

        it("GIVEN account without controller role WHEN batchForcedTransfer THEN transaction fails with AccountHasNoRole", async () => {
          const fromList = [signer_F.address];
          const toList = [signer_E.address];
          const amounts = [transferAmount];

          // signer_B does not have ATS_ROLES._CONTROLLER_ROLE
          await expect(
            erc3643Facet.connect(signer_B).batchForcedTransfer(fromList, toList, amounts),
          ).to.be.rejectedWith("AccountHasNoRole");
        });

        it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const fromList = [signer_F.address, signer_D.address];
          const amounts = [mintAmount, mintAmount];

          await expect(erc3643Facet.batchForcedTransfer(fromList, toList, amounts)).to.be.rejectedWith(
            "InputAmountsArrayLengthMismatch",
          );
        });

        it("GIVEN toList and amounts with different lengths WHEN batchForcedTransfer THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const fromList = [signer_A.address, signer_F.address];
          const toList = [signer_D.address, signer_E.address];
          const amounts = [mintAmount];

          await expect(erc3643Facet.batchForcedTransfer(fromList, toList, amounts)).to.be.rejectedWith(
            "InputAmountsArrayLengthMismatch",
          );
        });

        it("GIVEN a paused token WHEN batchForcedTransfer THEN transaction fails with TokenIsPaused", async () => {
          await pauseFacet.pause();

          const fromList = [signer_F.address];
          const toList = [signer_E.address];
          const amounts = [transferAmount];

          await expect(
            erc3643Facet.connect(signer_A).batchForcedTransfer(fromList, toList, amounts),
          ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
        });
      });

      describe("batchBurn", () => {
        const burnAmount = AMOUNT / 2;

        beforeEach(async () => {
          await erc3643Issuer.mint(signer_D.address, burnAmount);
          await erc3643Issuer.mint(signer_E.address, burnAmount);

          // The burner (signer_A) needs approval from the token holders
          await erc20Facet.connect(signer_D).approve(signer_A.address, burnAmount);
          await erc20Facet.connect(signer_E).approve(signer_A.address, burnAmount);
        });

        it("GIVEN approved operator WHEN batchBurn THEN transaction succeeds", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const amounts = [burnAmount, burnAmount];

          const initialTotalSupply = await erc1410SnapshotFacet.totalSupply();
          const initialBalanceD = await erc1410SnapshotFacet.balanceOf(signer_D.address);
          const initialBalanceE = await erc1410SnapshotFacet.balanceOf(signer_E.address);

          await expect(erc3643Facet.connect(signer_A).batchBurn(userAddresses, amounts)).to.not.be.reverted;

          const finalTotalSupply = await erc1410SnapshotFacet.totalSupply();
          const finalBalanceD = await erc1410SnapshotFacet.balanceOf(signer_D.address);
          const finalBalanceE = await erc1410SnapshotFacet.balanceOf(signer_E.address);

          expect(finalBalanceD).to.equal(initialBalanceD - BigInt(burnAmount));
          expect(finalBalanceE).to.equal(initialBalanceE - BigInt(burnAmount));
          expect(finalTotalSupply).to.equal(initialTotalSupply - BigInt(burnAmount * 2));
        });

        it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const userAddresses = [signer_D.address];
          const amounts = [burnAmount, burnAmount];

          await expect(erc3643Facet.connect(signer_A).batchBurn(userAddresses, amounts)).to.be.rejectedWith(
            "InputAmountsArrayLengthMismatch",
          );
        });

        it("GIVEN a paused token WHEN batchBurn THEN transaction fails with TokenIsPaused", async () => {
          await pauseFacet.pause();

          const userAddresses = [signer_D.address];
          const amounts = [burnAmount];

          await expect(erc3643Facet.connect(signer_A).batchBurn(userAddresses, amounts)).to.be.revertedWithCustomError(
            pauseFacet,
            "TokenIsPaused",
          );
        });
      });

      describe("batchSetAddressFrozen", () => {
        const mintAmount = AMOUNT;
        const transferAmount = AMOUNT / 2;

        beforeEach(async () => {
          // Mint tokens to accounts that will be frozen/unfrozen
          await erc3643Issuer.mint(signer_D.address, mintAmount);
          await erc3643Issuer.mint(signer_E.address, mintAmount);
        });

        it("GIVEN a FREEZE_MANAGER WHEN batchSetAddressFrozen with true THEN transfers from those addresses fail", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const freezeFlags = [true, true];

          // Freeze accounts
          await expect(freezeFacet.batchSetAddressFrozen(userAddresses, freezeFlags)).to.not.be.reverted;

          // Attempting transfers from frozen accounts should fail
          await expect(
            erc20Facet.connect(signer_D).transfer(signer_A.address, transferAmount),
          ).to.be.revertedWithCustomError(controlList, "AccountIsBlocked");

          await expect(
            erc20Facet.connect(signer_E).transfer(signer_A.address, transferAmount),
          ).to.be.revertedWithCustomError(controlList, "AccountIsBlocked");
        });

        it("GIVEN paused token WHEN batchSetAddressFrozen THEN fails with TokenIsPaused", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          // grant KYC to signer_A.address
          await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

          await pauseFacet.connect(signer_B).pause();

          // First, freeze the addresses
          await expect(freezeFacet.batchSetAddressFrozen(userAddresses, [true, true])).to.revertedWithCustomError(
            pauseFacet,
            "TokenIsPaused",
          );
        });

        it("GIVEN invalid address WHEN batchSetAddressFrozen THEN fails with ZeroAddressNotAllowed", async () => {
          const userAddresses = [signer_D.address, signer_E.address, ADDRESS_ZERO];
          // grant KYC to signer_A.address
          await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

          // First, freeze the addresses
          await expect(freezeFacet.batchSetAddressFrozen(userAddresses, [true, true, true])).to.revertedWithCustomError(
            freezeFacet,
            "ZeroAddressNotAllowed",
          );
        });

        it("GIVEN frozen addresses WHEN batchSetAddressFrozen with false THEN transfers from those addresses succeed", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          // grant KYC to signer_A.address
          await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

          // First, freeze the addresses
          await freezeFacet.batchSetAddressFrozen(userAddresses, [true, true]);

          // Now, unfreeze them in a batch
          await expect(freezeFacet.batchSetAddressFrozen(userAddresses, [false, false])).to.not.be.reverted;

          await expect(erc20Facet.connect(signer_D).transfer(signer_A.address, transferAmount)).to.not.be.reverted;

          await expect(erc20Facet.connect(signer_E).transfer(signer_A.address, transferAmount)).to.not.be.reverted;

          // Check final balances to be sure
          expect(await erc1410SnapshotFacet.balanceOf(signer_D.address)).to.equal(mintAmount - transferAmount);
          expect(await erc1410SnapshotFacet.balanceOf(signer_E.address)).to.equal(mintAmount - transferAmount);
        });

        it("GIVEN an account without ATS_ROLES._FREEZE_MANAGER_ROLE WHEN batchSetAddressFrozen THEN transaction fails", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const freezeFlags = [true, true];

          await expect(
            freezeFacet.connect(signer_F).batchSetAddressFrozen(userAddresses, freezeFlags),
          ).to.be.revertedWithCustomError(accessControlFacet, "AccountHasNoRoles");
        });

        it("GIVEN an invalid input boolean array THEN transaction fails with InputBoolArrayLengthMismatch", async () => {
          const toList = [signer_D.address];
          const status = [true, true];

          await expect(freezeFacet.batchSetAddressFrozen(toList, status)).to.be.rejectedWith(
            "InputBoolArrayLengthMismatch",
          );
        });
      });

      describe("batchFreezePartialTokens", () => {
        const freezeAmount = AMOUNT / 2;
        beforeEach(async () => {
          await erc3643Issuer.mint(signer_D.address, freezeAmount);
          await erc3643Issuer.mint(signer_E.address, freezeAmount);
        });

        it("GIVEN ATS_ROLES._FREEZE_MANAGER_ROLE WHEN batchFreezePartialTokens THEN tokens are frozen successfully", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const amounts = [freezeAmount, freezeAmount];

          const initialFrozenD = await freezeFacet.getFrozenTokens(signer_D.address);
          const initialFrozenE = await freezeFacet.getFrozenTokens(signer_E.address);

          await expect(freezeFacet.batchFreezePartialTokens(userAddresses, amounts)).to.not.be.reverted;

          const finalFrozenD = await freezeFacet.getFrozenTokens(signer_D.address);
          const finalFrozenE = await freezeFacet.getFrozenTokens(signer_E.address);

          expect(finalFrozenD).to.equal(initialFrozenD + BigInt(freezeAmount));
          expect(finalFrozenE).to.equal(initialFrozenE + BigInt(freezeAmount));
        });

        it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const amounts = [mintAmount, mintAmount];

          await expect(freezeFacet.batchFreezePartialTokens(toList, amounts)).to.be.rejectedWith(
            "InputAmountsArrayLengthMismatch",
          );
        });
      });

      describe("batchUnfreezePartialTokens", () => {
        const totalAmount = AMOUNT;
        const unfreezeAmount = AMOUNT / 2;

        beforeEach(async () => {
          await erc3643Issuer.mint(signer_D.address, totalAmount);
          await erc3643Issuer.mint(signer_E.address, totalAmount);

          await freezeFacet.freezePartialTokens(signer_D.address, totalAmount);
          await freezeFacet.freezePartialTokens(signer_E.address, totalAmount);
        });

        it("GIVEN frozen tokens WHEN batchUnfreezePartialTokens THEN tokens are unfrozen successfully", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const amounts = [unfreezeAmount, unfreezeAmount];

          const initialFrozenD = await freezeFacet.getFrozenTokens(signer_D.address);
          const initialFrozenE = await freezeFacet.getFrozenTokens(signer_E.address);

          await expect(freezeFacet.batchUnfreezePartialTokens(userAddresses, amounts)).to.not.be.reverted;

          const finalFrozenD = await freezeFacet.getFrozenTokens(signer_D.address);
          const finalFrozenE = await freezeFacet.getFrozenTokens(signer_E.address);

          expect(finalFrozenD).to.equal(initialFrozenD - BigInt(unfreezeAmount));
          expect(finalFrozenE).to.equal(initialFrozenE - BigInt(unfreezeAmount));
        });

        it("GIVEN insufficient frozen tokens WHEN batchUnfreezePartialTokens THEN transaction fails", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          // Try to unfreeze more than was frozen for signer_D.address
          const amounts = [totalAmount + 1, unfreezeAmount];

          await expect(freezeFacet.batchUnfreezePartialTokens(userAddresses, amounts)).to.be.revertedWithCustomError(
            erc3643Facet,
            "InsufficientFrozenBalance",
          );
        });

        it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const amounts = [mintAmount, mintAmount];

          await expect(freezeFacet.batchUnfreezePartialTokens(toList, amounts)).to.be.rejectedWith(
            "InputAmountsArrayLengthMismatch",
          );
        });
      });
    });

    describe("Agent", () => {
      it("GIVEN an initialized token WHEN adding agent THEN addAgent emits AgentAdded with agent address", async () => {
        expect(await erc3643Facet.addAgent(signer_B.address))
          .to.emit(erc3643Facet, "AgentAdded")
          .withArgs(signer_B.address);

        const hasRole = await accessControlFacet.hasRole(ATS_ROLES._AGENT_ROLE, signer_B.address);
        const isAgent = await erc3643Facet.isAgent(signer_B.address);
        expect(isAgent).to.equal(true);
        expect(hasRole).to.equal(true);
      });

      it("GIVEN an agent WHEN removing agent THEN removeAgent emits AgentRemoved and revokes role", async () => {
        await erc3643Facet.addAgent(signer_B.address);

        expect(await erc3643Facet.removeAgent(signer_B.address))
          .to.emit(erc3643Facet, "AgentRemoved")
          .withArgs(signer_B.address);

        const hasRole = await accessControlFacet.hasRole(ATS_ROLES._AGENT_ROLE, signer_B.address);
        const isAgent = await erc3643Facet.isAgent(signer_B.address);
        expect(isAgent).to.equal(false);
        expect(hasRole).to.equal(false);
      });

      it("GIVEN a non-agent address WHEN removing agent THEN reverts with AccountNotAssignedToRole", async () => {
        await expect(erc3643Facet.removeAgent(signer_C.address))
          .to.be.revertedWithCustomError(accessControlFacet, "AccountNotAssignedToRole")
          .withArgs(ATS_ROLES._AGENT_ROLE, signer_C.address);
      });

      it("GIVEN an already-agent address WHEN adding agent again THEN reverts with AccountAssignedToRole", async () => {
        await erc3643Facet.addAgent(signer_B.address);

        await expect(erc3643Facet.addAgent(signer_B.address))
          .to.be.revertedWithCustomError(accessControlFacet, "AccountAssignedToRole")
          .withArgs(ATS_ROLES._AGENT_ROLE, signer_B.address);
      });

      it("GIVEN a user with the agent role WHEN performing actions using ERC-1400 methods succeeds", async () => {
        await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_B.address);
        const amount = 1000;
        await expect(
          erc1410Facet.connect(signer_B).issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_E.address,
            value: 4 * amount,
            data: EMPTY_HEX_BYTES,
          }),
        ).to.emit(erc1410Facet, "IssuedByPartition");

        await expect(erc1644Facet.connect(signer_B).controllerRedeem(signer_E.address, amount, "0x", "0x")).to.emit(
          erc1644Facet,
          "ControllerRedemption",
        );
        await expect(
          erc1410Facet
            .connect(signer_B)
            .controllerRedeemByPartition(DEFAULT_PARTITION, signer_E.address, amount, "0x", "0x"),
        ).to.emit(erc1410Facet, "RedeemedByPartition");
        await expect(
          erc1644Facet.connect(signer_B).controllerTransfer(signer_E.address, signer_D.address, amount, "0x", "0x"),
        ).to.emit(erc1644Facet, "TransferByPartition");
        await expect(
          erc1410Facet
            .connect(signer_B)
            .controllerTransferByPartition(DEFAULT_PARTITION, signer_E.address, signer_D.address, amount, "0x", "0x"),
        ).to.emit(erc1410Facet, "TransferByPartition");
      });

      it("GIVEN a user with the agent role WHEN performing actions using ERC-3643 methods succeeds", async () => {
        await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_B.address);
        const amount = 1000;
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        });
        await expect(freezeFacet.connect(signer_B).freezePartialTokens(signer_E.address, amount))
          .to.emit(freezeFacet, "TokensFrozen")
          .withArgs(signer_E.address, amount, DEFAULT_PARTITION);
        await expect(freezeFacet.connect(signer_B).unfreezePartialTokens(signer_E.address, amount))
          .to.emit(freezeFacet, "TokensUnfrozen")
          .withArgs(signer_E.address, amount, DEFAULT_PARTITION);
        await expect(erc3643Facet.connect(signer_B).forcedTransfer(signer_E.address, signer_D.address, amount))
          .to.emit(erc1410Facet, "TransferByPartition")
          .withArgs(DEFAULT_PARTITION, ADDRESS_ZERO, signer_E.address, signer_D.address, amount, "0x", "0x");
        await expect(erc3643Facet.connect(signer_B).mint(signer_E.address, amount))
          .to.emit(erc1594Facet, "Issued")
          .withArgs(signer_B.address, signer_E.address, amount, "0x");
        await expect(erc3643Facet.connect(signer_B).burn(signer_E.address, amount))
          .to.emit(erc1594Facet, "Transfer")
          .withArgs(signer_E.address, ADDRESS_ZERO, amount);
        await expect(freezeFacet.connect(signer_B).setAddressFrozen(signer_E.address, true))
          .to.emit(freezeFacet, "AddressFrozen")
          .withArgs(signer_E.address, true, signer_B.address);
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without TREX_OWNER role WHEN setName THEN transaction fails with AccountHasNoRole", async () => {
        // set name fails
        await expect(erc3643Facet.connect(signer_C).setName(newName)).to.be.rejectedWith("AccountHasNoRole");
      });
      it("GIVEN an account without TREX_OWNER role WHEN setSymbol THEN transaction fails with AccountHasNoRole", async () => {
        // set symbol fails
        await expect(erc3643Facet.connect(signer_C).setSymbol(newSymbol)).to.be.rejectedWith("AccountHasNoRole");
      });
      it("GIVEN an account without TREX_OWNER role WHEN setOnchainID THEN transaction fails with AccountHasNoRole", async () => {
        // set onchainID fails
        await expect(erc3643Facet.connect(signer_C).setOnchainID(onchainId)).to.be.rejectedWith("AccountHasNoRole");
      });
      it("GIVEN an account without TREX_OWNER role WHEN setIdentityRegistry THEN transaction fails with AccountHasNoRole", async () => {
        // set IdentityRegistry fails
        await expect(
          erc3643Facet.connect(signer_C).setIdentityRegistry(identityRegistryMock.target as string),
        ).to.be.rejectedWith("AccountHasNoRole");
      });
      it("GIVEN an account without TREX_OWNER role WHEN setCompliance THEN transaction fails with AccountHasNoRole", async () => {
        await expect(erc3643Facet.connect(signer_C).setCompliance(complianceMock.target as string)).to.be.rejectedWith(
          "AccountHasNoRole",
        );
      });

      it("GIVEN an account without FREEZE MANAGER role WHEN freezePartialTokens THEN transaction fails with AccountHasNoRole", async () => {
        await expect(freezeFacet.connect(signer_C).freezePartialTokens(signer_A.address, 10)).to.be.rejectedWith(
          "AccountHasNoRole",
        );
      });

      it("GIVEN an account without FREEZE MANAGER role WHEN unfreezePartialTokens THEN transaction fails with AccountHasNoRole", async () => {
        await expect(freezeFacet.connect(signer_C).unfreezePartialTokens(signer_A.address, 10)).to.be.rejectedWith(
          "AccountHasNoRole",
        );
      });

      it("GIVEN an account without FREEZE MANAGER role WHEN setAddressFrozen THEN transaction fails with AccountHasNoRole", async () => {
        await expect(freezeFacet.connect(signer_C).setAddressFrozen(signer_A.address, true)).to.be.rejectedWith(
          "AccountHasNoRole",
        );
      });

      it("GIVEN an account without admin role WHEN addAgent or removeAgent THEN transaction fails with AccountHasNoRole", async () => {
        await expect(erc3643Facet.connect(signer_C).addAgent(signer_A.address)).to.be.rejectedWith("AccountHasNoRole");
        await expect(erc3643Facet.connect(signer_C).removeAgent(signer_A.address)).to.be.rejectedWith(
          "AccountHasNoRole",
        );
      });
      it("GIVEN an account without AGENT_ROLE role WHEN recoveryAddress THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          erc3643Facet.connect(signer_C).recoveryAddress(signer_A.address, signer_B.address, signer_C.address),
        ).to.be.rejectedWith("AccountHasNoRole");
      });
    });

    describe("Paused", () => {
      beforeEach(async () => {
        const pause = await ethers.getContractAt("PauseFacet", diamond.target);

        await pause.pause();
      });
      it("GIVEN a paused token WHEN freezePartialTokens THEN transactions revert with TokenIsPaused error", async () => {
        await expect(freezeFacet.freezePartialTokens(signer_A.address, 10)).to.be.revertedWithCustomError(
          pauseFacet,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused token WHEN unfreezePartialTokens THEN transactions revert with TokenIsPaused error", async () => {
        await expect(freezeFacet.unfreezePartialTokens(signer_A.address, 10)).to.be.revertedWithCustomError(
          pauseFacet,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused token WHEN setAddressFrozen THEN transactions revert with TokenIsPaused error", async () => {
        await expect(freezeFacet.setAddressFrozen(signer_A.address, true)).to.be.revertedWithCustomError(
          pauseFacet,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused token WHEN batchFreezePartialTokens THEN transactions revert with TokenIsPaused error", async () => {
        const userAddresses = [signer_D.address, signer_E.address];
        const amounts = [100, 100];

        await expect(freezeFacet.batchFreezePartialTokens(userAddresses, amounts)).to.be.revertedWithCustomError(
          pauseFacet,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused token WHEN batchUnfreezePartialTokens THEN transactions revert with TokenIsPaused error", async () => {
        const userAddresses = [signer_D.address, signer_E.address];
        const amounts = [100, 100];

        await expect(freezeFacet.batchUnfreezePartialTokens(userAddresses, amounts)).to.be.revertedWithCustomError(
          pauseFacet,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused token WHEN attempting to addAgent or removeAgent THEN transactions revert with TokenIsPaused error", async () => {
        await expect(erc3643Facet.addAgent(signer_A.address)).to.be.rejectedWith("TokenIsPaused");
        await expect(erc3643Facet.removeAgent(signer_A.address)).to.be.rejectedWith("TokenIsPaused");
      });

      it("GIVEN a paused token WHEN attempting to update name or symbol THEN transactions revert with TokenIsPaused error", async () => {
        await expect(erc3643Facet.setName(newName)).to.be.rejectedWith("TokenIsPaused");
        await expect(erc3643Facet.setSymbol(newSymbol)).to.be.rejectedWith("TokenIsPaused");
        await expect(erc3643Facet.setOnchainID(onchainId)).to.be.rejectedWith("TokenIsPaused");
        await expect(erc3643Facet.setIdentityRegistry(identityRegistryMock.target as string)).to.be.rejectedWith(
          "TokenIsPaused",
        );
        await expect(erc3643Facet.setCompliance(complianceMock.target as string)).to.be.rejectedWith("TokenIsPaused");
      });
    });
    describe("Adjust balances", () => {
      const _AMOUNT = 1000;
      const maxSupply_Original = 1000000 * _AMOUNT;
      const maxSupply_Partition_1_Original = 50000 * _AMOUNT;
      const balanceOf_A_Original = [10 * _AMOUNT, 100 * _AMOUNT];
      const adjustFactor = 253;
      const adjustDecimals = 2;

      async function setPreBalanceAdjustment() {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_C.address);

        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CAP_ROLE, signer_A.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_A.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_B.address);
        // Using account C (with role)
        adjustBalancesFacet = adjustBalancesFacet.connect(signer_C);
        erc1410Facet = erc1410Facet.connect(signer_A);
        capFacet = capFacet.connect(signer_A);

        await capFacet.setMaxSupply(maxSupply_Original);
        await capFacet.setMaxSupplyByPartition(DEFAULT_PARTITION, maxSupply_Partition_1_Original);

        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: balanceOf_A_Original[0],
          data: EMPTY_HEX_BYTES,
        });
      }

      it("GIVEN a freeze WHEN adjustBalances THEN frozen amount gets updated succeeds", async () => {
        await setPreBalanceAdjustment();

        const balance_Before = await erc1410Facet.balanceOf(signer_E.address);
        const balance_Before_Partition_1 = await erc1410Facet.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address);

        // HOLD
        await freezeFacet.freezePartialTokens(signer_E.address, _AMOUNT);

        const frozen_TotalAmount_Before = await freezeFacet.getFrozenTokens(signer_E.address);
        const frozen_TotalAmount_Before_Partition_1 = await freezeFacet.getFrozenTokens(signer_E.address);

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

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

        const frozen_TotalAmount_After = await freezeFacet.getFrozenTokens(signer_E.address);
        const frozen_TotalAmount_After_Partition_1 = await freezeFacet.getFrozenTokens(signer_E.address);

        const balance_After = await erc1410Facet.balanceOf(signer_E.address);
        const balance_After_Partition_1 = await erc1410Facet.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address);

        expect(frozen_TotalAmount_After).to.be.equal(frozen_TotalAmount_Before * BigInt(adjustFactor * adjustFactor));
        expect(frozen_TotalAmount_After_Partition_1).to.be.equal(
          frozen_TotalAmount_Before_Partition_1 * BigInt(adjustFactor * adjustFactor),
        );
        expect(balance_After).to.be.equal((balance_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor * adjustFactor));
        expect(frozen_TotalAmount_After).to.be.equal(frozen_TotalAmount_Before * BigInt(adjustFactor * adjustFactor));
        expect(balance_After_Partition_1).to.be.equal(
          (balance_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor * adjustFactor),
        );
      });

      it("GIVEN frozen tokens WHEN ABAF changes and freezing again THEN frozen amount adjustment is applied", async () => {
        // Grant necessary role for adjustBalances and connect to signer_A
        await accessControlFacet.grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_A.address);
        const adjustBalancesFacetA = adjustBalancesFacet.connect(signer_A);

        const amount = 1000;
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: EMPTY_HEX_BYTES,
        });

        // Freeze tokens initially
        await freezeFacet.freezePartialTokens(signer_E.address, amount / 2);

        const frozenBefore = await freezeFacet.getFrozenTokens(signer_E.address);

        // Change ABAF
        await adjustBalancesFacetA.adjustBalances(2, 1); // 2x adjustment

        // Freeze more tokens - this should trigger _updateTotalFreezeAmountAndLabaf
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: EMPTY_HEX_BYTES,
        });
        await freezeFacet.freezePartialTokens(signer_E.address, amount / 2);

        const frozenAfter = await freezeFacet.getFrozenTokens(signer_E.address);

        // The previously frozen amount should be adjusted by factor 2
        expect(frozenAfter).to.be.equal(frozenBefore * 2n + BigInt(amount / 2));
      });

      it("GIVEN frozen tokens WHEN freezing again without ABAF change THEN factor equals 1", async () => {
        const amount = 1000;
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: EMPTY_HEX_BYTES,
        });

        // Freeze tokens initially
        await freezeFacet.freezePartialTokens(signer_E.address, amount / 2);

        const frozenBefore = await freezeFacet.getFrozenTokens(signer_E.address);

        // Freeze more tokens WITHOUT changing ABAF - this should hit the factor == 1 branch
        await freezeFacet.freezePartialTokens(signer_E.address, amount / 4);

        const frozenAfter = await freezeFacet.getFrozenTokens(signer_E.address);

        // The frozen amount should just be sum (no factor adjustment)
        expect(frozenAfter).to.be.equal(frozenBefore + BigInt(amount / 4));
      });

      it("GIVEN frozen tokens by partition WHEN checking total balance THEN frozen tokens are included", async () => {
        await accessControlFacet.grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_A.address);
        await accessControlFacet.grantRole(ATS_ROLES._SNAPSHOT_ROLE, signer_A.address);

        const amount = 1000;
        const frozenAmount = 300;

        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: EMPTY_HEX_BYTES,
        });

        // Freeze some tokens by partition
        await freezeFacet.freezePartialTokens(signer_E.address, frozenAmount);

        // Take a snapshot - this will invoke _getTotalBalanceForByPartitionAdjusted
        await snapshotFacet.connect(signer_A).takeSnapshot();

        // Get balances before ABAF
        const frozenBefore = await freezeFacet.getFrozenTokens(signer_E.address);
        const freeBefore = await erc1410Facet.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address);

        // Apply ABAF with factor 2 - this internally uses _getTotalBalanceForByPartitionAdjusted to calculate total balance
        const decimals = await erc20Facet.decimals();
        await adjustBalancesFacet.connect(signer_A).adjustBalances(2, decimals);

        // Take another snapshot after ABAF to trigger _getTotalBalanceForByPartitionAdjusted again
        await snapshotFacet.connect(signer_A).takeSnapshot();

        // After ABAF, both free and frozen should be doubled
        const frozenAfter = await freezeFacet.getFrozenTokens(signer_E.address);
        const freeAfter = await erc1410Facet.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address);

        // Verify _getTotalBalanceForByPartitionAdjusted was used: total = free + frozen, then multiplied by factor
        expect(frozenAfter).to.equal(frozenBefore * 2n);
        expect(freeAfter).to.equal(freeBefore * 2n);
        expect(frozenAfter + freeAfter).to.equal(amount * 2);

        // Verify snapshots captured the total balance including frozen tokens by partition
        const snapshot1BalanceByPartition = await snapshotFacet.balanceOfAtSnapshotByPartition(
          DEFAULT_PARTITION,
          1,
          signer_E.address,
        );
        const snapshot2BalanceByPartition = await snapshotFacet.balanceOfAtSnapshotByPartition(
          DEFAULT_PARTITION,
          2,
          signer_E.address,
        );

        expect(snapshot1BalanceByPartition).to.equal(amount - frozenAmount);
        expect(snapshot2BalanceByPartition).to.equal((amount - frozenAmount) * 2);
      });
    });

    describe("Recovery", () => {
      it("GIVEN lost wallet with pending locks, holds or clearings THEN recovery fails with CannotRecoverWallet", async () => {
        await accessControlFacet.grantRole(ATS_ROLES._LOCKER_ROLE, signer_A.address);
        const amount = 1000;
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        });
        // Lock
        await lockFacet.lock(amount, signer_E.address, dateToUnixTimestamp("2030-01-01T00:00:03Z"));
        await expect(
          erc3643Facet.recoveryAddress(signer_E.address, signer_B.address, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(erc3643Facet, "CannotRecoverWallet");
        await timeTravelFacet.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:03Z"));
        await lockFacet.release(1, signer_E.address);
        // Hold
        const hold = {
          amount: amount,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:06Z"),
          escrow: signer_B.address,
          to: signer_C.address,
          data: EMPTY_HEX_BYTES,
        };
        await holdFacet.connect(signer_E).createHoldByPartition(DEFAULT_PARTITION, hold);
        await expect(
          erc3643Facet.recoveryAddress(signer_E.address, signer_B.address, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(erc3643Facet, "CannotRecoverWallet");
        await timeTravelFacet.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:06Z"));
        const holdIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          holdId: 1,
        };
        await holdFacet.connect(signer_B).releaseHoldByPartition(holdIdentifier, amount);
        // Clearing
        await clearingActionsFacet.activateClearing();
        const clearingOperation = {
          partition: DEFAULT_PARTITION,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:09Z"),
          data: EMPTY_HEX_BYTES,
        };
        await clearingFacet.connect(signer_E).clearingTransferByPartition(clearingOperation, amount, signer_A.address);
        await expect(
          erc3643Facet.recoveryAddress(signer_E.address, signer_B.address, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(erc3643Facet, "CannotRecoverWallet");
      });

      it("GIVEN lost wallet WHEN calling recoveryAddress THEN normal balance and freeze balance and status is successfully transferred", async () => {
        const amount = 1000;
        await accessControlFacet.grantRole(ATS_ROLES._CONTROL_LIST_ROLE, signer_A.address);
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        });
        await freezeFacet.freezePartialTokens(signer_E.address, amount / 2);
        await controlList.addToControlList(signer_E.address);
        expect(await erc3643Facet.recoveryAddress(signer_E.address, signer_B.address, ADDRESS_ZERO))
          .to.emit(erc3643Facet, "RecoverySuccess")
          .withArgs(signer_E.address, signer_B.address, ADDRESS_ZERO);
        const balanceE = await erc1410Facet.balanceOf(signer_E.address);
        const balanceB = await erc1410Facet.balanceOf(signer_B.address);
        const frozenBalanceE = await freezeFacet.getFrozenTokens(signer_E.address);
        const frozenBalanceB = await freezeFacet.getFrozenTokens(signer_B.address);
        const controlListStatusE = await controlList.isInControlList(signer_E.address);
        const controlListStatusB = await controlList.isInControlList(signer_B.address);
        const isRecovered = await erc3643Facet.isAddressRecovered(signer_E.address);
        expect(balanceE).to.equal(0);
        expect(balanceB).to.equal(amount / 2);
        expect(frozenBalanceE).to.equal(0);
        expect(frozenBalanceB).to.equal(amount / 2);
        expect(controlListStatusE).to.equal(true);
        expect(controlListStatusB).to.equal(true);
        expect(isRecovered).to.equal(true);
      });
      it("GIVEN lost wallet WHEN calling recovery using a previously recovered address THEN recovered status is set to false", async () => {
        await erc3643Facet.recoveryAddress(signer_C.address, signer_B.address, ADDRESS_ZERO);
        await erc3643Facet.recoveryAddress(signer_B.address, signer_C.address, ADDRESS_ZERO);
        const isRecoveredC = await erc3643Facet.isAddressRecovered(signer_C.address);
        expect(isRecoveredC).to.equal(false);
      });

      it("GIVEN a recovered address THEN operations should fail", async () => {
        // Set up
        await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await kycFacet.grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await kycFacet.grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await accessControlFacet.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
        await accessControlFacet.grantRole(ATS_ROLES._LOCKER_ROLE, signer_A.address);
        await erc1410Facet.connect(signer_C).authorizeOperator(signer_A.address);
        await erc1410Facet.connect(signer_C).authorizeOperator(signer_B.address);
        await erc1410Facet.connect(signer_A).authorizeOperator(signer_C.address);
        await erc1410Facet.connect(signer_A).authorizeOperator(signer_A.address);
        const amount = 1000;
        // Recover
        await erc3643Facet.recoveryAddress(signer_C.address, signer_B.address, ADDRESS_ZERO);
        // Transfers
        // 1 - Operator
        const basicTransferInfo = {
          to: signer_B.address,
          value: amount,
        };
        await expect(
          erc1410Facet.connect(signer_C).transferByPartition(DEFAULT_PARTITION, basicTransferInfo, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(erc20Facet.connect(signer_C).transfer(basicTransferInfo.to, amount)).to.be.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        await expect(
          erc20Facet.connect(signer_C).transferFrom(signer_A.address, basicTransferInfo.to, amount),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "bytes32"],
          [ATS_ROLES._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, DEFAULT_PARTITION],
        );
        const packedDataWithoutPrefix = packedData.slice(2);

        const ProtectedPartitionRole_1 = ethers.keccak256("0x" + packedDataWithoutPrefix);
        await accessControlFacet.grantRole(ProtectedPartitionRole_1, signer_A.address);
        await protectedPartitionsFacet.protectPartitions();
        await expect(
          erc1410Facet.protectedTransferFromByPartition(DEFAULT_PARTITION, signer_C.address, signer_B.address, amount, {
            deadline: MAX_UINT256,
            nounce: 1,
            signature: "0x1234",
          }),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await protectedPartitionsFacet.unprotectPartitions();
        const operatorTransferData = {
          partition: DEFAULT_PARTITION,
          from: signer_A.address,
          to: signer_B.address,
          value: amount,
          data: EMPTY_HEX_BYTES,
          operatorData: EMPTY_HEX_BYTES,
        };
        await expect(
          erc1410Facet.connect(signer_C).operatorTransferByPartition(operatorTransferData),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(
          erc1594Facet.connect(signer_C).transferWithData(signer_A.address, amount, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(
          erc1594Facet
            .connect(signer_C)
            .transferFromWithData(signer_A.address, signer_B.address, amount, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(
          erc3643Facet.connect(signer_C).batchTransfer([signer_D.address], [amount]),
        ).to.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        // 2 - From
        operatorTransferData.from = signer_C.address;
        await expect(
          erc1410Facet.connect(signer_A).operatorTransferByPartition(operatorTransferData),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        operatorTransferData.from = signer_A.address;
        await expect(
          erc1594Facet
            .connect(signer_A)
            .transferFromWithData(signer_C.address, signer_B.address, amount, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(
          erc20Facet.connect(signer_A).transferFrom(signer_C.address, basicTransferInfo.to, amount),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        // 3 - To
        basicTransferInfo.to = signer_C.address;
        await expect(
          erc1410Facet.transferByPartition(DEFAULT_PARTITION, basicTransferInfo, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(erc20Facet.transfer(signer_C.address, amount)).to.be.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        await expect(erc20Facet.transferFrom(signer_A.address, signer_C.address, amount)).to.be.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        await protectedPartitionsFacet.protectPartitions();
        await expect(
          erc1410Facet.protectedTransferFromByPartition(DEFAULT_PARTITION, signer_B.address, signer_C.address, amount, {
            deadline: MAX_UINT256,
            nounce: 1,
            signature: "0x1234",
          }),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await protectedPartitionsFacet.unprotectPartitions();
        operatorTransferData.to = signer_C.address;
        await expect(erc1410Facet.operatorTransferByPartition(operatorTransferData)).to.be.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        await expect(
          erc1594Facet.transferWithData(signer_C.address, amount, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(
          erc1594Facet.transferFromWithData(signer_A.address, signer_C.address, amount, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(erc3643Facet.batchTransfer([signer_C.address], [amount])).to.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        // Allowance
        // 1 - Operator
        await expect(
          erc20Facet.connect(signer_C).increaseAllowance(signer_A.address, amount),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(erc20Facet.connect(signer_C).approve(signer_A.address, amount)).to.be.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        await expect(erc1410Facet.connect(signer_C).authorizeOperator(signer_A.address)).to.be.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        await expect(
          erc1410Facet.connect(signer_C).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_A.address),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        // 2 - To
        await expect(erc20Facet.increaseAllowance(signer_C.address, amount)).to.be.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        await expect(erc20Facet.approve(signer_C.address, amount)).to.be.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        await expect(erc1410Facet.authorizeOperator(signer_C.address)).to.be.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        await expect(
          erc1410Facet.authorizeOperatorByPartition(DEFAULT_PARTITION, signer_C.address),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        // Redeems
        // 1 - Operator
        await expect(erc1594Facet.connect(signer_C).redeem(amount, EMPTY_HEX_BYTES)).to.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        await protectedPartitionsFacet.protectPartitions();
        await expect(
          erc1410Facet.protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_C.address, amount, {
            deadline: MAX_UINT256,
            nounce: 1,
            signature: "0x1234",
          }),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await protectedPartitionsFacet.unprotectPartitions();
        await expect(
          erc1410Facet
            .connect(signer_C)
            .operatorRedeemByPartition(DEFAULT_PARTITION, signer_A.address, amount, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(
          erc1410Facet.connect(signer_C).redeemByPartition(DEFAULT_PARTITION, amount, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(
          erc1594Facet.connect(signer_C).redeemFrom(signer_A.address, amount, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        // 2 - From
        await expect(erc1594Facet.redeemFrom(signer_C.address, amount, EMPTY_HEX_BYTES)).to.be.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        await expect(erc1594Facet.redeemFrom(signer_C.address, amount, EMPTY_HEX_BYTES)).to.be.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        await expect(
          erc1410Facet.operatorRedeemByPartition(
            DEFAULT_PARTITION,
            signer_C.address,
            amount,
            EMPTY_HEX_BYTES,
            EMPTY_HEX_BYTES,
          ),
        ).to.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        // Issue
        await expect(erc1594Facet.issue(signer_C.address, amount, EMPTY_HEX_BYTES)).to.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        await expect(
          erc1410Facet.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_C.address,
            value: amount,
            data: EMPTY_HEX_BYTES,
          }),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(erc3643Facet.mint(signer_C.address, amount)).to.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        await expect(erc3643Facet.batchMint([signer_C.address], [amount])).to.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        // Locks
        await expect(lockFacet.lock(amount, signer_C.address, MAX_UINT256)).to.be.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
        await expect(
          lockFacet.lockByPartition(DEFAULT_PARTITION, amount, signer_C.address, MAX_UINT256),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        // Clearings
        await clearingActionsFacet.activateClearing();
        const clearingOperation = {
          partition: DEFAULT_PARTITION,
          expirationTimestamp: MAX_UINT256,
          data: EMPTY_HEX_BYTES,
        };
        const clearingOperationFrom = {
          clearingOperation: clearingOperation,
          from: signer_A.address,
          operatorData: EMPTY_HEX_BYTES,
        };
        // Clearings - Transfers
        // 1 - Operator
        await expect(
          clearingFacet.connect(signer_C).clearingTransferByPartition(clearingOperation, amount, signer_A.address),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(
          clearingFacet
            .connect(signer_C)
            .clearingTransferFromByPartition(clearingOperationFrom, amount, signer_A.address),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        const protectedClearingOperation = {
          clearingOperation: clearingOperation,
          from: signer_C.address,
          deadline: MAX_UINT256,
          nonce: 1,
        };
        await protectedPartitionsFacet.protectPartitions();
        await expect(
          clearingFacet.protectedClearingTransferByPartition(
            protectedClearingOperation,
            amount,
            signer_A.address,
            "0x1234",
          ),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await protectedPartitionsFacet.unprotectPartitions();
        // 2 - From
        clearingOperationFrom.from = signer_C.address;
        await expect(
          clearingFacet.clearingTransferFromByPartition(clearingOperationFrom, amount, signer_C.address),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        clearingOperationFrom.from = signer_A.address;
        // 3 - To
        await expect(
          clearingFacet.clearingTransferByPartition(clearingOperation, amount, signer_C.address),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(
          clearingFacet.clearingTransferFromByPartition(clearingOperationFrom, amount, signer_C.address),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await protectedPartitionsFacet.protectPartitions();
        protectedClearingOperation.from = signer_A.address;
        await expect(
          clearingFacet.protectedClearingTransferByPartition(
            protectedClearingOperation,
            amount,
            signer_C.address,
            "0x1234",
          ),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        protectedClearingOperation.from = signer_C.address;
        await protectedPartitionsFacet.unprotectPartitions();
        // Clearings - Holds
        const hold = {
          amount: amount,
          expirationTimestamp: MAX_UINT256,
          escrow: signer_B.address,
          to: signer_C.address,
          data: EMPTY_HEX_BYTES,
        };
        // 1 - Operator
        await expect(
          clearingFacet.connect(signer_C).clearingCreateHoldByPartition(clearingOperation, hold),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(
          clearingFacet.connect(signer_C).clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await protectedPartitionsFacet.protectPartitions();
        await expect(
          clearingFacet.protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, "0x1234"),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await protectedPartitionsFacet.unprotectPartitions();
        // 2 - From
        await expect(
          clearingFacet.clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        // 3 - To
        hold.to = signer_C.address;
        await expect(
          clearingFacet.clearingCreateHoldByPartition(clearingOperation, hold),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(
          clearingFacet.clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await protectedPartitionsFacet.protectPartitions();
        await expect(
          clearingFacet.protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, "0x1234"),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await protectedPartitionsFacet.unprotectPartitions();
        // Clearings - Redeems
        // 1 - Operator
        await expect(
          clearingFacet.connect(signer_C).clearingRedeemByPartition(clearingOperation, amount),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(
          clearingFacet.connect(signer_C).clearingRedeemFromByPartition(clearingOperationFrom, amount),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await protectedPartitionsFacet.protectPartitions();
        await expect(
          clearingFacet.protectedClearingRedeemByPartition(protectedClearingOperation, amount, "0x1234"),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await protectedPartitionsFacet.unprotectPartitions();
        await clearingActionsFacet.deactivateClearing();
        // 2 - From
        clearingOperationFrom.from = signer_C.address;
        await expect(
          clearingFacet.clearingRedeemFromByPartition(clearingOperationFrom, amount),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        clearingOperationFrom.from = signer_A.address;
        // Holds
        // 1 - Operator
        await expect(
          holdFacet.connect(signer_C).createHoldByPartition(DEFAULT_PARTITION, hold),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(
          holdFacet
            .connect(signer_C)
            .createHoldFromByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await protectedPartitionsFacet.protectPartitions();
        const protectedHold = {
          hold: hold,
          deadline: MAX_UINT256,
          nonce: 1,
        };
        await expect(
          holdFacet.protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_C.address, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await protectedPartitionsFacet.unprotectPartitions();
        await expect(
          holdFacet
            .connect(signer_C)
            .operatorCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        // 2 - From
        await expect(
          holdFacet.operatorCreateHoldByPartition(DEFAULT_PARTITION, signer_C.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(
          holdFacet.createHoldFromByPartition(DEFAULT_PARTITION, signer_C.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        // 3 - To
        hold.to = signer_C.address;
        await expect(
          holdFacet.connect(signer_C).createHoldByPartition(DEFAULT_PARTITION, hold),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await expect(
          holdFacet
            .connect(signer_C)
            .createHoldFromByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await protectedPartitionsFacet.protectPartitions();
        await expect(
          holdFacet.protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_C.address, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        await protectedPartitionsFacet.unprotectPartitions();
        await expect(
          holdFacet
            .connect(signer_C)
            .operatorCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        const holdIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          holdId: 1,
        };
        await expect(
          holdFacet.executeHoldByPartition(holdIdentifier, signer_C.address, amount),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
        // Can transfer
        // 1 - Operator
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        let canTransferByPartition = await erc1410Facet
          .connect(signer_C)
          .canTransferByPartition(
            signer_A.address,
            signer_C.address,
            DEFAULT_PARTITION,
            amount,
            EMPTY_HEX_BYTES,
            EMPTY_HEX_BYTES,
          );
        expect(canTransferByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        canTransferByPartition = await erc1410Facet
          .connect(signer_C)
          .canTransferByPartition(
            signer_C.address,
            signer_A.address,
            DEFAULT_PARTITION,
            amount,
            EMPTY_HEX_BYTES,
            EMPTY_HEX_BYTES,
          );
        expect(canTransferByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        let canTransfer = await erc1594Facet.connect(signer_C).canTransfer(signer_A.address, amount, EMPTY_HEX_BYTES);
        expect(canTransfer[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        // 2 - From
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        await erc1644Facet.controllerTransfer(
          signer_A.address,
          signer_C.address,
          amount,
          EMPTY_HEX_BYTES,
          EMPTY_HEX_BYTES,
        );
        canTransferByPartition = await erc1410Facet
          .connect(signer_B)
          .canTransferByPartition(
            signer_C.address,
            signer_A.address,
            DEFAULT_PARTITION,
            amount,
            EMPTY_HEX_BYTES,
            EMPTY_HEX_BYTES,
          );
        expect(canTransferByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        // 3 - To
        canTransferByPartition = await erc1410Facet
          .connect(signer_B)
          .canTransferByPartition(
            signer_A.address,
            signer_C.address,
            DEFAULT_PARTITION,
            amount,
            EMPTY_HEX_BYTES,
            EMPTY_HEX_BYTES,
          );
        expect(canTransferByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        canTransfer = await erc1594Facet.canTransfer(signer_C.address, amount, EMPTY_HEX_BYTES);
        expect(canTransfer[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        // Can redeem
        // 1 - Operator
        let canRedeemByPartition = await erc1410Facet
          .connect(signer_C)
          .canRedeemByPartition(signer_A.address, DEFAULT_PARTITION, amount, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES);
        expect(canRedeemByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        canRedeemByPartition = await erc1410Facet
          .connect(signer_C)
          .canRedeemByPartition(signer_C.address, DEFAULT_PARTITION, amount, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES);
        expect(canRedeemByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        // 2 - From
        canRedeemByPartition = await erc1410Facet
          .connect(signer_B)
          .canRedeemByPartition(signer_C.address, DEFAULT_PARTITION, amount, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES);
        expect(canRedeemByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        // Freeze
        await expect(freezeFacet.freezePartialTokens(signer_C.address, amount)).to.revertedWithCustomError(
          erc3643Facet,
          "WalletRecovered",
        );
      });
      it("GIVEN a recovered wallet WHEN recoveryAddress THEN transaction fails with WalletRecovered", async () => {
        await erc3643Facet.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

        await expect(
          erc3643Facet.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
      });
    });
  });

  describe("multi partition", () => {
    beforeEach(async () => {
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
      signer_F = base.user5;
      await executeRbac(base.accessControlFacet, [
        {
          role: ATS_ROLES._PAUSER_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._CLEARING_ROLE,
          members: [signer_B.address],
        },
      ]);

      accessControlFacet = await ethers.getContractAt("AccessControl", diamond.target);

      pauseFacet = await ethers.getContractAt("PauseFacet", diamond.target);

      controlList = await ethers.getContractAt("ControlListFacet", diamond.target);

      erc3643Facet = await ethers.getContractAt("IERC3643", diamond.target);

      clearingActionsFacet = await ethers.getContractAt("ClearingActionsFacet", diamond.target, signer_B);
      freezeFacet = await ethers.getContractAt("FreezeFacet", diamond.target);

      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_A.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
    });

    it("GIVEN an account with issuer role WHEN mint THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      // transfer with data fails
      await expect(
        erc3643Facet.connect(signer_C).mint(signer_D.address, 2 * BALANCE_OF_C_ORIGINAL),
      ).to.be.revertedWithCustomError(erc1410Facet, "NotAllowedInMultiPartitionMode");
    });

    it("GIVEN an initialized token WHEN burning THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      // burn with data fails
      await expect(
        erc3643Facet.connect(signer_C).burn(signer_C.address, 2 * BALANCE_OF_C_ORIGINAL),
      ).to.be.revertedWithCustomError(erc1410Facet, "NotAllowedInMultiPartitionMode");
    });

    it("GIVEN an account with balance WHEN forcedTransfer THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      // transfer with data fails
      await expect(
        erc3643Facet.connect(signer_A).forcedTransfer(signer_A.address, signer_D.address, 2 * BALANCE_OF_C_ORIGINAL),
      ).to.be.revertedWithCustomError(erc1410Facet, "NotAllowedInMultiPartitionMode");
    });

    it("GIVEN an single partition token WHEN recoveryAddress THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
      await expect(
        erc3643Facet.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO),
      ).to.be.revertedWithCustomError(erc1410Facet, "NotAllowedInMultiPartitionMode");
    });

    describe("Batch operations", () => {
      it("GIVEN an single partition token WHEN batchTransfer THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(erc3643Facet.batchTransfer([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
          erc1410Facet,
          "NotAllowedInMultiPartitionMode",
        );
      });
      it("GIVEN an single partition token WHEN batchForcedTransfer THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(
          erc3643Facet.batchForcedTransfer([signer_A.address], [signer_A.address], [AMOUNT]),
        ).to.be.revertedWithCustomError(erc1410Facet, "NotAllowedInMultiPartitionMode");
      });
      it("GIVEN an single partition token WHEN batchMint THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(erc3643Facet.batchMint([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
          erc1410Facet,
          "NotAllowedInMultiPartitionMode",
        );
      });
      it("GIVEN an single partition token WHEN batchBurn THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(erc3643Facet.batchBurn([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
          erc1410Facet,
          "NotAllowedInMultiPartitionMode",
        );
      });
    });

    describe("Freeze", () => {
      it("GIVEN an account with ATS_ROLES._FREEZE_MANAGER_ROLE WHEN freezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(freezeFacet.freezePartialTokens(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(
          erc1410Facet,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN an account with ATS_ROLES._FREEZE_MANAGER_ROLE WHEN unfreezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(freezeFacet.unfreezePartialTokens(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(
          erc1410Facet,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN an account with ATS_ROLES._FREEZE_MANAGER_ROLE WHEN unfreezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(freezeFacet.unfreezePartialTokens(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(
          erc1410Facet,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN an account with ATS_ROLES._FREEZE_MANAGER_ROLE WHEN batchFreezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(freezeFacet.batchFreezePartialTokens([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
          erc1410Facet,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN an account with ATS_ROLES._FREEZE_MANAGER_ROLE WHEN batchFreezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(
          freezeFacet.batchUnfreezePartialTokens([signer_A.address], [AMOUNT]),
        ).to.be.revertedWithCustomError(erc1410Facet, "NotAllowedInMultiPartitionMode");
      });
    });
  });

  describe("Token is controllable", () => {
    async function deployERC3643TokenIsControllableFixture() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isControllable: false,
            maxSupply: MAX_SUPPLY,
          },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;
      signer_E = base.user4;
      signer_F = base.user5;
      await executeRbac(base.accessControlFacet, [
        {
          role: ATS_ROLES._CONTROLLER_ROLE,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES._ISSUER_ROLE,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES._KYC_ROLE,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES._SSI_MANAGER_ROLE,
          members: [signer_A.address],
        },
      ]);
      accessControlFacet = await ethers.getContractAt("AccessControl", diamond.target);

      pauseFacet = await ethers.getContractAt("PauseFacet", diamond.target);

      controlList = await ethers.getContractAt("ControlListFacet", diamond.target);

      erc3643Facet = await ethers.getContractAt("IERC3643", diamond.target);
      erc1594Facet = await ethers.getContractAt("ERC1594Facet", diamond.target);

      clearingActionsFacet = await ethers.getContractAt("ClearingActionsFacet", diamond.target, signer_B);
      freezeFacet = await ethers.getContractAt("FreezeFacet", diamond.target);
      kycFacet = await ethers.getContractAt("KycFacet", diamond.target, signer_A);
      ssiManagementFacet = await ethers.getContractAt("SsiManagementFacet", diamond.target, signer_A);
      await ssiManagementFacet.addIssuer(signer_A.address);
      await kycFacet.grantKyc(signer_F.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await kycFacet.grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await erc3643Facet.mint(signer_D.address, AMOUNT);
    }

    beforeEach(async () => {
      await loadFixture(deployERC3643TokenIsControllableFixture);
    });

    it("GIVEN token is not controllable WHEN batchBurn THEN transaction fails with TokenIsNotControllable", async () => {
      const userAddresses = [signer_D.address];
      const amounts = [AMOUNT];

      await expect(erc3643Facet.connect(signer_A).batchBurn(userAddresses, amounts)).to.be.revertedWithCustomError(
        erc1594Facet,
        "TokenIsNotControllable",
      );
    });
    it("GIVEN token is not controllable WHEN batchForcedTransfer THEN transaction fails with TokenIsNotControllable", async () => {
      const fromList = [signer_F.address];
      const toList = [signer_E.address];
      const amounts = [AMOUNT];

      await expect(
        erc3643Facet.connect(signer_A).batchForcedTransfer(fromList, toList, amounts),
      ).to.be.revertedWithCustomError(erc1594Facet, "TokenIsNotControllable");
    });
    it("GIVEN token is controllable WHEN burning THEN transaction fails with TokenIsNotControllable", async () => {
      await expect(erc3643Facet.burn(signer_E.address, AMOUNT)).to.be.revertedWithCustomError(
        erc1594Facet,
        "TokenIsNotControllable",
      );
    });
    it("GIVEN token is controllable WHEN forcedTransfer THEN transaction fails with TokenIsNotControllable", async () => {
      await expect(
        erc3643Facet.forcedTransfer(signer_E.address, signer_D.address, AMOUNT),
      ).to.be.revertedWithCustomError(erc1594Facet, "TokenIsNotControllable");
    });
  });
});
