// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock, MockERC1410StorageWrapper } from "@contract-types";
import { DEFAULT_PARTITION, ATS_ROLES, EMPTY_HEX_BYTES, RESOLVER_KEYS } from "@lib";
import { executeRbac, grantKycToHolders, MAX_UINT256 } from "@test";
import type { AssetMockCtx } from "@test";

export function securityHoldersTests(getCtx: () => AssetMockCtx): void {
  describe("SecurityHoldersFacet Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      signer_D = ctx.user3;
      unknownSigner = ctx.unknownSigner;

      asset = ctx.asset;

      await executeRbac(asset, [
        {
          role: ATS_ROLES.ROLE_KYC,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_ISSUER,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_SSI_MANAGER,
          members: [signer_A.address],
        },
      ]);

      // Grant KYC to all signers
      await asset.connect(signer_A).addIssuer(signer_A.address);
      await grantKycToHolders(asset, signer_A, [signer_B, signer_C, signer_D]);
    });

    describe("getSecurityHolders", () => {
      it("GIVEN no security holders WHEN getSecurityHolders page 0 THEN returns empty array", async () => {
        const holders = await asset.getSecurityHolders(0, 10);
        expect(holders.length).to.equal(0);
      });

      it("GIVEN one security holder WHEN getSecurityHolders page 0 THEN returns that holder", async () => {
        const tokenAmount = 1000n;
        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: tokenAmount,
          data: "0x",
        });

        const holders = await asset.getSecurityHolders(0, 10);
        expect(holders.length).to.equal(1);
        expect(holders[0]).to.equal(signer_B.address);
      });

      it("GIVEN three security holders WHEN getSecurityHolders page 0 with pageLength 2 THEN returns first two holders", async () => {
        const tokenAmount = 1000n;
        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: tokenAmount,
          data: "0x",
        });

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: tokenAmount,
          data: "0x",
        });

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_D.address,
          value: tokenAmount,
          data: "0x",
        });

        const holders = await asset.getSecurityHolders(0, 2);
        expect(holders.length).to.equal(2);
      });

      it("GIVEN three security holders WHEN getSecurityHolders page 1 with pageLength 2 THEN returns third holder", async () => {
        const tokenAmount = 1000n;
        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: tokenAmount,
          data: "0x",
        });

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: tokenAmount,
          data: "0x",
        });

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_D.address,
          value: tokenAmount,
          data: "0x",
        });

        const holders = await asset.getSecurityHolders(1, 2);
        expect(holders.length).to.equal(1);
        expect(holders[0]).to.equal(signer_D.address);
      });

      it("GIVEN security holders WHEN getSecurityHolders out-of-range page THEN returns empty array", async () => {
        const tokenAmount = 1000n;
        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: tokenAmount,
          data: "0x",
        });

        const holders = await asset.getSecurityHolders(100, 10);
        expect(holders.length).to.equal(0);
      });

      it("GIVEN security holders WHEN getSecurityHolders with pageLength 0 THEN returns empty array", async () => {
        const tokenAmount = 1000n;
        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: tokenAmount,
          data: "0x",
        });

        const holders = await asset.getSecurityHolders(0, 0);
        expect(holders.length).to.equal(0);
      });
    });

    describe("getTotalSecurityHolders", () => {
      it("GIVEN no security holders WHEN getTotalSecurityHolders THEN returns zero", async () => {
        const total = await asset.getTotalSecurityHolders();
        expect(total).to.equal(0);
      });

      it("GIVEN one security holder WHEN getTotalSecurityHolders THEN returns one", async () => {
        const tokenAmount = 1000n;
        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: tokenAmount,
          data: "0x",
        });

        const total = await asset.getTotalSecurityHolders();
        expect(total).to.equal(1);
      });

      it("GIVEN three security holders WHEN getTotalSecurityHolders THEN returns three", async () => {
        const tokenAmount = 1000n;
        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: tokenAmount,
          data: "0x",
        });

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: tokenAmount,
          data: "0x",
        });

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_D.address,
          value: tokenAmount,
          data: "0x",
        });

        const total = await asset.getTotalSecurityHolders();
        expect(total).to.equal(3);
      });

      it("GIVEN multiple issuances to same holder WHEN getTotalSecurityHolders THEN counts holder only once", async () => {
        const tokenAmount = 1000n;
        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: tokenAmount,
          data: "0x",
        });

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: tokenAmount,
          data: "0x",
        });

        const total = await asset.getTotalSecurityHolders();
        expect(total).to.equal(1);
      });

      it("GIVEN security holders WHEN getTotalSecurityHolders multiple times THEN returns consistent result", async () => {
        const tokenAmount = 1000n;
        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: tokenAmount,
          data: "0x",
        });

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: tokenAmount,
          data: "0x",
        });

        const total1 = await asset.getTotalSecurityHolders();
        const total2 = await asset.getTotalSecurityHolders();
        expect(total1).to.equal(total2);
        expect(total1).to.equal(2);
      });
    });

    describe("getSecurityHolders and getTotalSecurityHolders integration", () => {
      it("GIVEN N security holders WHEN getSecurityHolders with large pageLength THEN returns all N holders", async () => {
        const tokenAmount = 1000n;
        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: tokenAmount,
          data: "0x",
        });

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: tokenAmount,
          data: "0x",
        });

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_D.address,
          value: tokenAmount,
          data: "0x",
        });

        const total = await asset.getTotalSecurityHolders();
        const holders = await asset.getSecurityHolders(0, 1000);

        expect(holders.length).to.equal(Number(total));
      });

      it("GIVEN N security holders with pagination WHEN iterating through pages THEN all holders are returned exactly once", async () => {
        const tokenAmount = 1000n;
        const pageLength = 2;

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: tokenAmount,
          data: "0x",
        });

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: tokenAmount,
          data: "0x",
        });

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_D.address,
          value: tokenAmount,
          data: "0x",
        });

        const total = await asset.getTotalSecurityHolders();
        const allHolders: string[] = [];

        // Iterate through pages
        for (let page = 0; page < Math.ceil(Number(total) / pageLength); page++) {
          const pageHolders = await asset.getSecurityHolders(page, pageLength);
          allHolders.push(...pageHolders);
        }

        expect(allHolders.length).to.equal(Number(total));
        // Check for duplicates
        const uniqueHolders = new Set(allHolders);
        expect(uniqueHolders.size).to.equal(allHolders.length);
      });
    });

    describe("self-transfer holder registry integrity", () => {
      it("GIVEN a holder with full balance WHEN self-transfer of full balance THEN holder remains in registry", async () => {
        const tokenAmount = 1000n;

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: tokenAmount,
          data: "0x",
        });

        expect(await asset.getTotalSecurityHolders()).to.equal(1);

        await asset.connect(signer_B).transfer(signer_B.address, tokenAmount);

        expect(await asset.getTotalSecurityHolders()).to.equal(1);
        const holders = await asset.getSecurityHolders(0, 10);
        expect(holders).to.include(signer_B.address);
        expect(await asset.balanceOf(signer_B.address)).to.equal(tokenAmount);
      });

      it("GIVEN a holder with full balance WHEN partial self-transfer THEN holder remains in registry", async () => {
        const tokenAmount = 1000n;

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: tokenAmount,
          data: "0x",
        });

        await asset.connect(signer_B).transfer(signer_B.address, tokenAmount / 2n);

        expect(await asset.getTotalSecurityHolders()).to.equal(1);
        const holders = await asset.getSecurityHolders(0, 10);
        expect(holders).to.include(signer_B.address);
        expect(await asset.balanceOf(signer_B.address)).to.equal(tokenAmount);
      });
    });

    describe("holder registry integrity with encumbered tokens (FIND-120)", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_LOCKER, signer_A.address);
      });

      it("GIVEN a holder with locked tokens WHEN burning all free tokens via redeemByPartition THEN holder remains in registry", async () => {
        const totalAmount = 1000n;
        const lockedAmount = 900n;
        const freeAmount = totalAmount - lockedAmount;

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: totalAmount,
          data: "0x",
        });

        await asset.connect(signer_A).lock(lockedAmount, signer_B.address, MAX_UINT256);

        expect(await asset.getTotalSecurityHolders()).to.equal(1);

        await asset.connect(signer_B).redeemByPartition(DEFAULT_PARTITION, freeAmount, EMPTY_HEX_BYTES);

        expect(await asset.getTotalSecurityHolders()).to.equal(1);
        const holders = await asset.getSecurityHolders(0, 10);
        expect(holders).to.include(signer_B.address);
      });

      it("GIVEN a holder with locked tokens WHEN transferring all free tokens THEN holder remains in registry", async () => {
        const totalAmount = 1000n;
        const lockedAmount = 900n;
        const freeAmount = totalAmount - lockedAmount;

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: totalAmount,
          data: "0x",
        });

        await asset.connect(signer_A).lock(lockedAmount, signer_B.address, MAX_UINT256);

        expect(await asset.getTotalSecurityHolders()).to.equal(1);

        await asset.connect(signer_B).transfer(signer_C.address, freeAmount);

        expect(await asset.getTotalSecurityHolders()).to.equal(2);
        const holders = await asset.getSecurityHolders(0, 10);
        expect(holders).to.include(signer_B.address);
        expect(holders).to.include(signer_C.address);
      });
    });

    describe("replaceTokenHolder existence guard (audit fix)", () => {
      let mock: MockERC1410StorageWrapper;

      beforeEach(async () => {
        const factory = await ethers.getContractFactory("MockERC1410StorageWrapper");
        mock = (await factory.deploy()) as unknown as MockERC1410StorageWrapper;
        await mock.waitForDeployment();
      });

      it("GIVEN oldTokenHolder is not registered (index == 0) WHEN replaceTokenHolder THEN reverts with TokenHolderNotFound", async () => {
        await expect(mock.exposed_replaceTokenHolder(signer_B.address, signer_C.address))
          .to.be.revertedWithCustomError(mock, "TokenHolderNotFound")
          .withArgs(signer_C.address);
      });

      it("GIVEN oldTokenHolder was registered and then removed (index reset to 0) WHEN replaceTokenHolder THEN reverts with TokenHolderNotFound", async () => {
        await mock.exposed_addNewTokenHolder(signer_B.address);
        await mock.exposed_addNewTokenHolder(signer_C.address);
        await mock.exposed_removeTokenHolder(signer_B.address);

        expect(await mock.exposed_getTokenHolderIndex(signer_B.address)).to.equal(0);

        await expect(mock.exposed_replaceTokenHolder(signer_D.address, signer_B.address))
          .to.be.revertedWithCustomError(mock, "TokenHolderNotFound")
          .withArgs(signer_B.address);
      });

      it("GIVEN a registered oldTokenHolder WHEN replaceTokenHolder THEN registry is updated and slot 0 is never corrupted", async () => {
        await mock.exposed_addNewTokenHolder(signer_B.address);
        const indexBefore = await mock.exposed_getTokenHolderIndex(signer_B.address);

        await mock.exposed_replaceTokenHolder(signer_C.address, signer_B.address);

        expect(await mock.exposed_getTokenHolderIndex(signer_B.address)).to.equal(0);
        expect(await mock.exposed_getTokenHolderIndex(signer_C.address)).to.equal(indexBefore);
        expect(await mock.exposed_getTokenHolder(Number(indexBefore))).to.equal(signer_C.address);
        expect(await mock.exposed_getTokenHolder(0)).to.equal(ethers.ZeroAddress);
      });
    });

    describe("initializeSecurityHolders", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeSecurityHolders THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeSecurityHolders())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeSecurityHolders THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeSecurityHolders())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.securityHolders, 1);
      });
    });

    describe("initializeSecurityHolders event", () => {
      it("GIVEN fresh facet WHEN initializeSecurityHolders THEN emits SecurityHoldersInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.securityHolders);
        await expect(asset.initializeSecurityHolders()).to.emit(asset, "SecurityHoldersInitialized");
      });
    });

    describe("removeTokenHolder storage cleanup (audit fix FIND-123)", () => {
      it("GIVEN two holders WHEN first holder transfers all tokens out THEN tokenHolders[lastIndex] storage slot is zeroed", async () => {
        const tokenAmount = 1000n;

        // Issue to two holders: signer_B at index 1, signer_C at index 2 (lastIndex)
        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: tokenAmount,
          data: "0x",
        });
        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: tokenAmount,
          data: "0x",
        });

        expect(await asset.getTotalSecurityHolders()).to.equal(2);

        // Transfer all of signer_B's tokens to signer_C → removeTokenHolder(signer_B) is triggered.
        // Swap-and-pop moves signer_C (lastIndex=2) into slot 1.
        // Without the fix, tokenHolders[2] retains signer_C's address as a ghost.
        await asset.connect(signer_B).transfer(signer_C.address, tokenAmount);

        expect(await asset.getTotalSecurityHolders()).to.equal(1);

        // Compute storage slot for tokenHolders[2].
        // ERC1410BasicStorage struct layout from _ERC1410_BASIC_STORAGE_POSITION:
        //   +0 DEPRECATED_totalSupply, +1 totalSupplyByPartition, +2 DEPRECATED_balances,
        //   +3 partitions, +4 partitionToIndex, +5 multiPartition+initialized (packed),
        //   +6 tokenHolderIndex, +7 tokenHolders  ← mapping base slot
        const ERC1410_BASE = BigInt("0x67661db80d37d3b9810c430f78991b4b5377bdebd3b71f39bdf3427092c1822a");
        const tokenHoldersMappingBaseSlot = ERC1410_BASE + 7n;
        const lastIndex = 2n;
        const ghostSlot = ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [lastIndex, tokenHoldersMappingBaseSlot]),
        );

        const slotValue = await ethers.provider.getStorage(asset.target, ghostSlot);
        expect(slotValue).to.equal(ethers.ZeroHash);
      });
    });

    describe("removeTokenHolder unregistered holder guard", () => {
      let mock: MockERC1410StorageWrapper;

      beforeEach(async () => {
        const factory = await ethers.getContractFactory("MockERC1410StorageWrapper");
        mock = (await factory.deploy()) as unknown as MockERC1410StorageWrapper;
        await mock.waitForDeployment();
      });

      it("GIVEN an unregistered address WHEN removeTokenHolder is called THEN reverts with UnexpectedError", async () => {
        await expect(mock.exposed_removeTokenHolder(signer_B.address))
          .to.be.revertedWithCustomError(mock, "UnexpectedError")
          .withArgs("0x0000000c");
      });

      it("GIVEN a registered holder WHEN removeTokenHolder is called THEN succeeds and holder count decrements", async () => {
        await mock.exposed_addNewTokenHolder(signer_B.address);

        expect(await mock.exposed_getTotalTokenHolders()).to.equal(1);

        await mock.exposed_removeTokenHolder(signer_B.address);

        expect(await mock.exposed_getTotalTokenHolders()).to.equal(0);
        expect(await mock.exposed_getTokenHolderIndex(signer_B.address)).to.equal(0);
      });
    });
  });
}
