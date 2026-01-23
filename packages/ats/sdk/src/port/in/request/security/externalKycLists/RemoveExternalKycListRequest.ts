// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class RemoveExternalKycListRequest extends ValidatedRequest<RemoveExternalKycListRequest> {
  securityId: string;
  externalKycListAddress: string;

  constructor({ securityId, externalKycListAddress }: { securityId: string; externalKycListAddress: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      externalKycListAddress: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.externalKycListAddress = externalKycListAddress;
  }
}
