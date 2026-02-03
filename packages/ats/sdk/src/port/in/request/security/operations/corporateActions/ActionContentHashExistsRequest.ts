// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class ActionContentHashExistsRequest extends ValidatedRequest<ActionContentHashExistsRequest> {
  securityId: string;
  contentHash: string;

  constructor({ securityId, contentHash }: { securityId: string; contentHash: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      contentHash: FormatValidation.checkBytes32Format(),
    });

    this.securityId = securityId;
    this.contentHash = contentHash;
  }
}
