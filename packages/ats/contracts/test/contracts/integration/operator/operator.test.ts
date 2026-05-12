// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ATS_ROLES, EMPTY_STRING, ZERO } from "@scripts";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const EMPTY_VC_ID = EMPTY_STRING;

describe("Operator Facet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deployFixture() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);

    await executeRbac(asset, [
      { role: ATS_ROLES.ISSUER_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.KYC_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.PAUSER_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.CONTROL_LIST_ROLE, members: [signer_A.address] },
    ]);

    await asset.addIssuer(signer_A.address);
    await asset.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("isOperator", () => {
    it("GIVEN no authorization WHEN isOperator is called THEN returns false", async () => {
      expect(await asset.isOperator(signer_B.address, signer_C.address)).to.equal(false);
    });

    it("GIVEN an authorized operator WHEN isOperator is called THEN returns true", async () => {
      await asset.connect(signer_C).authorizeOperator(signer_B.address);
      expect(await asset.isOperator(signer_B.address, signer_C.address)).to.equal(true);
    });

    it("GIVEN a revoked operator WHEN isOperator is called THEN returns false", async () => {
      await asset.connect(signer_C).authorizeOperator(signer_B.address);
      await asset.connect(signer_C).revokeOperator(signer_B.address);
      expect(await asset.isOperator(signer_B.address, signer_C.address)).to.equal(false);
    });
  });

  describe("authorizeOperator", () => {
    it("GIVEN KYC'd addresses WHEN authorizeOperator THEN emits AuthorizedOperator and OperatorAuthorized and state is updated", async () => {
      await expect(asset.connect(signer_C).authorizeOperator(signer_B.address))
        .to.emit(asset, "AuthorizedOperator")
        .withArgs(signer_B.address, signer_C.address)
        .to.emit(asset, "OperatorAuthorized")
        .withArgs(signer_B.address, signer_C.address);

      expect(await asset.isOperator(signer_B.address, signer_C.address)).to.equal(true);
    });

    it("GIVEN a paused token WHEN authorizeOperator THEN reverts with IsPaused", async () => {
      await asset.pause();
      await expect(asset.connect(signer_C).authorizeOperator(signer_B.address)).to.be.revertedWithCustomError(
        asset,
        "IsPaused",
      );
    });

    it("GIVEN a blocked operator WHEN authorizeOperator THEN reverts with AccountIsBlocked", async () => {
      await asset.addToControlList(signer_B.address);
      await expect(asset.connect(signer_C).authorizeOperator(signer_B.address)).to.be.revertedWithCustomError(
        asset,
        "AccountIsBlocked",
      );
    });
  });

  describe("revokeOperator", () => {
    it("GIVEN an authorized operator WHEN revokeOperator THEN emits RevokedOperator and OperatorRevoked and state is updated", async () => {
      await asset.connect(signer_C).authorizeOperator(signer_B.address);

      await expect(asset.connect(signer_C).revokeOperator(signer_B.address))
        .to.emit(asset, "RevokedOperator")
        .withArgs(signer_B.address, signer_C.address)
        .to.emit(asset, "OperatorRevoked")
        .withArgs(signer_B.address, signer_C.address);

      expect(await asset.isOperator(signer_B.address, signer_C.address)).to.equal(false);
    });

    it("GIVEN a paused token WHEN revokeOperator THEN reverts with IsPaused", async () => {
      await asset.connect(signer_C).authorizeOperator(signer_B.address);
      await asset.pause();
      await expect(asset.connect(signer_C).revokeOperator(signer_B.address)).to.be.revertedWithCustomError(
        asset,
        "IsPaused",
      );
    });

    it("GIVEN a blocked operator WHEN revokeOperator THEN reverts with AccountIsBlocked", async () => {
      await asset.connect(signer_C).authorizeOperator(signer_B.address);
      await asset.addToControlList(signer_B.address);
      await expect(asset.connect(signer_C).revokeOperator(signer_B.address)).to.be.revertedWithCustomError(
        asset,
        "AccountIsBlocked",
      );
    });
  });
});
