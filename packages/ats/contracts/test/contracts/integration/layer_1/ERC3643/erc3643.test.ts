// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { isinGenerator } from "@thomaschaplin/isin-generator";
import { IAsset, type ResolverProxy, ComplianceMock, IdentityRegistryMock } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture } from "@test";
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

  let asset: IAsset;

  let identityRegistryMock: IdentityRegistryMock;
  let complianceMock: ComplianceMock;

  enum ClearingOperationType {
    Transfer,
    Redeem,
    HoldCreation,
  }

  describe("single partition", () => {
    async function deploySecurityFixtureSinglePartition() {
      const infrastructure = await loadFixture(deployAtsInfrastructureFixture);

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
        infrastructure,
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;
      signer_E = base.user4;
      signer_F = base.user5;

      asset = await ethers.getContractAt("IAsset", diamond.target);

      await executeRbac(asset, [
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

      await asset.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
      await asset.addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_F.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.grantRole(ATS_ROLES._FREEZE_MANAGER_ROLE, signer_A.address);
      await asset.grantRole(ATS_ROLES._PAUSER_ROLE, signer_A.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    it("GIVEN a paused token WHEN attempting to update name or symbol THEN transactions revert with TokenIsPaused error", async () => {
      await asset.connect(signer_B).pause();

      await expect(asset.setName(newName)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      await expect(asset.setName(newSymbol)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN an initialized token WHEN retrieving the version THEN returns the right version", async () => {
      const json = await asset.version();
      const parsed = JSON.parse(json);

      const [configResolver, configId, configVersion] = await asset.getConfigInfo();

      expect(parsed["Resolver"].toLowerCase()).to.equal(configResolver.toLowerCase());
      expect(parsed["Config ID"].toLowerCase()).to.equal(configId.toLowerCase());
      expect(parsed["Version"]).to.equal(configVersion.toString());
    });

    describe("initialize", () => {
      it("GIVEN an already initialized token WHEN attempting to initialize again THEN transaction fails with AlreadyInitialized", async () => {
        await expect(
          asset.initialize_ERC3643(complianceMock.target as string, identityRegistryMock.target as string),
        ).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
      });
    });

    describe("mint", () => {
      it("GIVEN an account with issuer role WHEN mint THEN transaction succeeds", async () => {
        // issue succeeds
        expect(await asset.mint(signer_E.address, AMOUNT / 2))
          .to.emit(asset, "Issued")
          .withArgs(signer_C.address, signer_E.address, AMOUNT / 2);
        expect(await asset.totalSupply()).to.be.equal(AMOUNT / 2);
        expect(await asset.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
      });
      it("GIVEN a paused token WHEN attempting to mint TokenIsPaused error", async () => {
        await asset.addIssuer(signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

        await asset.connect(signer_B).pause();

        await expect(asset.mint(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });
      it("GIVEN a max supply WHEN mint more than the max supply THEN transaction fails with MaxSupplyReached", async () => {
        await expect(asset.connect(signer_A).mint(signer_E.address, MAX_SUPPLY + 1)).to.be.revertedWithCustomError(
          asset,
          "MaxSupplyReached",
        );
      });
      it("GIVEN blocked account USING WHITELIST WHEN mint THEN transaction fails with AccountIsBlocked", async () => {
        // Blacklisting accounts
        await asset.connect(signer_A).grantRole(ATS_ROLES._CONTROL_LIST_ROLE, signer_A.address);
        await asset.connect(signer_A).addToControlList(signer_C.address);

        await asset.addIssuer(signer_C.address);
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_C.address);

        // mint fails
        await expect(asset.connect(signer_C).mint(signer_C.address, AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );
      });
      it("GIVEN non kyc account WHEN mint THEN transaction reverts with InvalidKycStatus", async () => {
        await asset.connect(signer_B).revokeKyc(signer_E.address);
        await expect(asset.mint(signer_E.address, AMOUNT)).to.revertedWithCustomError(asset, "InvalidKycStatus");
      });
    });

    describe("burn", () => {
      it("GIVEN an initialized token WHEN burning THEN transaction success", async () => {
        //happy path
        await asset.mint(signer_E.address, AMOUNT);

        expect(await asset.burn(signer_E.address, AMOUNT / 2))
          .to.emit(asset, "Redeemed")
          .withArgs(signer_D.address, signer_E.address, AMOUNT / 2);

        expect(await asset.allowance(signer_E.address, signer_D.address)).to.be.equal(0);
        expect(await asset.totalSupply()).to.be.equal(AMOUNT / 2);
        expect(await asset.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
      });
      it("GIVEN a paused token WHEN attempting to burn TokenIsPaused error", async () => {
        await asset.connect(signer_B).pause();

        await expect(asset.burn(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });
    });

    describe("setName", () => {
      it("GIVEN an initialized token WHEN updating the name THEN setName emits UpdatedTokenInformation with updated name and current metadata", async () => {
        const retrieved_name = await asset.name();
        expect(retrieved_name).to.equal(name);

        //Update name
        expect(await asset.setName(newName))
          .to.emit(asset, "UpdatedTokenInformation")
          .withArgs(newName, symbol, decimals, version, ADDRESS_ZERO);

        const retrieved_newName = await asset.name();
        expect(retrieved_newName).to.equal(newName);
      });

      it("GIVEN an initialized token WHEN updating the symbol THEN setSymbol emits UpdatedTokenInformation with updated symbol and current metadata", async () => {
        const retrieved_symbol = await asset.symbol();
        expect(retrieved_symbol).to.equal(symbol);

        //Update symbol
        expect(await asset.setSymbol(newSymbol))
          .to.emit(asset, "UpdatedTokenInformation")
          .withArgs(name, newSymbol, decimals, version, ADDRESS_ZERO);

        const retrieved_newSymbol = await asset.symbol();
        expect(retrieved_newSymbol).to.equal(newSymbol);
      });
    });

    describe("Freeze", () => {
      describe("snapshot", () => {
        it("GIVEN an account with snapshot role WHEN takeSnapshot and Freeze THEN transaction succeeds", async () => {
          const AMOUNT = 10;

          await asset.connect(signer_A).grantRole(ATS_ROLES._SNAPSHOT_ROLE, signer_A.address);

          await asset.connect(signer_A).issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_E.address,
            value: AMOUNT,
            data: "0x",
          });

          // snapshot
          await asset.connect(signer_A).takeSnapshot();

          // Operations
          await asset.connect(signer_A).freezePartialTokens(signer_E.address, 1);
          await asset.connect(signer_A).freezePartialTokens(signer_E.address, 1);

          // snapshot
          await asset.connect(signer_A).takeSnapshot();

          // Operations
          await asset.connect(signer_A).unfreezePartialTokens(signer_E.address, 1);

          // snapshot
          await asset.connect(signer_A).takeSnapshot();

          // checks
          const snapshot_Balance_Of_E_1 = await asset.balanceOfAtSnapshot(1, signer_E.address);
          const snapshot_FrozenBalance_Of_E_1 = await asset.frozenBalanceOfAtSnapshot(1, signer_E.address);
          const snapshot_Total_Supply_1 = await asset.totalSupplyAtSnapshot(1);

          expect(snapshot_Balance_Of_E_1).to.equal(AMOUNT);
          expect(snapshot_FrozenBalance_Of_E_1).to.equal(0);
          expect(snapshot_Total_Supply_1).to.equal(AMOUNT);

          const snapshot_Balance_Of_E_2 = await asset.balanceOfAtSnapshot(2, signer_E.address);
          const snapshot_FrozenBalance_Of_E_2 = await asset.frozenBalanceOfAtSnapshot(2, signer_E.address);
          const snapshot_Total_Supply_2 = await asset.totalSupplyAtSnapshot(2);

          expect(snapshot_Balance_Of_E_2).to.equal(AMOUNT - 2);
          expect(snapshot_FrozenBalance_Of_E_2).to.equal(2);
          expect(snapshot_Total_Supply_2).to.equal(AMOUNT);

          const snapshot_Balance_Of_E_3 = await asset.balanceOfAtSnapshot(3, signer_E.address);
          const snapshot_FrozenBalance_Of_E_3 = await asset.frozenBalanceOfAtSnapshot(3, signer_E.address);
          const snapshot_Total_Supply_3 = await asset.totalSupplyAtSnapshot(3);

          expect(snapshot_Balance_Of_E_3).to.equal(AMOUNT - 1);
          expect(snapshot_FrozenBalance_Of_E_3).to.equal(1);
          expect(snapshot_Total_Supply_3).to.equal(AMOUNT);
        });

        it("GIVEN frozen tokens WHEN querying historical snapshot THEN balance and frozen amounts are tracked separately", async () => {
          await asset.connect(signer_A).grantRole(ATS_ROLES._SNAPSHOT_ROLE, signer_A.address);

          await asset.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_E.address,
            value: AMOUNT,
            data: "0x",
          });

          // snapshot
          await asset.connect(signer_A).takeSnapshot();

          // Freeze some tokens
          await asset.connect(signer_A).freezePartialTokens(signer_E.address, 100);

          // snapshot
          await asset.connect(signer_A).takeSnapshot();

          // Check snapshots track balance and frozen separately
          const balance1 = await asset.balanceOfAtSnapshot(1, signer_E.address);
          const frozen1 = await asset.frozenBalanceOfAtSnapshot(1, signer_E.address);
          const balance2 = await asset.balanceOfAtSnapshot(2, signer_E.address);
          const frozen2 = await asset.frozenBalanceOfAtSnapshot(2, signer_E.address);

          expect(balance1).to.equal(AMOUNT); // Full balance, no frozen
          expect(frozen1).to.equal(0); // No frozen tokens yet
          expect(balance2).to.equal(AMOUNT - 100); // Balance reduced
          expect(frozen2).to.equal(100); // Frozen tokens tracked
          expect(balance2 + frozen2).to.equal(AMOUNT); // Total remains same
        });
      });

      it("GIVEN a invalid address WHEN attempting to setAddressFrozen THEN transactions revert with ZeroAddressNotAllowed error", async () => {
        await expect(asset.setAddressFrozen(ADDRESS_ZERO, true)).to.be.revertedWithCustomError(
          asset,
          "ZeroAddressNotAllowed",
        );
      });

      it("GIVEN a valid address WHEN setAddressFrozen AND blacklist THEN address should be added (freeze) and removed (unfreeze) from control list", async () => {
        await expect(asset.setAddressFrozen(signer_B.address, true))
          .to.emit(asset, "AddressFrozen")
          .withArgs(signer_B.address, true, signer_A.address);

        let isInControlList = await asset.isInControlList(signer_B.address);
        expect(isInControlList).to.equal(true);
        await expect(asset.setAddressFrozen(signer_B.address, false))
          .to.emit(asset, "AddressFrozen")
          .withArgs(signer_B.address, false, signer_A.address);
        isInControlList = await asset.isInControlList(signer_B.address);
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

        const newasset = await ethers.getContractAt("IAsset", newTokenFixture.diamond.target);

        await executeRbac(newasset, [
          {
            role: ATS_ROLES._FREEZE_MANAGER_ROLE,
            members: [signer_A.address],
          },
          {
            role: ATS_ROLES._CONTROL_LIST_ROLE,
            members: [signer_A.address],
          },
        ]);

        await newasset.addToControlList(signer_B.address);
        await expect(newasset.setAddressFrozen(signer_B.address, true))
          .to.emit(newasset, "AddressFrozen")
          .withArgs(signer_B.address, true, signer_A.address);

        let isInControlList = await newasset.isInControlList(signer_B.address);
        expect(isInControlList).to.equal(false);
        await expect(newasset.setAddressFrozen(signer_B.address, false))
          .to.emit(newasset, "AddressFrozen")
          .withArgs(signer_B.address, false, signer_A.address);
        isInControlList = await newasset.isInControlList(signer_B.address);
        expect(isInControlList).to.equal(true);
      });

      it("GIVEN a invalid address WHEN attempting to freezePartialTokens THEN transactions revert with ZeroAddressNotAllowed error", async () => {
        await expect(asset.freezePartialTokens(ADDRESS_ZERO, 10)).to.be.revertedWithCustomError(
          asset,
          "ZeroAddressNotAllowed",
        );
      });

      it("GIVEN a valid address WHEN attempting to freezePartialTokens THEN transactions succeed", async () => {
        const amount = 1000;

        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        });
        await expect(asset.freezePartialTokens(signer_E.address, amount))
          .to.emit(asset, "TokensFrozen")
          .withArgs(signer_E.address, amount, DEFAULT_PARTITION);
        expect(await asset.getFrozenTokens(signer_E.address)).to.be.equal(amount);
        expect(await asset.balanceOf(signer_E.address)).to.be.equal(0);
      });

      it("GIVEN a freeze amount greater than balance WHEN attempting to freezePartialTokens THEN transactions revert with InsufficientBalance error", async () => {
        const amount = 1000;
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        });
        await expect(asset.freezePartialTokens(signer_E.address, amount + 1)).to.be.revertedWithCustomError(
          asset,
          "InsufficientBalance",
        );
      });

      it("GIVEN a invalid address WHEN attempting to unfreezePartialTokens THEN transactions revert with ZeroAddressNotAllowed error", async () => {
        await expect(asset.unfreezePartialTokens(ADDRESS_ZERO, 10)).to.be.revertedWithCustomError(
          asset,
          "ZeroAddressNotAllowed",
        );
      });

      it("GIVEN a valid address WHEN attempting to unfreezePartialTokens THEN transactions succeed", async () => {
        const amount = 1000;
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        });
        await asset.freezePartialTokens(signer_E.address, amount);

        expect(await asset.getFrozenTokens(signer_E.address)).to.be.equal(amount);
        expect(await asset.balanceOf(signer_E.address)).to.be.equal(0);

        await expect(asset.unfreezePartialTokens(signer_E.address, amount))
          .to.emit(asset, "TokensUnfrozen")
          .withArgs(signer_E.address, amount, DEFAULT_PARTITION);
        expect(await asset.getFrozenTokens(signer_E.address)).to.be.equal(0);
        expect(await asset.balanceOf(signer_E.address)).to.be.equal(amount);
      });

      it("GIVEN a freeze amount greater than balance WHEN attempting to unfreezePartialTokens THEN transactions revert with InsufficientFrozenBalance error", async () => {
        const amount = 1000;
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        });
        await asset.freezePartialTokens(signer_E.address, amount);
        await expect(asset.unfreezePartialTokens(signer_E.address, amount + 1))
          .to.be.revertedWithCustomError(asset, "InsufficientFrozenBalance")
          .withArgs(signer_E.address, amount + 1, amount, DEFAULT_PARTITION);
      });
    });

    describe("Identity", () => {
      it("GIVEN an initialized token WHEN updating the onChanId THEN UpdatedTokenInformation emits OnchainIDUpdated with updated onchainId and current metadata", async () => {
        const retrieved_onChainId = await asset.onchainID();
        expect(retrieved_onChainId).to.equal(ADDRESS_ZERO);

        //Update onChainId
        expect(await asset.setOnchainID(onchainId))
          .to.emit(asset, "UpdatedTokenInformation")
          .withArgs(name, symbol, decimals, version, onchainId);

        const retrieved_newOnChainId = await asset.onchainID();
        expect(retrieved_newOnChainId).to.equal(onchainId);
      });

      it("GIVEN an initialized token WHEN updating the identityRegistry THEN setIdentityRegistry emits IdentityRegistryAdded with updated identityRegistry", async () => {
        const retrieved_identityRegistry = await asset.identityRegistry();
        expect(retrieved_identityRegistry).to.equal(identityRegistryMock.target as string);

        //Update identityRegistry
        expect(await asset.setIdentityRegistry(identityRegistryMock.target as string))
          .to.emit(asset, "IdentityRegistryAdded")
          .withArgs(identityRegistryMock.target as string);

        const retrieved_newIdentityRegistry = await asset.identityRegistry();
        expect(retrieved_newIdentityRegistry).to.equal(identityRegistryMock.target as string);
      });

      it("GIVEN non verified account with balance WHEN transfer THEN reverts with AddressNotVerified", async () => {
        // Setup
        await asset.mint(signer_E.address, 2 * AMOUNT);
        await asset.connect(signer_E).approve(signer_D.address, MAX_UINT256);
        await asset.connect(signer_E).authorizeOperator(signer_D.address);

        await identityRegistryMock.setFlags(false, false); // canTransfer = false

        // Transfers
        await expect(asset.connect(signer_E).transfer(signer_D.address, AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "AddressNotVerified",
        );
        await expect(
          asset.connect(signer_D).transferFrom(signer_E.address, signer_D.address, AMOUNT),
        ).to.be.revertedWithCustomError(asset, "AddressNotVerified");

        const basicTransferInfo = {
          to: signer_D.address,
          value: AMOUNT,
        };
        await expect(
          asset.connect(signer_E).transferByPartition(DEFAULT_PARTITION, basicTransferInfo, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "AddressNotVerified");

        const operatorTransferData = {
          partition: DEFAULT_PARTITION,
          from: signer_E.address,
          to: signer_D.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
          operatorData: EMPTY_HEX_BYTES,
        };
        await expect(
          asset.connect(signer_D).operatorTransferByPartition(operatorTransferData),
        ).to.be.revertedWithCustomError(asset, "AddressNotVerified");
        await expect(
          asset.connect(signer_E).transferWithData(signer_D.address, AMOUNT, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "AddressNotVerified");
        await expect(
          asset.connect(signer_D).transferFromWithData(signer_E.address, signer_D.address, AMOUNT, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "AddressNotVerified");
        await expect(asset.connect(signer_E).batchTransfer([signer_D.address], [AMOUNT])).to.be.revertedWithCustomError(
          asset,
          "AddressNotVerified",
        );
      });

      it("GIVEN non verified account WHEN issue THEN reverts with AddressNotVerified", async () => {
        await identityRegistryMock.setFlags(false, false); // canTransfer = false

        // Issue
        await expect(asset.batchMint([signer_E.address], [AMOUNT])).to.be.revertedWithCustomError(
          asset,
          "AddressNotVerified",
        );
        await expect(asset.mint(signer_E.address, AMOUNT)).to.be.revertedWithCustomError(asset, "AddressNotVerified");
        await expect(
          asset.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_E.address,
            value: AMOUNT,
            data: EMPTY_HEX_BYTES,
          }),
        ).to.be.revertedWithCustomError(asset, "AddressNotVerified");
        await expect(asset.issue(signer_E.address, AMOUNT, EMPTY_HEX_BYTES)).to.be.revertedWithCustomError(
          asset,
          "AddressNotVerified",
        );
      });

      it("GIVEN non verified account WHEN redeem THEN reverts with AddressNotVerified", async () => {
        await identityRegistryMock.setFlags(false, false); // canTransfer = false

        //Redeem
        await expect(
          asset.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "AddressNotVerified");
        await expect(asset.connect(signer_E).redeem(AMOUNT, EMPTY_HEX_BYTES)).to.be.revertedWithCustomError(
          asset,
          "AddressNotVerified",
        );
        await expect(
          asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "AddressNotVerified");
      });

      it("GIVEN non verified account WHEN Revoke THEN reverts with AddressNotVerified", async () => {
        // Setup: mint tokens
        await asset.mint(signer_E.address, 2 * AMOUNT);

        await identityRegistryMock.setFlags(false, false); // canTransfer = false

        // Clearings
        await asset.connect(signer_B).activateClearing();
        const clearingOperation = {
          partition: DEFAULT_PARTITION,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:09Z"),
          data: EMPTY_HEX_BYTES,
        };
        await asset.connect(signer_E).clearingTransferByPartition(clearingOperation, AMOUNT, signer_D.address);
        const clearingIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          clearingId: 1,
          clearingOperationType: ClearingOperationType.Transfer,
        };
        await expect(
          asset.connect(signer_A).approveClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(asset, "AddressNotVerified");
      });
    });

    describe("ERC3643 canTransfer Compliance Integration", () => {
      it("GIVEN ComplianceMock.canTransfer returns false THEN transfers fail with ComplianceNotAllowed", async () => {
        // Setup: mint tokens and set compliance to return false for canTransfer
        await asset.mint(signer_E.address, AMOUNT);
        await complianceMock.setFlags(false, false); // canTransfer = false

        await expect(asset.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.be.revertedWithCustomError(
          asset,
          "ComplianceNotAllowed",
        );
      });

      it("GIVEN ComplianceMock.canTransfer returns true THEN transfers succeed", async () => {
        // Setup: mint tokens and set compliance to return true for canTransfer
        await asset.mint(signer_E.address, AMOUNT);
        await complianceMock.setFlags(true, false); // canTransfer = true

        await expect(asset.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.not.be.reverted;

        expect(await asset.balanceOf(signer_E.address)).to.equal(AMOUNT / 2);
        expect(await asset.balanceOf(signer_D.address)).to.equal(AMOUNT / 2);
      });

      it("GIVEN zero address compliance THEN transfers succeed without compliance checks", async () => {
        // Deploy token without compliance contract (zero address)
        const newTokenFixture = await deployEquityTokenFixture();

        const newasset = await ethers.getContractAt("IAsset", newTokenFixture.diamond.target);

        await executeRbac(newasset, [
          {
            role: ATS_ROLES._ISSUER_ROLE,
            members: [signer_A.address],
          },
          { role: ATS_ROLES._KYC_ROLE, members: [signer_B.address] },
        ]);

        const erc3643NoCompliance = await ethers.getContractAt("IERC3643", newTokenFixture.diamond.target);
        const kycNoCompliance = await ethers.getContractAt("Kyc", newTokenFixture.diamond.target, signer_B);
        const erc20NoCompliance = await ethers.getContractAt("Transfer", newTokenFixture.diamond.target, signer_E);
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
        await asset.mint(signer_E.address, AMOUNT);
        await complianceMock.setFlags(false, false); // canTransfer = false

        await expect(asset.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.be.revertedWithCustomError(
          asset,
          "ComplianceNotAllowed",
        );
      });

      it("GIVEN ComplianceMock.canTransfer returns true THEN transfers succeed", async () => {
        // Setup: mint tokens and set compliance to return true for canTransfer
        await asset.mint(signer_E.address, AMOUNT);
        await complianceMock.setFlags(true, false); // canTransfer = true

        await expect(asset.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.not.be.reverted;

        expect(await asset.balanceOf(signer_E.address)).to.equal(AMOUNT / 2);
        expect(await asset.balanceOf(signer_D.address)).to.equal(AMOUNT / 2);
      });

      it("GIVEN zero address compliance THEN transfers succeed without compliance checks", async () => {
        const newTokenFixture = await deployEquityTokenFixture();

        const newasset = await ethers.getContractAt("IAsset", newTokenFixture.diamond.target);

        await executeRbac(newasset, [
          {
            role: ATS_ROLES._ISSUER_ROLE,
            members: [signer_A.address],
          },
          { role: ATS_ROLES._KYC_ROLE, members: [signer_B.address] },
        ]);
        // Deploy token without compliance contract (zero address)

        const erc3643NoCompliance = await ethers.getContractAt("IERC3643", newTokenFixture.diamond.target);
        const kycNoCompliance = await ethers.getContractAt("Kyc", newTokenFixture.diamond.target, signer_B);
        const erc20NoCompliance = await ethers.getContractAt("Transfer", newTokenFixture.diamond.target, signer_E);
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
        await asset.connect(signer_D).approve(signer_E.address, MAX_UINT256);
        await asset.connect(signer_E).approve(signer_D.address, MAX_UINT256);
        await asset.connect(signer_E).authorizeOperator(signer_D.address);
        await asset.connect(signer_D).authorizeOperator(signer_E.address);
        // Issue
        await asset.issueByPartition({
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
        await asset.connect(signer_E).transferByPartition(DEFAULT_PARTITION, basicTransferInfo, EMPTY_HEX_BYTES);
        transfersCounter++;
        await asset.connect(signer_E).transferFrom(signer_D.address, signer_E.address, AMOUNT);
        transfersCounter++;
        await asset.connect(signer_E).transfer(signer_D.address, AMOUNT);
        transfersCounter++;
        const operatorTransferData = {
          partition: DEFAULT_PARTITION,
          from: signer_D.address,
          to: signer_E.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
          operatorData: EMPTY_HEX_BYTES,
        };
        await asset.connect(signer_E).operatorTransferByPartition(operatorTransferData);
        transfersCounter++;
        await asset.connect(signer_E).transferWithData(signer_D.address, AMOUNT, EMPTY_HEX_BYTES);
        transfersCounter++;
        await asset.connect(signer_E).transferFromWithData(signer_D.address, signer_E.address, AMOUNT, EMPTY_HEX_BYTES);
        transfersCounter++;
        await asset.connect(signer_E).batchTransfer([signer_D.address], [AMOUNT]);
        transfersCounter++;
        // Clearing transfer
        await asset.connect(signer_B).activateClearing();
        const clearingOperation = {
          partition: DEFAULT_PARTITION,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:03Z"),
          data: EMPTY_HEX_BYTES,
        };
        await asset.connect(signer_D).clearingTransferByPartition(clearingOperation, AMOUNT, signer_E.address);
        transfersCounter++;
        const clearingIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_D.address,
          clearingId: 1,
          clearingOperationType: ClearingOperationType.Transfer,
        };
        await asset.approveClearingOperationByPartition(clearingIdentifier);
        const clearingOperationFrom = {
          clearingOperation: clearingOperation,
          from: signer_E.address,
          operatorData: EMPTY_HEX_BYTES,
        };
        await asset.connect(signer_D).clearingTransferFromByPartition(clearingOperationFrom, AMOUNT, signer_D.address);
        clearingIdentifier.tokenHolder = signer_E.address;
        await asset.approveClearingOperationByPartition(clearingIdentifier);
        transfersCounter++;
        await asset.connect(signer_B).deactivateClearing();
        // Hold execute
        const hold = {
          amount: AMOUNT,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:03Z"),
          escrow: signer_E.address,
          to: signer_E.address,
          data: EMPTY_HEX_BYTES,
        };
        await asset.connect(signer_D).createHoldByPartition(DEFAULT_PARTITION, hold);
        const holdIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_D.address,
          holdId: 1,
        };
        await asset.connect(signer_E).executeHoldByPartition(holdIdentifier, signer_E.address, AMOUNT);
        transfersCounter++;
        expect(await complianceMock.transferredHit()).to.be.equal(transfersCounter);
      });

      it("GIVEN a successful mint THEN created is called in compliance contract", async () => {
        let mintCounter = 0;

        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: "0x",
        });
        mintCounter++;
        await asset.mint(signer_E.address, AMOUNT);
        mintCounter++;
        await asset.batchMint([signer_E.address], [AMOUNT]);
        mintCounter++;
        await asset.issue(signer_E.address, AMOUNT, EMPTY_HEX_BYTES);
        mintCounter++;
        expect(await complianceMock.createdHit()).to.be.equal(mintCounter);
      });

      it("GIVEN a successful burn THEN destroyed is called in compliance contract", async () => {
        let burnCounter = 0;
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: 10 * AMOUNT,
          data: "0x",
        });
        await asset.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT, "0x");
        burnCounter++;
        await asset.burn(signer_E.address, AMOUNT);
        burnCounter++;
        await asset.batchBurn([signer_E.address], [AMOUNT]);
        burnCounter++;
        await asset.connect(signer_E).redeem(AMOUNT, EMPTY_HEX_BYTES);
        burnCounter++;
        expect(await complianceMock.destroyedHit()).to.be.equal(burnCounter);
      });

      it("GIVEN a failed mint call THEN transaction reverts with custom error", async () => {
        const hash = ethers.keccak256(ethers.toUtf8Bytes("created"));
        await complianceMock.setFlagsByMethod([], [], [true], [hash]);
        let caught;
        try {
          await asset.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_E.address,
            value: AMOUNT,
            data: "0x",
          });
        } catch (err: any) {
          caught = err;
        }
        const returnedSelector = (caught.data as string).slice(0, 10);
        const outerSelector = asset.interface.getError("ComplianceCallFailed")!.selector;
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
        await asset.issueByPartition({
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
          await asset.connect(signer_E).transferByPartition(DEFAULT_PARTITION, basicTransferInfo, EMPTY_HEX_BYTES);
        } catch (err: any) {
          caught = err;
        }
        const returnedSelector = (caught.data as string).slice(0, 10);
        const outerSelector = asset.interface.getError("ComplianceCallFailed")!.selector;
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
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: "0x",
        });
        const hash = ethers.keccak256(ethers.toUtf8Bytes("destroyed"));
        await complianceMock.setFlagsByMethod([], [], [true], [hash]);
        let caught;
        try {
          await asset.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT, EMPTY_HEX_BYTES);
        } catch (err: any) {
          caught = err;
        }
        const returnedSelector = (caught.data as string).slice(0, 10);
        const outerSelector = asset.interface.getError("ComplianceCallFailed")!.selector;
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
          await asset.connect(signer_E).approve(signer_D.address, AMOUNT);
        } catch (err: any) {
          caught = err;
        }
        const returnedSelector = (caught.data as string).slice(0, 10);
        const outerSelector = asset.interface.getError("ComplianceCallFailed")!.selector;
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
        await asset.mint(signer_E.address, 2 * AMOUNT);
        await asset.connect(signer_E).approve(signer_D.address, MAX_UINT256);
        await asset.connect(signer_E).authorizeOperator(signer_D.address);

        await complianceMock.setFlags(false, false); // canTransfer = false

        // Transfers
        await expect(asset.connect(signer_E).transfer(signer_D.address, AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "ComplianceNotAllowed",
        );
        await expect(
          asset.connect(signer_D).transferFrom(signer_E.address, signer_D.address, AMOUNT),
        ).to.be.revertedWithCustomError(asset, "ComplianceNotAllowed");
        const basicTransferInfo = {
          to: signer_D.address,
          value: AMOUNT,
        };
        await expect(
          asset.connect(signer_E).transferByPartition(DEFAULT_PARTITION, basicTransferInfo, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "ComplianceNotAllowed");
        const operatorTransferData = {
          partition: DEFAULT_PARTITION,
          from: signer_E.address,
          to: signer_D.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
          operatorData: EMPTY_HEX_BYTES,
        };
        await expect(
          asset.connect(signer_D).operatorTransferByPartition(operatorTransferData),
        ).to.be.revertedWithCustomError(asset, "ComplianceNotAllowed");
        await expect(
          asset.connect(signer_E).transferWithData(signer_D.address, AMOUNT, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "ComplianceNotAllowed");
        await expect(
          asset.connect(signer_D).transferFromWithData(signer_E.address, signer_D.address, AMOUNT, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "ComplianceNotAllowed");
        await expect(asset.connect(signer_E).batchTransfer([signer_D.address], [AMOUNT])).to.be.revertedWithCustomError(
          asset,
          "ComplianceNotAllowed",
        );

        // Issue
        await expect(asset.batchMint([signer_E.address], [AMOUNT])).to.be.revertedWithCustomError(
          asset,
          "ComplianceNotAllowed",
        );
        await expect(asset.mint(signer_E.address, AMOUNT)).to.be.revertedWithCustomError(asset, "ComplianceNotAllowed");
        await expect(
          asset.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_E.address,
            value: AMOUNT,
            data: EMPTY_HEX_BYTES,
          }),
        ).to.be.revertedWithCustomError(asset, "ComplianceNotAllowed");
        await expect(asset.issue(signer_E.address, AMOUNT, EMPTY_HEX_BYTES)).to.be.revertedWithCustomError(
          asset,
          "ComplianceNotAllowed",
        );

        // Redeem
        await expect(asset.redeemByPartition(DEFAULT_PARTITION, AMOUNT, EMPTY_HEX_BYTES)).to.be.revertedWithCustomError(
          asset,
          "ComplianceNotAllowed",
        );
        await expect(asset.connect(signer_E).redeem(AMOUNT, EMPTY_HEX_BYTES)).to.be.revertedWithCustomError(
          asset,
          "ComplianceNotAllowed",
        );
        await expect(
          asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "ComplianceNotAllowed");

        // Approves
        await expect(asset.connect(signer_E).approve(signer_D.address, AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "ComplianceNotAllowed",
        );
        await expect(asset.connect(signer_E).authorizeOperator(signer_D.address)).to.be.revertedWithCustomError(
          asset,
          "ComplianceNotAllowed",
        );
        await expect(
          asset.connect(signer_E).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_D.address),
        ).to.be.revertedWithCustomError(asset, "ComplianceNotAllowed");
        await expect(asset.connect(signer_E).increaseAllowance(signer_D.address, AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "ComplianceNotAllowed",
        );

        // Revoke
        await expect(asset.connect(signer_E).revokeOperator(signer_D.address)).to.be.revertedWithCustomError(
          asset,
          "ComplianceNotAllowed",
        );
        await expect(
          asset.connect(signer_E).revokeOperatorByPartition(DEFAULT_PARTITION, signer_D.address),
        ).to.be.revertedWithCustomError(asset, "ComplianceNotAllowed");

        // Holds
        const hold = {
          amount: AMOUNT,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:03Z"),
          escrow: signer_D.address,
          to: signer_D.address,
          data: EMPTY_HEX_BYTES,
        };
        await asset.connect(signer_E).createHoldByPartition(DEFAULT_PARTITION, hold);
        const holdIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          holdId: 1,
        };
        await expect(
          asset.connect(signer_D).executeHoldByPartition(holdIdentifier, signer_E.address, AMOUNT),
        ).to.be.revertedWithCustomError(asset, "ComplianceNotAllowed");

        // Clearings
        await asset.connect(signer_B).activateClearing();
        const clearingOperation = {
          partition: DEFAULT_PARTITION,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:09Z"),
          data: EMPTY_HEX_BYTES,
        };
        await asset.connect(signer_E).clearingTransferByPartition(clearingOperation, AMOUNT, signer_D.address);
        const clearingIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          clearingId: 1,
          clearingOperationType: ClearingOperationType.Transfer,
        };
        await expect(asset.approveClearingOperationByPartition(clearingIdentifier)).to.be.revertedWithCustomError(
          asset,
          "ComplianceNotAllowed",
        );
      });
    });

    describe("Batch Operations", () => {
      describe("batchMint", () => {
        it("GIVEN an account with issuer role WHEN batchMint THEN transaction succeeds and balances are updated", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address, signer_E.address];
          const amounts = [mintAmount, mintAmount];

          const initialBalanceD = await asset.balanceOf(signer_D.address);
          const initialBalanceE = await asset.balanceOf(signer_E.address);
          const initialTotalSupply = await asset.totalSupply();

          await expect(asset.batchMint(toList, amounts)).to.not.be.reverted;

          const finalBalanceD = await asset.balanceOf(signer_D.address);
          const finalBalanceE = await asset.balanceOf(signer_E.address);
          const finalTotalSupply = await asset.totalSupply();

          expect(finalBalanceD).to.be.equal(initialBalanceD + BigInt(mintAmount));
          expect(finalBalanceE).to.be.equal(initialBalanceE + BigInt(mintAmount));
          expect(finalTotalSupply).to.be.equal(initialTotalSupply + BigInt(mintAmount * 2));
        });

        it("GIVEN an account without issuer role WHEN batchMint THEN transaction fails with AccountHasNoRole", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address, signer_E.address];
          const amounts = [mintAmount, mintAmount];

          // signer_B does not have ATS_ROLES._ISSUER_ROLE
          await expect(asset.connect(signer_B).batchMint(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "AccountHasNoRoles",
          );
        });

        it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const amounts = [mintAmount, mintAmount];

          await expect(asset.batchMint(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "InputAmountsArrayLengthMismatch",
          );
        });

        it("GIVEN a paused token WHEN batchMint THEN transaction fails with TokenIsPaused", async () => {
          await asset.pause();

          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const amounts = [mintAmount];

          await expect(asset.batchMint(toList, amounts)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
        });
      });

      describe("batchTransfer", () => {
        const transferAmount = AMOUNT / 4;
        const initialMintAmount = AMOUNT;

        beforeEach(async () => {
          // Mint initial tokens to the sender (signer_E)
          await asset.mint(signer_E.address, initialMintAmount);
        });

        it("GIVEN a valid sender WHEN batchTransfer THEN transaction succeeds and balances are updated", async () => {
          const toList = [signer_F.address, signer_D.address];
          const amounts = [transferAmount, transferAmount];

          const initialBalanceSender = await asset.balanceOf(signer_E.address);
          const initialBalanceF = await asset.balanceOf(signer_F.address);
          const initialBalanceD = await asset.balanceOf(signer_D.address);

          await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.not.be.reverted;

          const finalBalanceSender = await asset.balanceOf(signer_E.address);
          const finalBalanceF = await asset.balanceOf(signer_F.address);
          const finalBalanceD = await asset.balanceOf(signer_D.address);

          expect(finalBalanceSender).to.equal(initialBalanceSender - BigInt(transferAmount * 2));
          expect(finalBalanceF).to.equal(initialBalanceF + BigInt(transferAmount));
          expect(finalBalanceD).to.equal(initialBalanceD + BigInt(transferAmount));
        });

        it("GIVEN insufficient balance WHEN batchTransfer THEN transaction fails", async () => {
          const toList = [signer_F.address, signer_D.address];
          // Total amount > balance
          const amounts = [initialMintAmount, transferAmount];

          await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "InvalidPartition",
          );
        });

        it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const amounts = [mintAmount, mintAmount];

          await expect(asset.batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "InputAmountsArrayLengthMismatch",
          );
        });

        it("GIVEN a paused token WHEN batchTransfer THEN transaction fails with TokenIsPaused", async () => {
          await asset.pause();

          const toList = [signer_F.address];
          const amounts = [transferAmount];

          await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "TokenIsPaused",
          );
        });

        it("GIVEN clearing is activated WHEN batchTransfer THEN transaction fails with ClearingIsActivated", async () => {
          await asset.connect(signer_B).activateClearing();

          const toList = [signer_F.address];
          const amounts = [transferAmount];

          await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "ClearingIsActivated",
          );
        });

        it("GIVEN protected partitions without wildcard role WHEN batchTransfer THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
          await asset.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
          await asset.protectPartitions();

          const toList = [signer_F.address];
          const amounts = [transferAmount];

          await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "PartitionsAreProtectedAndNoRole",
          );
        });

        it("GIVEN non-verified sender WHEN batchTransfer THEN transaction fails with AddressNotVerified", async () => {
          await identityRegistryMock.setFlags(false, false);

          const toList = [signer_F.address];
          const amounts = [transferAmount];

          await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "AddressNotVerified",
          );
        });

        it("GIVEN compliance returns false WHEN batchTransfer THEN transaction fails with ComplianceNotAllowed", async () => {
          await complianceMock.setFlags(false, false);

          const toList = [signer_F.address];
          const amounts = [transferAmount];

          await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "ComplianceNotAllowed",
          );
        });
      });

      describe("batchForcedTransfer", () => {
        const transferAmount = AMOUNT / 2;

        beforeEach(async () => {
          await asset.mint(signer_F.address, transferAmount);
          await asset.mint(signer_D.address, transferAmount);
          await asset.grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_A.address);
        });

        it("GIVEN controller role WHEN batchForcedTransfer THEN transaction succeeds", async () => {
          const fromList = [signer_F.address, signer_D.address];
          const toList = [signer_E.address, signer_E.address];
          const amounts = [transferAmount, transferAmount];

          const initialBalanceF = await asset.balanceOf(signer_F.address);
          const initialBalanceD = await asset.balanceOf(signer_D.address);
          const initialBalanceE = await asset.balanceOf(signer_E.address);

          await expect(asset.connect(signer_A).batchForcedTransfer(fromList, toList, amounts)).to.not.be.reverted;

          const finalBalanceF = await asset.balanceOf(signer_F.address);
          const finalBalanceD = await asset.balanceOf(signer_D.address);
          const finalBalanceE = await asset.balanceOf(signer_E.address);

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
            asset.connect(signer_B).batchForcedTransfer(fromList, toList, amounts),
          ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
        });

        it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const fromList = [signer_F.address, signer_D.address];
          const amounts = [mintAmount, mintAmount];

          await expect(asset.batchForcedTransfer(fromList, toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "InputAmountsArrayLengthMismatch",
          );
        });

        it("GIVEN toList and amounts with different lengths WHEN batchForcedTransfer THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const fromList = [signer_A.address, signer_F.address];
          const toList = [signer_D.address, signer_E.address];
          const amounts = [mintAmount];

          await expect(asset.batchForcedTransfer(fromList, toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "InputAmountsArrayLengthMismatch",
          );
        });

        it("GIVEN a paused token WHEN batchForcedTransfer THEN transaction fails with TokenIsPaused", async () => {
          await asset.pause();

          const fromList = [signer_F.address];
          const toList = [signer_E.address];
          const amounts = [transferAmount];

          await expect(
            asset.connect(signer_A).batchForcedTransfer(fromList, toList, amounts),
          ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
        });
      });

      describe("batchSetAddressFrozen", () => {
        const mintAmount = AMOUNT;
        const transferAmount = AMOUNT / 2;

        beforeEach(async () => {
          // Mint tokens to accounts that will be frozen/unfrozen
          await asset.mint(signer_D.address, mintAmount);
          await asset.mint(signer_E.address, mintAmount);
        });

        it("GIVEN a FREEZE_MANAGER WHEN batchSetAddressFrozen with true THEN transfers from those addresses fail", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const freezeFlags = [true, true];

          // Freeze accounts
          await expect(asset.batchSetAddressFrozen(userAddresses, freezeFlags)).to.not.be.reverted;

          // Attempting transfers from frozen accounts should fail
          await expect(
            asset.connect(signer_D).transfer(signer_A.address, transferAmount),
          ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");

          await expect(
            asset.connect(signer_E).transfer(signer_A.address, transferAmount),
          ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
        });

        it("GIVEN paused token WHEN batchSetAddressFrozen THEN fails with TokenIsPaused", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          // grant KYC to signer_A.address
          await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

          await asset.connect(signer_B).pause();

          // First, freeze the addresses
          await expect(asset.batchSetAddressFrozen(userAddresses, [true, true])).to.revertedWithCustomError(
            asset,
            "TokenIsPaused",
          );
        });

        it("GIVEN invalid address WHEN batchSetAddressFrozen THEN fails with ZeroAddressNotAllowed", async () => {
          const userAddresses = [signer_D.address, signer_E.address, ADDRESS_ZERO];
          // grant KYC to signer_A.address
          await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

          // First, freeze the addresses
          await expect(asset.batchSetAddressFrozen(userAddresses, [true, true, true])).to.revertedWithCustomError(
            asset,
            "ZeroAddressNotAllowed",
          );
        });

        it("GIVEN frozen addresses WHEN batchSetAddressFrozen with false THEN transfers from those addresses succeed", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          // grant KYC to signer_A.address
          await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

          // First, freeze the addresses
          await asset.batchSetAddressFrozen(userAddresses, [true, true]);

          // Now, unfreeze them in a batch
          await expect(asset.batchSetAddressFrozen(userAddresses, [false, false])).to.not.be.reverted;

          await expect(asset.connect(signer_D).transfer(signer_A.address, transferAmount)).to.not.be.reverted;

          await expect(asset.connect(signer_E).transfer(signer_A.address, transferAmount)).to.not.be.reverted;

          // Check final balances to be sure
          expect(await asset.balanceOf(signer_D.address)).to.equal(mintAmount - transferAmount);
          expect(await asset.balanceOf(signer_E.address)).to.equal(mintAmount - transferAmount);
        });

        it("GIVEN an account without ATS_ROLES._FREEZE_MANAGER_ROLE WHEN batchSetAddressFrozen THEN transaction fails", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const freezeFlags = [true, true];

          await expect(
            asset.connect(signer_F).batchSetAddressFrozen(userAddresses, freezeFlags),
          ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
        });

        it("GIVEN an invalid input boolean array THEN transaction fails with InputBoolArrayLengthMismatch", async () => {
          const toList = [signer_D.address];
          const status = [true, true];

          await expect(asset.batchSetAddressFrozen(toList, status)).to.be.revertedWithCustomError(
            asset,
            "InputBoolArrayLengthMismatch",
          );
        });
      });

      describe("batchFreezePartialTokens", () => {
        const freezeAmount = AMOUNT / 2;
        beforeEach(async () => {
          await asset.mint(signer_D.address, freezeAmount);
          await asset.mint(signer_E.address, freezeAmount);
        });

        it("GIVEN ATS_ROLES._FREEZE_MANAGER_ROLE WHEN batchFreezePartialTokens THEN tokens are frozen successfully", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const amounts = [freezeAmount, freezeAmount];

          const initialFrozenD = await asset.getFrozenTokens(signer_D.address);
          const initialFrozenE = await asset.getFrozenTokens(signer_E.address);

          await expect(asset.batchFreezePartialTokens(userAddresses, amounts)).to.not.be.reverted;

          const finalFrozenD = await asset.getFrozenTokens(signer_D.address);
          const finalFrozenE = await asset.getFrozenTokens(signer_E.address);

          expect(finalFrozenD).to.equal(initialFrozenD + BigInt(freezeAmount));
          expect(finalFrozenE).to.equal(initialFrozenE + BigInt(freezeAmount));
        });

        it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const amounts = [mintAmount, mintAmount];

          await expect(asset.batchFreezePartialTokens(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "InputAmountsArrayLengthMismatch",
          );
        });
      });

      describe("batchUnfreezePartialTokens", () => {
        const totalAmount = AMOUNT;
        const unfreezeAmount = AMOUNT / 2;

        beforeEach(async () => {
          await asset.mint(signer_D.address, totalAmount);
          await asset.mint(signer_E.address, totalAmount);

          await asset.freezePartialTokens(signer_D.address, totalAmount);
          await asset.freezePartialTokens(signer_E.address, totalAmount);
        });

        it("GIVEN frozen tokens WHEN batchUnfreezePartialTokens THEN tokens are unfrozen successfully", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const amounts = [unfreezeAmount, unfreezeAmount];

          const initialFrozenD = await asset.getFrozenTokens(signer_D.address);
          const initialFrozenE = await asset.getFrozenTokens(signer_E.address);

          await expect(asset.batchUnfreezePartialTokens(userAddresses, amounts)).to.not.be.reverted;

          const finalFrozenD = await asset.getFrozenTokens(signer_D.address);
          const finalFrozenE = await asset.getFrozenTokens(signer_E.address);

          expect(finalFrozenD).to.equal(initialFrozenD - BigInt(unfreezeAmount));
          expect(finalFrozenE).to.equal(initialFrozenE - BigInt(unfreezeAmount));
        });

        it("GIVEN insufficient frozen tokens WHEN batchUnfreezePartialTokens THEN transaction fails", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          // Try to unfreeze more than was frozen for signer_D.address
          const amounts = [totalAmount + 1, unfreezeAmount];

          await expect(asset.batchUnfreezePartialTokens(userAddresses, amounts)).to.be.revertedWithCustomError(
            asset,
            "InsufficientFrozenBalance",
          );
        });

        it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const amounts = [mintAmount, mintAmount];

          await expect(asset.batchUnfreezePartialTokens(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "InputAmountsArrayLengthMismatch",
          );
        });
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without TREX_OWNER role WHEN setName THEN transaction fails with AccountHasNoRole", async () => {
        // set name fails
        await expect(asset.connect(signer_C).setName(newName)).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });
      it("GIVEN an account without TREX_OWNER role WHEN setSymbol THEN transaction fails with AccountHasNoRole", async () => {
        // set symbol fails
        await expect(asset.connect(signer_C).setSymbol(newSymbol)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });
      it("GIVEN an account without TREX_OWNER role WHEN setOnchainID THEN transaction fails with AccountHasNoRole", async () => {
        // set onchainID fails
        await expect(asset.connect(signer_C).setOnchainID(onchainId)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });
      it("GIVEN an account without TREX_OWNER role WHEN setIdentityRegistry THEN transaction fails with AccountHasNoRole", async () => {
        // set IdentityRegistry fails
        await expect(
          asset.connect(signer_C).setIdentityRegistry(identityRegistryMock.target as string),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });
      it("GIVEN an account without FREEZE MANAGER role WHEN freezePartialTokens THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).freezePartialTokens(signer_A.address, 10)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRoles",
        );
      });

      it("GIVEN an account without FREEZE MANAGER role WHEN unfreezePartialTokens THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).unfreezePartialTokens(signer_A.address, 10)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRoles",
        );
      });

      it("GIVEN an account without FREEZE MANAGER role WHEN setAddressFrozen THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).setAddressFrozen(signer_A.address, true)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRoles",
        );
      });

      it("GIVEN an account without AGENT_ROLE role WHEN recoveryAddress THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          asset.connect(signer_C).recoveryAddress(signer_A.address, signer_B.address, signer_C.address),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });
    });

    describe("Paused", () => {
      beforeEach(async () => {
        await asset.pause();
      });
      it("GIVEN a paused token WHEN freezePartialTokens THEN transactions revert with TokenIsPaused error", async () => {
        await expect(asset.freezePartialTokens(signer_A.address, 10)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused token WHEN unfreezePartialTokens THEN transactions revert with TokenIsPaused error", async () => {
        await expect(asset.unfreezePartialTokens(signer_A.address, 10)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused token WHEN setAddressFrozen THEN transactions revert with TokenIsPaused error", async () => {
        await expect(asset.setAddressFrozen(signer_A.address, true)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused token WHEN batchFreezePartialTokens THEN transactions revert with TokenIsPaused error", async () => {
        const userAddresses = [signer_D.address, signer_E.address];
        const amounts = [100, 100];

        await expect(asset.batchFreezePartialTokens(userAddresses, amounts)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused token WHEN batchUnfreezePartialTokens THEN transactions revert with TokenIsPaused error", async () => {
        const userAddresses = [signer_D.address, signer_E.address];
        const amounts = [100, 100];

        await expect(asset.batchUnfreezePartialTokens(userAddresses, amounts)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused token WHEN attempting to update name or symbol THEN transactions revert with TokenIsPaused error", async () => {
        await expect(asset.setName(newName)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
        await expect(asset.setSymbol(newSymbol)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
        await expect(asset.setOnchainID(onchainId)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
        await expect(asset.setIdentityRegistry(identityRegistryMock.target as string)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
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
        await asset.connect(signer_A).grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_C.address);

        await asset.connect(signer_A).grantRole(ATS_ROLES._CAP_ROLE, signer_A.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_A.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_B.address);

        await asset.setMaxSupply(maxSupply_Original);
        await asset.setMaxSupplyByPartition(DEFAULT_PARTITION, maxSupply_Partition_1_Original);

        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: balanceOf_A_Original[0],
          data: EMPTY_HEX_BYTES,
        });
      }

      it("GIVEN a freeze WHEN adjustBalances THEN frozen amount gets updated succeeds", async () => {
        await setPreBalanceAdjustment();

        const balance_Before = await asset.balanceOf(signer_E.address);
        const balance_Before_Partition_1 = await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address);

        // HOLD
        await asset.freezePartialTokens(signer_E.address, _AMOUNT);

        const frozen_TotalAmount_Before = await asset.getFrozenTokens(signer_E.address);
        const frozen_TotalAmount_Before_Partition_1 = await asset.getFrozenTokens(signer_E.address);

        // adjustBalances
        await asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

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
        await asset.connect(signer_B).setScheduledBalanceAdjustment(balanceAdjustmentData);
        await asset.connect(signer_B).setScheduledBalanceAdjustment(balanceAdjustmentData_2);

        // wait for first scheduled balance adjustment only
        await asset.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:03Z"));

        const frozen_TotalAmount_After = await asset.getFrozenTokens(signer_E.address);
        const frozen_TotalAmount_After_Partition_1 = await asset.getFrozenTokens(signer_E.address);

        const balance_After = await asset.balanceOf(signer_E.address);
        const balance_After_Partition_1 = await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address);

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
        await asset.grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_A.address);
        const assetA = asset.connect(signer_A);

        const amount = 1000;
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: EMPTY_HEX_BYTES,
        });

        // Freeze tokens initially
        await asset.freezePartialTokens(signer_E.address, amount / 2);

        const frozenBefore = await asset.getFrozenTokens(signer_E.address);

        // Change ABAF
        await assetA.adjustBalances(2, 1); // 2x adjustment

        // Freeze more tokens - this should trigger _updateTotalFreezeAmountAndLabaf
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: EMPTY_HEX_BYTES,
        });
        await asset.freezePartialTokens(signer_E.address, amount / 2);

        const frozenAfter = await asset.getFrozenTokens(signer_E.address);

        // The previously frozen amount should be adjusted by factor 2
        expect(frozenAfter).to.be.equal(frozenBefore * 2n + BigInt(amount / 2));
      });

      it("GIVEN frozen tokens WHEN freezing again without ABAF change THEN factor equals 1", async () => {
        const amount = 1000;
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: EMPTY_HEX_BYTES,
        });

        // Freeze tokens initially
        await asset.freezePartialTokens(signer_E.address, amount / 2);

        const frozenBefore = await asset.getFrozenTokens(signer_E.address);

        // Freeze more tokens WITHOUT changing ABAF - this should hit the factor == 1 branch
        await asset.freezePartialTokens(signer_E.address, amount / 4);

        const frozenAfter = await asset.getFrozenTokens(signer_E.address);

        // The frozen amount should just be sum (no factor adjustment)
        expect(frozenAfter).to.be.equal(frozenBefore + BigInt(amount / 4));
      });

      it("GIVEN frozen tokens by partition WHEN checking total balance THEN frozen tokens are included", async () => {
        await asset.grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_A.address);
        await asset.grantRole(ATS_ROLES._SNAPSHOT_ROLE, signer_A.address);

        const amount = 1000;
        const frozenAmount = 300;

        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: EMPTY_HEX_BYTES,
        });

        // Freeze some tokens by partition
        await asset.freezePartialTokens(signer_E.address, frozenAmount);

        // Take a snapshot - this will invoke _getTotalBalanceForByPartitionAdjusted
        await asset.connect(signer_A).takeSnapshot();

        // Get balances before ABAF
        const frozenBefore = await asset.getFrozenTokens(signer_E.address);
        const freeBefore = await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address);

        // Apply ABAF with factor 2 - this internally uses _getTotalBalanceForByPartitionAdjusted to calculate total balance
        const decimals = await asset.decimals();
        await asset.connect(signer_A).adjustBalances(2, decimals);

        // Take another snapshot after ABAF to trigger _getTotalBalanceForByPartitionAdjusted again
        await asset.connect(signer_A).takeSnapshot();

        // After ABAF, both free and frozen should be doubled
        const frozenAfter = await asset.getFrozenTokens(signer_E.address);
        const freeAfter = await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address);

        // Verify _getTotalBalanceForByPartitionAdjusted was used: total = free + frozen, then multiplied by factor
        expect(frozenAfter).to.equal(frozenBefore * 2n);
        expect(freeAfter).to.equal(freeBefore * 2n);
        expect(frozenAfter + freeAfter).to.equal(amount * 2);

        // Verify snapshots captured the total balance including frozen tokens by partition
        const snapshot1BalanceByPartition = await asset.balanceOfAtSnapshotByPartition(
          DEFAULT_PARTITION,
          1,
          signer_E.address,
        );
        const snapshot2BalanceByPartition = await asset.balanceOfAtSnapshotByPartition(
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
        await asset.grantRole(ATS_ROLES._LOCKER_ROLE, signer_A.address);
        const amount = 1000;
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        });
        // Lock
        await asset.lock(amount, signer_E.address, dateToUnixTimestamp("2030-01-01T00:00:03Z"));
        await expect(
          asset.recoveryAddress(signer_E.address, signer_B.address, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(asset, "CannotRecoverWallet");
        await asset.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:03Z"));
        await asset.release(1, signer_E.address);
        // Hold
        const hold = {
          amount: amount,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:06Z"),
          escrow: signer_B.address,
          to: signer_C.address,
          data: EMPTY_HEX_BYTES,
        };
        await asset.connect(signer_E).createHoldByPartition(DEFAULT_PARTITION, hold);
        await expect(
          asset.recoveryAddress(signer_E.address, signer_B.address, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(asset, "CannotRecoverWallet");
        await asset.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:06Z"));
        const holdIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          holdId: 1,
        };
        await asset.connect(signer_B).releaseHoldByPartition(holdIdentifier, amount);
        // Clearing
        await asset.connect(signer_B).activateClearing();
        const clearingOperation = {
          partition: DEFAULT_PARTITION,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:09Z"),
          data: EMPTY_HEX_BYTES,
        };
        await asset.connect(signer_E).clearingTransferByPartition(clearingOperation, amount, signer_A.address);
        await expect(
          asset.recoveryAddress(signer_E.address, signer_B.address, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(asset, "CannotRecoverWallet");
      });

      it("GIVEN lost wallet WHEN calling recoveryAddress THEN normal balance and freeze balance and status is successfully transferred", async () => {
        const amount = 1000;
        await asset.grantRole(ATS_ROLES._CONTROL_LIST_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        });
        await asset.freezePartialTokens(signer_E.address, amount / 2);
        await asset.addToControlList(signer_E.address);
        expect(await asset.recoveryAddress(signer_E.address, signer_B.address, ADDRESS_ZERO))
          .to.emit(asset, "RecoverySuccess")
          .withArgs(signer_E.address, signer_B.address, ADDRESS_ZERO);
        const balanceE = await asset.balanceOf(signer_E.address);
        const balanceB = await asset.balanceOf(signer_B.address);
        const frozenBalanceE = await asset.getFrozenTokens(signer_E.address);
        const frozenBalanceB = await asset.getFrozenTokens(signer_B.address);
        const assetStatusE = await asset.isInControlList(signer_E.address);
        const assetStatusB = await asset.isInControlList(signer_B.address);
        const isRecovered = await asset.isAddressRecovered(signer_E.address);
        expect(balanceE).to.equal(0);
        expect(balanceB).to.equal(amount / 2);
        expect(frozenBalanceE).to.equal(0);
        expect(frozenBalanceB).to.equal(amount / 2);
        expect(assetStatusE).to.equal(true);
        expect(assetStatusB).to.equal(true);
        expect(isRecovered).to.equal(true);
      });
      it("GIVEN lost wallet WHEN calling recovery using a previously recovered address THEN recovered status is set to false", async () => {
        await asset.recoveryAddress(signer_C.address, signer_B.address, ADDRESS_ZERO);
        await asset.recoveryAddress(signer_B.address, signer_C.address, ADDRESS_ZERO);
        const isRecoveredC = await asset.isAddressRecovered(signer_C.address);
        expect(isRecoveredC).to.equal(false);
      });

      it("GIVEN a recovered address THEN operations should fail", async () => {
        // Set up
        await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
        await asset.grantRole(ATS_ROLES._LOCKER_ROLE, signer_A.address);
        await asset.connect(signer_C).authorizeOperator(signer_A.address);
        await asset.connect(signer_C).authorizeOperator(signer_B.address);
        await asset.connect(signer_A).authorizeOperator(signer_C.address);
        await asset.connect(signer_A).authorizeOperator(signer_A.address);
        const amount = 1000;
        // Recover
        await asset.recoveryAddress(signer_C.address, signer_B.address, ADDRESS_ZERO);
        // Transfers
        // 1 - Operator
        const basicTransferInfo = {
          to: signer_B.address,
          value: amount,
        };
        await expect(
          asset.connect(signer_C).transferByPartition(DEFAULT_PARTITION, basicTransferInfo, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.connect(signer_C).transfer(basicTransferInfo.to, amount)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(
          asset.connect(signer_C).transferFrom(signer_A.address, basicTransferInfo.to, amount),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "bytes32"],
          [ATS_ROLES._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, DEFAULT_PARTITION],
        );
        const packedDataWithoutPrefix = packedData.slice(2);

        const ProtectedPartitionRole_1 = ethers.keccak256("0x" + packedDataWithoutPrefix);
        await asset.grantRole(ProtectedPartitionRole_1, signer_A.address);
        await asset.protectPartitions();
        await expect(
          asset.protectedTransferFromByPartition(DEFAULT_PARTITION, signer_C.address, signer_B.address, amount, {
            deadline: MAX_UINT256,
            nonce: 1,
            signature: "0x1234",
          }),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        const operatorTransferData = {
          partition: DEFAULT_PARTITION,
          from: signer_A.address,
          to: signer_B.address,
          value: amount,
          data: EMPTY_HEX_BYTES,
          operatorData: EMPTY_HEX_BYTES,
        };
        await expect(
          asset.connect(signer_C).operatorTransferByPartition(operatorTransferData),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).transferWithData(signer_A.address, amount, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).transferFromWithData(signer_A.address, signer_B.address, amount, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.connect(signer_C).batchTransfer([signer_D.address], [amount])).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        // 2 - From
        operatorTransferData.from = signer_C.address;
        await expect(
          asset.connect(signer_A).operatorTransferByPartition(operatorTransferData),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        operatorTransferData.from = signer_A.address;
        await expect(
          asset.connect(signer_A).transferFromWithData(signer_C.address, signer_B.address, amount, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_A).transferFrom(signer_C.address, basicTransferInfo.to, amount),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        // 3 - To
        basicTransferInfo.to = signer_C.address;
        await expect(
          asset.transferByPartition(DEFAULT_PARTITION, basicTransferInfo, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.transfer(signer_C.address, amount)).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.transferFrom(signer_A.address, signer_C.address, amount)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await asset.protectPartitions();
        await expect(
          asset.protectedTransferFromByPartition(DEFAULT_PARTITION, signer_B.address, signer_C.address, amount, {
            deadline: MAX_UINT256,
            nonce: 1,
            signature: "0x1234",
          }),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        operatorTransferData.to = signer_C.address;
        await expect(asset.operatorTransferByPartition(operatorTransferData)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(asset.transferWithData(signer_C.address, amount, EMPTY_HEX_BYTES)).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(
          asset.transferFromWithData(signer_A.address, signer_C.address, amount, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.batchTransfer([signer_C.address], [amount])).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        // Allowance
        // 1 - Operator
        await expect(asset.connect(signer_C).increaseAllowance(signer_A.address, amount)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(asset.connect(signer_C).approve(signer_A.address, amount)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(asset.connect(signer_C).authorizeOperator(signer_A.address)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(
          asset.connect(signer_C).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        // 2 - To
        await expect(asset.increaseAllowance(signer_C.address, amount)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(asset.approve(signer_C.address, amount)).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.authorizeOperator(signer_C.address)).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.authorizeOperatorByPartition(DEFAULT_PARTITION, signer_C.address),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        // Redeems
        // 1 - Operator
        await expect(asset.connect(signer_C).redeem(amount, EMPTY_HEX_BYTES)).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await asset.protectPartitions();
        await expect(
          asset.protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_C.address, amount, {
            deadline: MAX_UINT256,
            nonce: 1,
            signature: "0x1234",
          }),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        await expect(
          asset
            .connect(signer_C)
            .operatorRedeemByPartition(DEFAULT_PARTITION, signer_A.address, amount, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).redeemByPartition(DEFAULT_PARTITION, amount, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).redeemFrom(signer_A.address, amount, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        // 2 - From
        await expect(asset.redeemFrom(signer_C.address, amount, EMPTY_HEX_BYTES)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(asset.redeemFrom(signer_C.address, amount, EMPTY_HEX_BYTES)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(
          asset.operatorRedeemByPartition(
            DEFAULT_PARTITION,
            signer_C.address,
            amount,
            EMPTY_HEX_BYTES,
            EMPTY_HEX_BYTES,
          ),
        ).to.revertedWithCustomError(asset, "WalletRecovered");
        // Issue
        await expect(asset.issue(signer_C.address, amount, EMPTY_HEX_BYTES)).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(
          asset.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_C.address,
            value: amount,
            data: EMPTY_HEX_BYTES,
          }),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.mint(signer_C.address, amount)).to.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.batchMint([signer_C.address], [amount])).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        // Locks
        await expect(asset.lock(amount, signer_C.address, MAX_UINT256)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(
          asset.lockByPartition(DEFAULT_PARTITION, amount, signer_C.address, MAX_UINT256),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        // Clearings
        await asset.connect(signer_B).activateClearing();
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
          asset.connect(signer_C).clearingTransferByPartition(clearingOperation, amount, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).clearingTransferFromByPartition(clearingOperationFrom, amount, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        const protectedClearingOperation = {
          clearingOperation: clearingOperation,
          from: signer_C.address,
          deadline: MAX_UINT256,
          nonce: 1,
        };
        await asset.protectPartitions();
        await expect(
          asset.protectedClearingTransferByPartition(protectedClearingOperation, amount, signer_A.address, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        // 2 - From
        clearingOperationFrom.from = signer_C.address;
        await expect(
          asset.clearingTransferFromByPartition(clearingOperationFrom, amount, signer_C.address),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        clearingOperationFrom.from = signer_A.address;
        // 3 - To
        await expect(
          asset.clearingTransferByPartition(clearingOperation, amount, signer_C.address),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.clearingTransferFromByPartition(clearingOperationFrom, amount, signer_C.address),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.protectPartitions();
        protectedClearingOperation.from = signer_A.address;
        await expect(
          asset.protectedClearingTransferByPartition(protectedClearingOperation, amount, signer_C.address, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        protectedClearingOperation.from = signer_C.address;
        await asset.unprotectPartitions();
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
          asset.connect(signer_C).clearingCreateHoldByPartition(clearingOperation, hold),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.protectPartitions();
        await expect(
          asset.protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        // 2 - From
        await expect(
          asset.clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        // 3 - To
        hold.to = signer_C.address;
        await expect(asset.clearingCreateHoldByPartition(clearingOperation, hold)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(
          asset.clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.protectPartitions();
        await expect(
          asset.protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        // Clearings - Redeems
        // 1 - Operator
        await expect(
          asset.connect(signer_C).clearingRedeemByPartition(clearingOperation, amount),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).clearingRedeemFromByPartition(clearingOperationFrom, amount),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.protectPartitions();
        await expect(
          asset.protectedClearingRedeemByPartition(protectedClearingOperation, amount, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        await asset.connect(signer_B).deactivateClearing();
        // 2 - From
        clearingOperationFrom.from = signer_C.address;
        await expect(asset.clearingRedeemFromByPartition(clearingOperationFrom, amount)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        clearingOperationFrom.from = signer_A.address;
        // Holds
        // 1 - Operator
        await expect(
          asset.connect(signer_C).createHoldByPartition(DEFAULT_PARTITION, hold),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).createHoldFromByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.protectPartitions();
        const protectedHold = {
          hold: hold,
          deadline: MAX_UINT256,
          nonce: 1,
        };
        await expect(
          asset.protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_C.address, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        await expect(
          asset
            .connect(signer_C)
            .operatorCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        // 2 - From
        await expect(
          asset.operatorCreateHoldByPartition(DEFAULT_PARTITION, signer_C.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.createHoldFromByPartition(DEFAULT_PARTITION, signer_C.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        // 3 - To
        hold.to = signer_C.address;
        await expect(
          asset.connect(signer_C).createHoldByPartition(DEFAULT_PARTITION, hold),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).createHoldFromByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.protectPartitions();
        await expect(
          asset.protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_C.address, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        await expect(
          asset
            .connect(signer_C)
            .operatorCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        const holdIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          holdId: 1,
        };
        await expect(
          asset.executeHoldByPartition(holdIdentifier, signer_C.address, amount),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        // Can transfer
        // 1 - Operator
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        let canTransferByPartition = await asset
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
        canTransferByPartition = await asset
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
        let canTransfer = await asset.connect(signer_C).canTransfer(signer_A.address, amount, EMPTY_HEX_BYTES);
        expect(canTransfer[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        // 2 - From
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        await asset.controllerTransfer(signer_A.address, signer_C.address, amount, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES);
        canTransferByPartition = await asset
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
        canTransferByPartition = await asset
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
        canTransfer = await asset.canTransfer(signer_C.address, amount, EMPTY_HEX_BYTES);
        expect(canTransfer[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        // Can redeem
        // 1 - Operator
        let canRedeemByPartition = await asset
          .connect(signer_C)
          .canRedeemByPartition(signer_A.address, DEFAULT_PARTITION, amount, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES);
        expect(canRedeemByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        canRedeemByPartition = await asset
          .connect(signer_C)
          .canRedeemByPartition(signer_C.address, DEFAULT_PARTITION, amount, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES);
        expect(canRedeemByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        // 2 - From
        canRedeemByPartition = await asset
          .connect(signer_B)
          .canRedeemByPartition(signer_C.address, DEFAULT_PARTITION, amount, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES);
        expect(canRedeemByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        // Freeze
        await expect(asset.freezePartialTokens(signer_C.address, amount)).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
      });
      it("GIVEN a recovered wallet WHEN recoveryAddress THEN transaction fails with WalletRecovered", async () => {
        await asset.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

        await expect(
          asset.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
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

      asset = await ethers.getContractAt("IAsset", diamond.target);

      await executeRbac(asset, [
        {
          role: ATS_ROLES._PAUSER_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._CLEARING_ROLE,
          members: [signer_B.address],
        },
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
    });

    it("GIVEN an account with issuer role WHEN mint THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      // transfer with data fails
      await expect(
        asset.connect(signer_C).mint(signer_D.address, 2 * BALANCE_OF_C_ORIGINAL),
      ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
    });

    it("GIVEN an initialized token WHEN burning THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      // burn with data fails
      await expect(
        asset.connect(signer_C).burn(signer_C.address, 2 * BALANCE_OF_C_ORIGINAL),
      ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
    });

    it("GIVEN an account with balance WHEN forcedTransfer THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      // transfer with data fails
      await expect(
        asset.connect(signer_A).forcedTransfer(signer_A.address, signer_D.address, 2 * BALANCE_OF_C_ORIGINAL),
      ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
    });

    it("GIVEN an single partition token WHEN recoveryAddress THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      await asset.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
      await expect(
        asset.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO),
      ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
    });

    describe("Batch operations", () => {
      it("GIVEN an single partition token WHEN batchTransfer THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.batchTransfer([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });
      it("GIVEN an single partition token WHEN batchForcedTransfer THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(
          asset.batchForcedTransfer([signer_A.address], [signer_A.address], [AMOUNT]),
        ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
      });
      it("GIVEN an single partition token WHEN batchMint THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.batchMint([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });
    });

    describe("Freeze", () => {
      it("GIVEN an account with ATS_ROLES._FREEZE_MANAGER_ROLE WHEN freezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.freezePartialTokens(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN an account with ATS_ROLES._FREEZE_MANAGER_ROLE WHEN unfreezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.unfreezePartialTokens(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN an account with ATS_ROLES._FREEZE_MANAGER_ROLE WHEN unfreezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.unfreezePartialTokens(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN an account with ATS_ROLES._FREEZE_MANAGER_ROLE WHEN batchFreezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.batchFreezePartialTokens([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN an account with ATS_ROLES._FREEZE_MANAGER_ROLE WHEN batchFreezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.batchUnfreezePartialTokens([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
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

      asset = await ethers.getContractAt("IAsset", diamond.target);

      await executeRbac(asset, [
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

      await asset.addIssuer(signer_A.address);
      await asset.grantKyc(signer_F.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.mint(signer_D.address, AMOUNT);
    }

    beforeEach(async () => {
      await loadFixture(deployERC3643TokenIsControllableFixture);
    });

    it("GIVEN token is not controllable WHEN batchForcedTransfer THEN transaction fails with TokenIsNotControllable", async () => {
      const fromList = [signer_F.address];
      const toList = [signer_E.address];
      const amounts = [AMOUNT];

      await expect(
        asset.connect(signer_A).batchForcedTransfer(fromList, toList, amounts),
      ).to.be.revertedWithCustomError(asset, "TokenIsNotControllable");
    });
    it("GIVEN token is controllable WHEN burning THEN transaction fails with TokenIsNotControllable", async () => {
      await expect(asset.burn(signer_E.address, AMOUNT)).to.be.revertedWithCustomError(asset, "TokenIsNotControllable");
    });
    it("GIVEN token is controllable WHEN forcedTransfer THEN transaction fails with TokenIsNotControllable", async () => {
      await expect(asset.forcedTransfer(signer_E.address, signer_D.address, AMOUNT)).to.be.revertedWithCustomError(
        asset,
        "TokenIsNotControllable",
      );
    });
  });
});
