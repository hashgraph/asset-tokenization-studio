// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../../FormatValidation";
import { BaseArgs as BaseRequest } from "@core/validation/BaseArgs";

export default class MintRequest extends ValidatedRequest<MintRequest> implements BaseRequest {
  securityId: string;
  targetId: string;
  amount: string;

  constructor({ securityId, targetId, amount }: { amount: string; targetId: string; securityId: string }) {
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
