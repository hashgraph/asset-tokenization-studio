// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers, network } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { DEFAULT_PARTITION, EMPTY_STRING, ZERO, ADDRESS_ZERO, ATS_ROLES } from "@scripts";
import { ResolverProxy, IAsset } from "@contract-types";

interface HoldData {
  amount: number;
  expirationTimestamp: bigint;
  escrow: string;
  to: string;
  data: string;
}

interface ProtectedHoldData {
  hold: HoldData;
  deadline: bigint;
  nonce: number;
}

enum ThirdPartyType {
  NULL,
  AUTHORIZED,
  OPERATOR,
  PROTECTED,
  CONTROLLER,
  CLEARING,
}

describe("ProtectedHoldByPartition Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  const domain = {
    name: "",
    version: "",
    chainId: 1,
    verifyingContract: "",
  };

  const holdType = {
    Hold: [
      { name: "amount", type: "uint256" },
      { name: "expirationTimestamp", type: "uint256" },
      { name: "escrow", type: "address" },
      { name: "to", type: "address" },
      { name: "data", type: "bytes" },
    ],
    ProtectedHold: [
      { name: "hold", type: "Hold" },
      { name: "deadline", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
    protectedCreateHoldByPartition: [
      { name: "_partition", type: "bytes32" },
      { name: "_from", type: "address" },
      { name: "_protectedHold", type: "ProtectedHold" },
    ],
  };

  const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "bytes32"],
    [ATS_ROLES.PROTECTED_PARTITIONS_PARTICIPANT_ROLE, DEFAULT_PARTITION],
  );
  const packedDataWithoutPrefix = packedData.slice(2);
  const ProtectedPartitionRole_1 = ethers.keccak256("0x" + packedDataWithoutPrefix);

  function set_initRbacs(): any[] {
    return [
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.CONTROL_LIST_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.PROTECTED_PARTITIONS_ROLE,
        members: [signer_B.address],
      },
      {
        role: ProtectedPartitionRole_1,
        members: [signer_A.address, signer_B.address],
      },
      {
        role: ATS_ROLES.KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.CLEARING_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.CLEARING_VALIDATOR_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.AGENT_ROLE,
        members: [signer_A.address],
      },
    ];
  }

  async function deploySecurityFixture() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          arePartitionsProtected: true,
          compliance: undefined,
        },
      },
    });

    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;
    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, set_initRbacs());

    domain.name = (await asset.getERC20Metadata()).info.name;
    domain.version = (await asset.getConfigInfo()).version_.toString();
    domain.chainId = await network.provider.send("eth_chainId");
    domain.verifyingContract = diamond.target as string;

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixture);
  });

  describe("Happy Path", () => {
    it("GIVEN valid parameters and signature WHEN protectedCreateHoldByPartition THEN transaction succeeds, emits ProtectedHeldByPartition and updates state", async () => {
      const expirationTimestamp = MAX_UINT256;
      const hold: HoldData = {
        amount: 1,
        expirationTimestamp: BigInt(expirationTimestamp.toString()),
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x1234",
      };

      const protectedHold: ProtectedHoldData = {
        hold: hold,
        deadline: BigInt(MAX_UINT256.toString()),
        nonce: 1,
      };

      const message = {
        _partition: DEFAULT_PARTITION,
        _from: signer_A.address,
        _protectedHold: protectedHold,
      };

      const signature = await signer_A.signTypedData(domain, holdType, message);

      await asset.connect(signer_B).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: protectedHold.hold.amount,
        data: "0x",
      });

      await expect(
        asset
          .connect(signer_B)
          .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, signature),
      )
        .to.emit(asset, "ProtectedHeldByPartition")
        .withArgs(
          signer_B.address,
          signer_A.address,
          DEFAULT_PARTITION,
          1,
          [
            protectedHold.hold.amount,
            protectedHold.hold.expirationTimestamp,
            protectedHold.hold.escrow,
            protectedHold.hold.to,
            protectedHold.hold.data,
          ],
          "0x",
        );

      const holdIdentifier = {
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        holdId: 1,
      };

      const heldAmount = await asset.getHeldAmountForByPartition(DEFAULT_PARTITION, signer_A.address);
      expect(heldAmount).to.equal(protectedHold.hold.amount);

      const holdCount = await asset.getHoldCountForByPartition(DEFAULT_PARTITION, signer_A.address);
      expect(holdCount).to.equal(1);

      const retrievedHold = await asset.getHoldForByPartition(holdIdentifier);
      expect(retrievedHold.amount_).to.equal(protectedHold.hold.amount);
      expect(retrievedHold.escrow_).to.equal(protectedHold.hold.escrow);
      expect(retrievedHold.destination_).to.equal(protectedHold.hold.to);
      expect(retrievedHold.expirationTimestamp_).to.equal(protectedHold.hold.expirationTimestamp);
      expect(retrievedHold.thirdPartyType_).to.equal(ThirdPartyType.PROTECTED);

      const holdThirdParty = await asset.getHoldThirdParty(holdIdentifier);
      expect(holdThirdParty).to.equal(ADDRESS_ZERO);
    });

    it("GIVEN a hold with specific destination WHEN protectedCreateHoldByPartition THEN hold is created with correct destination", async () => {
      const expirationTimestamp = MAX_UINT256;
      const hold: HoldData = {
        amount: 1,
        expirationTimestamp: BigInt(expirationTimestamp.toString()),
        escrow: signer_B.address,
        to: signer_C.address,
        data: "0x1234",
      };

      const protectedHold: ProtectedHoldData = {
        hold: hold,
        deadline: BigInt(MAX_UINT256.toString()),
        nonce: 1,
      };

      const message = {
        _partition: DEFAULT_PARTITION,
        _from: signer_A.address,
        _protectedHold: protectedHold,
      };

      const signature = await signer_A.signTypedData(domain, holdType, message);

      await asset.connect(signer_B).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: protectedHold.hold.amount,
        data: "0x",
      });

      await asset
        .connect(signer_B)
        .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, signature);

      const holdIdentifier = {
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        holdId: 1,
      };

      const retrievedHold = await asset.getHoldForByPartition(holdIdentifier);
      expect(retrievedHold.destination_).to.equal(signer_C.address);
    });
  });

  describe("Role-Gated Negative Cases", () => {
    it("GIVEN a account without the protected partition participant role WHEN protectedCreateHoldByPartition THEN transaction fails with AccountHasNoRole", async () => {
      const expirationTimestamp = MAX_UINT256;
      const hold: HoldData = {
        amount: 1,
        expirationTimestamp: BigInt(expirationTimestamp.toString()),
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x1234",
      };

      const protectedHold: ProtectedHoldData = {
        hold: hold,
        deadline: BigInt(MAX_UINT256.toString()),
        nonce: 1,
      };

      await expect(
        asset
          .connect(signer_C)
          .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });
  });

  describe("Signature Validation", () => {
    it("GIVEN a wrong deadline WHEN performing a protected hold THEN transaction fails with ExpiredDeadline", async () => {
      const expirationTimestamp = MAX_UINT256;
      const hold: HoldData = {
        amount: 1,
        expirationTimestamp: BigInt(expirationTimestamp.toString()),
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x1234",
      };

      const protectedHold: ProtectedHoldData = {
        hold: hold,
        deadline: 1n,
        nonce: 1,
      };

      await expect(
        asset
          .connect(signer_B)
          .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "ExpiredDeadline");
    });

    it("GIVEN a wrong signature length WHEN performing a protected hold THEN transaction fails with WrongSignatureLength", async () => {
      const expirationTimestamp = MAX_UINT256;
      const hold: HoldData = {
        amount: 1,
        expirationTimestamp: BigInt(expirationTimestamp.toString()),
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x1234",
      };

      const protectedHold: ProtectedHoldData = {
        hold: hold,
        deadline: BigInt(MAX_UINT256.toString()),
        nonce: 1,
      };

      await expect(
        asset
          .connect(signer_B)
          .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x12"),
      ).to.be.revertedWithCustomError(asset, "WrongSignatureLength");
    });

    it("GIVEN a wrong signature WHEN performing a protected hold THEN transaction fails with WrongSignature", async () => {
      const expirationTimestamp = MAX_UINT256;
      const hold: HoldData = {
        amount: 1,
        expirationTimestamp: BigInt(expirationTimestamp.toString()),
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x1234",
      };

      const protectedHold: ProtectedHoldData = {
        hold: hold,
        deadline: BigInt(MAX_UINT256.toString()),
        nonce: 1,
      };

      await expect(
        asset
          .connect(signer_B)
          .protectedCreateHoldByPartition(
            DEFAULT_PARTITION,
            signer_A.address,
            protectedHold,
            "0x0011223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344",
          ),
      ).to.be.revertedWithCustomError(asset, "WrongSignature");
    });

    it("GIVEN a wrong nonce WHEN performing a protected hold THEN transaction fails with WrongNonce", async () => {
      const expirationTimestamp = MAX_UINT256;
      const hold: HoldData = {
        amount: 1,
        expirationTimestamp: BigInt(expirationTimestamp.toString()),
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x1234",
      };

      const protectedHold: ProtectedHoldData = {
        hold: hold,
        deadline: BigInt(MAX_UINT256.toString()),
        nonce: 0,
      };

      await expect(
        asset
          .connect(signer_B)
          .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "WrongNonce");
    });
  });

  describe("Input Validation", () => {
    it("GIVEN a zero address tokenHolder WHEN protectedCreateHoldByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
      const expirationTimestamp = MAX_UINT256;
      const hold: HoldData = {
        amount: 1,
        expirationTimestamp: BigInt(expirationTimestamp.toString()),
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x1234",
      };

      const protectedHold: ProtectedHoldData = {
        hold: hold,
        deadline: BigInt(MAX_UINT256.toString()),
        nonce: 1,
      };

      await expect(
        asset.protectedCreateHoldByPartition(DEFAULT_PARTITION, ADDRESS_ZERO, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN a zero address escrow WHEN protectedCreateHoldByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
      const expirationTimestamp = MAX_UINT256;
      const hold: HoldData = {
        amount: 1,
        expirationTimestamp: BigInt(expirationTimestamp.toString()),
        escrow: ADDRESS_ZERO,
        to: ADDRESS_ZERO,
        data: "0x1234",
      };

      const protectedHold: ProtectedHoldData = {
        hold: hold,
        deadline: BigInt(MAX_UINT256.toString()),
        nonce: 1,
      };

      await expect(
        asset.protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN a from user recovering WHEN protectedCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
      const expirationTimestamp = MAX_UINT256;
      const hold: HoldData = {
        amount: 1,
        expirationTimestamp: BigInt(expirationTimestamp.toString()),
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x1234",
      };

      const protectedHold: ProtectedHoldData = {
        hold: hold,
        deadline: BigInt(MAX_UINT256.toString()),
        nonce: 1,
      };

      await asset.connect(signer_A).recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

      await expect(
        asset
          .connect(signer_B)
          .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "WalletRecovered");
    });

    it("GIVEN a hold destination user recovering WHEN protectedCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
      const expirationTimestamp = MAX_UINT256;
      const hold: HoldData = {
        amount: 1,
        expirationTimestamp: BigInt(expirationTimestamp.toString()),
        escrow: signer_B.address,
        to: signer_C.address,
        data: "0x1234",
      };

      const protectedHold: ProtectedHoldData = {
        hold: hold,
        deadline: BigInt(MAX_UINT256.toString()),
        nonce: 1,
      };

      await asset.connect(signer_A).recoveryAddress(protectedHold.hold.to, signer_B.address, ADDRESS_ZERO);

      await expect(
        asset
          .connect(signer_B)
          .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "WalletRecovered");
    });

    it("GIVEN a wrong expiration timestamp WHEN protectedCreateHoldByPartition THEN transaction fails with WrongExpirationTimestamp", async () => {
      const hold: HoldData = {
        amount: 1,
        expirationTimestamp: 1n,
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x1234",
      };

      const protectedHold: ProtectedHoldData = {
        hold: hold,
        deadline: BigInt(MAX_UINT256.toString()),
        nonce: 1,
      };

      await expect(
        asset
          .connect(signer_B)
          .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
    });
  });

  describe("Token State Checks", () => {
    it("GIVEN a paused token WHEN protectedCreateHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
      const expirationTimestamp = MAX_UINT256;
      const hold: HoldData = {
        amount: 1,
        expirationTimestamp: BigInt(expirationTimestamp.toString()),
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x1234",
      };

      const protectedHold: ProtectedHoldData = {
        hold: hold,
        deadline: BigInt(MAX_UINT256.toString()),
        nonce: 1,
      };

      await asset.connect(signer_B).pause();

      await expect(
        asset.protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN a token in clearing mode WHEN protectedCreateHoldByPartition THEN transaction fails with ClearingIsActivated", async () => {
      const expirationTimestamp = MAX_UINT256;
      const hold: HoldData = {
        amount: 1,
        expirationTimestamp: BigInt(expirationTimestamp.toString()),
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x1234",
      };

      const protectedHold: ProtectedHoldData = {
        hold: hold,
        deadline: BigInt(MAX_UINT256.toString()),
        nonce: 1,
      };

      await asset.connect(signer_A).activateClearing();

      await expect(
        asset.protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "ClearingIsActivated");
    });
  });

  describe("Partition Protection", () => {
    it("GIVEN unprotected partitions WHEN protectedCreateHoldByPartition THEN transaction fails with PartitionsAreUnProtected", async () => {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            arePartitionsProtected: false,
          },
        },
      });

      const unprotectedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await executeRbac(unprotectedAsset, set_initRbacs());

      const expirationTimestamp = MAX_UINT256;
      const hold: HoldData = {
        amount: 1,
        expirationTimestamp: BigInt(expirationTimestamp.toString()),
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x1234",
      };

      const protectedHold: ProtectedHoldData = {
        hold: hold,
        deadline: BigInt(MAX_UINT256.toString()),
        nonce: 1,
      };

      await expect(
        unprotectedAsset
          .connect(signer_B)
          .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(unprotectedAsset, "PartitionsAreUnProtected");
    });
  });
});
