// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, type ResolverProxy, MockDiamondCut } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import {
  ATS_ROLES,
  DEFAULT_PARTITION,
  EMPTY_HEX_BYTES,
  EMPTY_STRING,
  ZERO,
  EQUITY_CONFIG_ID,
  MINT_BY_PARTITION_RESOLVER_KEY,
} from "@scripts";

const AMOUNT = 1000;
const DATA = "0x1234";
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;
const WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const CUSTOM_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const PARTITION_CAP = 500;

describe("MintByPartitionFacet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;
  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  describe("Single partition mode", () => {
    async function deploySinglePartitionFixture() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            internalKycActivated: true,
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
      asset = await ethers.getContractAt("IAsset", diamond.target);
      mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_C.address] },
      ]);

      await asset.addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySinglePartitionFixture);
    });

    it("GIVEN an issuer WHEN issueByPartition THEN emits IssuedByPartition and updates balances", async () => {
      await expect(
        asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
        }),
      )
        .to.emit(asset, "IssuedByPartition")
        .withArgs(DEFAULT_PARTITION, signer_A.address, signer_E.address, AMOUNT, EMPTY_HEX_BYTES);

      expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.equal(AMOUNT);
      expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(AMOUNT);
    });

    it("GIVEN a caller without issuer or agent role WHEN issueByPartition THEN reverts with AccountHasNoRoles", async () => {
      await expect(
        asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
        }),
      )
        .to.be.revertedWithCustomError(asset, "AccountHasNoRoles")
        .withArgs(signer_B.address, [ATS_ROLES.ROLE_ISSUER, ATS_ROLES.ROLE_AGENT]);
    });

    it("GIVEN a paused token WHEN issueByPartition THEN reverts with IsPaused", async () => {
      await asset.connect(signer_C).pause();

      await expect(
        asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
        }),
      ).to.be.revertedWithCustomError(asset, "IsPaused");
    });

    it("GIVEN single-partition mode WHEN issueByPartition with wrong partition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
      await expect(
        asset.issueByPartition({
          partition: WRONG_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
        }),
      )
        .to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode")
        .withArgs(WRONG_PARTITION);
    });

    it("GIVEN a caller with agent role WHEN issueByPartition THEN emits IssuedByPartition and updates balances", async () => {
      await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_B.address);

      await expect(
        asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
        }),
      )
        .to.emit(asset, "IssuedByPartition")
        .withArgs(DEFAULT_PARTITION, signer_B.address, signer_E.address, AMOUNT, EMPTY_HEX_BYTES);

      expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.equal(AMOUNT);
    });

    it("GIVEN a recovered caller WHEN issueByPartition THEN reverts with WalletRecovered", async () => {
      await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_C.address);
      await asset.connect(signer_C).recoveryAddress(signer_A.address, signer_E.address, ethers.ZeroAddress);

      await expect(
        asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
        }),
      ).to.be.revertedWithCustomError(asset, "WalletRecovered");
    });

    it("GIVEN amount exceeds global max supply WHEN issueByPartition THEN reverts with MaxSupplyReached", async () => {
      await expect(
        asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: MAX_SUPPLY + 1,
          data: EMPTY_HEX_BYTES,
        }),
      ).to.be.revertedWithCustomError(asset, "MaxSupplyReached");
    });

    it("GIVEN a token holder without KYC WHEN issueByPartition THEN reverts with InvalidKycStatus", async () => {
      await asset.connect(signer_B).revokeKyc(signer_E.address);

      await expect(
        asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
        }),
      ).to.be.revertedWithCustomError(asset, "InvalidKycStatus");
    });

    it("GIVEN a recovered token holder WHEN issueByPartition THEN reverts with WalletRecovered", async () => {
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_C.address);
      await asset.connect(signer_C).recoveryAddress(signer_E.address, signer_D.address, ethers.ZeroAddress);

      await expect(
        asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
        }),
      ).to.be.revertedWithCustomError(asset, "WalletRecovered");
    });

    it("GIVEN a tokenHolder who already holds a partition WHEN issueByPartition again THEN increases existing balance", async () => {
      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_E.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await expect(
        asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
        }),
      )
        .to.emit(asset, "IssuedByPartition")
        .withArgs(DEFAULT_PARTITION, signer_A.address, signer_E.address, AMOUNT, EMPTY_HEX_BYTES);

      expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.equal(AMOUNT * 2);
      expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(AMOUNT * 2);
    });

    describe("bug Transfer", () => {
      it("GIVEN an issuer WHEN issueByPartition THEN Transfer event is emitted from address(0) to receiver", async () => {
        await expect(
          asset.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_E.address,
            value: AMOUNT,
            data: EMPTY_HEX_BYTES,
          }),
        )
          .to.emit(asset, "Transfer")
          .withArgs(ethers.ZeroAddress, signer_E.address, AMOUNT);
      });
    });
  });

  describe("Multi partition mode", () => {
    async function deployMultiPartitionFixture() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
            internalKycActivated: true,
            maxSupply: MAX_SUPPLY,
          },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_E = base.user4;
      asset = await ethers.getContractAt("IAsset", diamond.target);

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
      ]);

      await asset.addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    }

    beforeEach(async () => {
      await loadFixture(deployMultiPartitionFixture);
    });

    it("GIVEN multi-partition mode WHEN issueByPartition to default partition THEN succeeds and updates balances", async () => {
      await expect(
        asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
        }),
      )
        .to.emit(asset, "IssuedByPartition")
        .withArgs(DEFAULT_PARTITION, signer_A.address, signer_E.address, AMOUNT, EMPTY_HEX_BYTES);

      expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.equal(AMOUNT);
      expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(AMOUNT);
    });

    it("GIVEN multi-partition mode WHEN issueByPartition to non-default partition THEN succeeds and updates balances", async () => {
      await expect(
        asset.issueByPartition({
          partition: CUSTOM_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
        }),
      )
        .to.emit(asset, "IssuedByPartition")
        .withArgs(CUSTOM_PARTITION, signer_A.address, signer_E.address, AMOUNT, EMPTY_HEX_BYTES);

      expect(await asset.balanceOfByPartition(CUSTOM_PARTITION, signer_E.address)).to.equal(AMOUNT);
      expect(await asset.totalSupplyByPartition(CUSTOM_PARTITION)).to.equal(AMOUNT);
    });

    it("GIVEN per-partition max supply is set WHEN issueByPartition exceeds partition cap THEN reverts with MaxSupplyReachedForPartition", async () => {
      await asset.grantRole(ATS_ROLES.ROLE_CAP, signer_A.address);
      await asset.setMaxSupplyByPartition(CUSTOM_PARTITION, PARTITION_CAP);

      await expect(
        asset.issueByPartition({
          partition: CUSTOM_PARTITION,
          tokenHolder: signer_E.address,
          value: PARTITION_CAP + 1,
          data: EMPTY_HEX_BYTES,
        }),
      ).to.be.revertedWithCustomError(asset, "MaxSupplyReachedForPartition");
    });

    it("GIVEN an issuer WHEN issueByPartition with max supply after balance adjustment THEN succeeds", async () => {
      const balanceAdjustmentData = {
        executionDate: 5000n,
        factor: 3,
        decimals: 0,
      };

      await asset.changeSystemTimestamp(100n);
      await asset.grantRole(ATS_ROLES.ROLE_CAP, signer_A.address);
      await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);

      await asset.setMaxSupplyByPartition(CUSTOM_PARTITION, AMOUNT);
      await asset.issueByPartition({
        partition: CUSTOM_PARTITION,
        tokenHolder: signer_E.address,
        value: AMOUNT,
        data: DATA,
      });
      await asset.setScheduledBalanceAdjustment(balanceAdjustmentData);

      await asset.changeSystemTimestamp(balanceAdjustmentData.executionDate + 1n);

      await expect(
        asset.issueByPartition({
          partition: CUSTOM_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: DATA,
        }),
      )
        .to.be.revertedWithCustomError(asset, "MaxSupplyReachedForPartition")
        .withArgs(CUSTOM_PARTITION, balanceAdjustmentData.factor * AMOUNT);
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN issueByPartition THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset
          .connect(base.deployer)
          .issueByPartition({ partition: ethers.ZeroHash, tokenHolder: ethers.ZeroAddress, value: 0, data: "0x" }),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN issue THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).issue(ethers.ZeroAddress, 0, "0x"),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });

  describe("initializeMintByPartition", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeMintByPartition is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_D).initializeMintByPartition())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_D.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeMintByPartition is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeMintByPartition())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(MINT_BY_PARTITION_RESOLVER_KEY, 1);
    });
  });

  describe("initializeMintByPartition event", () => {
    it("GIVEN a fresh deployment WHEN initializeMintByPartition is called THEN emits MintByPartitionInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(MINT_BY_PARTITION_RESOLVER_KEY);
      await expect(asset.initializeMintByPartition()).to.emit(asset, "MintByPartitionInitialized");
    });
  });

  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeMintByPartition is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeMintByPartition())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeMintByPartition is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeMintByPartition())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(MINT_BY_PARTITION_RESOLVER_KEY, 1);
    });
  });

  describe("initializeMintByPartition event", () => {
    it("GIVEN a fresh deployment WHEN initializeMintByPartition is called THEN emits MintByPartitionInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(MINT_BY_PARTITION_RESOLVER_KEY);
      await expect(asset.initializeMintByPartition()).to.emit(asset, "MintByPartitionInitialized");
    });
  });

  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational WHEN issueByPartition is called THEN AssetNotOperational", async () => {
      await expect(
        asset.issueByPartition({
          partition: ethers.ZeroHash,
          tokenHolder: ethers.ZeroAddress,
          value: 0n,
          data: "0x",
          operatorData: "0x",
        }),
      )
        .to.be.revertedWithCustomError(asset, "AssetNotOperational")
        .withArgs(EQUITY_CONFIG_ID, 1);
    });
  });
});
