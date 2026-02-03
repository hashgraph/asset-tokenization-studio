// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";
import { BaseArgs as BaseRequest } from "@core/validation/BaseArgs";

export default class IssueRequest extends ValidatedRequest<IssueRequest> implements BaseRequest {
  securityId: string;
  targetId: string;
  amount: string;

  constructor({ amount, targetId, securityId }: { amount: string; targetId: string; securityId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amount: FormatValidation.checkAmount(),
    });
    this.securityId = securityId;
    this.targetId = targetId;
    this.amount = amount;
  }
}
