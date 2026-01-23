// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class GetRevocationRegistryAddressRequest extends ValidatedRequest<GetRevocationRegistryAddressRequest> {
  securityId: string;

  constructor({ securityId }: { securityId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
  }
}
