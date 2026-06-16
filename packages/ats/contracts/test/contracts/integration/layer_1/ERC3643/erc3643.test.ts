// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { isinGenerator } from "@thomaschaplin/isin-generator";
import { IAsset, type ResolverProxy, ComplianceMock, IdentityRegistryMock, MockDiamondCut } from "@contract-types";
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
  RESOLVER_KEY_COMPLIANCE,
  RESOLVER_KEY_IDENTITY,
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

describe("ERC3643 Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;
  let signer_F: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

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
      mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);

      await executeRbac(asset, [
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_ISSUER,
          members: [signer_C.address],
        },
        {
          role: ATS_ROLES.ROLE_KYC,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_SSI_MANAGER,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_CLEARING,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_CLEARING_VALIDATOR,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_AGENT,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_TREX_OWNER,
          members: [signer_A.address],
        },
      ]);

      await asset.grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
      await asset.addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_F.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.grantRole(ATS_ROLES.ROLE_FREEZE_MANAGER, signer_A.address);
      await asset.grantRole(ATS_ROLES.ROLE_PAUSER, signer_A.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    it("GIVEN a paused token WHEN attempting to update name or symbol THEN transactions revert with IsPaused error", async () => {
      await asset.connect(signer_B).pause();

      await expect(asset.setName(newName)).to.be.revertedWithCustomError(asset, "IsPaused");
      await expect(asset.setName(newSymbol)).to.be.revertedWithCustomError(asset, "IsPaused");
    });

    it("GIVEN an initialized token WHEN retrieving the version THEN returns the right version", async () => {
      const json = await asset.version();
      const parsed = JSON.parse(json);

      const [configResolver, , configId, configVersion] = await asset.getConfigInfo();

      expect(parsed["Resolver"].toLowerCase()).to.equal(configResolver.toLowerCase());
      expect(parsed["Config ID"].toLowerCase()).to.equal(configId.toLowerCase());
      expect(parsed["Version"]).to.equal(configVersion.toString());
    });

    describe("initializeCompliance / initializeIdentity", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeCompliance is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_D).initializeCompliance(complianceMock.target as string))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_D.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeIdentity is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_D).initializeIdentity(identityRegistryMock.target as string))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_D.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeCompliance is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeCompliance(complianceMock.target as string)).to.be.revertedWithCustomError(
          asset,
          "FacetAlreadyRegistered",
        );
      });

      it("GIVEN already-initialised WHEN initializeIdentity is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeIdentity(identityRegistryMock.target as string)).to.be.revertedWithCustomError(
          asset,
          "FacetAlreadyRegistered",
        );
      });
    });

    describe("initializeCompliance / initializeIdentity events", () => {
      it("GIVEN a fresh deployment WHEN initializeCompliance is called THEN emits ComplianceInitialized", async () => {
        await mockDiamondCut.forceFacetNotRegistered(RESOLVER_KEY_COMPLIANCE);
        await expect(asset.initializeCompliance(complianceMock.target as string)).to.emit(
          asset,
          "ComplianceInitialized",
        );
      });

      it("GIVEN a fresh deployment WHEN initializeIdentity is called THEN emits IdentityInitialized", async () => {
        await mockDiamondCut.forceFacetNotRegistered(RESOLVER_KEY_IDENTITY);
        await expect(asset.initializeIdentity(identityRegistryMock.target as string)).to.emit(
          asset,
          "IdentityInitialized",
        );
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
            role: ATS_ROLES.ROLE_FREEZE_MANAGER,
            members: [signer_A.address],
          },
          {
            role: ATS_ROLES.ROLE_CONTROL_LIST,
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
        expect(await asset.isFrozen(signer_E.address)).to.be.true;
        expect(await asset.balanceOf(signer_E.address)).to.be.equal(0);
      });

      describe("bug Transfer", () => {
        it("GIVEN a valid holder WHEN freezePartialTokens THEN Transfer event is emitted from holder to address(0)", async () => {
          await asset.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_E.address,
            value: AMOUNT,
            data: "0x",
          });
          await expect(asset.freezePartialTokens(signer_E.address, AMOUNT))
            .to.emit(asset, "Transfer")
            .withArgs(signer_E.address, ethers.ZeroAddress, AMOUNT);
        });
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
        expect(await asset.isFrozen(signer_E.address)).to.be.true;
        expect(await asset.balanceOf(signer_E.address)).to.be.equal(0);

        await expect(asset.unfreezePartialTokens(signer_E.address, amount))
          .to.emit(asset, "TokensUnfrozen")
          .withArgs(signer_E.address, amount, DEFAULT_PARTITION)
          .to.emit(asset, "Transfer")
          .withArgs(ethers.ZeroAddress, signer_E.address, amount);
        expect(await asset.getFrozenTokens(signer_E.address)).to.be.equal(0);
        expect(await asset.isFrozen(signer_E.address)).to.be.false;
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
            role: ATS_ROLES.ROLE_ISSUER,
            members: [signer_A.address],
          },
          { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        ]);

        const kycNoCompliance = await ethers.getContractAt("Kyc", newTokenFixture.diamond.target, signer_B);
        const erc20NoCompliance = await ethers.getContractAt("Transfer", newTokenFixture.diamond.target, signer_E);
        const ssiNoCompliance = await ethers.getContractAt("SsiManagement", newTokenFixture.diamond.target);

        // Grant ATS_ROLES.ROLE_SSI_MANAGER to signer_A.address first, then add signer_E.address as an issuer
        const accessControlNoCompliance = await ethers.getContractAt("AccessControl", newTokenFixture.diamond.target);
        await accessControlNoCompliance.grantRole(ATS_ROLES.ROLE_SSI_MANAGER, signer_A.address);
        await ssiNoCompliance.addIssuer(signer_E.address);
        await kycNoCompliance.grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await kycNoCompliance.grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

        await newasset.mint(signer_E.address, AMOUNT);

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
            role: ATS_ROLES.ROLE_ISSUER,
            members: [signer_A.address],
          },
          { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        ]);
        // Deploy token without compliance contract (zero address)

        const kycNoCompliance = await ethers.getContractAt("Kyc", newTokenFixture.diamond.target, signer_B);
        const erc20NoCompliance = await ethers.getContractAt("Transfer", newTokenFixture.diamond.target, signer_E);
        const ssiNoCompliance = await ethers.getContractAt("SsiManagement", newTokenFixture.diamond.target);

        // Grant ATS_ROLES.ROLE_SSI_MANAGER to signer_A.address first, then add signer_E.address as an issuer
        const accessControlNoCompliance = await ethers.getContractAt("AccessControl", newTokenFixture.diamond.target);
        await accessControlNoCompliance.grantRole(ATS_ROLES.ROLE_SSI_MANAGER, signer_A.address);
        await ssiNoCompliance.addIssuer(signer_E.address);
        await kycNoCompliance.grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await kycNoCompliance.grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

        await newasset.mint(signer_E.address, AMOUNT);

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
      describe("batchForcedTransfer", () => {
        const transferAmount = AMOUNT / 2;

        beforeEach(async () => {
          await asset.mint(signer_F.address, transferAmount);
          await asset.mint(signer_D.address, transferAmount);
          await asset.grantRole(ATS_ROLES.ROLE_CONTROLLER, signer_A.address);
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

          // signer_B does not have ATS_ROLES.ROLE_CONTROLLER
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

        it("GIVEN a paused token WHEN batchForcedTransfer THEN transaction fails with IsPaused", async () => {
          await asset.pause();

          const fromList = [signer_F.address];
          const toList = [signer_E.address];
          const amounts = [transferAmount];

          await expect(
            asset.connect(signer_A).batchForcedTransfer(fromList, toList, amounts),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
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
    });

    describe("Paused", () => {
      beforeEach(async () => {
        await asset.pause();
      });
      it("GIVEN a paused token WHEN freezePartialTokens THEN transactions revert with IsPaused error", async () => {
        await expect(asset.freezePartialTokens(signer_A.address, 10)).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN a paused token WHEN unfreezePartialTokens THEN transactions revert with IsPaused error", async () => {
        await expect(asset.unfreezePartialTokens(signer_A.address, 10)).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
      });

      it("GIVEN a paused token WHEN setAddressFrozen THEN transactions revert with IsPaused error", async () => {
        await expect(asset.setAddressFrozen(signer_A.address, true)).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN a paused token WHEN attempting to update name or symbol THEN transactions revert with IsPaused error", async () => {
        await expect(asset.setName(newName)).to.be.revertedWithCustomError(asset, "IsPaused");
        await expect(asset.setSymbol(newSymbol)).to.be.revertedWithCustomError(asset, "IsPaused");
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
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ADJUSTMENT_BALANCE, signer_C.address);

        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CAP, signer_A.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROLLER, signer_A.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_B.address);

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
        await asset.grantRole(ATS_ROLES.ROLE_ADJUSTMENT_BALANCE, signer_A.address);
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
        await asset.grantRole(ATS_ROLES.ROLE_ADJUSTMENT_BALANCE, signer_A.address);
        await asset.grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_A.address);

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
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_CLEARING,
          members: [signer_B.address],
        },
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROLLER, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);
    });

    it("GIVEN an account with issuer role WHEN mint THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      // transfer with data fails
      await expect(
        asset.connect(signer_C).mint(signer_D.address, 2 * BALANCE_OF_C_ORIGINAL),
      ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
    });

    it("GIVEN an account with balance WHEN forcedTransfer THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      // transfer with data fails
      await expect(
        asset.connect(signer_A).forcedTransfer(signer_A.address, signer_D.address, 2 * BALANCE_OF_C_ORIGINAL),
      ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
    });

    describe("Freeze", () => {
      it("GIVEN an account with ATS_ROLES.ROLE_FREEZE_MANAGER WHEN freezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.freezePartialTokens(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN an account with ATS_ROLES.ROLE_FREEZE_MANAGER WHEN unfreezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.unfreezePartialTokens(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN an account with ATS_ROLES.ROLE_FREEZE_MANAGER WHEN unfreezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.unfreezePartialTokens(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(
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
          role: ATS_ROLES.ROLE_CONTROLLER,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_ISSUER,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_KYC,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_SSI_MANAGER,
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

    it("GIVEN token is controllable WHEN forcedTransfer THEN transaction fails with TokenIsNotControllable", async () => {
      await expect(asset.forcedTransfer(signer_E.address, signer_D.address, AMOUNT)).to.be.revertedWithCustomError(
        asset,
        "TokenIsNotControllable",
      );
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN setAddressFrozen THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).setAddressFrozen(ethers.ZeroAddress, true),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN freezePartialTokens THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).freezePartialTokens(ethers.ZeroAddress, 0),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN unfreezePartialTokens THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).unfreezePartialTokens(ethers.ZeroAddress, 0),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });
});
