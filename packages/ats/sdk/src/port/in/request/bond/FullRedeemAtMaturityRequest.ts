// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class FullRedeemAtMaturityRequest extends ValidatedRequest<FullRedeemAtMaturityRequest> {
  securityId: string;
  sourceId: string;

  constructor({ securityId, sourceId }: { securityId: string; sourceId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      sourceId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.sourceId = sourceId;
  }
}
