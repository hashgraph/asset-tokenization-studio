// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class ExecuteDistributionRequest extends ValidatedRequest<ExecuteDistributionRequest> {
  lifeCycleCashFlow: string;
  asset: string;
  pageIndex: number;
  pageLength: number;
  distributionId: string;

  constructor({
    lifeCycleCashFlow,
    asset,
    pageIndex,
    pageLength,
    distributionId,
  }: {
    lifeCycleCashFlow: string;
    asset: string;
    pageIndex: number;
    pageLength: number;
    distributionId: string;
  }) {
    super({
      lifeCycleCashFlow: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      asset: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      pageIndex: FormatValidation.checkNumber({ min: 0 }),
      pageLength: FormatValidation.checkNumber({ min: 1 }),
      distributionId: FormatValidation.checkNumber(),
    });

    this.lifeCycleCashFlow = lifeCycleCashFlow;
    this.asset = asset;
    this.pageIndex = pageIndex;
    this.pageLength = pageLength;
    this.distributionId = distributionId;
  }
}
