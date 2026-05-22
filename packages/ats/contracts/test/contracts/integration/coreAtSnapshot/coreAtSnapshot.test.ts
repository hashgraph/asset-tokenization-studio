// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ATS_ROLES, EMPTY_STRING, ZERO } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const EMPTY_VC_ID = EMPTY_STRING;
const DEFAULT_DECIMALS = 6;

describe("CoreAtSnapshot Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;

  let asset: IAsset;

  async function deployEquity() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.ROLE_SNAPSHOT,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_ISSUER,
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
    ]);

    await asset.connect(signer_A).addIssuer(signer_B.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
  }

  beforeEach(async () => {
    await loadFixture(deployEquity);
  });

  describe("decimalsAtSnapshot", () => {
    it("GIVEN no snapshot taken WHEN decimalsAtSnapshot at id 0 THEN reverts with SnapshotIdNull", async () => {
      await expect(asset.decimalsAtSnapshot(0)).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
    });

    it("GIVEN no snapshot taken WHEN decimalsAtSnapshot at unknown id THEN reverts with SnapshotIdDoesNotExists", async () => {
      await expect(asset.decimalsAtSnapshot(1)).to.be.revertedWithCustomError(asset, "SnapshotIdDoesNotExists");
    });

    it("GIVEN a snapshot taken WHEN decimalsAtSnapshot THEN returns the token decimals at that snapshot", async () => {
      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000,
        data: "0x",
      });

      const snapshotId = await asset.connect(signer_A).takeSnapshot.staticCall();
      await asset.connect(signer_A).takeSnapshot();

      expect(await asset.decimalsAtSnapshot(snapshotId)).to.equal(DEFAULT_DECIMALS);
    });
  });
  describe.skip("initializeCoreAtSnapshot", () => {
    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeCoreAtSnapshot is called THEN it reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_B).initializeCoreAtSnapshot()).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    describe("when already initialised", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).initializeCoreAtSnapshot();
      });

      it("GIVEN an already-initialised facet WHEN initializeCoreAtSnapshot is called again THEN it reverts with FacetAlreadyRegistered", async () => {
        await expect(asset.connect(signer_A).initializeCoreAtSnapshot()).to.be.revertedWithCustomError(
          asset,
          "FacetAlreadyRegistered",
        );
      });
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeCoreAtSnapshot is called THEN it emits CoreAtSnapshotInitialized", async () => {
      await expect(asset.connect(signer_A).initializeCoreAtSnapshot()).to.emit(asset, "CoreAtSnapshotInitialized");
    });
  });
});
