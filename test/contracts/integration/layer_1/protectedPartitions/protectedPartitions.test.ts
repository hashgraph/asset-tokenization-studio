// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers, network } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { IAssetMock, ComplianceMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { DEFAULT_PARTITION, ZERO, EMPTY_STRING, ADDRESS_ZERO, ATS_ROLES, RESOLVER_KEYS } from "@lib";
import { EVENT_NAMES, MAX_UINT256, expectExactlyOneEvent } from "@test";
import { executeRbac } from "@test";

const amount = 1;

const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
  ["bytes32", "bytes32"],
  [ATS_ROLES.ROLE_PROTECTED_PARTITIONS_PARTICIPANT, DEFAULT_PARTITION],
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
    { name: "_nonce", type: "uint256" },
  ],
};

const EMPTY_VC_ID = EMPTY_STRING;

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

export function protectedPartitionsTests(getCtx: () => AssetMockCtx): void {
  describe("ProtectedPartitions Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;
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
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_WILD_CARD, wildCard_Account);

      await asset.connect(signer_B).issueByPartition({
        partition: issue_Partition,
        tokenHolder: issue_Account,
        value: issue_Amount,
        data: "0x",
      });
    }

    async function grantKyc() {
      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    }

    function set_initRbacs(): any[] {
      return [
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_CONTROL_LIST,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_ISSUER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_PROTECTED_PARTITIONS,
          members: [signer_B.address],
        },
        {
          role: ProtectedPartitionRole_1,
          members: [signer_A.address, signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_LOCKER,
          members: [signer_B.address],
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
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_CLEARING_VALIDATOR,
          members: [signer_A.address],
        },
      ];
    }

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;
      asset = ctx.asset;

      const expirationTimestamp = MAX_UINT256;

      hold = {
        amount: 1,
        expirationTimestamp: BigInt(expirationTimestamp.toString()),
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x1234",
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

    describe("initializeProtectedPartitions", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeProtectedPartitions is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeProtectedPartitions(true))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeProtectedPartitions is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeProtectedPartitions(true)).to.be.revertedWithCustomError(
          asset,
          "FacetAlreadyRegistered",
        );
      });
    });

    describe("initializeProtectedPartitions event", () => {
      it("GIVEN a fresh deployment WHEN initializeProtectedPartitions is called THEN emits ProtectedPartitionsInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.protectedPartitions);
        await expect(asset.initializeProtectedPartitions(true)).to.emit(asset, "ProtectedPartitionsInitialized");
      });
    });

    describe("Generic set Partition Status Tests", () => {
      beforeEach(async () => {
        await executeRbac(asset, set_initRbacs());
        await grantKyc();
        await asset.connect(signer_B).protectPartitions();
      });

      it("GIVEN a paused security role WHEN protecting or unprotecting partitions THEN transaction fails with Paused", async () => {
        await asset.connect(signer_B).pause();

        await expect(asset.connect(signer_B).protectPartitions()).to.be.revertedWithCustomError(asset, "IsPaused");

        await expect(asset.connect(signer_B).unprotectPartitions()).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN a account without the protected partition role WHEN protecting or unprotecting partitions THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.protectPartitions()).to.be.revertedWithCustomError(asset, "AccountHasNoRole");

        await expect(asset.unprotectPartitions()).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });
    });

    describe("Unprotected Partitions", () => {
      beforeEach(async () => {
        await executeRbac(asset, set_initRbacs());
        await grantKyc();
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
    });

    describe("Protected Partitions", () => {
      beforeEach(async () => {
        await executeRbac(asset, set_initRbacs());

        const ComplianceMockFactory = await ethers.getContractFactory("ComplianceMock", signer_A);
        const complianceMockInstance = await ComplianceMockFactory.deploy(true, false);
        await complianceMockInstance.waitForDeployment();
        complianceMockAddress = complianceMockInstance.target as string;
        complianceMock = await ethers.getContractAt("ComplianceMock", complianceMockAddress);

        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_TREX_OWNER, signer_A.address);
        await asset.connect(signer_A).setCompliance(complianceMockAddress);
        await asset.connect(signer_B).protectPartitions();
        await grantKyc();

        domain.name = (await asset.getERC20Metadata()).info.name;
        domain.version = (await asset.getConfigInfo()).configurationVersion_.toString();
        domain.chainId = await network.provider.send("eth_chainId");
        domain.verifyingContract = asset.target as string;
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

        it("GIVEN a signed protected transfer with nonce > currentNonce+1 WHEN executed THEN reverts with WrongNonce (FIND-073)", async () => {
          const deadline = MAX_UINT256;
          const NONCE_GAP = 1000;
          const signature = await signer_A.signTypedData(domain, transferType, {
            _partition: DEFAULT_PARTITION,
            _from: signer_A.address,
            _to: signer_B.address,
            _amount: amount,
            _deadline: deadline,
            _nonce: NONCE_GAP,
          });
          await asset.connect(signer_B).issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: amount,
            data: "0x",
          });
          await expect(
            asset
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_B.address, amount, {
                deadline,
                nonce: NONCE_GAP,
                signature,
              }),
          ).to.be.revertedWithCustomError(asset, "WrongNonce");
        });

        it("GIVEN three pre-signed transfers with consecutive nonces WHEN executed in order THEN all succeed and nonce is 3 (FIND-073)", async () => {
          const deadline = MAX_UINT256;
          const signatures: string[] = [];
          for (let n = 1; n <= 3; n++) {
            signatures.push(
              await signer_A.signTypedData(domain, transferType, {
                _partition: DEFAULT_PARTITION,
                _from: signer_A.address,
                _to: signer_B.address,
                _amount: amount,
                _deadline: deadline,
                _nonce: n,
              }),
            );
          }
          await asset.connect(signer_B).issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: 3 * amount,
            data: "0x",
          });
          for (let n = 1; n <= 3; n++) {
            await asset
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_B.address, amount, {
                deadline,
                nonce: n,
                signature: signatures[n - 1],
              });
          }
          expect(await asset.nonces(signer_A.address)).to.equal(3);
        });

        it("GIVEN a correct signature WHEN performing a protected transfer THEN transaction succeeds", async () => {
          const deadline = MAX_UINT256;

          const message = {
            _partition: DEFAULT_PARTITION,
            _from: signer_A.address,
            _to: signer_B.address,
            _amount: amount,
            _deadline: deadline,
            _nonce: 1,
          };

          // Sign the message hash
          const signature = await signer_A.signTypedData(domain, transferType, message);

          await asset.connect(signer_B).issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: amount,
            data: "0x",
          });

          const tx = asset
            .connect(signer_B)
            .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_B.address, amount, {
              deadline: deadline,
              nonce: 1,
              signature: signature,
            });
          await expect(tx)
            .to.emit(asset, EVENT_NAMES.PROTECTED_TRANSFERRED_BY_PARTITION)
            .withArgs(signer_B.address, signer_A.address, signer_B.address, amount, DEFAULT_PARTITION, [
              deadline,
              1,
              signature,
            ]);
          const receipt = await (await tx).wait();
          expectExactlyOneEvent(receipt!, asset, EVENT_NAMES.PROTECTED_TRANSFERRED_BY_PARTITION);
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
            asset
              .connect(signer_B)
              .operatorClearingTransferByPartition(clearingOperationFrom, amount, signer_C.address),
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

        it("GIVEN signed protected clearing ops with nonce > currentNonce+1 WHEN executed THEN revert with WrongNonce (FIND-073)", async () => {
          const NONCE_GAP = 1000;
          protectedClearingOperation.nonce = NONCE_GAP;

          const signatureTransfer = await signer_A.signTypedData(domain, clearingTransferType, {
            _protectedClearingOperation: protectedClearingOperation,
            _amount: amount,
            _to: signer_C.address,
          });
          await expect(
            asset
              .connect(signer_B)
              .protectedClearingTransferByPartition(
                protectedClearingOperation,
                amount,
                signer_C.address,
                signatureTransfer,
              ),
          ).to.be.revertedWithCustomError(asset, "WrongNonce");

          const signatureHold = await signer_A.signTypedData(domain, clearingCreateHoldType, {
            _protectedClearingOperation: protectedClearingOperation,
            _hold: hold,
          });
          await expect(
            asset
              .connect(signer_B)
              .protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, signatureHold),
          ).to.be.revertedWithCustomError(asset, "WrongNonce");

          const signatureRedeem = await signer_A.signTypedData(domain, clearingRedeemType, {
            _protectedClearingOperation: protectedClearingOperation,
            _amount: amount,
          });
          await expect(
            asset
              .connect(signer_B)
              .protectedClearingRedeemByPartition(protectedClearingOperation, amount, signatureRedeem),
          ).to.be.revertedWithCustomError(asset, "WrongNonce");
        });

        it("GIVEN a wrong nonce WHEN performing a protected clearing THEN transaction fails with WrongNonce", async () => {
          protectedClearingOperation.nonce = 0;

          //TRANSFER
          await expect(
            asset
              .connect(signer_B)
              .protectedClearingTransferByPartition(protectedClearingOperation, amount, signer_C.address, "0x1234"),
          ).to.be.revertedWithCustomError(asset, "WrongNonce");
          // HOLD
          await expect(
            asset.connect(signer_B).protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, "0x1234"),
          ).to.be.revertedWithCustomError(asset, "WrongNonce");
          //REDEEM
          await expect(
            asset.connect(signer_B).protectedClearingRedeemByPartition(protectedClearingOperation, amount, "0x1234"),
          ).to.be.revertedWithCustomError(asset, "WrongNonce");
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
          const tx = asset
            .connect(signer_B)
            .protectedClearingTransferByPartition(protectedClearingOperation, amount, signer_C.address, signature);
          await expect(tx)
            .to.emit(asset, EVENT_NAMES.PROTECTED_CLEARED_TRANSFER_BY_PARTITION)
            .withArgs(
              signer_B.address,
              protectedClearingOperation.from,
              signer_C.address,
              protectedClearingOperation.clearingOperation.partition,
              anyValue,
              amount,
              protectedClearingOperation.clearingOperation.expirationTimestamp,
              protectedClearingOperation.clearingOperation.data,
              "0x",
            );
          const receipt = await (await tx).wait();
          expectExactlyOneEvent(receipt!, asset, EVENT_NAMES.PROTECTED_CLEARED_TRANSFER_BY_PARTITION);
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
          const txHold = asset
            .connect(signer_B)
            .protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, signatureHold);
          await expect(txHold).to.emit(asset, EVENT_NAMES.PROTECTED_CLEARED_HOLD_BY_PARTITION).withArgs(
            signer_B.address, // operator
            protectedClearingOperation.from, // tokenHolder
            protectedClearingOperation.clearingOperation.partition, // partition
            anyValue, // clearingId (runtime)
            [hold.amount, hold.expirationTimestamp, hold.escrow, hold.to, hold.data], // hold tuple
            protectedClearingOperation.clearingOperation.expirationTimestamp, // expirationDate
            protectedClearingOperation.clearingOperation.data, // data
            "0x", // operatorData
          );
          const receiptHold = await (await txHold).wait();
          expectExactlyOneEvent(receiptHold!, asset, EVENT_NAMES.PROTECTED_CLEARED_HOLD_BY_PARTITION);
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
          const txRedeem = asset
            .connect(signer_B)
            .protectedClearingRedeemByPartition(protectedClearingOperation, amount, signatureRedeem);
          await expect(txRedeem)
            .to.emit(asset, EVENT_NAMES.PROTECTED_CLEARED_REDEEM_BY_PARTITION)
            .withArgs(
              signer_B.address,
              protectedClearingOperation.from,
              protectedClearingOperation.clearingOperation.partition,
              anyValue,
              amount,
              protectedClearingOperation.clearingOperation.expirationTimestamp,
              protectedClearingOperation.clearingOperation.data,
              "0x",
            );
          const receiptRedeem = await (await txRedeem).wait();
          expectExactlyOneEvent(receiptRedeem!, asset, EVENT_NAMES.PROTECTED_CLEARED_REDEEM_BY_PARTITION);
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
          const tx = asset
            .connect(signer_B)
            .protectedClearingTransferByPartition(protectedClearingOperation, amount, signer_C.address, signature);
          await expect(tx)
            .to.emit(asset, EVENT_NAMES.PROTECTED_CLEARED_TRANSFER_BY_PARTITION)
            .withArgs(
              signer_B.address,
              protectedClearingOperation.from,
              signer_C.address,
              protectedClearingOperation.clearingOperation.partition,
              anyValue,
              amount,
              protectedClearingOperation.clearingOperation.expirationTimestamp,
              protectedClearingOperation.clearingOperation.data,
              "0x",
            );
          const receipt = await (await tx).wait();
          expectExactlyOneEvent(receipt!, asset, EVENT_NAMES.PROTECTED_CLEARED_TRANSFER_BY_PARTITION);
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
            _nonce: 1,
          };

          const signature = await signer_A.signTypedData(domain, transferType, message);

          await asset.connect(signer_B).issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: amount,
            data: "0x",
          });

          const tx = asset
            .connect(signer_B)
            .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_B.address, amount, {
              deadline: deadline,
              nonce: 1,
              signature: signature,
            });
          await expect(tx)
            .to.emit(asset, EVENT_NAMES.PROTECTED_TRANSFERRED_BY_PARTITION)
            .withArgs(signer_B.address, signer_A.address, signer_B.address, amount, DEFAULT_PARTITION, [
              deadline,
              1,
              signature,
            ]);
          const receipt = await (await tx).wait();
          expectExactlyOneEvent(receipt!, asset, EVENT_NAMES.PROTECTED_TRANSFERRED_BY_PARTITION);
          expect(await complianceMock.transferredHit()).to.equal(1);
        });
      });
    });

    describe("Deactivated", () => {
      it("GIVEN a deactivated asset WHEN protectPartitions THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(asset.connect(signer_A).protectPartitions()).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN unprotectPartitions THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(asset.connect(signer_A).unprotectPartitions()).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN protectedTransferFromByPartition THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset
            .connect(signer_A)
            .protectedTransferFromByPartition(ethers.ZeroHash, ethers.ZeroAddress, ethers.ZeroAddress, 0, {
              deadline: 0,
              nonce: 0,
              signature: "0x",
            }),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN protectedRedeemFromByPartition THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset.connect(signer_A).protectedRedeemFromByPartition(ethers.ZeroHash, ethers.ZeroAddress, 0, {
            deadline: 0,
            nonce: 0,
            signature: "0x",
          }),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN protectedClearingRedeemByPartition THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset.connect(signer_A).protectedClearingRedeemByPartition(
            {
              clearingOperation: { partition: ethers.ZeroHash, expirationTimestamp: 0, data: "0x" },
              from: ethers.ZeroAddress,
              deadline: 0,
              nonce: 0,
            },
            0,
            "0x",
          ),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN protectedClearingTransferByPartition THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset.connect(signer_A).protectedClearingTransferByPartition(
            {
              clearingOperation: { partition: ethers.ZeroHash, expirationTimestamp: 0, data: "0x" },
              from: ethers.ZeroAddress,
              deadline: 0,
              nonce: 0,
            },
            0,
            ethers.ZeroAddress,
            "0x",
          ),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN protectedClearingCreateHoldByPartition THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset.connect(signer_A).protectedClearingCreateHoldByPartition(
            {
              clearingOperation: { partition: ethers.ZeroHash, expirationTimestamp: 0, data: "0x" },
              from: ethers.ZeroAddress,
              deadline: 0,
              nonce: 0,
            },
            { amount: 0, expirationTimestamp: 0, escrow: ethers.ZeroAddress, to: ethers.ZeroAddress, data: "0x" },
            "0x",
          ),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN protectPartitions THEN reverts with AssetNotOperational", async () => {
        await expect(asset.protectPartitions()).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN unprotectPartitions THEN reverts with AssetNotOperational", async () => {
        await expect(asset.unprotectPartitions()).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN protectedTransferFromByPartition THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.protectedTransferFromByPartition(ethers.ZeroHash, ethers.ZeroAddress, ethers.ZeroAddress, 0, {
            deadline: 0,
            nonce: 0,
            signature: "0x",
          }),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN protectedRedeemFromByPartition THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.protectedRedeemFromByPartition(ethers.ZeroHash, ethers.ZeroAddress, 0, {
            deadline: 0,
            nonce: 0,
            signature: "0x",
          }),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN protectedClearingRedeemByPartition THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.protectedClearingRedeemByPartition(
            {
              clearingOperation: { partition: ethers.ZeroHash, expirationTimestamp: 0, data: "0x" },
              from: ethers.ZeroAddress,
              deadline: 0,
              nonce: 0,
            },
            0,
            "0x",
          ),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN protectedClearingTransferByPartition THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.protectedClearingTransferByPartition(
            {
              clearingOperation: { partition: ethers.ZeroHash, expirationTimestamp: 0, data: "0x" },
              from: ethers.ZeroAddress,
              deadline: 0,
              nonce: 0,
            },
            0,
            ethers.ZeroAddress,
            "0x",
          ),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN protectedClearingCreateHoldByPartition THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.protectedClearingCreateHoldByPartition(
            {
              clearingOperation: { partition: ethers.ZeroHash, expirationTimestamp: 0, data: "0x" },
              from: ethers.ZeroAddress,
              deadline: 0,
              nonce: 0,
            },
            { amount: 0, expirationTimestamp: 0, escrow: ethers.ZeroAddress, to: ethers.ZeroAddress, data: "0x" },
            "0x",
          ),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });

    describe("initializeProtectedByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeProtectedByPartition THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeProtectedByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeProtectedByPartition THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeProtectedByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.protectedByPartition, 1);
      });
    });

    describe("initializeProtectedByPartition event", () => {
      it("GIVEN fresh facet WHEN initializeProtectedByPartition THEN emits ProtectedByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.protectedByPartition);
        await expect(asset.initializeProtectedByPartition()).to.emit(asset, "ProtectedByPartitionInitialized");
      });
    });

    describe("initializeProtectedClearingByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeProtectedClearingByPartition THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeProtectedClearingByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeProtectedClearingByPartition THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeProtectedClearingByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.protectedClearingByPartition, 1);
      });
    });

    describe("initializeProtectedClearingByPartition event", () => {
      it("GIVEN fresh facet WHEN initializeProtectedClearingByPartition THEN emits ProtectedClearingByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.protectedClearingByPartition);
        await expect(asset.initializeProtectedClearingByPartition()).to.emit(
          asset,
          "ProtectedClearingByPartitionInitialized",
        );
      });
    });

    describe("initializeProtectedClearingHoldByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeProtectedClearingHoldByPartition THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeProtectedClearingHoldByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeProtectedClearingHoldByPartition THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeProtectedClearingHoldByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.protectedClearingHoldByPartition, 1);
      });
    });

    describe("initializeProtectedClearingHoldByPartition event", () => {
      it("GIVEN fresh facet WHEN initializeProtectedClearingHoldByPartition THEN emits ProtectedClearingHoldByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.protectedClearingHoldByPartition);
        await expect(asset.initializeProtectedClearingHoldByPartition()).to.emit(
          asset,
          "ProtectedClearingHoldByPartitionInitialized",
        );
      });
    });
  });
}
