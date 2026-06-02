// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class GetCustomDataRequest extends ValidatedRequest<GetCustomDataRequest> {
  securityId: string;
  key: string;

  constructor({ securityId, key }: { securityId: string; key: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      key: FormatValidation.checkString({ emptyCheck: true }),
    });
    this.securityId = securityId;
    this.key = key;
  }
}
