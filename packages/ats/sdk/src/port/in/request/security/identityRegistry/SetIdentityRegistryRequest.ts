// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class SetIdentityRegistryRequest extends ValidatedRequest<SetIdentityRegistryRequest> {
  securityId: string;
  identityRegistry: string;

  constructor({ securityId, identityRegistry }: { securityId: string; identityRegistry: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      identityRegistry: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.identityRegistry = identityRegistry;
  }
}
