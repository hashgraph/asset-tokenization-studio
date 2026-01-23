// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class SetRevocationRegistryAddressRequest extends ValidatedRequest<SetRevocationRegistryAddressRequest> {
  securityId: string;
  revocationRegistryId: string;

  constructor({ securityId, revocationRegistryId }: { revocationRegistryId: string; securityId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      revocationRegistryId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.revocationRegistryId = revocationRegistryId;
  }
}
