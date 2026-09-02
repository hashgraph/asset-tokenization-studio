// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock, ComplianceMock, IdentityRegistryMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { ATS_ROLES, EMPTY_STRING, ZERO } from "@scripts";

const AMOUNT = 1000;
const EMPTY_VC_ID = EMPTY_STRING;

/**
 * An ERC-3643 module that answers every selector with success and empty returndata.
 *
 * `ERC1594StorageWrapper` inspects the returndata of its `ICompliance` and
 * `IIdentityRegistry` staticcalls and treats an empty answer as approval, so any address
 * of this shape silently disables the seam it is wired to. An externally owned account, a
 * contract with a silent fallback, a Hedera system contract and a Hedera token's HIP-719
 * facade all behave this way; only the second is needed to reproduce the seam on any EVM.
 */
export function silentModuleTests(getCtx: () => AssetMockCtx): void {
  describe("ERC3643 Silent Module Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let signer_E: HardhatEthersSigner;

    let asset: IAssetMock;
    let silentModule: string;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_D = ctx.user3;
      signer_E = ctx.user4;
      asset = ctx.asset;

      const silent = await (await ethers.getContractFactory("MockedSilentModule", signer_A)).deploy();
      await silent.waitForDeployment();
      silentModule = silent.target as string;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_AGENT, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_TREX_OWNER, members: [signer_A.address] },
      ]);

      await asset.grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
      await asset.addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

      // Both modules default to address(0) on the shared fixture, so the balance is minted
      // before the module under test is wired in.
      await asset.mint(signer_E.address, AMOUNT);
    });

    describe("compliance seam", () => {
      it("GIVEN a permissive ComplianceMock WHEN transfer THEN it succeeds", async () => {
        const complianceMock: ComplianceMock = await (
          await ethers.getContractFactory("ComplianceMock", signer_A)
        ).deploy(true, false);
        await complianceMock.waitForDeployment();
        await asset.connect(signer_A).setCompliance(complianceMock.target as string);

        await expect(asset.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.not.be.reverted;
      });

      it("GIVEN a denying ComplianceMock WHEN transfer THEN it reverts with ComplianceNotAllowed", async () => {
        const complianceMock: ComplianceMock = await (
          await ethers.getContractFactory("ComplianceMock", signer_A)
        ).deploy(false, false);
        await complianceMock.waitForDeployment();
        await asset.connect(signer_A).setCompliance(complianceMock.target as string);

        await expect(asset.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.be.revertedWithCustomError(
          asset,
          "ComplianceNotAllowed",
        );
      });

      it("GIVEN a compliance that answers with empty returndata WHEN transfer THEN it reverts with ComplianceCallFailed", async () => {
        await asset.connect(signer_A).setCompliance(silentModule);

        await expect(asset.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.be.revertedWithCustomError(
          asset,
          "ComplianceCallFailed",
        );
      });

      it("GIVEN no compliance configured WHEN transfer THEN it succeeds", async () => {
        await expect(asset.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.not.be.reverted;
      });
    });

    describe("identity registry seam", () => {
      it("GIVEN a verifying IdentityRegistryMock WHEN transfer THEN it succeeds", async () => {
        const identityRegistryMock: IdentityRegistryMock = await (
          await ethers.getContractFactory("IdentityRegistryMock", signer_A)
        ).deploy(true, false);
        await identityRegistryMock.waitForDeployment();
        await asset.connect(signer_A).setIdentityRegistry(identityRegistryMock.target as string);

        await expect(asset.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.not.be.reverted;
      });

      it("GIVEN a rejecting IdentityRegistryMock WHEN transfer THEN it reverts with AddressNotVerified", async () => {
        const identityRegistryMock: IdentityRegistryMock = await (
          await ethers.getContractFactory("IdentityRegistryMock", signer_A)
        ).deploy(false, false);
        await identityRegistryMock.waitForDeployment();
        await asset.connect(signer_A).setIdentityRegistry(identityRegistryMock.target as string);

        await expect(asset.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.be.revertedWithCustomError(
          asset,
          "AddressNotVerified",
        );
      });

      it("GIVEN an identity registry that answers with empty returndata WHEN transfer THEN it reverts with IdentityRegistryCallFailed", async () => {
        await asset.connect(signer_A).setIdentityRegistry(silentModule);

        await expect(asset.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.be.revertedWithCustomError(
          asset,
          "IdentityRegistryCallFailed",
        );
      });

      it("GIVEN no identity registry configured WHEN transfer THEN it succeeds", async () => {
        await expect(asset.connect(signer_E).transfer(signer_D.address, AMOUNT / 2)).to.not.be.reverted;
      });
    });
  });
}
