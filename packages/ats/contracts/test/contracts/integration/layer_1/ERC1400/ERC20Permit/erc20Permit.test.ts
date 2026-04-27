// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ADDRESS_ZERO, ATS_ROLES } from "@scripts";
import { deployEquityTokenFixture, executeRbac, getDltTimestamp } from "@test";

describe("ERC20Permit Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  beforeEach(async () => {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
    await executeRbac(asset, [
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_A.address],
      },
    ]);
  });

  describe("Single Partition", () => {
    describe("Domain Separator", () => {
      it("GIVEN a deployed contract WHEN DOMAIN_SEPARATOR is called THEN the correct domain separator is returned", async () => {
        const domainSeparator = await asset.DOMAIN_SEPARATOR();
        const CONTRACT_NAME = (await asset.getERC20Metadata()).info.name;
        const CONTRACT_VERSION = (await asset.getConfigInfo()).version_.toString();
        const domain = {
          name: CONTRACT_NAME,
          version: CONTRACT_VERSION,
          chainId: await ethers.provider.getNetwork().then((n) => n.chainId),
          verifyingContract: diamond.target as string,
        };
        const domainHash = ethers.TypedDataEncoder.hashDomain(domain);
        expect(domainSeparator).to.equal(domainHash);
      });
    });

    describe("permit", () => {
      it("GIVEN a paused token WHEN permit is called THEN the transaction fails with TokenIsPaused", async () => {
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
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
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
        // Blacklisting accounts
        await asset.connect(signer_A).grantRole(ATS_ROLES.CONTROL_LIST_ROLE, signer_A.address);
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
        await asset.connect(signer_A).grantRole(ATS_ROLES.CONTROL_LIST_ROLE, signer_A.address);
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
        const expiry = (await getDltTimestamp()) - 3600; // 1 hour ago

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
        const expiry = (await getDltTimestamp()) + 3600; // 1 hour in the future
        const CONTRACT_NAME = (await asset.getERC20Metadata()).info.name;
        const CONTRACT_VERSION = (await asset.getConfigInfo()).version_.toString();

        const domain = {
          name: CONTRACT_NAME,
          version: CONTRACT_VERSION,
          chainId: await ethers.provider.getNetwork().then((n) => n.chainId),
          verifyingContract: diamond.target as string,
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
        const expiry = (await getDltTimestamp()) + 3600; // 1 hour in the future
        const CONTRACT_NAME = (await asset.getERC20Metadata()).info.name;
        const CONTRACT_VERSION = (await asset.getConfigInfo()).version_.toString();

        const domain = {
          name: CONTRACT_NAME,
          version: CONTRACT_VERSION,
          chainId: await ethers.provider.getNetwork().then((n) => n.chainId),
          verifyingContract: diamond.target as string,
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
    it("GIVEN a new diamond contract with multi-partition enabled WHEN permit is called THEN the transaction fails with NotAllowedInMultiPartitionMode", async () => {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: { isMultiPartition: true },
        },
      });

      const expiry = (await getDltTimestamp()) + 3600;

      await expect(
        (asset.attach(base.diamond.target) as IAsset).permit(
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
      // Grant _AGENT_ROLE to recover address
      await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);

      // Recover signer_B (owner) address
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
      // Grant _AGENT_ROLE to recover address
      await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);

      // Recover signer_C (spender) address
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
});
