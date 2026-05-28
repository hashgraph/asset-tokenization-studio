// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, type ResolverProxy, ComplianceMock, IdentityRegistryMock, MockDiamondCut } from "@contract-types";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  ATS_ROLES,
  EIP1066_CODES,
  EMPTY_HEX_BYTES,
  EMPTY_STRING,
  ZERO,
  dateToUnixTimestamp,
  RESOLVER_KEY_COMPLIANCE,
} from "@scripts";
import { getSelector } from "@scripts/infrastructure";

const AMOUNT = 1000;
const DATA = "0x1234";
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("Compliance Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;
  let signer_F: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  enum ClearingOperationType {
    Transfer,
    Redeem,
    HoldCreation,
  }

  describe("Multi partition mode", () => {
    async function deploySecurityFixtureMultiPartition() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
            internalKycActivated: true,
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
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_CLEARING,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_KYC,
          members: [signer_B.address],
        },
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);
    });

    describe("NotAllowedInMultiPartitionMode", () => {
      it("GIVEN an initialized token WHEN canTransfer THEN fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(
          asset.connect(signer_C).canTransfer(signer_D.address, 2 * AMOUNT, DATA),
        ).to.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
      });

      it("GIVEN an initialized token WHEN canTransferFrom THEN fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(
          asset.connect(signer_C).canTransferFrom(signer_B.address, signer_D.address, 2 * AMOUNT, DATA),
        ).to.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
      });
    });
  });

  describe("Single partition mode", () => {
    async function deploySecurityFixtureSinglePartition() {
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
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
      await asset.connect(signer_A).addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    describe("Paused", () => {
      beforeEach(async () => {
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.issue(signer_C.address, AMOUNT, DATA);
        await asset.issue(signer_E.address, AMOUNT, DATA);
        await asset.connect(signer_E).increaseAllowance(signer_C.address, AMOUNT);
        await asset.connect(signer_B).pause();
      });

      it("GIVEN a paused Token WHEN canTransfer or canTransferFrom THEN returns paused status", async () => {
        expect(await asset.connect(signer_C).canTransfer(signer_D.address, AMOUNT, DATA)).to.be.deep.equal([
          false,
          EIP1066_CODES.PAUSED,
          getSelector(asset, "IsPaused"),
        ]);

        expect(
          await asset.connect(signer_C).canTransferFrom(signer_E.address, signer_D.address, AMOUNT, DATA),
        ).to.be.deep.equal([false, EIP1066_CODES.PAUSED, getSelector(asset, "IsPaused")]);
      });
    });

    it(
      "GIVEN blocked accounts (sender, to, from) " +
        "WHEN canTransfer or canTransferFrom " +
        "THEN transaction returns _OPERATOR_BLOCKED_ERROR_ID, " +
        "_FROM_BLOCKED_ERROR_ID or _TO_BLOCKED_ERROR_ID",
      async () => {
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.issue(signer_C.address, AMOUNT, DATA);
        await asset.connect(signer_C).increaseAllowance(signer_A.address, AMOUNT);
        await asset.connect(signer_E).increaseAllowance(signer_C.address, AMOUNT);
        // Blacklisting accounts
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROL_LIST, signer_A.address);
        await asset.connect(signer_A).addToControlList(signer_C.address);

        expect(await asset.connect(signer_C).canTransfer(signer_D.address, AMOUNT, DATA)).to.be.deep.equal([
          false,
          EIP1066_CODES.DISALLOWED_OR_STOP,
          getSelector(asset, "AccountIsBlocked"),
        ]);
        await asset.issue(signer_D.address, AMOUNT, DATA);
        expect(await asset.connect(signer_D).canTransfer(signer_C.address, AMOUNT, DATA)).to.be.deep.equal([
          false,
          EIP1066_CODES.DISALLOWED_OR_STOP,
          getSelector(asset, "AccountIsBlocked"),
        ]);

        await asset.issue(signer_E.address, AMOUNT, DATA);
        expect(
          await asset.connect(signer_C).canTransferFrom(signer_E.address, signer_D.address, AMOUNT, DATA),
        ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(asset, "AccountIsBlocked")]);

        expect(
          await asset.connect(signer_A).canTransferFrom(signer_C.address, signer_D.address, AMOUNT, DATA),
        ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(asset, "AccountIsBlocked")]);
        await asset.connect(signer_E).increaseAllowance(signer_A.address, AMOUNT);
        expect(
          await asset.connect(signer_A).canTransferFrom(signer_E.address, signer_C.address, AMOUNT, DATA),
        ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(asset, "AccountIsBlocked")]);
      },
    );

    describe("Kyc", () => {
      it(
        "GIVEN non kyc accounts (to, from) " +
          "WHEN canTransfer or canTransferFrom " +
          "THEN transaction returns _FROM_KYC_ERROR_ID or _TO_KYC_ERROR_ID",
        async () => {
          await asset.issue(signer_E.address, AMOUNT, DATA);
          await asset.connect(signer_E).increaseAllowance(signer_B.address, AMOUNT);
          await asset.connect(signer_B).revokeKyc(signer_E.address);
          // non kyc'd sender
          expect(await asset.connect(signer_E).canTransfer(signer_D.address, AMOUNT, DATA)).to.be.deep.equal([
            false,
            EIP1066_CODES.DISALLOWED_OR_STOP,
            getSelector(asset, "InvalidKycStatus"),
          ]);
          expect(
            await asset.connect(signer_B).canTransferFrom(signer_E.address, signer_A.address, AMOUNT, DATA),
          ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(asset, "InvalidKycStatus")]);
          // non kyc'd receiver
          await asset.issue(signer_D.address, AMOUNT, DATA);
          expect(await asset.connect(signer_D).canTransfer(signer_E.address, AMOUNT, DATA)).to.be.deep.equal([
            false,
            EIP1066_CODES.DISALLOWED_OR_STOP,
            getSelector(asset, "InvalidKycStatus"),
          ]);
          await asset.connect(signer_D).increaseAllowance(signer_A.address, AMOUNT);
          expect(
            await asset.connect(signer_A).canTransferFrom(signer_D.address, signer_E.address, AMOUNT, DATA),
          ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(asset, "InvalidKycStatus")]);
        },
      );
    });

    it("GIVEN a zero address in to WHEN canTransfer and canTransferFrom THEN responds ZeroAddressNotAllowed", async () => {
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.issue(signer_A.address, AMOUNT, DATA);
      expect(await asset.canTransfer(ethers.ZeroAddress, AMOUNT, DATA)).to.be.deep.equal([
        false,
        EIP1066_CODES.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
        getSelector(asset, "ZeroAddressNotAllowed"),
      ]);
      await asset.issue(signer_D.address, AMOUNT, DATA);
      await asset.connect(signer_D).increaseAllowance(signer_A.address, AMOUNT);
      expect(await asset.canTransferFrom(signer_D.address, ethers.ZeroAddress, AMOUNT, DATA)).to.be.deep.equal([
        false,
        EIP1066_CODES.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
        getSelector(asset, "ZeroAddressNotAllowed"),
      ]);
    });

    it("GIVEN a non allowed WHEN canTransferFrom THEN responds InvalidKycStatus", async () => {
      expect(await asset.canTransferFrom(signer_B.address, signer_D.address, AMOUNT, DATA)).to.be.deep.equal([
        false,
        EIP1066_CODES.DISALLOWED_OR_STOP,
        getSelector(asset, "InvalidKycStatus"),
      ]);
    });

    it("GIVEN a non funds account WHEN canTransfer & canTransferFrom THEN responds with insufficient funds or KYC error", async () => {
      expect(await asset.canTransfer(signer_D.address, AMOUNT, DATA)).to.be.deep.equal([
        false,
        EIP1066_CODES.DISALLOWED_OR_STOP,
        getSelector(asset, "InvalidKycStatus"),
      ]);

      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_C).approve(signer_A.address, AMOUNT);
      expect(await asset.canTransferFrom(signer_C.address, signer_D.address, AMOUNT, DATA)).to.be.deep.equal([
        false,
        EIP1066_CODES.INSUFFICIENT_FUNDS,
        getSelector(asset, "InvalidPartition"),
      ]);
    });

    it("GIVEN an account with balance WHEN canTransfer THEN returns success", async () => {
      await asset.connect(signer_C).issue(signer_E.address, AMOUNT, DATA);

      expect(await asset.connect(signer_E).canTransfer(signer_D.address, AMOUNT / 2, DATA)).to.be.deep.equal([
        true,
        EIP1066_CODES.SUCCESS,
        ethers.ZeroHash,
      ]);
    });

    it("GIVEN an account with balance and allowance WHEN canTransferFrom THEN returns success", async () => {
      await asset.connect(signer_C).issue(signer_E.address, AMOUNT, DATA);
      await asset.connect(signer_E).approve(signer_D.address, AMOUNT / 2);

      expect(
        await asset.connect(signer_D).canTransferFrom(signer_E.address, signer_D.address, AMOUNT / 2, DATA),
      ).to.be.deep.equal([true, EIP1066_CODES.SUCCESS, ethers.ZeroHash]);
    });
  });

  describe("setCompliance / compliance", () => {
    let complianceMock: ComplianceMock;
    let identityRegistryMock: IdentityRegistryMock;

    async function deploySecurityFixtureWithCompliance() {
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

      asset = await ethers.getContractAt("IAsset", diamond.target);
      mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);

      await executeRbac(asset, [
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_TREX_OWNER,
          members: [signer_A.address],
        },
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_PAUSER, signer_A.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureWithCompliance);
    });

    it("GIVEN an initialized token WHEN updating the compliance THEN setCompliance emits ComplianceAdded with updated compliance", async () => {
      const retrieved_compliance = await asset.compliance();
      expect(retrieved_compliance).to.equal(complianceMock.target as string);

      const newComplianceMock = await (await ethers.getContractFactory("ComplianceMock", signer_A)).deploy(true, false);
      await newComplianceMock.waitForDeployment();

      expect(await asset.setCompliance(newComplianceMock.target as string))
        .to.emit(asset, "ComplianceAdded")
        .withArgs(newComplianceMock);

      const retrieved_newCompliance = await asset.compliance();
      expect(retrieved_newCompliance).to.equal(newComplianceMock.target as string);
    });

    it("GIVEN an account without TREX_OWNER role WHEN setCompliance THEN transaction fails with AccountHasNoRole", async () => {
      await expect(
        asset.connect(signer_C).setCompliance(complianceMock.target as string),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN a paused token WHEN setCompliance THEN transaction fails with IsPaused", async () => {
      await asset.connect(signer_B).pause();
      await expect(asset.setCompliance(complianceMock.target as string)).to.be.revertedWithCustomError(
        asset,
        "IsPaused",
      );
    });
  });

  describe("Compliance notifications (multi partition)", () => {
    const NON_DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
    let complianceMock: ComplianceMock;
    let identityRegistryMock: IdentityRegistryMock;

    async function deploySecurityFixtureMultiPartitionWithCompliance() {
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
            isMultiPartition: true,
            compliance: complianceMock.target as string,
            identityRegistry: identityRegistryMock.target as string,
            maxSupply: MAX_SUPPLY,
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
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_C.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CLEARING, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_CLEARING_VALIDATOR, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_AGENT, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_TREX_OWNER, members: [signer_A.address] },
      ]);

      await asset.grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
      await asset.addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_F.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartitionWithCompliance);
    });

    it("GIVEN an issue on a non-default partition THEN created is called on the compliance contract", async () => {
      await asset.issueByPartition({
        partition: NON_DEFAULT_PARTITION,
        tokenHolder: signer_E.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      expect(await complianceMock.createdHit()).to.be.equal(1);
    });

    it("GIVEN a transferByPartition on a non-default partition THEN transferred is called on the compliance contract", async () => {
      await asset.issueByPartition({
        partition: NON_DEFAULT_PARTITION,
        tokenHolder: signer_E.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await asset
        .connect(signer_E)
        .transferByPartition(NON_DEFAULT_PARTITION, { to: signer_D.address, value: AMOUNT / 2 }, EMPTY_HEX_BYTES);

      expect(await complianceMock.transferredHit()).to.be.equal(1);
    });

    it("GIVEN a redeemByPartition on a non-default partition THEN destroyed is called on the compliance contract", async () => {
      await asset.issueByPartition({
        partition: NON_DEFAULT_PARTITION,
        tokenHolder: signer_E.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(signer_E).redeemByPartition(NON_DEFAULT_PARTITION, AMOUNT / 2, EMPTY_HEX_BYTES);

      expect(await complianceMock.destroyedHit()).to.be.equal(1);
    });

    it("GIVEN an executeHoldByPartition on a non-default partition THEN transferred is called on the compliance contract", async () => {
      await asset.issueByPartition({
        partition: NON_DEFAULT_PARTITION,
        tokenHolder: signer_D.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      const hold = {
        amount: AMOUNT,
        expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:03Z"),
        escrow: signer_E.address,
        to: signer_E.address,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_D).createHoldByPartition(NON_DEFAULT_PARTITION, hold);

      await asset
        .connect(signer_E)
        .executeHoldByPartition(
          { partition: NON_DEFAULT_PARTITION, tokenHolder: signer_D.address, holdId: 1 },
          signer_E.address,
          AMOUNT,
        );

      expect(await complianceMock.transferredHit()).to.be.equal(1);
    });

    it("GIVEN a clearing transfer approved on a non-default partition THEN transferred is called on the compliance contract", async () => {
      await asset.issueByPartition({
        partition: NON_DEFAULT_PARTITION,
        tokenHolder: signer_D.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(signer_B).activateClearing();

      const clearingOperation = {
        partition: NON_DEFAULT_PARTITION,
        expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:03Z"),
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_D).clearingTransferByPartition(clearingOperation, AMOUNT, signer_E.address);

      await asset.approveClearingOperationByPartition({
        partition: NON_DEFAULT_PARTITION,
        tokenHolder: signer_D.address,
        clearingId: 1,
        clearingOperationType: ClearingOperationType.Transfer,
      });

      expect(await complianceMock.transferredHit()).to.be.equal(1);
    });

    it("GIVEN a clearing redeem approved on a non-default partition THEN destroyed is called on the compliance contract", async () => {
      await asset.issueByPartition({
        partition: NON_DEFAULT_PARTITION,
        tokenHolder: signer_D.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(signer_B).activateClearing();

      const clearingOperation = {
        partition: NON_DEFAULT_PARTITION,
        expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:03Z"),
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_D).clearingRedeemByPartition(clearingOperation, AMOUNT);

      await asset.approveClearingOperationByPartition({
        partition: NON_DEFAULT_PARTITION,
        tokenHolder: signer_D.address,
        clearingId: 1,
        clearingOperationType: ClearingOperationType.Redeem,
      });

      expect(await complianceMock.destroyedHit()).to.be.equal(1);
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN setCompliance THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).setCompliance(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });

  describe("Compliance notifications when compliance is address(0)", () => {
    const NON_DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";

    async function deploySecurityFixtureMultiPartitionWithoutCompliance() {
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
      signer_C = base.user2;
      signer_D = base.user3;
      signer_E = base.user4;

      asset = await ethers.getContractAt("IAsset", diamond.target);
      mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CLEARING, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_CLEARING_VALIDATOR, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_AGENT, members: [signer_A.address] },
      ]);

      await asset.grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
      await asset.addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartitionWithoutCompliance);
    });

    it("GIVEN compliance set to address(0) THEN the compliance getter returns the zero address", async () => {
      expect(await asset.compliance()).to.equal(ethers.ZeroAddress);
    });

    it("GIVEN compliance set to address(0) WHEN issueByPartition on a non-default partition THEN the call does not revert", async () => {
      await expect(
        asset.issueByPartition({
          partition: NON_DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
        }),
      ).to.not.be.reverted;
    });

    it("GIVEN compliance set to address(0) WHEN transferByPartition on a non-default partition THEN the call does not revert", async () => {
      await asset.issueByPartition({
        partition: NON_DEFAULT_PARTITION,
        tokenHolder: signer_E.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await expect(
        asset
          .connect(signer_E)
          .transferByPartition(NON_DEFAULT_PARTITION, { to: signer_D.address, value: AMOUNT / 2 }, EMPTY_HEX_BYTES),
      ).to.not.be.reverted;
    });

    it("GIVEN compliance set to address(0) WHEN redeemByPartition on a non-default partition THEN the call does not revert", async () => {
      await asset.issueByPartition({
        partition: NON_DEFAULT_PARTITION,
        tokenHolder: signer_E.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await expect(asset.connect(signer_E).redeemByPartition(NON_DEFAULT_PARTITION, AMOUNT / 2, EMPTY_HEX_BYTES)).to.not
        .be.reverted;
    });

    it("GIVEN compliance set to address(0) WHEN executeHoldByPartition on a non-default partition THEN the call does not revert", async () => {
      await asset.issueByPartition({
        partition: NON_DEFAULT_PARTITION,
        tokenHolder: signer_D.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      const hold = {
        amount: AMOUNT,
        expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:03Z"),
        escrow: signer_E.address,
        to: signer_E.address,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_D).createHoldByPartition(NON_DEFAULT_PARTITION, hold);

      await expect(
        asset
          .connect(signer_E)
          .executeHoldByPartition(
            { partition: NON_DEFAULT_PARTITION, tokenHolder: signer_D.address, holdId: 1 },
            signer_E.address,
            AMOUNT,
          ),
      ).to.not.be.reverted;
    });

    it("GIVEN compliance set to address(0) WHEN a clearing transfer is approved on a non-default partition THEN the call does not revert", async () => {
      await asset.issueByPartition({
        partition: NON_DEFAULT_PARTITION,
        tokenHolder: signer_D.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(signer_B).activateClearing();

      const clearingOperation = {
        partition: NON_DEFAULT_PARTITION,
        expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:03Z"),
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_D).clearingTransferByPartition(clearingOperation, AMOUNT, signer_E.address);

      await expect(
        asset.approveClearingOperationByPartition({
          partition: NON_DEFAULT_PARTITION,
          tokenHolder: signer_D.address,
          clearingId: 1,
          clearingOperationType: ClearingOperationType.Transfer,
        }),
      ).to.not.be.reverted;
    });

    it("GIVEN compliance set to address(0) WHEN a clearing redeem is approved on a non-default partition THEN the call does not revert", async () => {
      await asset.issueByPartition({
        partition: NON_DEFAULT_PARTITION,
        tokenHolder: signer_D.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(signer_B).activateClearing();

      const clearingOperation = {
        partition: NON_DEFAULT_PARTITION,
        expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:03Z"),
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_D).clearingRedeemByPartition(clearingOperation, AMOUNT);

      await expect(
        asset.approveClearingOperationByPartition({
          partition: NON_DEFAULT_PARTITION,
          tokenHolder: signer_D.address,
          clearingId: 1,
          clearingOperationType: ClearingOperationType.Redeem,
        }),
      ).to.not.be.reverted;
    });
  });
  describe("initializeCompliance", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeCompliance is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_D).initializeCompliance())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_D.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeCompliance is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeCompliance())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(RESOLVER_KEY_COMPLIANCE, 1);
    });
  });

  describe("initializeCompliance event", () => {
    it("GIVEN a fresh deployment WHEN initializeCompliance is called THEN emits ComplianceInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(RESOLVER_KEY_COMPLIANCE);
      await expect(asset.initializeCompliance()).to.emit(asset, "ComplianceInitialized");
    });
  });

  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational asset WHEN setCompliance THEN reverts with AssetNotOperational", async () => {
      await expect(asset.setCompliance("0x0000000000000000000000000000000000000001")).to.be.revertedWithCustomError(
        asset,
        "AssetNotOperational",
      );
    });
  });
});
