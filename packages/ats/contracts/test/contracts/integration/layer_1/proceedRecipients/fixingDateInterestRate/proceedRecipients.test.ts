// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { dateToUnixTimestamp, ATS_ROLES } from "@scripts";
import { executeRbac } from "@test";
import type { AssetMockCtx } from "@test";

const PROCEED_RECIPIENT_1 = "0x1234567890123456789012345678901234567890";
const PROCEED_RECIPIENT_1_DATA = "0xabcdef";
const referenceDate = dateToUnixTimestamp(`2030-01-01T00:01:00Z`);

export function proceedRecipientsTests(getCtx: () => AssetMockCtx): void {
  describe("Proceed Recipients fixing Date Interest RateTests", () => {
    let signer_A: HardhatEthersSigner;
    let asset: IAssetMock;

    const couponData = {
      startDate: referenceDate.toString(),
      endDate: (referenceDate + 100).toString(),
      fixingDate: (referenceDate + 200).toString(),
      recordDate: (referenceDate + 300).toString(),
      executionDate: (referenceDate + 400).toString(),
      rate: 0,
      rateDecimals: 0,
      rateStatus: 0, // PENDING — accepted by KPI-linked rate type
    };

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      signer_A = ctx.deployer;

      // The mega-mock starts in EVM-default state (maturityDate = 0, STANDARD rate type).
      // The legacy fixture deployed via deployBondKpiLinkedRateTokenFixture which set
      // KPI_LINKED rate type and a future maturityDate at deploy time.
      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_MATURITY_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_PROCEED_RECIPIENT_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CORPORATE_ACTION, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_INTEREST_RATE_MANAGER, members: [signer_A.address] },
      ]);
      await asset.updateMaturityDate(dateToUnixTimestamp(`2031-01-01T00:00:00Z`));
      await asset.setCouponRateType(3); // KPI_LINKED — creates 2 pending tasks on setCoupon
    });

    describe("Add Tests", () => {
      it("GIVEN a unlisted proceed recipient WHEN authorized user adds it THEN it is listed and pending tasks triggered", async () => {
        await asset.connect(signer_A).setCoupon(couponData);
        const tasks_count_Before = await asset.scheduledCrossOrderedTaskCount();

        await asset.changeSystemTimestamp(couponData.fixingDate + 1);

        await asset.addProceedRecipient(PROCEED_RECIPIENT_1, PROCEED_RECIPIENT_1_DATA);

        const tasks_count_After = await asset.scheduledCrossOrderedTaskCount();

        expect(tasks_count_Before).to.equal(2);
        expect(tasks_count_After).to.equal(0);
      });
    });

    describe("Remove Tests", () => {
      it("GIVEN a listed proceed recipient WHEN authorized user removes it THEN it is removed and pending tasks triggered", async () => {
        await asset.addProceedRecipient(PROCEED_RECIPIENT_1, PROCEED_RECIPIENT_1_DATA);

        await asset.connect(signer_A).setCoupon(couponData);
        const tasks_count_Before = await asset.scheduledCrossOrderedTaskCount();

        await asset.changeSystemTimestamp(couponData.fixingDate + 1);

        await asset.removeProceedRecipient(PROCEED_RECIPIENT_1);

        const tasks_count_After = await asset.scheduledCrossOrderedTaskCount();

        expect(tasks_count_Before).to.equal(2);
        expect(tasks_count_After).to.equal(0);
      });
    });
  });
}
