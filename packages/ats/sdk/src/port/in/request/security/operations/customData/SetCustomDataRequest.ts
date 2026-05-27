// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class SetCustomDataRequest extends ValidatedRequest<SetCustomDataRequest> {
  securityId: string;
  key: string;
  value: string[];

  constructor({ securityId, key, value }: { securityId: string; key: string; value: string[] }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      key: FormatValidation.checkString({ emptyCheck: true }),
    });
    this.securityId = securityId;
    this.key = key;
    this.value = value;
  }
}
