// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class SetMaxSupplyRequest extends ValidatedRequest<SetMaxSupplyRequest> {
  securityId: string;
  maxSupply: string;

  constructor({ securityId, maxSupply }: { securityId: string; maxSupply: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      maxSupply: FormatValidation.checkAmount(),
    });

    this.securityId = securityId;
    this.maxSupply = maxSupply;
  }
}
