// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers, network } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type IAsset, type ResolverProxy, MockDiamondCut } from "@contract-types";
import {
  ATS_ROLES,
  DEFAULT_PARTITION,
  EMPTY_HEX_BYTES,
  EMPTY_STRING,
  ZERO,
  EQUITY_CONFIG_ID,
  BURN_BY_PARTITION_RESOLVER_KEY,
} from "@scripts";
import { deployEquityTokenFixture, EVENT_NAMES, executeRbac, expectExactlyOneEvent, MAX_UINT256 } from "@test";

const AMOUNT = 1000;
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;
const WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const CUSTOM_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const CUSTOM_PARTITION_2 = "0x0000000000000000000000000000000000000000000000000000000000004321";
const CUSTOM_PARTITION_3 = "0x0000000000000000000000000000000000000000000000000000000000054321";

// Compute partition-specific role for protected redemptions
const PARTITION_SPECIFIC_ROLE = ethers.keccak256(
  ethers.solidityPacked(["bytes32", "bytes32"], [ATS_ROLES.ROLE_PROTECTED_PARTITIONS_PARTICIPANT, DEFAULT_PARTITION]),
);

describe("BurnByPartitionFacet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
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
            arePartitionsProtected: true,
          },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_E = base.user4;
      asset = await ethers.getContractAt("IAsset", diamond.target);
      mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_C.address] },
        { role: ATS_ROLES.ROLE_PROTECTED_PARTITIONS, members: [signer_E.address] },
        { role: PARTITION_SPECIFIC_ROLE, members: [signer_E.address] },
        { role: ATS_ROLES.ROLE_WILD_CARD, members: [signer_E.address] },
      ]);

      await asset.addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_E.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });
    }

    beforeEach(async () => {
      await loadFixture(deploySinglePartitionFixture);
    });

    it("GIVEN a token holder with balance WHEN redeemByPartition THEN emits RedeemedByPartition and updates balances", async () => {
      const initialSupply = await asset.totalSupplyByPartition(DEFAULT_PARTITION);
      const initialBalance = await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address);

      await expect(asset.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT, EMPTY_HEX_BYTES))
        .to.emit(asset, "RedeemedByPartition")
        .withArgs(DEFAULT_PARTITION, ethers.ZeroAddress, signer_E.address, AMOUNT, EMPTY_HEX_BYTES, "0x");

      expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.equal(
        initialBalance - BigInt(AMOUNT),
      );
      expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(initialSupply - BigInt(AMOUNT));
    });

    it("GIVEN single-partition mode WHEN redeemByPartition with wrong partition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
      await expect(asset.connect(signer_E).redeemByPartition(WRONG_PARTITION, AMOUNT, EMPTY_HEX_BYTES))
        .to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode")
        .withArgs(WRONG_PARTITION);
    });

    it("GIVEN a paused token WHEN redeemByPartition THEN reverts with IsPaused", async () => {
      await asset.connect(signer_C).pause();

      await expect(
        asset.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "IsPaused");
    });

    it("GIVEN insufficient balance WHEN redeemByPartition THEN reverts", async () => {
      await expect(asset.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT + 1, EMPTY_HEX_BYTES)).to.be
        .reverted;
    });

    it("GIVEN a token holder with balance WHEN redeemByPartition partial amount THEN updates balances correctly", async () => {
      const redeemAmount = AMOUNT / 2;

      await expect(asset.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, redeemAmount, EMPTY_HEX_BYTES))
        .to.emit(asset, "RedeemedByPartition")
        .withArgs(DEFAULT_PARTITION, ethers.ZeroAddress, signer_E.address, redeemAmount, EMPTY_HEX_BYTES, "0x");

      expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.equal(AMOUNT - redeemAmount);
      expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(AMOUNT - redeemAmount);
    });

    describe("bug Transfer", () => {
      it("GIVEN a token holder WHEN redeemByPartition THEN Transfer event is emitted from holder to address(0)", async () => {
        await expect(asset.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT, EMPTY_HEX_BYTES))
          .to.emit(asset, "Transfer")
          .withArgs(signer_E.address, ethers.ZeroAddress, AMOUNT);
      });

      it("GIVEN a token holder WHEN protectedRedeemFromByPartition THEN Transfer event is emitted from holder to address(0)", async () => {
        const domain = {
          name: (await asset.getERC20Metadata()).info.name,
          version: (await asset.getConfigInfo()).version_.toString(),
          chainId: await network.provider.send("eth_chainId"),
          verifyingContract: diamond.target as string,
        };

        const redeemType = {
          protectedRedeemFromByPartition: [
            { name: "_partition", type: "bytes32" },
            { name: "_from", type: "address" },
            { name: "_amount", type: "uint256" },
            { name: "_deadline", type: "uint256" },
            { name: "_nonce", type: "uint256" },
          ],
        };

        const protectionData = {
          deadline: MAX_UINT256,
          nonce: 1,
          signature: "0x",
        };

        const message = {
          _partition: DEFAULT_PARTITION,
          _from: signer_E.address,
          _amount: AMOUNT,
          _deadline: protectionData.deadline,
          _nonce: protectionData.nonce,
        };

        const signature = await signer_E.signTypedData(domain, redeemType, message);
        protectionData.signature = signature;

        const protectedRedeemTx = asset
          .connect(signer_E)
          .protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_E.address, AMOUNT, protectionData);
        await expect(protectedRedeemTx)
          .to.emit(asset, "Transfer")
          .withArgs(signer_E.address, ethers.ZeroAddress, AMOUNT);
        await expect(protectedRedeemTx)
          .to.emit(asset, EVENT_NAMES.PROTECTED_REDEEMED_BY_PARTITION)
          .withArgs(signer_E.address, signer_E.address, AMOUNT, DEFAULT_PARTITION, [
            protectionData.deadline,
            protectionData.nonce,
            protectionData.signature,
          ]);
        const receipt = await (await protectedRedeemTx).wait();
        expectExactlyOneEvent(receipt!, asset, EVENT_NAMES.PROTECTED_REDEEMED_BY_PARTITION);
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

    it("GIVEN multi-partition mode WHEN redeemByPartition from default partition THEN succeeds and updates balances", async () => {
      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_E.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await expect(asset.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT, EMPTY_HEX_BYTES))
        .to.emit(asset, "RedeemedByPartition")
        .withArgs(DEFAULT_PARTITION, ethers.ZeroAddress, signer_E.address, AMOUNT, EMPTY_HEX_BYTES, "0x");

      expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.equal(0);
      expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(0);
    });

    it("GIVEN multi-partition mode WHEN redeemByPartition from non-default partition THEN succeeds and updates balances", async () => {
      await asset.issueByPartition({
        partition: CUSTOM_PARTITION,
        tokenHolder: signer_E.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await expect(asset.connect(signer_E).redeemByPartition(CUSTOM_PARTITION, AMOUNT, EMPTY_HEX_BYTES))
        .to.emit(asset, "RedeemedByPartition")
        .withArgs(CUSTOM_PARTITION, ethers.ZeroAddress, signer_E.address, AMOUNT, EMPTY_HEX_BYTES, "0x");

      expect(await asset.balanceOfByPartition(CUSTOM_PARTITION, signer_E.address)).to.equal(0);
      expect(await asset.totalSupplyByPartition(CUSTOM_PARTITION)).to.equal(0);
    });

    it("GIVEN multi-partition mode WHEN redeemByPartition from non-default partition THEN succeeds and labafs updated correctly", async () => {
      const ABAF_1 = 2;
      const ABAF_2 = 3;
      const ABAF_3 = 4;

      const tokenHolder = signer_E.address;

      await asset.grantRole(ATS_ROLES.ROLE_ADJUSTMENT_BALANCE, signer_A.address);

      await asset.issueByPartition({
        partition: CUSTOM_PARTITION,
        tokenHolder: tokenHolder,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await asset.adjustBalances(ABAF_1, 0);

      await asset.issueByPartition({
        partition: CUSTOM_PARTITION_2,
        tokenHolder: tokenHolder,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await asset.adjustBalances(ABAF_2, 0);

      await asset.issueByPartition({
        partition: CUSTOM_PARTITION_3,
        tokenHolder: tokenHolder,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await asset.adjustBalances(ABAF_3, 0);

      const totalBalanceByPartition_1 = await asset.getTotalBalanceForByPartition(CUSTOM_PARTITION, tokenHolder);
      const totalBalanceByPartition_2 = await asset.getTotalBalanceForByPartition(CUSTOM_PARTITION_2, tokenHolder);
      const totalBalanceByPartition_3 = await asset.getTotalBalanceForByPartition(CUSTOM_PARTITION_3, tokenHolder);
      const ListOfPartitions_Before = await asset.partitionsOf(tokenHolder);

      await asset.connect(signer_E).redeemByPartition(CUSTOM_PARTITION_2, totalBalanceByPartition_2, EMPTY_HEX_BYTES);

      const totalBalanceByPartition_1_after = await asset.getTotalBalanceForByPartition(CUSTOM_PARTITION, tokenHolder);
      const totalBalanceByPartition_2_after = await asset.getTotalBalanceForByPartition(
        CUSTOM_PARTITION_2,
        tokenHolder,
      );
      const totalBalanceByPartition_3_after = await asset.getTotalBalanceForByPartition(
        CUSTOM_PARTITION_3,
        tokenHolder,
      );
      const ListOfPartitions_After = await asset.partitionsOf(tokenHolder);

      expect(totalBalanceByPartition_1_after).to.equal(totalBalanceByPartition_1);
      expect(totalBalanceByPartition_2_after).to.equal(0);
      expect(totalBalanceByPartition_3_after).to.equal(totalBalanceByPartition_3);
      expect(ListOfPartitions_Before).to.deep.equal([CUSTOM_PARTITION, CUSTOM_PARTITION_2, CUSTOM_PARTITION_3]);
      expect(ListOfPartitions_After).to.deep.equal([CUSTOM_PARTITION, CUSTOM_PARTITION_3]);
    });

    describe("bug Transfer", () => {
      it("GIVEN an authorized operator WHEN operatorRedeemByPartition THEN Transfer event is emitted from holder to address(0)", async () => {
        await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(signer_B).authorizeOperator(signer_E.address);
        await expect(
          asset
            .connect(signer_E)
            .operatorRedeemByPartition(DEFAULT_PARTITION, signer_B.address, AMOUNT, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES),
        )
          .to.emit(asset, "Transfer")
          .withArgs(signer_B.address, ethers.ZeroAddress, AMOUNT);
      });
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN redeemByPartition THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).redeemByPartition(ethers.ZeroHash, 0, "0x"),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });
  describe("initializeBurnByPartition", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeBurnByPartition is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeBurnByPartition())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeBurnByPartition is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeBurnByPartition())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(BURN_BY_PARTITION_RESOLVER_KEY, 1);
    });
  });

  describe("initializeBurnByPartition event", () => {
    it("GIVEN a fresh deployment WHEN initializeBurnByPartition is called THEN emits BurnByPartitionInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(BURN_BY_PARTITION_RESOLVER_KEY);
      await expect(asset.initializeBurnByPartition()).to.emit(asset, "BurnByPartitionInitialized");
    });
  });

  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational WHEN redeemByPartition is called THEN AssetNotOperational", async () => {
      await expect(asset.redeemByPartition(ethers.ZeroHash, 0n, "0x"))
        .to.be.revertedWithCustomError(asset, "AssetNotOperational")
        .withArgs(EQUITY_CONFIG_ID, 1);
    });
  });
});
