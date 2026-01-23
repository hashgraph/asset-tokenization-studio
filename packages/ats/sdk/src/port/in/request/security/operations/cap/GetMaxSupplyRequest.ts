// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class GetMaxSupplyRequest extends ValidatedRequest<GetMaxSupplyRequest> {
  securityId: string;

  constructor({ securityId }: { securityId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
  }
}
