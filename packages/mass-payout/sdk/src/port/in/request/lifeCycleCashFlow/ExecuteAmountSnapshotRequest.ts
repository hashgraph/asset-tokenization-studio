// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class ExecuteAmountSnapshotRequest extends ValidatedRequest<ExecuteAmountSnapshotRequest> {
  lifeCycleCashFlow: string;
  asset: string;
  snapshotId: string;
  pageIndex: number;
  pageLength: number;
  amount: string;

  constructor({
    lifeCycleCashFlow,
    asset,
    snapshotId,
    pageIndex,
    pageLength,
    amount,
  }: {
    lifeCycleCashFlow: string;
    asset: string;
    snapshotId: string;
    pageIndex: number;
    pageLength: number;
    amount: string;
  }) {
    super({
      lifeCycleCashFlow: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      asset: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      snapshotId: FormatValidation.checkNumber(),
      pageIndex: FormatValidation.checkNumber({ min: 0 }),
      pageLength: FormatValidation.checkNumber({ min: 1 }),
      amount: FormatValidation.checkAmount(false),
    });

    this.lifeCycleCashFlow = lifeCycleCashFlow;
    this.asset = asset;
    this.snapshotId = snapshotId;
    this.pageIndex = pageIndex;
    this.pageLength = pageLength;
    this.amount = amount;
  }
}
