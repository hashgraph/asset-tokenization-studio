// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { isinGenerator } from "@thomaschaplin/isin-generator";
import {
  type ResolverProxy,
  type ERC20Facet,
  type IERC1410,
  type Pause,
  type ControlList,
  type ERC1594,
  Kyc,
  SsiManagement,
  ClearingActionsFacet,
  IERC3643,
  AccessControlFacet,
} from "@contract-types";
import { ATS_ROLES, DEFAULT_PARTITION, EMPTY_STRING, ZERO } from "@scripts";
import { assertObject } from "../../../../../common";
import { deployEquityTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { SecurityType } from "@scripts/domain";

const amount = 1000;
// con erc20 y sin erc1410 funciona
// sin erc20 y con erc1410 funciona
// con erc20 y con erc1410 NO funciona
describe("ERC20 Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let erc20Facet: ERC20Facet;
  let erc20FacetBlackList: ERC20Facet;
  let pauseFacet: Pause;
  let controlListFacet: ControlList;
  let erc1594Facet: ERC1594;
  let kycFacet: Kyc;
  let ssiManagementFacet: SsiManagement;
  let clearingActionsFacet: ClearingActionsFacet;

  const name = "TEST_AccessControl";
  const symbol = "TAC";
  const decimals = 6;
  const isin = isinGenerator();
  const EMPTY_VC_ID = EMPTY_STRING;

  describe("Multi partition", () => {
    async function deploySecurityFixtureMultiPartition() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
            erc20MetadataInfo: { name, symbol, isin },
          },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;

      await executeRbac(base.accessControlFacet, [
        {
          role: ATS_ROLES._PAUSER_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._CONTROL_LIST_ROLE,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES._CLEARING_ROLE,
          members: [signer_A.address],
        },
      ]);

      erc20Facet = await ethers.getContractAt("ERC20Facet", diamond.target);
      erc20FacetBlackList = await ethers.getContractAt("ERC20Facet", diamond.target, signer_D);
      pauseFacet = await ethers.getContractAt("Pause", diamond.target, signer_B);
      controlListFacet = await ethers.getContractAt("ControlList", diamond.target, signer_A);
      clearingActionsFacet = await ethers.getContractAt("ClearingActionsFacet", diamond.target, signer_A);
    }
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);
    });

    it("GIVEN a initialized ERC20 WHEN initialize again THEN transaction fails with AlreadyInitialized", async () => {
      // initialize fails
      const info = {
        name: "TEST",
        symbol: "TST",
        isin: "ES1234567890",
        decimals: 6,
      };

      await expect(
        erc20Facet.initialize_ERC20({
          info: info,
          securityType: SecurityType.BOND_VARIABLE_RATE,
        }),
      ).to.be.revertedWithCustomError(erc20Facet, "AlreadyInitialized");
    });

    it("GIVEN a initialized ERC20 WHEN getERC20Metadata THEN obtain configured metadata", async () => {
      // initialize fails
      const erc20Metadata = await erc20Facet.getERC20Metadata();
      assertObject(erc20Metadata.info, {
        name: name,
        symbol: symbol,
        isin: isin,
        decimals: decimals,
      });
      expect(erc20Metadata.securityType).to.be.equal(SecurityType.EQUITY);
    });

    it("GIVEN a initialized ERC20 WHEN name, symbol, decimals THEN obtain configured metadata", async () => {
      // initialize fails
      const retrieved_name = await erc20Facet.name();
      const retrieved_symbol = await erc20Facet.symbol();
      const retrieved_decimals = await erc20Facet.decimals();

      expect(retrieved_name).to.equal(name);
      expect(retrieved_symbol).to.equal(symbol);
      expect(retrieved_decimals).to.equal(decimals);
    });

    it("GIVEN a initialized ERC20 WHEN running any state changing method THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      await expect(erc20Facet.connect(signer_A).approve(signer_D.address, amount)).to.be.rejectedWith(
        "NotAllowedInMultiPartitionMode",
      );

      await expect(erc20Facet.connect(signer_A).transfer(signer_D.address, amount)).to.be.rejectedWith(
        "NotAllowedInMultiPartitionMode",
      );

      await expect(
        erc20Facet.connect(signer_A).transferFrom(signer_C.address, signer_D.address, amount),
      ).to.be.rejectedWith("NotAllowedInMultiPartitionMode");

      await expect(erc20Facet.connect(signer_A).increaseAllowance(signer_C.address, amount)).to.be.rejectedWith(
        "NotAllowedInMultiPartitionMode",
      );

      await expect(erc20Facet.connect(signer_A).decreaseAllowance(signer_C.address, amount)).to.be.rejectedWith(
        "NotAllowedInMultiPartitionMode",
      );
    });
  });

  describe("Single partition", () => {
    let erc20SignerC: ERC20Facet;
    let erc20SignerE: ERC20Facet;
    let erc1410Facet: IERC1410;

    async function deploySecurityFixtureSinglePartition() {
      const base = await deployEquityTokenFixture();
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;

      await executeRbac(base.accessControlFacet, [
        {
          role: ATS_ROLES._ISSUER_ROLE,
          members: [signer_B.address],
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
          role: ATS_ROLES._PAUSER_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._CLEARING_ROLE,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES._CONTROL_LIST_ROLE,
          members: [signer_A.address],
        },
      ]);

      erc20Facet = await ethers.getContractAt("ERC20Facet", diamond.target);
      erc20FacetBlackList = await ethers.getContractAt("ERC20Facet", diamond.target, signer_D);
      erc20SignerC = await ethers.getContractAt("ERC20Facet", diamond.target, signer_C);
      erc20SignerE = await ethers.getContractAt("ERC20Facet", diamond.target, signer_D);
      erc1410Facet = await ethers.getContractAt("IERC1410", diamond.target);
      erc1594Facet = await ethers.getContractAt("ERC1594", diamond.target, signer_B);
      kycFacet = await ethers.getContractAt("Kyc", diamond.target, signer_B);
      ssiManagementFacet = await ethers.getContractAt("SsiManagement", diamond.target, signer_A);
      pauseFacet = await ethers.getContractAt("Pause", diamond.target, signer_B);

      clearingActionsFacet = await ethers.getContractAt("ClearingActionsFacet", diamond.target, signer_A);
      controlListFacet = await ethers.getContractAt("ControlList", diamond.target, signer_A);
      await ssiManagementFacet.addIssuer(signer_D.address);
      await kycFacet.grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_D.address);
      await kycFacet.grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_D.address);
      await erc1594Facet.issue(signer_C.address, amount, "0x");
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    describe("Approval", () => {
      it(
        "GIVEN a account with balance " + "WHEN approve to a zero account " + "THEN fails with SpenderWithZeroAddress",
        async () => {
          await expect(erc20SignerC.approve(ethers.ZeroAddress, amount / 2)).to.revertedWithCustomError(
            erc20Facet,
            "SpenderWithZeroAddress",
          );
        },
      );

      it(
        "GIVEN a account with balance " +
          "WHEN increaseAllowance to a zero account " +
          "THEN fails with SpenderWithZeroAddress",
        async () => {
          await expect(erc20SignerC.increaseAllowance(ethers.ZeroAddress, amount / 2)).to.revertedWithCustomError(
            erc20Facet,
            "SpenderWithZeroAddress",
          );
        },
      );

      it(
        "GIVEN a account with balance " +
          "WHEN decreaseAllowance to a zero account " +
          "THEN fails with SpenderWithZeroAddress",
        async () => {
          await expect(erc20SignerC.decreaseAllowance(ethers.ZeroAddress, amount / 2)).to.revertedWithCustomError(
            erc20Facet,
            "SpenderWithZeroAddress",
          );
        },
      );

      it(
        "GIVEN a account without balance " +
          "WHEN decreaseAllowance to a valid account " +
          "THEN fails with InsufficientAllowance",
        async () => {
          await expect(erc20SignerE.decreaseAllowance(signer_B.address, amount / 2))
            .to.revertedWithCustomError(erc20Facet, "InsufficientAllowance")
            .withArgs(signer_B.address, signer_D.address);
        },
      );

      it(
        "GIVEN a account with balance " +
          "WHEN approve to another whitelisted account " +
          "THEN emits Approval event and allowance is updated",
        async () => {
          expect(await erc20SignerC.approve(signer_D.address, amount / 2))
            .to.emit(erc20SignerC, "Approval")
            .withArgs(signer_C.address, signer_D.address, amount / 2);
          expect(await erc20SignerC.allowance(signer_C.address, signer_D.address)).to.be.equal(amount / 2);
        },
      );

      it(
        "GIVEN a account with balance " +
          "WHEN increaseAllowance to another whitelisted account " +
          "THEN emits Approval event and allowance is updated",
        async () => {
          expect(await erc20SignerC.increaseAllowance(signer_D.address, amount / 2))
            .to.emit(erc20SignerC, "Approval")
            .withArgs(signer_C.address, signer_D.address, amount / 2);
          expect(await erc20SignerC.allowance(signer_C.address, signer_D.address)).to.be.equal(amount / 2);
        },
      );

      it(
        "GIVEN a account with balance " +
          "WHEN decreaseAllowance to another whitelisted account " +
          "THEN emits Approval event and allowance is updated",
        async () => {
          await erc20SignerC.increaseAllowance(signer_D.address, amount);
          expect(await erc20SignerC.decreaseAllowance(signer_D.address, amount / 2))
            .to.emit(erc20SignerC, "Approval")
            .withArgs(signer_C.address, signer_D.address, amount / 2);
          expect(await erc20SignerC.allowance(signer_C.address, signer_D.address)).to.be.equal(amount / 2);
        },
      );
    });

    describe("transfer", () => {
      it("GIVEN a non kyc account THEN transfer fails with InvalidKycStatus", async () => {
        await kycFacet.revokeKyc(signer_D.address);
        await expect(erc20SignerC.transfer(signer_D.address, amount / 2)).to.revertedWithCustomError(
          kycFacet,
          "InvalidKycStatus",
        );

        await kycFacet.grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_D.address);

        await kycFacet.revokeKyc(signer_C.address);
        await expect(erc20SignerC.transfer(signer_D.address, amount / 2)).to.revertedWithCustomError(
          kycFacet,
          "InvalidKycStatus",
        );
      });
      it(
        "GIVEN an account with balance " +
          "WHEN transfer to another whitelisted account " +
          "THEN emits Transfer event and balances are updated",
        async () => {
          expect(await erc20SignerC.transfer(signer_D.address, amount / 2))
            .to.emit(erc20SignerC, "Transfer")
            .withArgs(signer_C.address, signer_D.address, amount);
          expect(await erc1410Facet.balanceOf(signer_C.address)).to.be.equal(amount / 2);
          expect(await erc1410Facet.balanceOf(signer_D.address)).to.be.equal(amount / 2);
          expect(await erc1410Facet.totalSupply()).to.be.equal(amount);
          expect(await erc1410Facet.balanceOfByPartition(DEFAULT_PARTITION, signer_C.address)).to.be.equal(amount / 2);
          expect(await erc1410Facet.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.be.equal(amount / 2);
          expect(await erc1410Facet.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(amount);
        },
      );
    });

    describe("transferFrom", () => {
      beforeEach(async () => {
        await erc20SignerC.approve(signer_D.address, amount);
      });

      it("GIVEN a non kyc account THEN transferFrom fails with InvalidKycStatus", async () => {
        await kycFacet.revokeKyc(signer_C.address);
        // non kyc'd sender
        await expect(
          erc20Facet.connect(signer_A).transferFrom(signer_D.address, signer_C.address, amount / 2),
        ).to.revertedWithCustomError(kycFacet, "InvalidKycStatus");

        // non kyc'd receiver
        await expect(
          erc20Facet.connect(signer_A).transferFrom(signer_C.address, signer_D.address, amount / 2),
        ).to.revertedWithCustomError(kycFacet, "InvalidKycStatus");
      });

      it(
        "GIVEN an account with allowance " +
          "WHEN transferFrom to another whitelisted account " +
          "THEN emits Transfer event and balances are updated",
        async () => {
          expect(await erc20SignerE.transferFrom(signer_C.address, signer_D.address, amount / 2))
            .to.emit(erc20SignerC, "Transfer")
            .withArgs(signer_C.address, signer_D.address, amount);
          expect(await erc1410Facet.balanceOf(signer_C.address)).to.be.equal(amount / 2);
          expect(await erc1410Facet.balanceOf(signer_D.address)).to.be.equal(amount / 2);
          expect(await erc1410Facet.totalSupply()).to.be.equal(amount);
          expect(await erc1410Facet.balanceOfByPartition(DEFAULT_PARTITION, signer_C.address)).to.be.equal(amount / 2);
          expect(await erc1410Facet.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.be.equal(amount / 2);
          expect(await erc1410Facet.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(amount);
        },
      );
    });

    describe("Wallet Recovery Tests", () => {
      let erc3643Facet: IERC3643;
      let accessControlFacet: AccessControlFacet;
      const ADDRESS_ZERO = ethers.ZeroAddress;

      beforeEach(async () => {
        erc3643Facet = await ethers.getContractAt("IERC3643", diamond.target);
        accessControlFacet = await ethers.getContractAt("AccessControlFacet", diamond.target);
      });

      it("GIVEN non-recovered wallets WHEN approve THEN transaction succeeds", async () => {
        // Verify both sender and spender are not recovered
        const senderRecovered = await erc3643Facet.isAddressRecovered(signer_C.address);
        const spenderRecovered = await erc3643Facet.isAddressRecovered(signer_D.address);
        expect(senderRecovered).to.be.false;
        expect(spenderRecovered).to.be.false;

        // Approve should succeed
        await expect(erc20SignerC.approve(signer_D.address, amount / 2))
          .to.emit(erc20SignerC, "Approval")
          .withArgs(signer_C.address, signer_D.address, amount / 2);
      });

      it("GIVEN a recovered sender WHEN approve THEN transaction fails with WalletRecovered", async () => {
        // Grant AGENT_ROLE to perform recovery
        await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);

        // Recover signer_C's address (no need to redeem - recovery only checks locks/holds/clears)
        await erc3643Facet.recoveryAddress(signer_C.address, signer_A.address, ADDRESS_ZERO);
        // Verify recovery was successful
        expect(await erc3643Facet.isAddressRecovered(signer_C.address)).to.be.true;

        // Approve should fail because sender (signer_C) is recovered
        await expect(erc20SignerC.approve(signer_D.address, amount / 2)).to.be.revertedWithCustomError(
          erc20SignerC,
          "WalletRecovered",
        );
      });

      it("GIVEN a recovered spender WHEN approve THEN transaction fails with WalletRecovered", async () => {
        // Grant AGENT_ROLE to perform recovery
        await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);

        // First ensure signer_C is NOT recovered
        const senderRecovered = await erc3643Facet.isAddressRecovered(signer_C.address);
        expect(senderRecovered).to.be.false;

        // Recover signer_D's address (no need to issue/redeem - recovery only checks locks/holds/clears)
        await erc3643Facet.recoveryAddress(signer_D.address, signer_A.address, ADDRESS_ZERO);

        // Verify recovery was successful
        expect(await erc3643Facet.isAddressRecovered(signer_D.address)).to.be.true;

        // Approve should fail because spender (signer_D) is recovered
        // This should hit the SECOND onlyUnrecoveredAddress modifier (line 26 in ERC20.sol)
        await expect(erc20SignerC.approve(signer_D.address, amount / 2)).to.be.revertedWithCustomError(
          erc20SignerC,
          "WalletRecovered",
        );
      });
    });

    describe("Protected Partitions Role Tests", () => {
      let protectedPartitionsFacet: any;
      let accessControlFacet: any;

      beforeEach(async () => {
        protectedPartitionsFacet = await ethers.getContractAt("ProtectedPartitions", diamond.target);
        accessControlFacet = await ethers.getContractAt("AccessControl", diamond.target);
      });

      it("GIVEN protected partitions activated WHEN transfer without role THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        // Enable protected partitions
        await accessControlFacet.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
        await protectedPartitionsFacet.protectPartitions();

        // Try transfer without partition-specific role
        await expect(erc20SignerC.transfer(signer_D.address, amount / 2)).to.be.revertedWithCustomError(
          erc20Facet,
          "PartitionsAreProtectedAndNoRole",
        );
      });

      it("GIVEN protected partitions activated WHEN transferFrom without role THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        // Enable protected partitions
        await accessControlFacet.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
        await protectedPartitionsFacet.protectPartitions();

        // Approve first
        await erc20SignerC.approve(signer_D.address, amount);

        // Try transferFrom without partition-specific role
        await expect(
          erc20SignerE.transferFrom(signer_C.address, signer_D.address, amount / 2),
        ).to.be.revertedWithCustomError(erc20Facet, "PartitionsAreProtectedAndNoRole");
      });
    });

    describe("decimalsAt", () => {
      it("GIVEN an ERC20 token WHEN calling decimalsAt THEN returns correct decimals", async () => {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const decimalsValue = await erc20Facet.decimalsAt(currentTimestamp);
        expect(decimalsValue).to.equal(6); // Configured decimals in fixture
      });
    });

    it("GIVEN a paused ERC20 WHEN running any state changing method THEN transaction fails with TokenIsPaused", async () => {
      await pauseFacet.pause();

      await expect(erc20Facet.approve(signer_D.address, amount)).to.be.rejectedWith("TokenIsPaused");

      await expect(erc20Facet.transfer(signer_D.address, amount)).to.be.rejectedWith("TokenIsPaused");

      await expect(erc20Facet.transferFrom(signer_C.address, signer_D.address, amount)).to.be.rejectedWith(
        "TokenIsPaused",
      );

      await expect(erc20Facet.increaseAllowance(signer_C.address, amount)).to.be.rejectedWith("TokenIsPaused");

      await expect(erc20Facet.decreaseAllowance(signer_C.address, amount)).to.be.rejectedWith("TokenIsPaused");
    });

    it("GIVEN an ERC20 with clearing active WHEN transfer THEN transaction fails with ClearingIsActivated", async () => {
      await clearingActionsFacet.activateClearing();
      const clearingInterface = await ethers.getContractAt("IClearing", diamond.target);
      await expect(erc20Facet.transfer(signer_D.address, amount)).to.be.revertedWithCustomError(
        clearingInterface,
        "ClearingIsActivated",
      );

      await expect(erc20Facet.transferFrom(signer_C.address, signer_D.address, amount)).to.be.revertedWithCustomError(
        clearingInterface,
        "ClearingIsActivated",
      );
    });

    it("GIVEN a initializer ERC20 WHEN try to use a non authorized account THEN transaction fails with AccountIsBlocked", async () => {
      await controlListFacet.addToControlList(signer_D.address);
      await expect(erc20FacetBlackList.approve(signer_A.address, amount)).to.be.rejectedWith("AccountIsBlocked");
      await expect(erc20Facet.approve(signer_D.address, amount)).to.be.rejectedWith("AccountIsBlocked");
      await expect(erc20FacetBlackList.transfer(signer_A.address, amount)).to.be.rejectedWith("AccountIsBlocked");
      await expect(erc20Facet.transfer(signer_D.address, amount)).to.be.rejectedWith("AccountIsBlocked");
      await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_D.address);
      await kycFacet.grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_D.address);

      await expect(erc20FacetBlackList.transferFrom(signer_A.address, signer_B.address, amount)).to.be.rejectedWith(
        "AccountIsBlocked",
      );
      await expect(erc20Facet.transferFrom(signer_D.address, signer_C.address, amount)).to.be.rejectedWith(
        "AccountIsBlocked",
      );
      await expect(erc20Facet.transferFrom(signer_C.address, signer_D.address, amount)).to.be.rejectedWith(
        "AccountIsBlocked",
      );
      await expect(erc20FacetBlackList.increaseAllowance(signer_A.address, amount)).to.be.rejectedWith(
        "AccountIsBlocked",
      );
      await expect(erc20Facet.increaseAllowance(signer_D.address, amount)).to.be.rejectedWith("AccountIsBlocked");
      await expect(erc20FacetBlackList.decreaseAllowance(signer_A.address, amount)).to.be.rejectedWith(
        "AccountIsBlocked",
      );
      await expect(erc20Facet.decreaseAllowance(signer_D.address, amount)).to.be.rejectedWith("AccountIsBlocked");
    });
  });
});
