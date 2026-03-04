// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class GetCorporateActionsByTypeRequest extends ValidatedRequest<GetCorporateActionsByTypeRequest> {
  securityId: string;
  actionType: string;
  pageIndex: number;
  pageLength: number;

  constructor({
    securityId,
    actionType,
    pageIndex,
    pageLength,
  }: {
    securityId: string;
    actionType: string;
    pageIndex: number;
    pageLength: number;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      actionType: FormatValidation.checkBytes32Format(),
      pageIndex: FormatValidation.checkIsNotNegative(),
      pageLength: FormatValidation.checkIsPositive(),
    });

    this.securityId = securityId;
    this.actionType = actionType;
    this.pageIndex = pageIndex;
    this.pageLength = pageLength;
  }
}
