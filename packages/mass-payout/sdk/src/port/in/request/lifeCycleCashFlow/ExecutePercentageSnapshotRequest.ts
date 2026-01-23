// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class ExecutePercentageSnapshotRequest extends ValidatedRequest<ExecutePercentageSnapshotRequest> {
  lifeCycleCashFlow: string;
  asset: string;
  snapshotId: string;
  pageIndex: number;
  pageLength: number;
  percentage: string;

  constructor({
    lifeCycleCashFlow,
    asset,
    snapshotId,
    pageIndex,
    pageLength,
    percentage,
  }: {
    lifeCycleCashFlow: string;
    asset: string;
    snapshotId: string;
    pageIndex: number;
    pageLength: number;
    percentage: string;
  }) {
    super({
      lifeCycleCashFlow: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      asset: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      snapshotId: FormatValidation.checkNumber(),
      pageIndex: FormatValidation.checkNumber({ min: 0 }),
      pageLength: FormatValidation.checkNumber({ min: 1 }),
      percentage: FormatValidation.checkNumber({
        max: 100,
        min: 0.01,
      }),
    });

    this.lifeCycleCashFlow = lifeCycleCashFlow;
    this.asset = asset;
    this.snapshotId = snapshotId;
    this.pageIndex = pageIndex;
    this.pageLength = pageLength;
    this.percentage = percentage;
  }
}
