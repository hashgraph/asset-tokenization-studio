// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class RemoveExternalPauseRequest extends ValidatedRequest<RemoveExternalPauseRequest> {
  securityId: string;
  externalPauseAddress: string;

  constructor({ securityId, externalPauseAddress }: { securityId: string; externalPauseAddress: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      externalPauseAddress: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.externalPauseAddress = externalPauseAddress;
  }
}
