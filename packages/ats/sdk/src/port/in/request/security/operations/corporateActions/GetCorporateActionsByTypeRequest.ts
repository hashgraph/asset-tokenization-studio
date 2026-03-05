// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class GetCorporateActionsByTypeRequest extends ValidatedRequest<GetCorporateActionsByTypeRequest> {
  securityId: string;
  actionType: string;
  start: number;
  end: number;

  constructor({
    securityId,
    actionType,
    start,
    end,
  }: {
    securityId: string;
    actionType: string;
    start: number;
    end: number;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      actionType: FormatValidation.checkBytes32Format(),
      start: FormatValidation.checkNumber({ min: 0 }),
      end: FormatValidation.checkNumber({ min: 1 }),
    });

    this.securityId = securityId;
    this.actionType = actionType;
    this.start = start;
    this.end = end;
  }
}
