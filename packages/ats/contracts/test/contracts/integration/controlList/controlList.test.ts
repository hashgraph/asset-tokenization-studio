// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ATS_ROLES } from "@scripts";
import { deployEquityTokenFixture } from "@test";
import { grantRoleAndPauseToken } from "@test";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { executeRbac } from "@test";

describe("Control List Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let asset: IAsset;

  async function deployEquityWithControlListFixture() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [{ role: ATS_ROLES.PAUSER_ROLE, members: [signer_B.address] }]);
  }

  beforeEach(async () => {
    await loadFixture(deployEquityWithControlListFixture);
  });

  it("GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized", async () => {
    await expect(asset.initializeControlList(true)).to.be.rejectedWith("AlreadyInitialized");
  });

  it("GIVEN an account without controlList role WHEN addToControlList THEN transaction fails with AccountHasNoRole", async () => {
    await expect(asset.connect(signer_B).addToControlList(signer_C.address)).to.be.rejectedWith("AccountHasNoRole");
  });

  it("GIVEN an account without controlList role WHEN removeFromControlList THEN transaction fails with AccountHasNoRole", async () => {
    await expect(asset.connect(signer_B).removeFromControlList(signer_C.address)).to.be.rejectedWith(
      "AccountHasNoRole",
    );
  });

  it("GIVEN a paused Token WHEN addToControlList THEN transaction fails with TokenIsPaused", async () => {
    await grantRoleAndPauseToken(asset, ATS_ROLES.CONTROL_LIST_ROLE, signer_A, signer_B, signer_C.address);

    await expect(asset.connect(signer_C).addToControlList(signer_D.address)).to.be.rejectedWith("TokenIsPaused");
  });

  it("GIVEN a paused Token WHEN removeFromControlList THEN transaction fails with TokenIsPaused", async () => {
    await grantRoleAndPauseToken(asset, ATS_ROLES.CONTROL_LIST_ROLE, signer_A, signer_B, signer_C.address);

    await expect(asset.connect(signer_C).removeFromControlList(signer_D.address)).to.be.rejectedWith("TokenIsPaused");
  });

  it("GIVEN an account with controlList role WHEN addToControlList and removeFromControlList THEN transaction succeeds", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.CONTROL_LIST_ROLE, signer_B.address);

    let check_signer_B = await asset.isInControlList(signer_B.address);
    expect(check_signer_B).to.equal(false);
    let check_signer_C = await asset.isInControlList(signer_C.address);
    expect(check_signer_C).to.equal(false);

    await expect(asset.connect(signer_B).addToControlList(signer_B.address))
      .to.emit(asset, "AddedToControlList")
      .withArgs(signer_B.address, signer_B.address);
    await expect(asset.connect(signer_B).addToControlList(signer_C.address))
      .to.emit(asset, "AddedToControlList")
      .withArgs(signer_B.address, signer_C.address);

    check_signer_B = await asset.isInControlList(signer_B.address);
    expect(check_signer_B).to.equal(true);
    check_signer_C = await asset.isInControlList(signer_C.address);
    expect(check_signer_C).to.equal(true);

    let listCount = await asset.getControlListCount();
    let listMembers = await asset.getControlListMembers(0, listCount);

    expect(listCount).to.equal(2);
    expect(listMembers.length).to.equal(listCount);
    expect(listMembers[0].toUpperCase()).to.equal(signer_B.address.toUpperCase());
    expect(listMembers[1].toUpperCase()).to.equal(signer_C.address.toUpperCase());

    await expect(asset.connect(signer_B).removeFromControlList(signer_B.address))
      .to.emit(asset, "RemovedFromControlList")
      .withArgs(signer_B.address, signer_B.address);

    check_signer_B = await asset.isInControlList(signer_B.address);
    expect(check_signer_B).to.equal(false);

    listCount = await asset.getControlListCount();
    listMembers = await asset.getControlListMembers(0, listCount);

    expect(listCount).to.equal(1);
    expect(listMembers.length).to.equal(listCount);
    expect(listMembers[0].toUpperCase()).to.equal(signer_C.address.toUpperCase());

    const listType = await asset.getControlListType();
    expect(listType).to.equal(false);
  });

  it("GIVEN an account already in control list WHEN addToControlList is called again THEN transaction fails with ListedAccount", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.CONTROL_LIST_ROLE, signer_B.address);

    // Add account to control list
    await asset.connect(signer_B).addToControlList(signer_C.address);

    // Verify account is in the list
    expect(await asset.isInControlList(signer_C.address)).to.equal(true);

    // Try to add the same account again
    await expect(asset.connect(signer_B).addToControlList(signer_C.address))
      .to.be.revertedWithCustomError(asset, "ListedAccount")
      .withArgs(signer_C.address);
  });

  it("GIVEN an account not in control list WHEN removeFromControlList is called THEN transaction fails with UnlistedAccount", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.CONTROL_LIST_ROLE, signer_B.address);

    // Verify account is not in the list
    expect(await asset.isInControlList(signer_C.address)).to.equal(false);

    // Try to remove an account that's not in the list
    await expect(asset.connect(signer_B).removeFromControlList(signer_C.address))
      .to.be.revertedWithCustomError(asset, "UnlistedAccount")
      .withArgs(signer_C.address);
  });
});
