// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type IAsset, type ResolverProxy } from "@contract-types";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { ADDRESS_ZERO, ATS_ROLES, EIP1066_CODES, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO } from "@scripts";
import { getSelector } from "@scripts/infrastructure";

const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const AMOUNT = 1000;
const DATA = "0x1234";
const OPERATOR_DATA = "0x5678";
const EMPTY_VC_ID = EMPTY_STRING;

describe("ComplianceByPartition Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;

  let asset: IAsset;

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

    await executeRbac(asset, [
      { role: ATS_ROLES.PAUSER_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.ISSUER_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.CONTROL_LIST_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.CLEARING_ROLE, members: [signer_A.address] },
    ]);

    await asset.connect(signer_A).addIssuer(signer_E.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

    await asset.connect(signer_A).issueByPartition({
      partition: _PARTITION_ID_1,
      tokenHolder: signer_C.address,
      value: 4 * AMOUNT,
      data: DATA,
    });
    await asset.connect(signer_A).issueByPartition({
      partition: _PARTITION_ID_1,
      tokenHolder: signer_E.address,
      value: 4 * AMOUNT,
      data: DATA,
    });
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureMultiPartition);
  });

  describe("canTransferByPartition", () => {
    it("GIVEN a paused token WHEN canTransferByPartition THEN returns PAUSED with IsPaused selector", async () => {
      await asset.connect(signer_B).pause();

      expect(
        await asset
          .connect(signer_C)
          .canTransferByPartition(signer_C.address, signer_D.address, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([false, EIP1066_CODES.PAUSED, getSelector(asset, "IsPaused")]);
    });

    it("GIVEN clearing is active WHEN canTransferByPartition THEN returns UNAVAILABLE with ClearingIsActivated selector", async () => {
      await asset.connect(signer_A).activateClearing();

      expect(
        await asset
          .connect(signer_C)
          .canTransferByPartition(signer_C.address, signer_D.address, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([false, EIP1066_CODES.UNAVAILABLE, getSelector(asset, "ClearingIsActivated")]);
    });

    it("GIVEN a zero address as `from` WHEN canTransferByPartition THEN returns NOT_FOUND with ZeroAddressNotAllowed selector", async () => {
      expect(
        await asset.canTransferByPartition(
          ADDRESS_ZERO,
          signer_D.address,
          _PARTITION_ID_1,
          AMOUNT,
          DATA,
          OPERATOR_DATA,
        ),
      ).to.be.deep.equal([
        false,
        EIP1066_CODES.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
        getSelector(asset, "ZeroAddressNotAllowed"),
      ]);
    });

    it("GIVEN a zero address as `to` WHEN canTransferByPartition THEN returns NOT_FOUND with ZeroAddressNotAllowed selector", async () => {
      expect(
        await asset.canTransferByPartition(
          signer_C.address,
          ADDRESS_ZERO,
          _PARTITION_ID_1,
          AMOUNT,
          DATA,
          OPERATOR_DATA,
        ),
      ).to.be.deep.equal([
        false,
        EIP1066_CODES.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
        getSelector(asset, "ZeroAddressNotAllowed"),
      ]);
    });

    it("GIVEN a blocked `from` WHEN canTransferByPartition THEN returns DISALLOWED with AccountIsBlocked selector", async () => {
      await asset.connect(signer_A).addToControlList(signer_C.address);

      expect(
        await asset
          .connect(signer_C)
          .canTransferByPartition(signer_C.address, signer_D.address, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(asset, "AccountIsBlocked")]);
    });

    it("GIVEN a blocked `to` WHEN canTransferByPartition THEN returns DISALLOWED with AccountIsBlocked selector", async () => {
      await asset.connect(signer_A).addToControlList(signer_D.address);

      expect(
        await asset
          .connect(signer_C)
          .canTransferByPartition(signer_C.address, signer_D.address, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(asset, "AccountIsBlocked")]);
    });

    it("GIVEN a non-KYC `from` WHEN canTransferByPartition THEN returns DISALLOWED with InvalidKycStatus selector", async () => {
      await asset.connect(signer_B).revokeKyc(signer_C.address);

      expect(
        await asset
          .connect(signer_C)
          .canTransferByPartition(signer_C.address, signer_D.address, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(asset, "InvalidKycStatus")]);
    });

    it("GIVEN a non-KYC `to` WHEN canTransferByPartition THEN returns DISALLOWED with InvalidKycStatus selector", async () => {
      await asset.connect(signer_B).revokeKyc(signer_D.address);

      expect(
        await asset
          .connect(signer_C)
          .canTransferByPartition(signer_C.address, signer_D.address, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(asset, "InvalidKycStatus")]);
    });

    it("GIVEN a wrong partition WHEN canTransferByPartition THEN returns INSUFFICIENT_FUNDS with InvalidPartition selector", async () => {
      expect(
        await asset
          .connect(signer_C)
          .canTransferByPartition(signer_C.address, signer_D.address, _WRONG_PARTITION, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([false, EIP1066_CODES.INSUFFICIENT_FUNDS, getSelector(asset, "InvalidPartition")]);
    });

    it("GIVEN a value above the partition balance WHEN canTransferByPartition THEN returns INSUFFICIENT_FUNDS with InsufficientBalance selector", async () => {
      expect(
        await asset
          .connect(signer_C)
          .canTransferByPartition(
            signer_C.address,
            signer_D.address,
            _PARTITION_ID_1,
            100 * AMOUNT,
            DATA,
            OPERATOR_DATA,
          ),
      ).to.be.deep.equal([false, EIP1066_CODES.INSUFFICIENT_FUNDS, getSelector(asset, "InsufficientBalance")]);
    });

    it("GIVEN an operator without allowance WHEN canTransferByPartition THEN returns INSUFFICIENT_FUNDS with InsufficientAllowance selector", async () => {
      expect(
        await asset
          .connect(signer_D)
          .canTransferByPartition(signer_C.address, signer_D.address, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([false, EIP1066_CODES.INSUFFICIENT_FUNDS, getSelector(asset, "InsufficientAllowance")]);
    });

    it("GIVEN a holder with balance WHEN canTransferByPartition THEN returns success", async () => {
      expect(
        await asset
          .connect(signer_C)
          .canTransferByPartition(signer_C.address, signer_D.address, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([true, EIP1066_CODES.SUCCESS, ethers.ZeroHash]);
    });

    it("GIVEN an authorised partition operator WHEN canTransferByPartition THEN returns success", async () => {
      await asset.connect(signer_C).authorizeOperatorByPartition(_PARTITION_ID_1, signer_D.address);

      expect(
        await asset
          .connect(signer_D)
          .canTransferByPartition(signer_C.address, signer_E.address, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([true, EIP1066_CODES.SUCCESS, ethers.ZeroHash]);
    });
  });

  describe("canRedeemByPartition", () => {
    it("GIVEN a paused token WHEN canRedeemByPartition THEN returns PAUSED with IsPaused selector", async () => {
      await asset.connect(signer_B).pause();

      expect(
        await asset
          .connect(signer_C)
          .canRedeemByPartition(signer_C.address, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([false, EIP1066_CODES.PAUSED, getSelector(asset, "IsPaused")]);
    });

    it("GIVEN clearing is active WHEN canRedeemByPartition THEN returns UNAVAILABLE with ClearingIsActivated selector", async () => {
      await asset.connect(signer_A).activateClearing();

      expect(
        await asset
          .connect(signer_C)
          .canRedeemByPartition(signer_C.address, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([false, EIP1066_CODES.UNAVAILABLE, getSelector(asset, "ClearingIsActivated")]);
    });

    it("GIVEN a zero address as `from` WHEN canRedeemByPartition THEN returns NOT_FOUND with AccountIsBlocked selector", async () => {
      expect(
        await asset.canRedeemByPartition(ADDRESS_ZERO, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([
        false,
        EIP1066_CODES.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
        getSelector(asset, "AccountIsBlocked"),
      ]);
    });

    it("GIVEN a blocked holder WHEN canRedeemByPartition THEN returns DISALLOWED with AccountIsBlocked selector", async () => {
      await asset.connect(signer_A).addToControlList(signer_C.address);

      expect(
        await asset
          .connect(signer_C)
          .canRedeemByPartition(signer_C.address, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(asset, "AccountIsBlocked")]);
    });

    it("GIVEN a non-KYC holder WHEN canRedeemByPartition THEN returns DISALLOWED with InvalidKycStatus selector", async () => {
      await asset.connect(signer_B).revokeKyc(signer_C.address);

      expect(
        await asset
          .connect(signer_C)
          .canRedeemByPartition(signer_C.address, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([false, EIP1066_CODES.DISALLOWED_OR_STOP, getSelector(asset, "InvalidKycStatus")]);
    });

    it("GIVEN a wrong partition WHEN canRedeemByPartition THEN returns INSUFFICIENT_FUNDS with InvalidPartition selector", async () => {
      expect(
        await asset
          .connect(signer_C)
          .canRedeemByPartition(signer_C.address, _WRONG_PARTITION, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([false, EIP1066_CODES.INSUFFICIENT_FUNDS, getSelector(asset, "InvalidPartition")]);
    });

    it("GIVEN a value above the partition balance WHEN canRedeemByPartition THEN returns INSUFFICIENT_FUNDS with InsufficientBalance selector", async () => {
      expect(
        await asset
          .connect(signer_C)
          .canRedeemByPartition(signer_C.address, _PARTITION_ID_1, 100 * AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([false, EIP1066_CODES.INSUFFICIENT_FUNDS, getSelector(asset, "InsufficientBalance")]);
    });

    it("GIVEN an operator without allowance WHEN canRedeemByPartition THEN returns INSUFFICIENT_FUNDS with InsufficientAllowance selector", async () => {
      expect(
        await asset
          .connect(signer_D)
          .canRedeemByPartition(signer_C.address, _PARTITION_ID_1, AMOUNT, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES),
      ).to.be.deep.equal([false, EIP1066_CODES.INSUFFICIENT_FUNDS, getSelector(asset, "InsufficientAllowance")]);
    });

    it("GIVEN a holder with balance WHEN canRedeemByPartition THEN returns success", async () => {
      expect(
        await asset
          .connect(signer_C)
          .canRedeemByPartition(signer_C.address, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([true, EIP1066_CODES.SUCCESS, ethers.ZeroHash]);
    });

    it("GIVEN an authorised partition operator WHEN canRedeemByPartition THEN returns success", async () => {
      await asset.connect(signer_C).authorizeOperatorByPartition(_PARTITION_ID_1, signer_D.address);

      expect(
        await asset
          .connect(signer_D)
          .canRedeemByPartition(signer_C.address, _PARTITION_ID_1, AMOUNT, DATA, OPERATOR_DATA),
      ).to.be.deep.equal([true, EIP1066_CODES.SUCCESS, ethers.ZeroHash]);
    });
  });
});
