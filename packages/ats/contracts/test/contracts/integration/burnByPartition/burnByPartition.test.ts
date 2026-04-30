// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers, network } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, type ResolverProxy } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { ATS_ROLES, DEFAULT_PARTITION, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO } from "@scripts";

const AMOUNT = 1000;
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;
const WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const CUSTOM_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";

// Compute partition-specific role for protected redemptions
const PARTITION_SPECIFIC_ROLE = ethers.keccak256(
  ethers.solidityPacked(["bytes32", "bytes32"], [ATS_ROLES.PROTECTED_PARTITIONS_PARTICIPANT_ROLE, DEFAULT_PARTITION]),
);

describe("BurnByPartitionFacet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;
  let asset: IAsset;

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

      await executeRbac(asset, [
        { role: ATS_ROLES.ISSUER_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES.PAUSER_ROLE, members: [signer_C.address] },
        { role: ATS_ROLES.PROTECTED_PARTITIONS_ROLE, members: [signer_E.address] },
        { role: PARTITION_SPECIFIC_ROLE, members: [signer_E.address] },
        { role: ATS_ROLES.WILD_CARD_ROLE, members: [signer_E.address] },
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

    it("GIVEN a paused token WHEN redeemByPartition THEN reverts with TokenIsPaused", async () => {
      await asset.connect(signer_C).pause();

      await expect(
        asset.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
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

        await expect(
          asset
            .connect(signer_E)
            .protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_E.address, AMOUNT, protectionData),
        )
          .to.emit(asset, "Transfer")
          .withArgs(signer_E.address, ethers.ZeroAddress, AMOUNT);
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
        { role: ATS_ROLES.ISSUER_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
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
});
