// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers, network } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset, ComplianceMock } from "@contract-types";
import { DEFAULT_PARTITION, ZERO, EMPTY_STRING, ADDRESS_ZERO, ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const amount = 1;

const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
  ["bytes32", "bytes32"],
  [ATS_ROLES._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, DEFAULT_PARTITION],
);
const packedDataWithoutPrefix = packedData.slice(2);

const ProtectedPartitionRole_1 = ethers.keccak256("0x" + packedDataWithoutPrefix);

const domain = {
  name: "",
  version: "",
  chainId: 1,
  verifyingContract: "",
};

const transferType = {
  protectedTransferFromByPartition: [
    { name: "_partition", type: "bytes32" },
    { name: "_from", type: "address" },
    { name: "_to", type: "address" },
    { name: "_amount", type: "uint256" },
    { name: "_deadline", type: "uint256" },
    { name: "_nounce", type: "uint256" },
  ],
};

const EMPTY_VC_ID = EMPTY_STRING;

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

const clearingTransferType = {
  ClearingOperation: [
    { name: "partition", type: "bytes32" },
    { name: "expirationTimestamp", type: "uint256" },
    { name: "data", type: "bytes" },
  ],
  ProtectedClearingOperation: [
    { name: "clearingOperation", type: "ClearingOperation" },
    { name: "from", type: "address" },
    { name: "deadline", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
  protectedClearingTransferByPartition: [
    {
      name: "_protectedClearingOperation",
      type: "ProtectedClearingOperation",
    },
    { name: "_amount", type: "uint256" },
    { name: "_to", type: "address" },
  ],
};

const clearingCreateHoldType = {
  ClearingOperation: [
    { name: "partition", type: "bytes32" },
    { name: "expirationTimestamp", type: "uint256" },
    { name: "data", type: "bytes" },
  ],
  ProtectedClearingOperation: [
    { name: "clearingOperation", type: "ClearingOperation" },
    { name: "from", type: "address" },
    { name: "deadline", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
  Hold: [
    { name: "amount", type: "uint256" },
    { name: "expirationTimestamp", type: "uint256" },
    { name: "escrow", type: "address" },
    { name: "to", type: "address" },
    { name: "data", type: "bytes" },
  ],
  protectedClearingCreateHoldByPartition: [
    {
      name: "_protectedClearingOperation",
      type: "ProtectedClearingOperation",
    },
    { name: "_hold", type: "Hold" },
  ],
};

const clearingRedeemType = {
  ClearingOperation: [
    { name: "partition", type: "bytes32" },
    { name: "expirationTimestamp", type: "uint256" },
    { name: "data", type: "bytes" },
  ],
  ProtectedClearingOperation: [
    { name: "clearingOperation", type: "ClearingOperation" },
    { name: "from", type: "address" },
    { name: "deadline", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
  protectedClearingRedeemByPartition: [
    {
      name: "_protectedClearingOperation",
      type: "ProtectedClearingOperation",
    },
    { name: "_amount", type: "uint256" },
  ],
};

interface BasicTransferInfo {
  to: string;
  value: number;
}

interface OperatorTransferData {
  partition: string;
  from: string;
  to: string;
  value: number;
  data: string;
  operatorData: string;
}

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

interface ClearingOperationData {
  partition: string;
  expirationTimestamp: bigint;
  data: string;
}

interface ClearingOperationFromData {
  clearingOperation: ClearingOperationData;
  from: string;
  operatorData: string;
}

interface ProtectedClearingOperationData {
  clearingOperation: ClearingOperationData;
  from: string;
  deadline: bigint;
  nonce: number;
}

let basicTransferInfo: BasicTransferInfo;
let operatorTransferData: OperatorTransferData;

describe("ProtectedPartitions Tests", () => {
  let diamond_UnprotectedPartitions: ResolverProxy;
  let diamond_ProtectedPartitions: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;
  let protectedHold: ProtectedHoldData;
  let hold: HoldData;
  let clearingOperation: ClearingOperationData;
  let clearingOperationFrom: ClearingOperationFromData;
  let protectedClearingOperation: ProtectedClearingOperationData;
  let complianceMock: ComplianceMock;
  let complianceMockAddress: string;

  async function grant_WILD_CARD_ROLE_and_issue_tokens(
    wildCard_Account: string,
    issue_Account: string,
    issue_Amount: number,
    issue_Partition: string,
  ) {
    await asset.connect(signer_A).grantRole(ATS_ROLES._WILD_CARD_ROLE, wildCard_Account);

    await asset.connect(signer_B).issueByPartition({
      partition: issue_Partition,
      tokenHolder: issue_Account,
      value: issue_Amount,
      data: "0x",
    });
  }

  async function setFacets(address: string, compliance?: string) {
    asset = await ethers.getContractAt("IAsset", address);

    if (compliance) {
      complianceMock = await ethers.getContractAt("ComplianceMock", compliance);
    }
  }

  async function grantKyc() {
    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  async function setProtected() {
    await setFacets(diamond_ProtectedPartitions.target as string, complianceMockAddress);

    domain.name = (await asset.getERC20Metadata()).info.name;
    domain.version = (await asset.getConfigInfo()).version_.toString();
    domain.chainId = await network.provider.send("eth_chainId");
    domain.verifyingContract = diamond_ProtectedPartitions.target as string;
    await grantKyc();
  }

  async function setUnProtected() {
    await setFacets(diamond_UnprotectedPartitions.target as string);
    await grantKyc();
  }

  function set_initRbacs(): any[] {
    return [
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._CONTROL_LIST_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._PROTECTED_PARTITIONS_ROLE,
        members: [signer_B.address],
      },
      {
        role: ProtectedPartitionRole_1,
        members: [signer_A.address, signer_B.address],
      },
      {
        role: ATS_ROLES._LOCKER_ROLE,
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
        role: ATS_ROLES._CLEARING_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._CLEARING_VALIDATOR_ROLE,
        members: [signer_A.address],
      },
    ];
  }

  async function deploySecurityFixtureUnprotectedPartitions() {
    const base = await deployEquityTokenFixture({ useLoadFixture: false });
    diamond_UnprotectedPartitions = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;
    asset = await ethers.getContractAt("IAsset", diamond_UnprotectedPartitions.target);
    await executeRbac(asset, set_initRbacs());

    await setFacets(diamond_UnprotectedPartitions.target as string);
  }

  async function deploySecurityFixtureProtectedPartitions() {
    const ComplianceMockFactory = await ethers.getContractFactory("ComplianceMock", signer_A);
    const complianceMockInstance = await ComplianceMockFactory.deploy(true, false);
    await complianceMockInstance.waitForDeployment();
    complianceMockAddress = complianceMockInstance.target as string;

    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          arePartitionsProtected: true,
          compliance: complianceMockAddress,
        },
      },
      useLoadFixture: false, // CRITICAL: avoid nested loadFixture that would erase ComplianceMock
    });

    diamond_ProtectedPartitions = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;
    asset = await ethers.getContractAt("IAsset", diamond_ProtectedPartitions.target);
    await executeRbac(asset, set_initRbacs());

    await setFacets(diamond_ProtectedPartitions.target as string, complianceMockAddress);
  }

  beforeEach(async () => {
    // await loadFixture(deploySecurityFixtureUnprotectedPartitions);
    await loadFixture(deploySecurityFixtureProtectedPartitions);

    const expirationTimestamp = MAX_UINT256;

    hold = {
      amount: 1,
      expirationTimestamp: BigInt(expirationTimestamp.toString()),
      escrow: signer_B.address,
      to: ADDRESS_ZERO,
      data: "0x1234",
    };

    protectedHold = {
      hold: hold,
      deadline: BigInt(MAX_UINT256.toString()),
      nonce: 1,
    };

    basicTransferInfo = {
      to: signer_B.address,
      value: amount,
    };

    operatorTransferData = {
      partition: DEFAULT_PARTITION,
      from: signer_A.address,
      to: signer_B.address,
      value: amount,
      data: "0x1234",
      operatorData: "0x1234",
    };

    clearingOperation = {
      partition: DEFAULT_PARTITION,
      expirationTimestamp: BigInt(expirationTimestamp.toString()),
      data: "0x1234",
    };

    clearingOperationFrom = {
      clearingOperation: clearingOperation,
      from: signer_A.address,
      operatorData: "0x1234",
    };

    protectedClearingOperation = {
      clearingOperation: clearingOperation,
      from: signer_A.address,
      deadline: BigInt(MAX_UINT256.toString()),
      nonce: 1,
    };
  });

  it("GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized", async () => {
    await setProtected();
    await expect(asset.initialize_ProtectedPartitions(true)).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
  });

  describe("Generic Hold check Tests", () => {
    it("GIVEN a paused security WHEN performing a protected hold THEN transaction fails with Paused", async () => {
      await setProtected();

      await asset.connect(signer_B).pause();

      await expect(
        asset.protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN a security with clearing active WHEN performing a protected hold THEN transaction fails with ClearingIsActivated", async () => {
      await setProtected();

      await asset.connect(signer_A).activateClearing();

      await expect(
        asset.protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "ClearingIsActivated");
    });

    it("GIVEN a account without the participant role WHEN performing a protected hold THEN transaction fails with AccountHasNoRole", async () => {
      await setProtected();

      await expect(
        asset
          .connect(signer_C)
          .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN a zero address tokenHolder account WHEN performing a protected hold from it THEN transaction fails with ZeroAddressNotAllowed", async () => {
      await setProtected();

      await expect(
        asset.protectedCreateHoldByPartition(DEFAULT_PARTITION, ADDRESS_ZERO, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN a zero address escrow account WHEN performing a protected hold from it THEN transaction fails with ZeroAddressNotAllowed", async () => {
      await setProtected();

      protectedHold.hold.escrow = ADDRESS_ZERO;

      await expect(
        asset.protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN a wrong expiration date WHEN performing a protected hold from it THEN transaction fails with WrongExpirationTimestamp", async () => {
      await setProtected();

      protectedHold.hold.expirationTimestamp = 1n;

      await expect(
        asset
          .connect(signer_B)
          .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
    });
  });

  describe("Generic set Partition Status Tests", () => {
    it("GIVEN a paused security role WHEN protecting or unprotecting partitions THEN transaction fails with Paused", async () => {
      await setProtected();

      await asset.connect(signer_B).pause();

      await expect(asset.connect(signer_B).protectPartitions()).to.be.revertedWithCustomError(asset, "TokenIsPaused");

      await expect(asset.connect(signer_B).unprotectPartitions()).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN a account without the protected partition role WHEN protecting or unprotecting partitions THEN transaction fails with AccountHasNoRole", async () => {
      await setProtected();

      await expect(asset.protectPartitions()).to.be.revertedWithCustomError(asset, "AccountHasNoRole");

      await expect(asset.unprotectPartitions()).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });
  });

  describe("Unprotected Partitions", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureUnprotectedPartitions);
      await setUnProtected();
    });

    it("GIVEN an unprotected partitions equity WHEN retrieving the protected partitions Status, result is false", async () => {
      const partitionsProtectedStatus = await asset.arePartitionsProtected();
      await expect(partitionsProtectedStatus).to.be.false;
    });

    it("GIVEN an unprotected partitions equity AFTER protecting it THEN retrieving the protected partitions Status, result is true", async () => {
      await asset.connect(signer_B).protectPartitions();

      const partitionsProtectedStatus = await asset.arePartitionsProtected();
      expect(partitionsProtectedStatus).to.be.true;
    });

    it("GIVEN an unprotected partitions equity WHEN performing a protected hold THEN transaction fails with PartitionsAreUnProtected", async () => {
      await expect(
        asset
          .connect(signer_B)
          .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
      ).to.be.revertedWithCustomError(asset, "PartitionsAreUnProtected");
    });
  });

  describe("Protected Partitions", () => {
    beforeEach(async () => {
      await setProtected();
    });

    it("GIVEN a protected partitions equity WHEN retrieving the protected partitions Status, result is true", async () => {
      const partitionsProtectedStatus = await asset.arePartitionsProtected();
      expect(partitionsProtectedStatus).to.be.true;
    });

    it("GIVEN an protected partitions equity AFTER unprotecting it THEN retrieving the protected partitions Status, result is false", async () => {
      await asset.connect(signer_B).unprotectPartitions();

      const partitionsProtectedStatus = await asset.arePartitionsProtected();
      expect(partitionsProtectedStatus).to.be.false;
    });

    it("GIVEN a partition WHEN calculating role for partition THEN returns correct role", async () => {
      const role = await asset.calculateRoleForPartition(DEFAULT_PARTITION);
      expect(role).to.equal(ProtectedPartitionRole_1);
    });

    describe("Transfer Tests", () => {
      it("GIVEN a protected token WHEN performing a ERC1410 transfer By partition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        await expect(
          asset.transferByPartition(DEFAULT_PARTITION, basicTransferInfo, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });

      it("GIVEN a protected token WHEN performing a ERC1594 transfer with Data THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        await expect(asset.transferWithData(signer_B.address, amount, "0x1234")).to.be.revertedWithCustomError(
          asset,
          "PartitionsAreProtectedAndNoRole",
        );
      });

      it("GIVEN a protected token WHEN performing a ERC1594 transfer From with Data THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        await expect(
          asset.transferFromWithData(signer_A.address, signer_B.address, amount, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });

      it("GIVEN a protected token WHEN performing a ERC20 transfer THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        await expect(asset.transfer(signer_B.address, amount)).to.be.revertedWithCustomError(
          asset,
          "PartitionsAreProtectedAndNoRole",
        );
      });

      it("GIVEN a protected token WHEN performing a ERC20 transfer From THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        await expect(asset.transferFrom(signer_A.address, signer_B.address, amount)).to.be.revertedWithCustomError(
          asset,
          "PartitionsAreProtectedAndNoRole",
        );
      });

      it("GIVEN a protected token WHEN performing a transferAndLock By Partition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        await expect(
          asset
            .connect(signer_B)
            .transferAndLockByPartition(DEFAULT_PARTITION, signer_B.address, amount, "0x1234", MAX_UINT256),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });

      it("GIVEN a protected token WHEN performing a transferAndLock THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        await expect(
          asset.connect(signer_B).transferAndLock(signer_B.address, amount, "0x1234", MAX_UINT256),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });

      it("GIVEN a protected token and a WILD CARD account WHEN performing a ERC1410 transfer By partition THEN transaction succeeds", async () => {
        await grant_WILD_CARD_ROLE_and_issue_tokens(signer_B.address, signer_B.address, amount, DEFAULT_PARTITION);

        basicTransferInfo.to = signer_C.address;

        await asset.connect(signer_B).transferByPartition(DEFAULT_PARTITION, basicTransferInfo, "0x1234");
      });

      it("GIVEN a protected token and a WILD CARD account WHEN performing an ERC1410 operator transfer By partition THEN transaction succeeds", async () => {
        await grant_WILD_CARD_ROLE_and_issue_tokens(signer_C.address, signer_A.address, amount, DEFAULT_PARTITION);

        await asset.connect(signer_A).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_C.address);

        await asset.connect(signer_C).operatorTransferByPartition(operatorTransferData);
      });

      it("GIVEN a protected token and a WILD CARD account WHEN performing a ERC1594 transfer with Data THEN transaction succeeds", async () => {
        await grant_WILD_CARD_ROLE_and_issue_tokens(signer_A.address, signer_A.address, amount, DEFAULT_PARTITION);

        await asset.transferWithData(signer_B.address, amount, "0x1234");
      });

      it("GIVEN a protected token and a WILD CARD account WHEN performing a ERC1594 transfer From with Data THEN transaction succeeds", async () => {
        await grant_WILD_CARD_ROLE_and_issue_tokens(signer_C.address, signer_A.address, amount, DEFAULT_PARTITION);

        await asset.approve(signer_C.address, amount);

        await asset.connect(signer_C).transferFromWithData(signer_A.address, signer_B.address, amount, "0x1234");
      });

      it("GIVEN a protected token and a WILD CARD account WHEN performing a ERC20 transfer THEN transaction succeeds", async () => {
        await grant_WILD_CARD_ROLE_and_issue_tokens(signer_A.address, signer_A.address, amount, DEFAULT_PARTITION);

        await asset.transfer(signer_B.address, amount);
      });

      it("GIVEN a protected token and a WILD CARD account WHEN performing a ERC20 transfer From THEN transaction succeeds", async () => {
        await grant_WILD_CARD_ROLE_and_issue_tokens(signer_C.address, signer_A.address, amount, DEFAULT_PARTITION);

        await asset.approve(signer_C.address, amount);

        await asset.connect(signer_C).transferFrom(signer_A.address, signer_B.address, amount);
      });

      it("GIVEN a protected token and a WILD CARD account WHEN performing a transferAndLock By Partition THEN transaction succeeds", async () => {
        await grant_WILD_CARD_ROLE_and_issue_tokens(signer_B.address, signer_B.address, amount, DEFAULT_PARTITION);

        await asset
          .connect(signer_B)
          .transferAndLockByPartition(DEFAULT_PARTITION, signer_C.address, amount, "0x1234", MAX_UINT256);
      });

      it("GIVEN a protected token and a WILD CARD account WHEN performing a transferAndLock THEN transaction succeeds", async () => {
        await grant_WILD_CARD_ROLE_and_issue_tokens(signer_B.address, signer_B.address, amount, DEFAULT_PARTITION);

        await asset.connect(signer_B).transferAndLock(signer_C.address, amount, "0x1234", MAX_UINT256);
      });

      it("GIVEN a correct signature WHEN performing a protected transfer THEN transaction succeeds", async () => {
        const deadline = MAX_UINT256;

        const message = {
          _partition: DEFAULT_PARTITION,
          _from: signer_A.address,
          _to: signer_B.address,
          _amount: amount,
          _deadline: deadline,
          _nounce: 1,
        };

        /*const domainSeparator =
                    ethers.TypedDataEncoder.hashDomain(domain)
                const messageHash = ethers.TypedDataEncoder.hash(
                    domain,
                    transferType,
                    message
                )*/

        // Sign the message hash
        const signature = await signer_A.signTypedData(domain, transferType, message);

        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await asset
          .connect(signer_B)
          .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_B.address, amount, {
            deadline: deadline,
            nounce: 1,
            signature: signature,
          });
      });
    });

    describe("Redeem Tests", () => {
      it("GIVEN a protected token WHEN performing a ERC1410 redeem By partition THEN transaction fails with PartitionsAreProtected", async () => {
        await expect(asset.redeemByPartition(DEFAULT_PARTITION, amount, "0x1234")).to.be.revertedWithCustomError(
          asset,
          "PartitionsAreProtectedAndNoRole",
        );
      });

      it("GIVEN a protected token WHEN performing an ERC1410 operator redeem By partition THEN transaction fails with PartitionsAreProtected", async () => {
        await asset.authorizeOperatorByPartition(DEFAULT_PARTITION, signer_C.address);

        await expect(
          asset
            .connect(signer_C)
            .operatorRedeemByPartition(DEFAULT_PARTITION, signer_A.address, amount, "0x1234", "0x1234"),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });

      it("GIVEN a protected token WHEN performing a ERC1594 redeem THEN transaction fails with PartitionsAreProtected", async () => {
        await expect(asset.redeem(amount, "0x1234")).to.be.revertedWithCustomError(
          asset,
          "PartitionsAreProtectedAndNoRole",
        );
      });

      it("GIVEN a protected token WHEN performing a ERC1594 redeem From with Data THEN transaction fails with PartitionsAreProtected", async () => {
        await expect(asset.redeemFrom(signer_B.address, amount, "0x1234")).to.be.revertedWithCustomError(
          asset,
          "PartitionsAreProtectedAndNoRole",
        );
      });
    });

    describe("Hold Tests", () => {
      it("GIVEN a protected token WHEN performing a createHoldByPartition THEN transaction fails with PartitionsAreProtected", async () => {
        await expect(asset.createHoldByPartition(DEFAULT_PARTITION, hold)).to.be.revertedWithCustomError(
          asset,
          "PartitionsAreProtectedAndNoRole",
        );
      });

      it("GIVEN a protected token WHEN performing a createHoldFromByPartition THEN transaction fails with PartitionsAreProtected", async () => {
        await expect(
          asset.connect(signer_B).createHoldFromByPartition(DEFAULT_PARTITION, signer_A.address, hold, "0x"),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });

      it("GIVEN a protected token WHEN performing a operatorCreateHoldByPartition THEN transaction fails with PartitionsAreProtected", async () => {
        await asset.connect(signer_A).authorizeOperator(signer_B.address);

        await expect(
          asset.connect(signer_B).operatorCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold, "0x"),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");

        await asset.connect(signer_A).revokeOperator(signer_B.address);
      });

      it("GIVEN a wrong deadline WHEN performing a protected hold THEN transaction fails with ExpiredDeadline", async () => {
        protectedHold.deadline = 1n;

        await expect(
          asset
            .connect(signer_B)
            .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "ExpiredDeadline");
      });

      it("GIVEN a wrong signature length WHEN performing a protected hold THEN transaction fails with WrongSignatureLength", async () => {
        await expect(
          asset
            .connect(signer_B)
            .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x12"),
        ).to.be.revertedWithCustomError(asset, "WrongSignatureLength");
      });

      it("GIVEN a wrong signature WHEN performing a protected hold THEN transaction fails with WrongSignature", async () => {
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

      it("GIVEN a wrong nounce WHEN performing a protected hold THEN transaction fails with WrongNounce", async () => {
        protectedHold.nonce = 0;

        await expect(
          asset
            .connect(signer_B)
            .protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WrongNounce");
      });

      it("GIVEN a correct signature WHEN performing a protected hold THEN transaction succeeds", async () => {
        const message = {
          _partition: DEFAULT_PARTITION,
          _from: signer_A.address,
          _protectedHold: protectedHold,
        };

        /*const domainSeparator =
                    ethers.TypedDataEncoder.hashDomain(domain)
                const messageHash = ethers.TypedDataEncoder.hash(
                    domain,
                    transferType,
                    message
                )*/

        // Sign the message hash
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
      });
    });
    describe("Clearing Tests", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).activateClearing();
      });
      it("GIVEN a protected token WHEN performing a create clearing THEN transaction fails with PartitionsAreProtected", async () => {
        // TRANSFERS
        await expect(
          asset.connect(signer_A).clearingTransferByPartition(clearingOperation, amount, signer_C.address),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        await expect(
          asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, amount, signer_C.address),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        await asset.authorizeOperator(signer_B.address);
        await expect(
          asset.connect(signer_B).operatorClearingTransferByPartition(clearingOperationFrom, amount, signer_C.address),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        // CLEARING CREATE HOLD
        await expect(
          asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        await expect(
          asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        await expect(
          asset.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        // CLEARING REDEEM
        await expect(
          asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, amount),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        await expect(
          asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, amount),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        await expect(
          asset.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, amount),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });

      it("GIVEN a wrong deadline WHEN performing a protected clearing THEN transaction fails with ExpiredDeadline", async () => {
        protectedClearingOperation.deadline = 1n;
        //TRANSFER
        await expect(
          asset
            .connect(signer_B)
            .protectedClearingTransferByPartition(protectedClearingOperation, amount, signer_C.address, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "ExpiredDeadline");
        // HOLD
        await expect(
          asset.connect(signer_B).protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "ExpiredDeadline");
        //REDEEM
        await expect(
          asset.connect(signer_B).protectedClearingRedeemByPartition(protectedClearingOperation, amount, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "ExpiredDeadline");
      });

      it("GIVEN a wrong signature length WHEN performing a protected clearing THEN transaction fails with WrongSignatureLength", async () => {
        //TRANSFER
        await expect(
          asset
            .connect(signer_B)
            .protectedClearingTransferByPartition(protectedClearingOperation, amount, signer_C.address, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WrongSignatureLength");
        // HOLD
        await expect(
          asset.connect(signer_B).protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WrongSignatureLength");
        //REDEEM
        await expect(
          asset.connect(signer_B).protectedClearingRedeemByPartition(protectedClearingOperation, amount, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WrongSignatureLength");
      });

      it("GIVEN a wrong signature WHEN performing a protected clearing THEN transaction fails with WrongSignature", async () => {
        //TRANSFER
        await expect(
          asset
            .connect(signer_B)
            .protectedClearingTransferByPartition(
              protectedClearingOperation,
              amount,
              signer_C.address,
              "0x0011223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344",
            ),
        ).to.be.revertedWithCustomError(asset, "WrongSignature");
        // HOLD
        await expect(
          asset
            .connect(signer_B)
            .protectedClearingCreateHoldByPartition(
              protectedClearingOperation,
              hold,
              "0x0011223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344",
            ),
        ).to.be.revertedWithCustomError(asset, "WrongSignature");
        //REDEEM
        await expect(
          asset
            .connect(signer_B)
            .protectedClearingRedeemByPartition(
              protectedClearingOperation,
              amount,
              "0x0011223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344",
            ),
        ).to.be.revertedWithCustomError(asset, "WrongSignature");
      });

      it("GIVEN a wrong nounce WHEN performing a protected clearing THEN transaction fails with WrongNounce", async () => {
        protectedClearingOperation.nonce = 0;

        //TRANSFER
        await expect(
          asset
            .connect(signer_B)
            .protectedClearingTransferByPartition(protectedClearingOperation, amount, signer_C.address, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WrongNounce");
        // HOLD
        await expect(
          asset.connect(signer_B).protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WrongNounce");
        //REDEEM
        await expect(
          asset.connect(signer_B).protectedClearingRedeemByPartition(protectedClearingOperation, amount, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WrongNounce");
      });

      it("GIVEN a correct signature WHEN performing a protected clearing THEN transaction succeeds", async () => {
        // TRANSFERS
        const message = {
          _protectedClearingOperation: protectedClearingOperation,
          _amount: amount,
          _to: signer_C.address,
        };
        // Sign the message hash
        const signature = await signer_A.signTypedData(domain, clearingTransferType, message);
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        await asset
          .connect(signer_B)
          .protectedClearingTransferByPartition(protectedClearingOperation, amount, signer_C.address, signature);
        // HOLDS
        protectedClearingOperation.nonce = 2;
        const messageHold = {
          _protectedClearingOperation: protectedClearingOperation,
          _hold: hold,
        };
        // Sign the message hash
        const signatureHold = await signer_A.signTypedData(domain, clearingCreateHoldType, messageHold);
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        await asset
          .connect(signer_B)
          .protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, signatureHold);
        // REDEEMS
        protectedClearingOperation.nonce = 3;
        const messageRedeem = {
          _protectedClearingOperation: protectedClearingOperation,
          _amount: amount,
        };
        // Sign the message hash
        const signatureRedeem = await signer_A.signTypedData(domain, clearingRedeemType, messageRedeem);
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        await asset
          .connect(signer_B)
          .protectedClearingRedeemByPartition(protectedClearingOperation, amount, signatureRedeem);
      });
    });

    describe("Compliance", () => {
      it("GIVEN a successful protected clearing transfer THEN compliance contract is called", async () => {
        await asset.connect(signer_A).activateClearing();
        // TRANSFERS
        const message = {
          _protectedClearingOperation: protectedClearingOperation,
          _amount: amount,
          _to: signer_C.address,
        };
        // Sign the message hash
        const signature = await signer_A.signTypedData(domain, clearingTransferType, message);
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        await asset
          .connect(signer_B)
          .protectedClearingTransferByPartition(protectedClearingOperation, amount, signer_C.address, signature);
        const clearingIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          clearingId: 1,
          clearingOperationType: 0,
        };
        await asset.approveClearingOperationByPartition(clearingIdentifier);
        expect(await complianceMock.transferredHit()).to.equal(1);
      });

      it("GIVEN a successful protected transfer THEN compliance contract is called", async () => {
        const deadline = MAX_UINT256;

        const message = {
          _partition: DEFAULT_PARTITION,
          _from: signer_A.address,
          _to: signer_B.address,
          _amount: amount,
          _deadline: deadline,
          _nounce: 1,
        };

        const signature = await signer_A.signTypedData(domain, transferType, message);

        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await asset
          .connect(signer_B)
          .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_B.address, amount, {
            deadline: deadline,
            nounce: 1,
            signature: signature,
          });
        expect(await complianceMock.transferredHit()).to.equal(1);
      });
    });
  });
});
