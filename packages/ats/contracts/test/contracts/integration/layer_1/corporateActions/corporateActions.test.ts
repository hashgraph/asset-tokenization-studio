import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type CorporateActions, type Pause, type AccessControl } from "@contract-types";
import { ATS_ROLES } from "@scripts";
import { grantRoleAndPauseToken } from "../../../../common";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";
import { executeRbac } from "@test";

const actionType = "0x000000000000000000000000000000000000000000000000000000000000aa23";
const actionData = "0x1234";
const corporateActionId_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";

describe("Corporate Actions Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let corporateActionsFacet: CorporateActions;
  let accessControlFacet: AccessControl;
  let pauseFacet: Pause;

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_B.address],
      },
    ]);

    accessControlFacet = await ethers.getContractAt("AccessControlFacet", diamond.target, signer_A);
    corporateActionsFacet = await ethers.getContractAt("CorporateActionsFacet", diamond.target, signer_A);
    pauseFacet = await ethers.getContractAt("PauseFacet", diamond.target, signer_A);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);
  });

  it("GIVEN an account without corporateActions role WHEN addCorporateAction THEN transaction fails with AccountHasNoRole", async () => {
    // add to list fails
    await expect(corporateActionsFacet.connect(signer_C).addCorporateAction(actionType, actionData)).to.be.rejectedWith(
      "AccountHasNoRole",
    );
  });

  it("GIVEN a paused Token WHEN addCorporateAction THEN transaction fails with TokenIsPaused", async () => {
    // Granting Role to account C and Pause
    await grantRoleAndPauseToken(
      accessControlFacet,
      pauseFacet,
      ATS_ROLES._CORPORATE_ACTION_ROLE,
      signer_A,
      signer_B,
      signer_C.address,
    );

    // add to list fails
    await expect(corporateActionsFacet.connect(signer_C).addCorporateAction(actionType, actionData)).to.be.rejectedWith(
      "TokenIsPaused",
    );
  });

  it("GIVEN an account with corporateActions role WHEN addCorporateAction (two identical CA) THEN transaction first succeeds but second fails with DuplicatedCorporateAction", async () => {
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(["bytes32", "bytes"], [actionType, actionData]);

    const contentHash = ethers.keccak256(encoded);

    const actionContentHashExistsBefore = await corporateActionsFacet.actionContentHashExists(contentHash);

    // add to list
    await corporateActionsFacet.connect(signer_C).addCorporateAction(actionType, actionData);

    // check list members
    const listCount = await corporateActionsFacet.getCorporateActionCount();
    const listMembers = await corporateActionsFacet.getCorporateActionIds(0, listCount);
    const listCountByType = await corporateActionsFacet.getCorporateActionCountByType(actionType);
    const listMembersByType = await corporateActionsFacet.getCorporateActionIdsByType(actionType, 0, listCount);
    const corporateAction = await corporateActionsFacet.getCorporateAction(corporateActionId_1);
    const actionContentHashExistsAfter = await corporateActionsFacet.actionContentHashExists(contentHash);

    expect(listCount).to.equal(1);
    expect(listMembers.length).to.equal(listCount);
    expect(listMembers[0]).to.equal(corporateActionId_1);
    expect(listCountByType).to.equal(1);
    expect(listMembersByType.length).to.equal(listCountByType);
    expect(listMembersByType[0]).to.equal(corporateActionId_1);
    expect(corporateAction[0].toUpperCase()).to.equal(actionType.toUpperCase());
    expect(corporateAction[1]).to.equal(BigInt(listMembersByType[0]));
    expect(corporateAction[2].toUpperCase()).to.equal(actionData.toUpperCase());
    expect(actionContentHashExistsBefore).to.be.false;
    expect(actionContentHashExistsAfter).to.be.true;

    await expect(
      corporateActionsFacet.connect(signer_C).addCorporateAction(actionType, actionData),
    ).to.revertedWithCustomError(corporateActionsFacet, "DuplicatedCorporateAction");
  });
});
