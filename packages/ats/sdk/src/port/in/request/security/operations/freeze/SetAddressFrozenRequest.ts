// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "../../../FormatValidation";

export default class SetAddressFrozenRequest extends ValidatedRequest<SetAddressFrozenRequest> {
  securityId: string;
  targetId: string;
  status: boolean;

  constructor({ securityId, targetId, status }: { securityId: string; status: boolean; targetId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      status: FormatValidation.checkBoolean(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(true),
    });
    this.securityId = securityId;
    this.status = status;
    this.targetId = targetId;
  }
}
