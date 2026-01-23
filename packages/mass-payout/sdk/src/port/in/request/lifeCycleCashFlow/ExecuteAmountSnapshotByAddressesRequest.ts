// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

// eslint-disable-next-line max-len
export default class ExecuteAmountSnapshotByAddressesRequest extends ValidatedRequest<ExecuteAmountSnapshotByAddressesRequest> {
  lifeCycleCashFlow: string;
  asset: string;
  snapshotId: string;
  holders: string[];
  amount: string;

  constructor({
    lifeCycleCashFlow,
    asset,
    snapshotId,
    holders,
    amount,
  }: {
    lifeCycleCashFlow: string;
    asset: string;
    snapshotId: string;
    holders: string[];
    amount: string;
  }) {
    super({
      lifeCycleCashFlow: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      asset: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      snapshotId: FormatValidation.checkNumber(),
      holders: (vals) => FormatValidation.checkHederaIdOrEvmAddressArray(vals, "holders", false),
      amount: FormatValidation.checkAmount(false),
    });

    this.lifeCycleCashFlow = lifeCycleCashFlow;
    this.asset = asset;
    this.snapshotId = snapshotId;
    this.holders = holders;
    this.amount = amount;
  }
}
