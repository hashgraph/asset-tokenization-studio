// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers, network } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import type { AssetMockCtx } from "@test";
import { executeRbac, MAX_UINT256, EVENT_NAMES } from "@test";
import { DEFAULT_PARTITION, EMPTY_STRING, ZERO, ADDRESS_ZERO, ATS_ROLES, RESOLVER_KEYS } from "@scripts";
import { IAssetMock } from "@contract-types";
import { ASSET_MOCK_CONFIG_ID } from "../../../fixtures/deploy/assetMockConfiguration";

interface ProtectionData {
  deadline: bigint;
  nonce: number;
  signature: string;
}

const AMOUNT = 10;
const EMPTY_VC_ID = EMPTY_STRING;

export function protectedByPartitionTests(getCtx: () => AssetMockCtx): void {
  describe("ProtectedByPartition Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;

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

    const redeemType = {
      protectedRedeemFromByPartition: [
        { name: "_partition", type: "bytes32" },
        { name: "_from", type: "address" },
        { name: "_amount", type: "uint256" },
        { name: "_deadline", type: "uint256" },
        { name: "_nonce", type: "uint256" },
      ],
    };

    const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "bytes32"],
      [ATS_ROLES.ROLE_PROTECTED_PARTITIONS_PARTICIPANT, DEFAULT_PARTITION],
    );
    const packedDataWithoutPrefix = packedData.slice(2);
    const ProtectedPartitionRole_1 = ethers.keccak256("0x" + packedDataWithoutPrefix);

    function set_initRbacs(): any[] {
      return [
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_CONTROL_LIST, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_PROTECTED_PARTITIONS, members: [signer_B.address] },
        { role: ProtectedPartitionRole_1, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
      ];
    }

    async function grantKyc() {
      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    }

    async function signTransfer(
      from: HardhatEthersSigner,
      to: string,
      amount: number,
      deadline: bigint,
      nonce: number,
    ): Promise<string> {
      return from.signTypedData(domain, transferType, {
        _partition: DEFAULT_PARTITION,
        _from: from.address,
        _to: to,
        _amount: amount,
        _deadline: deadline,
        _nonce: nonce,
      });
    }

    async function signRedeem(
      from: HardhatEthersSigner,
      amount: number,
      deadline: bigint,
      nonce: number,
    ): Promise<string> {
      return from.signTypedData(domain, redeemType, {
        _partition: DEFAULT_PARTITION,
        _from: from.address,
        _amount: amount,
        _deadline: deadline,
        _nonce: nonce,
      });
    }

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;
      asset = ctx.asset;

      domain.name = (await asset.getERC20Metadata()).name;
      domain.version = (await asset.getConfigInfo()).configurationVersion_.toString();
      domain.chainId = await network.provider.send("eth_chainId");
      domain.verifyingContract = asset.target as string;
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

    describe("protectedTransferFromByPartition", () => {
      beforeEach(async () => {
        await executeRbac(asset, set_initRbacs());
        await grantKyc();
        await asset.connect(signer_B).protectPartitions();

        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: AMOUNT,
          data: "0x",
        });
      });

      it("GIVEN valid parameters and signature WHEN protectedTransferFromByPartition THEN transaction succeeds, emits ProtectedTransferredByPartition and updates balances", async () => {
        const deadline = MAX_UINT256;
        const signature = await signTransfer(signer_A, signer_C.address, AMOUNT, deadline, 1);
        const protectionData: ProtectionData = { deadline, nonce: 1, signature };

        const tx = asset
          .connect(signer_B)
          .protectedTransferFromByPartition(
            DEFAULT_PARTITION,
            signer_A.address,
            signer_C.address,
            AMOUNT,
            protectionData,
          );

        await expect(tx)
          .to.emit(asset, EVENT_NAMES.PROTECTED_TRANSFERRED_BY_PARTITION)
          .withArgs(signer_B.address, signer_A.address, signer_C.address, AMOUNT, DEFAULT_PARTITION, [
            deadline,
            1,
            signature,
          ]);
        await expect(tx).to.emit(asset, "Transfer").withArgs(signer_A.address, signer_C.address, AMOUNT);

        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_C.address)).to.equal(AMOUNT);
      });

      it("GIVEN a zero-amount protected transfer WHEN protectedTransferFromByPartition THEN reverts with ZeroValue", async () => {
        const deadline = MAX_UINT256;
        const signature = await signTransfer(signer_A, signer_C.address, 0, deadline, 1);
        const protectionData: ProtectionData = { deadline, nonce: 1, signature };

        await expect(
          asset
            .connect(signer_B)
            .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_C.address, 0, protectionData),
        ).to.be.revertedWithCustomError(asset, "ZeroValue");
      });

      describe("Role-Gated Negative Cases", () => {
        it("GIVEN a caller without the partition role WHEN protectedTransferFromByPartition THEN transaction fails with AccountHasNoRole", async () => {
          await expect(
            asset
              .connect(signer_C)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_C.address, AMOUNT, {
                deadline: MAX_UINT256,
                nonce: 1,
                signature: "0x1234",
              }),
          )
            .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
            .withArgs(signer_C.address, ProtectedPartitionRole_1);
        });
      });

      describe("Token State Checks", () => {
        it("GIVEN a paused token WHEN protectedTransferFromByPartition THEN transaction fails with IsPaused", async () => {
          await asset.connect(signer_B).pause();

          await expect(
            asset
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_C.address, AMOUNT, {
                deadline: MAX_UINT256,
                nonce: 1,
                signature: "0x1234",
              }),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });
      });

      describe("Partition Protection", () => {
        it("GIVEN unprotected partitions WHEN protectedTransferFromByPartition THEN transaction fails with PartitionsAreUnProtected", async () => {
          await asset.connect(signer_B).unprotectPartitions();

          await expect(
            asset
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_C.address, AMOUNT, {
                deadline: MAX_UINT256,
                nonce: 1,
                signature: "0x1234",
              }),
          ).to.be.revertedWithCustomError(asset, "PartitionsAreUnProtected");
        });
      });

      describe("Compliance", () => {
        it("GIVEN a zero address recipient WHEN protectedTransferFromByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
          const deadline = MAX_UINT256;
          const signature = await signTransfer(signer_A, ADDRESS_ZERO, AMOUNT, deadline, 1);

          await expect(
            asset
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, ADDRESS_ZERO, AMOUNT, {
                deadline,
                nonce: 1,
                signature,
              }),
          ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        });
      });

      describe("Signature Validation", () => {
        it("GIVEN a wrong deadline WHEN protectedTransferFromByPartition THEN transaction fails with ExpiredDeadline", async () => {
          await expect(
            asset
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_C.address, AMOUNT, {
                deadline: 1n,
                nonce: 1,
                signature: "0x1234",
              }),
          ).to.be.revertedWithCustomError(asset, "ExpiredDeadline");
        });

        it("GIVEN a wrong signature length WHEN protectedTransferFromByPartition THEN transaction fails with WrongSignatureLength", async () => {
          await expect(
            asset
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_C.address, AMOUNT, {
                deadline: MAX_UINT256,
                nonce: 1,
                signature: "0x12",
              }),
          ).to.be.revertedWithCustomError(asset, "WrongSignatureLength");
        });

        it("GIVEN a wrong signature WHEN protectedTransferFromByPartition THEN transaction fails with WrongSignature", async () => {
          await expect(
            asset
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_C.address, AMOUNT, {
                deadline: MAX_UINT256,
                nonce: 1,
                signature:
                  "0x0011223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344",
              }),
          ).to.be.revertedWithCustomError(asset, "WrongSignature");
        });

        it("GIVEN a wrong nonce WHEN protectedTransferFromByPartition THEN transaction fails with WrongNonce", async () => {
          await expect(
            asset
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_C.address, AMOUNT, {
                deadline: MAX_UINT256,
                nonce: 0,
                signature: "0x1234",
              }),
          ).to.be.revertedWithCustomError(asset, "WrongNonce");
        });

        it("GIVEN a nonce greater than currentNonce+1 WHEN protectedTransferFromByPartition THEN transaction fails with WrongNonce (FIND-073)", async () => {
          const deadline = MAX_UINT256;
          const NONCE_GAP = 1000;
          const signature = await signTransfer(signer_A, signer_C.address, AMOUNT, deadline, NONCE_GAP);

          await expect(
            asset
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_C.address, AMOUNT, {
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
            signatures.push(await signTransfer(signer_A, signer_C.address, 1, deadline, n));
          }

          for (let n = 1; n <= 3; n++) {
            await asset
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_C.address, 1, {
                deadline,
                nonce: n,
                signature: signatures[n - 1],
              });
          }

          expect(await asset.nonces(signer_A.address)).to.equal(3);
        });
      });

      describe("Deactivated", () => {
        it("GIVEN a deactivated asset WHEN protectedTransferFromByPartition THEN transaction fails with Deactivated", async () => {
          await asset.forceDeactivate();
          await expect(
            asset.protectedTransferFromByPartition(ethers.ZeroHash, ethers.ZeroAddress, ethers.ZeroAddress, 0, {
              deadline: 0,
              nonce: 0,
              signature: "0x",
            }),
          ).to.be.revertedWithCustomError(asset, "Deactivated");
        });
      });

      describe("nonOperational", () => {
        it("GIVEN a non-operational asset WHEN protectedTransferFromByPartition THEN transaction fails with AssetNotOperational", async () => {
          await asset.forceNonOperational();
          await expect(
            asset.protectedTransferFromByPartition(ethers.ZeroHash, ethers.ZeroAddress, ethers.ZeroAddress, 0, {
              deadline: 0,
              nonce: 0,
              signature: "0x",
            }),
          )
            .to.be.revertedWithCustomError(asset, "AssetNotOperational")
            .withArgs(ASSET_MOCK_CONFIG_ID, 1);
        });
      });
    });

    describe("protectedRedeemFromByPartition", () => {
      beforeEach(async () => {
        await executeRbac(asset, set_initRbacs());
        await grantKyc();
        await asset.connect(signer_B).protectPartitions();

        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: AMOUNT,
          data: "0x",
        });
      });

      it("GIVEN valid parameters and signature WHEN protectedRedeemFromByPartition THEN transaction succeeds, emits ProtectedRedeemedByPartition and burns tokens", async () => {
        const deadline = MAX_UINT256;
        const signature = await signRedeem(signer_A, AMOUNT, deadline, 1);
        const protectionData: ProtectionData = { deadline, nonce: 1, signature };

        const tx = asset
          .connect(signer_B)
          .protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, AMOUNT, protectionData);

        await expect(tx)
          .to.emit(asset, EVENT_NAMES.PROTECTED_REDEEMED_BY_PARTITION)
          .withArgs(signer_B.address, signer_A.address, AMOUNT, DEFAULT_PARTITION, [deadline, 1, signature]);
        await expect(tx).to.emit(asset, "Transfer").withArgs(signer_A.address, ethers.ZeroAddress, AMOUNT);

        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(0);
      });

      describe("Role-Gated Negative Cases", () => {
        it("GIVEN a caller without the partition role WHEN protectedRedeemFromByPartition THEN transaction fails with AccountHasNoRole", async () => {
          await expect(
            asset.connect(signer_C).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, AMOUNT, {
              deadline: MAX_UINT256,
              nonce: 1,
              signature: "0x1234",
            }),
          )
            .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
            .withArgs(signer_C.address, ProtectedPartitionRole_1);
        });
      });

      describe("Token State Checks", () => {
        it("GIVEN a paused token WHEN protectedRedeemFromByPartition THEN transaction fails with IsPaused", async () => {
          await asset.connect(signer_B).pause();

          await expect(
            asset.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, AMOUNT, {
              deadline: MAX_UINT256,
              nonce: 1,
              signature: "0x1234",
            }),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });
      });

      describe("Partition Protection", () => {
        it("GIVEN unprotected partitions WHEN protectedRedeemFromByPartition THEN transaction fails with PartitionsAreUnProtected", async () => {
          await asset.connect(signer_B).unprotectPartitions();

          await expect(
            asset.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, AMOUNT, {
              deadline: MAX_UINT256,
              nonce: 1,
              signature: "0x1234",
            }),
          ).to.be.revertedWithCustomError(asset, "PartitionsAreUnProtected");
        });
      });

      describe("Compliance", () => {
        it("GIVEN a zero address token holder WHEN protectedRedeemFromByPartition THEN transaction fails with AccountIsBlocked", async () => {
          await expect(
            asset.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, ADDRESS_ZERO, AMOUNT, {
              deadline: MAX_UINT256,
              nonce: 1,
              signature: "0x1234",
            }),
          ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
        });
      });

      describe("Signature Validation", () => {
        it("GIVEN a wrong deadline WHEN protectedRedeemFromByPartition THEN transaction fails with ExpiredDeadline", async () => {
          await expect(
            asset.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, AMOUNT, {
              deadline: 1n,
              nonce: 1,
              signature: "0x1234",
            }),
          ).to.be.revertedWithCustomError(asset, "ExpiredDeadline");
        });

        it("GIVEN a wrong signature length WHEN protectedRedeemFromByPartition THEN transaction fails with WrongSignatureLength", async () => {
          await expect(
            asset.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, AMOUNT, {
              deadline: MAX_UINT256,
              nonce: 1,
              signature: "0x12",
            }),
          ).to.be.revertedWithCustomError(asset, "WrongSignatureLength");
        });

        it("GIVEN a wrong signature WHEN protectedRedeemFromByPartition THEN transaction fails with WrongSignature", async () => {
          await expect(
            asset.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, AMOUNT, {
              deadline: MAX_UINT256,
              nonce: 1,
              signature:
                "0x0011223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344",
            }),
          ).to.be.revertedWithCustomError(asset, "WrongSignature");
        });

        it("GIVEN a wrong nonce WHEN protectedRedeemFromByPartition THEN transaction fails with WrongNonce", async () => {
          await expect(
            asset.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, AMOUNT, {
              deadline: MAX_UINT256,
              nonce: 0,
              signature: "0x1234",
            }),
          ).to.be.revertedWithCustomError(asset, "WrongNonce");
        });

        it("GIVEN a nonce greater than currentNonce+1 WHEN protectedRedeemFromByPartition THEN transaction fails with WrongNonce (FIND-073)", async () => {
          const deadline = MAX_UINT256;
          const NONCE_GAP = 1000;
          const signature = await signRedeem(signer_A, AMOUNT, deadline, NONCE_GAP);

          await expect(
            asset.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, AMOUNT, {
              deadline,
              nonce: NONCE_GAP,
              signature,
            }),
          ).to.be.revertedWithCustomError(asset, "WrongNonce");
        });

        it("GIVEN three pre-signed redemptions with consecutive nonces WHEN executed in order THEN all succeed and nonce is 3 (FIND-073)", async () => {
          const deadline = MAX_UINT256;
          const signatures: string[] = [];
          for (let n = 1; n <= 3; n++) {
            signatures.push(await signRedeem(signer_A, 1, deadline, n));
          }

          for (let n = 1; n <= 3; n++) {
            await asset.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, 1, {
              deadline,
              nonce: n,
              signature: signatures[n - 1],
            });
          }

          expect(await asset.nonces(signer_A.address)).to.equal(3);
        });
      });

      describe("Deactivated", () => {
        it("GIVEN a deactivated asset WHEN protectedRedeemFromByPartition THEN transaction fails with Deactivated", async () => {
          await asset.forceDeactivate();
          await expect(
            asset.protectedRedeemFromByPartition(ethers.ZeroHash, ethers.ZeroAddress, 0, {
              deadline: 0,
              nonce: 0,
              signature: "0x",
            }),
          ).to.be.revertedWithCustomError(asset, "Deactivated");
        });
      });

      describe("nonOperational", () => {
        it("GIVEN a non-operational asset WHEN protectedRedeemFromByPartition THEN transaction fails with AssetNotOperational", async () => {
          await asset.forceNonOperational();
          await expect(
            asset.protectedRedeemFromByPartition(ethers.ZeroHash, ethers.ZeroAddress, 0, {
              deadline: 0,
              nonce: 0,
              signature: "0x",
            }),
          )
            .to.be.revertedWithCustomError(asset, "AssetNotOperational")
            .withArgs(ASSET_MOCK_CONFIG_ID, 1);
        });
      });
    });
  });
}
