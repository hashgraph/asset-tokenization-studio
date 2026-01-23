// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class AddExternalControlListRequest extends ValidatedRequest<AddExternalControlListRequest> {
  securityId: string;
  externalControlListAddress: string;

  constructor({ securityId, externalControlListAddress }: { securityId: string; externalControlListAddress: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      externalControlListAddress: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.externalControlListAddress = externalControlListAddress;
  }
}
