// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset, MockDiamondCut } from "@contract-types";
import { ATS_ROLES, EQUITY_CONFIG_ID, RESOLVER_KEY_ACCESS_CONTROL } from "@scripts";
import { deployEquityTokenFixture } from "@test";
import { executeRbac } from "@test";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Access Control Tests", () => {
  let diamond: ResolverProxy;
  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;
  let deployer: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let unknownSigner: HardhatEthersSigner;

  async function deployFixture() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    asset = await ethers.getContractAt("IAsset", diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
    await executeRbac(asset, [
      {
        role: ATS_ROLES.ROLE_PAUSER,
        members: [base.user1.address],
      },
    ]);

    deployer = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    unknownSigner = base.unknownSigner;
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  it("GIVEN a deactivated asset WHEN grantRole THEN transaction fails with Deactivated", async () => {
    await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_TEST, deployer.address);
    await asset.connect(deployer).deactivate();
    await expect(
      asset.connect(deployer).grantRole(ATS_ROLES.ROLE_PAUSER, unknownSigner.address),
    ).to.be.revertedWithCustomError(asset, "Deactivated");
  });

  it("GIVEN an account without administrative role WHEN grantRole THEN transaction fails with AccountHasNoRole", async () => {
    await expect(asset.connect(signer_C).grantRole(ATS_ROLES.ROLE_PAUSER, unknownSigner.address))
      .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
      .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
  });

  it("GIVEN a deactivated asset WHEN revokeRole THEN transaction fails with Deactivated", async () => {
    await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_TEST, deployer.address);
    await asset.connect(deployer).deactivate();
    await expect(
      asset.connect(deployer).revokeRole(ATS_ROLES.DEFAULT_ADMIN_ROLE, unknownSigner.address),
    ).to.be.revertedWithCustomError(asset, "Deactivated");
  });

  it("GIVEN an account without administrative role WHEN revokeRole THEN transaction fails with AccountHasNoRole", async () => {
    await expect(asset.connect(signer_C).revokeRole(ATS_ROLES.DEFAULT_ADMIN_ROLE, unknownSigner.address))
      .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
      .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
  });

  it("GIVEN a deactivated asset WHEN applyRoles THEN transaction fails with Deactivated", async () => {
    await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_TEST, deployer.address);
    await asset.connect(deployer).deactivate();
    await expect(
      asset.connect(signer_C).applyRoles([ATS_ROLES.DEFAULT_ADMIN_ROLE], [true], unknownSigner.address),
    ).to.be.revertedWithCustomError(asset, "Deactivated");
  });

  it("GIVEN an account without administrative role WHEN applyRoles THEN transaction fails with AccountHasNoRole", async () => {
    await expect(asset.connect(signer_C).applyRoles([ATS_ROLES.DEFAULT_ADMIN_ROLE], [true], unknownSigner.address))
      .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
      .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
  });

  it("GIVEN a list of roles and actives that is not equally long WHEN applyRoles THEN transaction fails with RolesAndActivesLengthMismatch", async () => {
    await expect(asset.connect(signer_C).applyRoles([ATS_ROLES.DEFAULT_ADMIN_ROLE], [], unknownSigner.address))
      .to.be.revertedWithCustomError(asset, "RolesAndActivesLengthMismatch")
      .withArgs(1, 0);
  });

  it("GIVEN a list of contradictory roles (enable and disable) role WHEN applyRoles THEN transaction fails with ApplyRoleContradiction", async () => {
    const Roles_1 = [
      ATS_ROLES.DEFAULT_ADMIN_ROLE,
      ATS_ROLES.ROLE_PAUSER,
      ATS_ROLES.ROLE_CAP,
      ATS_ROLES.ROLE_CONTROLLER,
      ATS_ROLES.ROLE_CORPORATE_ACTION,
      ATS_ROLES.ROLE_DOCUMENTER,
      ATS_ROLES.ROLE_CONTROLLER,
      ATS_ROLES.ROLE_LOCKER,
    ];

    const actives_1 = [true, true, true, true, true, true, false, true];
    const actives_2 = [true, true, true, false, true, true, true, true];

    // revoke role fails
    await expect(asset.connect(deployer).applyRoles(Roles_1, actives_1, unknownSigner.address))
      .to.be.revertedWithCustomError(asset, "ContradictoryValuesInArray")
      .withArgs(3, 6);

    await expect(asset.connect(deployer).applyRoles(Roles_1, actives_2, unknownSigner.address))
      .to.be.revertedWithCustomError(asset, "ContradictoryValuesInArray")
      .withArgs(3, 6);
  });

  it("GIVEN a paused Token WHEN grantRole THEN transaction fails with IsPaused", async () => {
    await asset.connect(signer_B).pause();

    await expect(
      asset.connect(deployer).grantRole(ATS_ROLES.ROLE_PAUSER, unknownSigner.address),
    ).to.be.revertedWithCustomError(asset, "IsPaused");
  });

  it("GIVEN a paused Token WHEN revokeRole THEN transaction fails with IsPaused", async () => {
    await asset.connect(signer_B).pause();

    await expect(
      asset.connect(deployer).revokeRole(ATS_ROLES.ROLE_PAUSER, unknownSigner.address),
    ).to.be.revertedWithCustomError(asset, "IsPaused");
  });

  it("GIVEN a deactivated asset WHEN renounceRole THEN transaction fails with Deactivated", async () => {
    await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_TEST, deployer.address);
    await asset.connect(deployer).deactivate();
    await expect(asset.connect(signer_C).renounceRole(ATS_ROLES.ROLE_PAUSER)).to.be.revertedWithCustomError(
      asset,
      "Deactivated",
    );
  });

  it("GIVEN a paused Token WHEN renounce THEN transaction fails with IsPaused", async () => {
    // Pausing the token
    await asset.connect(signer_B).pause();

    // revoke role fails
    await expect(asset.connect(deployer).renounceRole(ATS_ROLES.ROLE_PAUSER)).to.be.revertedWithCustomError(
      asset,
      "IsPaused",
    );
  });

  it("GIVEN an paused Token WHEN applyRoles THEN transaction fails with IsPaused", async () => {
    // Pausing the token
    await asset.connect(signer_B).pause();

    // revoke role fails
    await expect(
      asset.connect(signer_B).applyRoles([ATS_ROLES.DEFAULT_ADMIN_ROLE], [true], unknownSigner.address),
    ).to.be.revertedWithCustomError(asset, "IsPaused");
  });

  it("GIVEN an account with administrative role WHEN grantRole THEN transaction succeeds", async () => {
    // check that C does not have the role
    let check_C = await asset.hasRole(ATS_ROLES.ROLE_PAUSER, unknownSigner.address);
    expect(check_C).to.equal(false);

    // grant Role
    await expect(asset.connect(deployer).grantRole(ATS_ROLES.ROLE_PAUSER, unknownSigner.address))
      .to.emit(asset, "RoleGranted")
      .withArgs(deployer.address, unknownSigner.address, ATS_ROLES.ROLE_PAUSER);

    // check that C has the role
    check_C = await asset.hasRole(ATS_ROLES.ROLE_PAUSER, unknownSigner.address);
    expect(check_C).to.equal(true);
    // check roles and members count and lists
    const roleCountFor_C = await asset.getRoleCountFor(unknownSigner.address);
    const rolesFor_C = await asset.getRolesFor(unknownSigner.address, 0, roleCountFor_C);
    const memberCountFor_Pause = await asset.getRoleMemberCount(ATS_ROLES.ROLE_PAUSER);
    const membersFor_Pause = await asset.getRoleMembers(ATS_ROLES.ROLE_PAUSER, 0, memberCountFor_Pause);
    expect(roleCountFor_C).to.equal(1);
    expect(rolesFor_C.length).to.equal(roleCountFor_C);
    expect(rolesFor_C[0].toUpperCase()).to.equal(ATS_ROLES.ROLE_PAUSER.toUpperCase());
    expect(memberCountFor_Pause).to.equal(2);
    expect(membersFor_Pause.length).to.equal(memberCountFor_Pause);
    expect(membersFor_Pause[0].toUpperCase()).to.equal(signer_B.address.toUpperCase());
    expect(membersFor_Pause[1].toUpperCase()).to.equal(unknownSigner.address.toUpperCase());
  });

  it("GIVEN an account with administrative role WHEN revokeRole THEN transaction succeeds", async () => {
    // check that B has the role
    let check_B = await asset.hasRole(ATS_ROLES.ROLE_PAUSER, signer_B.address);
    expect(check_B).to.equal(true);

    // revoke Role
    await expect(asset.connect(deployer).revokeRole(ATS_ROLES.ROLE_PAUSER, signer_B.address))
      .to.emit(asset, "RoleRevoked")
      .withArgs(deployer.address, signer_B.address, ATS_ROLES.ROLE_PAUSER);

    // check that B does not have the role
    check_B = await asset.hasRole(ATS_ROLES.ROLE_PAUSER, signer_B.address);
    expect(check_B).to.equal(false);
    // check roles and members count and lists
    const roleCountFor_B = await asset.getRoleCountFor(signer_B.address);
    const rolesFor_B = await asset.getRolesFor(signer_B.address, 0, roleCountFor_B);
    const memberCountFor_Pause = await asset.getRoleMemberCount(ATS_ROLES.ROLE_PAUSER);
    const membersFor_Pause = await asset.getRoleMembers(ATS_ROLES.ROLE_PAUSER, 0, memberCountFor_Pause);
    expect(roleCountFor_B).to.equal(0);
    expect(rolesFor_B.length).to.equal(roleCountFor_B);
    expect(memberCountFor_Pause).to.equal(0);
    expect(membersFor_Pause.length).to.equal(memberCountFor_Pause);
  });

  it("GIVEN an account with pauser role WHEN renouncing the pauser role THEN transaction succeeds", async () => {
    // check that B has the role
    let check_B = await asset.hasRole(ATS_ROLES.ROLE_PAUSER, signer_B.address);
    expect(check_B).to.equal(true);

    // revoke Role
    await expect(asset.connect(signer_B).renounceRole(ATS_ROLES.ROLE_PAUSER))
      .to.emit(asset, "RoleRenounced")
      .withArgs(signer_B.address, ATS_ROLES.ROLE_PAUSER);

    // check that B does not have the role
    check_B = await asset.hasRole(ATS_ROLES.ROLE_PAUSER, signer_B.address);
    expect(check_B).to.equal(false);
    // check roles and members count and lists
    const roleCountFor_B = await asset.getRoleCountFor(signer_B.address);
    const rolesFor_B = await asset.getRolesFor(signer_B.address, 0, roleCountFor_B);
    const memberCountFor_Pause = await asset.getRoleMemberCount(ATS_ROLES.ROLE_PAUSER);
    const membersFor_Pause = await asset.getRoleMembers(ATS_ROLES.ROLE_PAUSER, 0, memberCountFor_Pause);
    expect(roleCountFor_B).to.equal(0);
    expect(rolesFor_B.length).to.equal(roleCountFor_B);
    expect(memberCountFor_Pause).to.equal(0);
    expect(membersFor_Pause.length).to.equal(memberCountFor_Pause);
  });

  it("GIVEN an account with administrative role WHEN applyRoles THEN transaction succeeds", async () => {
    // check that C does not have the role
    await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_PAUSER, signer_C.address);

    // grant Role
    await expect(
      asset
        .connect(deployer)
        .applyRoles([ATS_ROLES.ROLE_PAUSER, ATS_ROLES.DEFAULT_ADMIN_ROLE], [false, true], signer_C.address),
    )
      .to.emit(asset, "RolesApplied")
      .withArgs(
        [ATS_ROLES.ROLE_PAUSER, ATS_ROLES.DEFAULT_ADMIN_ROLE],
        [false, true],
        signer_C.address,
        [ATS_ROLES.ROLE_PAUSER, ATS_ROLES.DEFAULT_ADMIN_ROLE],
        [false, true],
      );

    // check that C has the role
    expect(await asset.hasRole(ATS_ROLES.ROLE_PAUSER, signer_C.address)).to.equal(false);
    expect(await asset.hasRole(ATS_ROLES.DEFAULT_ADMIN_ROLE, signer_C.address)).to.equal(true);
    // check roles and members count and lists
    const roleCountFor_C = await asset.getRoleCountFor(signer_C.address);
    const rolesFor_C = await asset.getRolesFor(signer_C.address, 0, roleCountFor_C);
    const memberCountFor_Pause = await asset.getRoleMemberCount(ATS_ROLES.ROLE_PAUSER);
    const membersFor_Pause = await asset.getRoleMembers(ATS_ROLES.ROLE_PAUSER, 0, memberCountFor_Pause);
    const memberCountFor_Default = await asset.getRoleMemberCount(ATS_ROLES.DEFAULT_ADMIN_ROLE);
    const membersFor_Default = await asset.getRoleMembers(ATS_ROLES.DEFAULT_ADMIN_ROLE, 0, memberCountFor_Default);
    expect(roleCountFor_C).to.equal(1);
    expect(rolesFor_C.length).to.equal(roleCountFor_C);
    expect(rolesFor_C[0].toUpperCase()).to.equal(ATS_ROLES.DEFAULT_ADMIN_ROLE.toUpperCase());
    expect(memberCountFor_Pause).to.equal(1);
    expect(membersFor_Pause.length).to.equal(memberCountFor_Pause);
    expect(memberCountFor_Default).to.equal(2);
    expect(membersFor_Default.length).to.equal(memberCountFor_Default);
    expect(membersFor_Pause[0].toUpperCase()).to.equal(signer_B.address.toUpperCase());
    expect(membersFor_Default[1].toUpperCase()).to.equal(signer_C.address.toUpperCase());
  });

  it("GIVEN an account with administrative role, if roles are duplicated but not contradictory WHEN applyRoles THEN transaction succeeds", async () => {
    // check that C does not have the role
    await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_PAUSER, signer_C.address);

    // grant Role
    await expect(
      asset
        .connect(deployer)
        .applyRoles(
          [ATS_ROLES.ROLE_PAUSER, ATS_ROLES.DEFAULT_ADMIN_ROLE, ATS_ROLES.DEFAULT_ADMIN_ROLE],
          [true, false, false],
          signer_C.address,
        ),
    )
      .to.emit(asset, "RolesApplied")
      .withArgs(
        [ATS_ROLES.ROLE_PAUSER, ATS_ROLES.DEFAULT_ADMIN_ROLE, ATS_ROLES.DEFAULT_ADMIN_ROLE],
        [true, false, false],
        signer_C.address,
        [],
        [],
      );

    // check that C has the role
    expect(await asset.hasRole(ATS_ROLES.ROLE_PAUSER, signer_C.address)).to.equal(true);
    expect(await asset.hasRole(ATS_ROLES.DEFAULT_ADMIN_ROLE, signer_C.address)).to.equal(false);
    // check roles and members count and lists
    const roleCountFor_C = await asset.getRoleCountFor(signer_C.address);
    const rolesFor_C = await asset.getRolesFor(signer_C.address, 0, roleCountFor_C);

    expect(roleCountFor_C).to.equal(1);
    expect(rolesFor_C.length).to.equal(roleCountFor_C);
    expect(rolesFor_C[0].toUpperCase()).to.equal(ATS_ROLES.ROLE_PAUSER.toUpperCase());
  });

  it("GIVEN a mixed batch of effective and no-op entries WHEN applyRoles THEN RolesApplied carries only the effectively changed entries in input order", async () => {
    // Pre-state: signer_C holds ROLE_PAUSER and ROLE_AGENT, nothing else.
    await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_PAUSER, signer_C.address);
    await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_AGENT, signer_C.address);

    // Five entries, alternating no-op / effective. The interleaving is the point:
    // it exercises the count-cursor vs index-write path that all-effective and
    // all-no-op batches cannot distinguish (audit FIND-142 cursor correctness).
    const requestedRoles = [
      ATS_ROLES.ROLE_CAP, // revoke unheld → no-op
      ATS_ROLES.DEFAULT_ADMIN_ROLE, // grant new → effective
      ATS_ROLES.ROLE_PAUSER, // grant held → no-op
      ATS_ROLES.ROLE_AGENT, // revoke held → effective
      ATS_ROLES.ROLE_BOND_MANAGER, // revoke unheld → no-op
    ];
    const requestedStates = [false, true, true, false, false];

    await expect(asset.connect(deployer).applyRoles(requestedRoles, requestedStates, signer_C.address))
      .to.emit(asset, "RolesApplied")
      .withArgs(
        requestedRoles,
        requestedStates,
        signer_C.address,
        [ATS_ROLES.DEFAULT_ADMIN_ROLE, ATS_ROLES.ROLE_AGENT],
        [true, false],
      );

    expect(await asset.hasRole(ATS_ROLES.ROLE_CAP, signer_C.address)).to.equal(false);
    expect(await asset.hasRole(ATS_ROLES.DEFAULT_ADMIN_ROLE, signer_C.address)).to.equal(true);
    expect(await asset.hasRole(ATS_ROLES.ROLE_PAUSER, signer_C.address)).to.equal(true);
    expect(await asset.hasRole(ATS_ROLES.ROLE_AGENT, signer_C.address)).to.equal(false);
    expect(await asset.hasRole(ATS_ROLES.ROLE_BOND_MANAGER, signer_C.address)).to.equal(false);
  });

  it("GIVEN an account that already has a role WHEN grantRole is called again THEN transaction fails with AccountAssignedToRole", async () => {
    // Grant the role first time
    await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_PAUSER, unknownSigner.address);

    // Verify role was granted
    expect(await asset.hasRole(ATS_ROLES.ROLE_PAUSER, unknownSigner.address)).to.equal(true);

    // Try to grant the same role again and expect it to fail
    await expect(asset.connect(deployer).grantRole(ATS_ROLES.ROLE_PAUSER, unknownSigner.address))
      .to.be.revertedWithCustomError(asset, "AccountAssignedToRole")
      .withArgs(ATS_ROLES.ROLE_PAUSER, unknownSigner.address);
  });

  it("GIVEN an account without a specific role WHEN revokeRole is called THEN transaction fails with AccountNotAssignedToRole", async () => {
    // Verify that the account does not have the role
    expect(await asset.hasRole(ATS_ROLES.ROLE_PAUSER, unknownSigner.address)).to.equal(false);

    // Try to revoke a role that the account doesn't have
    await expect(asset.connect(deployer).revokeRole(ATS_ROLES.ROLE_PAUSER, unknownSigner.address))
      .to.be.revertedWithCustomError(asset, "AccountNotAssignedToRole")
      .withArgs(ATS_ROLES.ROLE_PAUSER, unknownSigner.address);
  });

  it("GIVEN an account without a specific role WHEN renounceRole is called THEN transaction fails with AccountNotAssignedToRole", async () => {
    // Verify that the account does not have the role
    expect(await asset.hasRole(ATS_ROLES.ROLE_PAUSER, unknownSigner.address)).to.equal(false);

    // Try to renounce a role that the account doesn't have
    await expect(asset.connect(unknownSigner).renounceRole(ATS_ROLES.ROLE_PAUSER))
      .to.be.revertedWithCustomError(asset, "AccountNotAssignedToRole")
      .withArgs(ATS_ROLES.ROLE_PAUSER, unknownSigner.address);
  });

  it("GIVEN the sole DEFAULT_ADMIN_ROLE holder WHEN renounceRole is called THEN transaction fails with CannotRenounceSoleAdmin", async () => {
    // Verify deployer is the only admin
    const memberCount = await asset.getRoleMemberCount(ATS_ROLES.DEFAULT_ADMIN_ROLE);
    expect(memberCount).to.equal(1);

    // Sole admin cannot renounce
    await expect(asset.connect(deployer).renounceRole(ATS_ROLES.DEFAULT_ADMIN_ROLE)).to.be.revertedWithCustomError(
      asset,
      "CannotRenounceSoleAdmin",
    );
  });

  it("GIVEN two DEFAULT_ADMIN_ROLE holders WHEN one renounces THEN transaction succeeds and one admin remains", async () => {
    // Grant DEFAULT_ADMIN_ROLE to signer_C so there are 2 admins
    await asset.connect(deployer).applyRoles([ATS_ROLES.DEFAULT_ADMIN_ROLE], [true], signer_C.address);
    expect(await asset.getRoleMemberCount(ATS_ROLES.DEFAULT_ADMIN_ROLE)).to.equal(2);

    // deployer can renounce because signer_C is still admin
    await expect(asset.connect(deployer).renounceRole(ATS_ROLES.DEFAULT_ADMIN_ROLE))
      .to.emit(asset, "RoleRenounced")
      .withArgs(deployer.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);

    // deployer no longer has the role, signer_C still does
    expect(await asset.hasRole(ATS_ROLES.DEFAULT_ADMIN_ROLE, deployer.address)).to.equal(false);
    expect(await asset.hasRole(ATS_ROLES.DEFAULT_ADMIN_ROLE, signer_C.address)).to.equal(true);
    expect(await asset.getRoleMemberCount(ATS_ROLES.DEFAULT_ADMIN_ROLE)).to.equal(1);
  });

  describe("initializeAccessControl", () => {
    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeAccessControl is called THEN it reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(unknownSigner).initializeAccessControl())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN an already-initialised facet WHEN initializeAccessControl is called again THEN it reverts with FacetAlreadyRegistered", async () => {
      await expect(asset.initializeAccessControl())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(RESOLVER_KEY_ACCESS_CONTROL, 1);
    });
  });

  describe("initializeAccessControl event", () => {
    it("GIVEN a fresh deployment WHEN initializeAccessControl is called THEN it emits AccessControlInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(RESOLVER_KEY_ACCESS_CONTROL);
      await expect(asset.initializeAccessControl()).to.emit(asset, "AccessControlInitialized");
    });
  });

  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational WHEN grantRole is called THEN AssetNotOperational", async () => {
      await expect(asset.grantRole(ATS_ROLES.DEFAULT_ADMIN_ROLE, unknownSigner.address))
        .to.be.revertedWithCustomError(asset, "AssetNotOperational")
        .withArgs(EQUITY_CONFIG_ID, 1);
    });

    it("GIVEN non-operational WHEN revokeRole is called THEN AssetNotOperational", async () => {
      await expect(asset.revokeRole(ATS_ROLES.DEFAULT_ADMIN_ROLE, unknownSigner.address))
        .to.be.revertedWithCustomError(asset, "AssetNotOperational")
        .withArgs(EQUITY_CONFIG_ID, 1);
    });

    it("GIVEN non-operational WHEN renounceRole is called THEN AssetNotOperational", async () => {
      await expect(asset.renounceRole(ATS_ROLES.DEFAULT_ADMIN_ROLE))
        .to.be.revertedWithCustomError(asset, "AssetNotOperational")
        .withArgs(EQUITY_CONFIG_ID, 1);
    });

    it("GIVEN non-operational WHEN applyRoles is called THEN AssetNotOperational", async () => {
      await expect(asset.applyRoles([], [], unknownSigner.address))
        .to.be.revertedWithCustomError(asset, "AssetNotOperational")
        .withArgs(EQUITY_CONFIG_ID, 1);
    });
  });
});
