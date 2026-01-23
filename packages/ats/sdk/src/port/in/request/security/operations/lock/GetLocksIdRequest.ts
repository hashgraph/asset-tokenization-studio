// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class GetLocksIdRequest extends ValidatedRequest<GetLocksIdRequest> {
  securityId: string;
  targetId: string;
  start: number;
  end: number;

  constructor({
    securityId,
    targetId,
    start,
    end,
  }: {
    securityId: string;
    targetId: string;
    start: number;
    end: number;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
    this.targetId = targetId;
    this.start = start;
    this.end = end;
  }
}
