// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ADDRESS_ZERO, ATS_ROLES, RESOLVER_KEY_ERC20PERMIT } from "@scripts";
import { executeRbac, getDltTimestamp } from "@test";

export function erc20PermitTests(getCtx: () => AssetMockCtx): void {
  describe("ERC20Permit Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;
      await executeRbac(asset, [
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_A.address],
        },
      ]);
    });

    describe("Single Partition", () => {
      describe("permit", () => {
        it("GIVEN a paused token WHEN permit is called THEN the transaction fails with IsPaused", async () => {
          await asset.pause();

          const expiry = (await getDltTimestamp()) + 3600;

          await expect(
            asset.permit(
              signer_B.address,
              signer_A.address,
              1,
              expiry,
              27,
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            ),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it("GIVEN an owner address of zero WHEN permit is called THEN the transaction fails with ZeroAddressNotAllowed", async () => {
          const expiry = (await getDltTimestamp()) + 3600;

          await expect(
            asset.permit(
              ADDRESS_ZERO,
              signer_A.address,
              1,
              expiry,
              27,
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            ),
          ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        });

        it("GIVEN a spender address of zero WHEN permit is called THEN the transaction fails with ZeroAddressNotAllowed", async () => {
          const expiry = (await getDltTimestamp()) + 3600;

          await expect(
            asset.permit(
              signer_A.address,
              ADDRESS_ZERO,
              1,
              expiry,
              27,
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            ),
          ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        });

        it("GIVEN a blocked owner account WHEN permit is called THEN the transaction fails with AccountIsBlocked", async () => {
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROL_LIST, signer_A.address);
          await asset.connect(signer_A).addToControlList(signer_C.address);

          const expiry = (await getDltTimestamp()) + 3600;

          await expect(
            asset.permit(
              signer_C.address,
              signer_B.address,
              1,
              expiry,
              27,
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            ),
          ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
        });

        it("GIVEN a blocked spender account WHEN permit is called THEN the transaction fails with AccountIsBlocked", async () => {
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROL_LIST, signer_A.address);
          await asset.connect(signer_A).addToControlList(signer_C.address);

          const expiry = (await getDltTimestamp()) + 3600;

          await expect(
            asset.permit(
              signer_B.address,
              signer_C.address,
              1,
              expiry,
              27,
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            ),
          ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
        });

        it("GIVEN an expired signature WHEN permit is called THEN the transaction reverts with ERC2612ExpiredSignature", async () => {
          const expiry = (await getDltTimestamp()) - 3600;

          await expect(
            asset.permit(
              signer_B.address,
              signer_C.address,
              1,
              expiry,
              27,
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            ),
          )
            .to.be.revertedWithCustomError(asset, "ERC2612ExpiredSignature")
            .withArgs(expiry);
        });

        it("GIVEN a signature from a different owner WHEN permit is called THEN the transaction reverts with ERC2612InvalidSigner", async () => {
          const nonce = await asset.nonces(signer_A.address);
          const expiry = (await getDltTimestamp()) + 3600;
          const name = (await asset.getERC20Metadata()).info.name;
          const version = (await asset.getConfigInfo()).version_.toString();
          const verifyingContract = await asset.getAddress();

          const domain = {
            name,
            version,
            chainId: await ethers.provider.getNetwork().then((n) => n.chainId),
            verifyingContract,
          };

          const types = {
            Permit: [
              { name: "owner", type: "address" },
              { name: "spender", type: "address" },
              { name: "value", type: "uint256" },
              { name: "nonce", type: "uint256" },
              { name: "deadline", type: "uint256" },
            ],
          };

          const value = {
            owner: signer_A.address,
            spender: signer_B.address,
            value: 1,
            nonce: nonce,
            deadline: expiry,
          };

          const signature = await signer_A.signTypedData(domain, types, value);
          const sig = ethers.Signature.from(signature);

          await expect(
            asset.permit(signer_B.address, signer_A.address, 1, expiry, sig.v, sig.r, sig.s),
          ).to.be.revertedWithCustomError(asset, "ERC2612InvalidSigner");
        });

        it("GIVEN a valid signature WHEN permit is called THEN the approval succeeds and emits Approval event", async () => {
          const nonce = await asset.nonces(signer_A.address);
          const expiry = (await getDltTimestamp()) + 3600;
          const name = (await asset.getERC20Metadata()).info.name;
          const version = (await asset.getConfigInfo()).version_.toString();
          const verifyingContract = await asset.getAddress();

          const domain = {
            name,
            version,
            chainId: await ethers.provider.getNetwork().then((n) => n.chainId),
            verifyingContract,
          };

          const types = {
            Permit: [
              { name: "owner", type: "address" },
              { name: "spender", type: "address" },
              { name: "value", type: "uint256" },
              { name: "nonce", type: "uint256" },
              { name: "deadline", type: "uint256" },
            ],
          };

          const value = {
            owner: signer_A.address,
            spender: signer_B.address,
            value: 1,
            nonce: nonce,
            deadline: expiry,
          };

          const signature = await signer_A.signTypedData(domain, types, value);
          const sig = ethers.Signature.from(signature);

          await expect(asset.permit(signer_A.address, signer_B.address, 1, expiry, sig.v, sig.r, sig.s))
            .to.emit(asset, "Approval")
            .withArgs(signer_A.address, signer_B.address, 1);
        });
      });
    });

    describe("Multi Partition", () => {
      it("GIVEN a token with multi-partition enabled WHEN permit is called THEN the transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await asset.setMultiPartition(true);

        const expiry = (await getDltTimestamp()) + 3600;

        await expect(
          asset.permit(
            signer_B.address,
            signer_C.address,
            1,
            expiry,
            27,
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ),
        ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
      });
    });

    describe("onlyUnrecoveredAddress modifier for permit", () => {
      it("GIVEN a recovered owner address WHEN calling permit THEN transaction fails with WalletRecovered", async () => {
        await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_A.address);
        await asset.recoveryAddress(signer_B.address, signer_C.address, ADDRESS_ZERO);

        const expiry = (await getDltTimestamp()) + 3600;

        await expect(
          asset.permit(
            signer_B.address,
            signer_A.address,
            1,
            expiry,
            27,
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });

      it("GIVEN a recovered spender address WHEN calling permit THEN transaction fails with WalletRecovered", async () => {
        await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_A.address);
        await asset.recoveryAddress(signer_C.address, signer_B.address, ADDRESS_ZERO);

        const expiry = (await getDltTimestamp()) + 3600;

        await expect(
          asset.permit(
            signer_A.address,
            signer_C.address,
            1,
            expiry,
            27,
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN permit THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.permit(ADDRESS_ZERO, ADDRESS_ZERO, 0, 0, 0, ethers.ZeroHash, ethers.ZeroHash),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeERC20Permit", () => {
      it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeERC20Permit is called THEN it reverts with AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeERC20Permit()).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN an already-initialised facet WHEN initializeERC20Permit is called again THEN it reverts with FacetAlreadyRegistered", async () => {
        await expect(asset.initializeERC20Permit()).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
      });
    });

    describe("initializeERC20Permit event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeERC20Permit is called THEN it emits ERC20PermitInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_ERC20PERMIT);
        await expect(asset.initializeERC20Permit()).to.emit(asset, "ERC20PermitInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN permit THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.permit(ADDRESS_ZERO, ADDRESS_ZERO, 0, 0, 0, ethers.ZeroHash, ethers.ZeroHash),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
