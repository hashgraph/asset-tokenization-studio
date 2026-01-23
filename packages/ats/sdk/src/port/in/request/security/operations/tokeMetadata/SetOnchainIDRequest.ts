// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class SetOnchainIDRequest extends ValidatedRequest<SetOnchainIDRequest> {
  securityId: string;
  onchainID: string;

  constructor({ securityId, onchainID }: { securityId: string; onchainID: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      onchainID: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.onchainID = onchainID;
  }
}
