// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class ExecuteBondCashOutRequest extends ValidatedRequest<ExecuteBondCashOutRequest> {
  lifeCycleCashFlow: string;
  bond: string;
  pageIndex: number;
  pageLength: number;

  constructor({
    lifeCycleCashFlow,
    bond,
    pageIndex,
    pageLength,
  }: {
    lifeCycleCashFlow: string;
    bond: string;
    pageIndex: number;
    pageLength: number;
  }) {
    super({
      lifeCycleCashFlow: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      bond: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      pageIndex: FormatValidation.checkNumber({ min: 0 }),
      pageLength: FormatValidation.checkNumber({ min: 1 }),
    });

    this.lifeCycleCashFlow = lifeCycleCashFlow;
    this.bond = bond;
    this.pageIndex = pageIndex;
    this.pageLength = pageLength;
  }
}
