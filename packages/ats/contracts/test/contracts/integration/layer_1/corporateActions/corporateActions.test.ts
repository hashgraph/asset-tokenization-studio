// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, ATS_CORPORATE_ACTION, RESOLVER_KEY_CORPORATE_ACTIONS } from "@scripts";
import { executeRbac } from "@test";
import type { AssetMockCtx } from "@test";

const corporateActionId_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";

export function corporateActionsTests(getCtx: () => AssetMockCtx): void {
  describe("Corporate Actions Tests", () => {
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_B = ctx.user1;
      signer_C = ctx.user2;

      asset = ctx.asset;

      await executeRbac(asset, [
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_CORPORATE_ACTION,
          members: [signer_C.address],
        },
      ]);
    });

    it("GIVEN a token with a corporate action the functions returns the data", async () => {
      const currentTimestamp = await asset.blockTimestamp();
      const ONE_DAY = 86400n; // 24 hours in seconds

      const dividendData = {
        recordDate: Number(currentTimestamp + ONE_DAY),
        executionDate: Number(currentTimestamp + ONE_DAY + 1000n),
        amount: 10,
        amountDecimals: 1,
      };

      const actionType = ATS_CORPORATE_ACTION.DIVIDEND;
      const encodedDividendData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["(uint256 recordDate, uint256 executionDate, uint256 amount, uint8 amountDecimals)"],
        [dividendData],
      );
      const encoded = ethers.AbiCoder.defaultAbiCoder().encode(["bytes32", "bytes"], [actionType, encodedDividendData]);
      const contentHash = ethers.keccak256(encoded);

      const actionContentHashExistsBefore = await asset.actionContentHashExists(contentHash);

      await asset.connect(signer_C).setDividend(dividendData);

      // check list members
      const listCount = await asset.getCorporateActionCount();
      const listMembers = await asset.getCorporateActionIds(0, listCount);
      const listCountByType = await asset.getCorporateActionCountByType(actionType);
      const listMembersByType = await asset.getCorporateActionIdsByType(actionType, 0, listCount);
      const corporateAction = await asset.getCorporateAction(corporateActionId_1);
      const actionContentHashExistsAfter = await asset.actionContentHashExists(contentHash);

      // Get all corporate actions with pagination
      const corporateActions = await asset.getCorporateActions(0, listCount);

      // Get all corporate actions by type with pagination
      const corporateActionsByType = await asset.getCorporateActionsByType(actionType, 0, listCount);

      expect(listCount).to.equal(1);
      expect(listMembers.length).to.equal(listCount);
      expect(listMembers[0]).to.equal(corporateActionId_1);
      expect(listCountByType).to.equal(1);
      expect(listMembersByType.length).to.equal(listCountByType);
      expect(listMembersByType[0]).to.equal(corporateActionId_1);
      expect(corporateAction.actionType_.toUpperCase()).to.equal(actionType.toUpperCase());
      expect(corporateAction.actionIdByType_).to.equal(BigInt(listMembersByType[0]));
      expect(corporateAction.data_.toUpperCase()).to.equal(encodedDividendData.toUpperCase());
      expect(corporateAction.isDisabled_).to.be.false;
      expect(actionContentHashExistsBefore).to.be.false;
      expect(actionContentHashExistsAfter).to.be.true;

      // Validate getCorporateActions response
      expect(corporateActions.actionTypes_.length).to.equal(1);
      expect(corporateActions.actionIdByType_.length).to.equal(1);
      expect(corporateActions.datas_.length).to.equal(1);
      expect(corporateActions.isDisabled_.length).to.equal(1);

      expect(corporateActions.actionTypes_[0].toUpperCase()).to.equal(actionType.toUpperCase());
      expect(corporateActions.actionIdByType_[0]).to.equal(BigInt(corporateActionId_1));
      expect(corporateActions.datas_[0].toUpperCase()).to.equal(encodedDividendData.toUpperCase());
      expect(corporateActions.isDisabled_[0]).to.be.false;

      // Validate getCorporateActionsByType response
      expect(corporateActionsByType.actionTypes_.length).to.equal(1);
      expect(corporateActionsByType.actionIdByType_.length).to.equal(1);
      expect(corporateActionsByType.datas_.length).to.equal(1);
      expect(corporateActionsByType.isDisabled_.length).to.equal(1);

      expect(corporateActionsByType.actionTypes_[0].toUpperCase()).to.equal(actionType.toUpperCase());
      expect(corporateActionsByType.actionIdByType_[0]).to.equal(BigInt(corporateActionId_1));
      expect(corporateActionsByType.datas_[0].toUpperCase()).to.equal(encodedDividendData.toUpperCase());
      expect(corporateActionsByType.isDisabled_[0]).to.be.false;

      // Cross-validate that getCorporateActions and getCorporateActionsByType return the same data
      expect(corporateActions.actionTypes_[0]).to.equal(corporateActionsByType.actionTypes_[0]);
      expect(corporateActions.actionIdByType_[0]).to.equal(corporateActionsByType.actionIdByType_[0]);
      expect(corporateActions.datas_[0]).to.equal(corporateActionsByType.datas_[0]);
      expect(corporateActions.isDisabled_[0]).to.equal(corporateActionsByType.isDisabled_[0]);
    });

    describe("initializeCorporateActions", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeCorporateActions is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_B).initializeCorporateActions())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_B.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeCorporateActions is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeCorporateActions())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_CORPORATE_ACTIONS, 1);
      });
    });

    describe("initializeCorporateActions event", () => {
      it("GIVEN a fresh deployment WHEN initializeCorporateActions is called THEN emits CorporateActionsInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_CORPORATE_ACTIONS);
        await expect(asset.initializeCorporateActions()).to.emit(asset, "CorporateActionsInitialized");
      });
    });
  });
}
