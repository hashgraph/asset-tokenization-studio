// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type CorporateActions, EquityUSA, TimeTravelFacet } from "@contract-types";
import { ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";
import { executeRbac } from "@test";

const corporateActionId_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";

describe("Corporate Actions Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let corporateActionsFacet: CorporateActions;
  let equityFacet: EquityUSA;
  let timeTravelFacet: TimeTravelFacet;

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
      {
        role: ATS_ROLES._CORPORATE_ACTION_ROLE,
        members: [signer_C.address],
      },
    ]);

    corporateActionsFacet = await ethers.getContractAt("CorporateActionsFacet", diamond.target, signer_A);
    equityFacet = await ethers.getContractAt("EquityUSAFacetTimeTravel", diamond.target, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.target, signer_A);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);
  });
  it("GIVEN a token with a corporate action the functions returns the data", async () => {
    const currentTimestamp = await timeTravelFacet.blockTimestamp();
    const ONE_DAY = 86400n; // 24 hours in seconds

    let dividendData = {
      recordDate: Number(currentTimestamp + ONE_DAY),
      executionDate: Number(currentTimestamp + ONE_DAY + 1000n),
      amount: 10,
      amountDecimals: 1,
    };

    const actionType = "0x1c29d09f87f2b0c8192a7719a2acdfdfa320dc2835b5a0398e5bd8dc34c14b0e"; //DIVIDEND_CORPORATE_ACTION_TYPE
    const encodedDividendData = ethers.AbiCoder.defaultAbiCoder().encode(
      ["(uint256 recordDate, uint256 executionDate, uint256 amount, uint8 amountDecimals)"],
      [dividendData],
    );
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(["bytes32", "bytes"], [actionType, encodedDividendData]);
    const contentHash = ethers.keccak256(encoded);

    const actionContentHashExistsBefore = await corporateActionsFacet.actionContentHashExists(contentHash);

    await equityFacet.connect(signer_C).setDividend(dividendData);

    // check list members
    const listCount = await corporateActionsFacet.getCorporateActionCount();
    const listMembers = await corporateActionsFacet.getCorporateActionIds(0, listCount);
    const listCountByType = await corporateActionsFacet.getCorporateActionCountByType(actionType);
    const listMembersByType = await corporateActionsFacet.getCorporateActionIdsByType(actionType, 0, listCount);
    const corporateAction = await corporateActionsFacet.getCorporateAction(corporateActionId_1);
    const actionContentHashExistsAfter = await corporateActionsFacet.actionContentHashExists(contentHash);

    // Get all corporate actions with pagination
    const corporateActions = await corporateActionsFacet.getCorporateActions(0, listCount);

    // Get all corporate actions by type with pagination
    const corporateActionsByType = await corporateActionsFacet.getCorporateActionsByType(actionType, 0, listCount);

    expect(listCount).to.equal(1);
    expect(listMembers.length).to.equal(listCount);
    expect(listMembers[0]).to.equal(corporateActionId_1);
    expect(listCountByType).to.equal(1);
    expect(listMembersByType.length).to.equal(listCountByType);
    expect(listMembersByType[0]).to.equal(corporateActionId_1);
    expect(corporateAction.actionType_.toUpperCase()).to.equal(actionType.toUpperCase());
    expect(corporateAction.actionTypeId_).to.equal(BigInt(listMembersByType[0]));
    expect(corporateAction.data_.toUpperCase()).to.equal(encodedDividendData.toUpperCase());
    expect(corporateAction.isDisabled_).to.be.false;
    expect(actionContentHashExistsBefore).to.be.false;
    expect(actionContentHashExistsAfter).to.be.true;

    // Validate getCorporateActions response
    expect(corporateActions.actionTypes_.length).to.equal(1);
    expect(corporateActions.actionTypeIds_.length).to.equal(1);
    expect(corporateActions.datas_.length).to.equal(1);
    expect(corporateActions.isDisabled_.length).to.equal(1);

    expect(corporateActions.actionTypes_[0].toUpperCase()).to.equal(actionType.toUpperCase());
    expect(corporateActions.actionTypeIds_[0]).to.equal(BigInt(corporateActionId_1));
    expect(corporateActions.datas_[0].toUpperCase()).to.equal(encodedDividendData.toUpperCase());
    expect(corporateActions.isDisabled_[0]).to.be.false;

    // Validate getCorporateActionsByType response
    expect(corporateActionsByType.actionTypes_.length).to.equal(1);
    expect(corporateActionsByType.actionTypeIds_.length).to.equal(1);
    expect(corporateActionsByType.datas_.length).to.equal(1);
    expect(corporateActionsByType.isDisabled_.length).to.equal(1);

    expect(corporateActionsByType.actionTypes_[0].toUpperCase()).to.equal(actionType.toUpperCase());
    expect(corporateActionsByType.actionTypeIds_[0]).to.equal(BigInt(corporateActionId_1));
    expect(corporateActionsByType.datas_[0].toUpperCase()).to.equal(encodedDividendData.toUpperCase());
    expect(corporateActionsByType.isDisabled_[0]).to.be.false;

    // Cross-validate that getCorporateActions and getCorporateActionsByType return the same data
    expect(corporateActions.actionTypes_[0]).to.equal(corporateActionsByType.actionTypes_[0]);
    expect(corporateActions.actionTypeIds_[0]).to.equal(corporateActionsByType.actionTypeIds_[0]);
    expect(corporateActions.datas_[0]).to.equal(corporateActionsByType.datas_[0]);
    expect(corporateActions.isDisabled_[0]).to.equal(corporateActionsByType.isDisabled_[0]);
  });
});
