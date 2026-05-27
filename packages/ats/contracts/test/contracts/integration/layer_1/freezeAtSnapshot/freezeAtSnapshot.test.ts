// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset, MockDiamondCut } from "@contract-types";
import { ZERO, EMPTY_STRING, ATS_ROLES, DEFAULT_PARTITION, FREEZE_AT_SNAPSHOT_RESOLVER_KEY } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const AMOUNT = 1000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("FreezeAtSnapshot Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  function set_initRbacs(): any[] {
    return [
      {
        role: ATS_ROLES.ROLE_ISSUER,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_PAUSER,
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
        role: ATS_ROLES.ROLE_FREEZE_MANAGER,
        members: [signer_B.address],
      },
    ];
  }

  async function deploySingleParitionFixture() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: false,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
    await executeRbac(asset, set_initRbacs());
  }

  beforeEach(async () => {
    await loadFixture(deploySingleParitionFixture);
  });

  it("GIVEN an account with snapshot role WHEN takeSnapshot and Freeze THEN frozen balance is captured per snapshot", async () => {
    const TINY_AMOUNT = 10;

    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_A.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_FREEZE_MANAGER, signer_A.address);
    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

    await asset.connect(signer_A).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_C.address,
      value: TINY_AMOUNT,
      data: "0x",
    });

    // snapshot
    await asset.connect(signer_A).takeSnapshot();

    // Operations
    await asset.connect(signer_A).freezePartialTokens(signer_C.address, 1);
    await asset.connect(signer_A).freezePartialTokens(signer_C.address, 1);

    // snapshot
    await asset.connect(signer_A).takeSnapshot();

    // Operations
    await asset.connect(signer_A).unfreezePartialTokens(signer_C.address, 1);

    // snapshot
    await asset.connect(signer_A).takeSnapshot();

    // checks
    expect(await asset.frozenBalanceOfAtSnapshot(1, signer_C.address)).to.equal(0);
    expect(await asset.frozenBalanceOfAtSnapshot(2, signer_C.address)).to.equal(2);
    expect(await asset.frozenBalanceOfAtSnapshot(3, signer_C.address)).to.equal(1);
  });

  it("GIVEN frozen tokens WHEN querying historical snapshot THEN balance and frozen amounts are tracked separately", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_A.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_FREEZE_MANAGER, signer_A.address);
    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

    await asset.issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_C.address,
      value: AMOUNT,
      data: "0x",
    });

    // snapshot
    await asset.connect(signer_A).takeSnapshot();

    // Freeze some tokens
    await asset.connect(signer_A).freezePartialTokens(signer_C.address, 100);

    // snapshot
    await asset.connect(signer_A).takeSnapshot();

    // Check snapshots track balance and frozen separately
    const balance1 = await asset.balanceOfAtSnapshot(1, signer_C.address);
    const frozen1 = await asset.frozenBalanceOfAtSnapshot(1, signer_C.address);
    const balance2 = await asset.balanceOfAtSnapshot(2, signer_C.address);
    const frozen2 = await asset.frozenBalanceOfAtSnapshot(2, signer_C.address);

    expect(balance1).to.equal(AMOUNT); // Full balance, no frozen
    expect(frozen1).to.equal(0); // No frozen tokens yet
    expect(balance2).to.equal(AMOUNT - 100); // Balance reduced
    expect(frozen2).to.equal(100); // Frozen tokens tracked
    expect(balance2 + frozen2).to.equal(AMOUNT); // Total remains same
  });

  describe("initializeFreezeAtSnapshot", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeFreezeAtSnapshot is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeFreezeAtSnapshot())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeFreezeAtSnapshot is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeFreezeAtSnapshot())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(FREEZE_AT_SNAPSHOT_RESOLVER_KEY, 1);
    });
  });

  describe("initializeFreezeAtSnapshot event", () => {
    it("GIVEN a fresh deployment WHEN initializeFreezeAtSnapshot is called THEN emits FreezeAtSnapshotInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(FREEZE_AT_SNAPSHOT_RESOLVER_KEY);
      await expect(asset.initializeFreezeAtSnapshot()).to.emit(asset, "FreezeAtSnapshotInitialized");
    });
  });
});
