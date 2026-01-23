// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class SetNameRequest extends ValidatedRequest<SetNameRequest> {
  securityId: string;
  name: string;

  constructor({ securityId, name }: { securityId: string; name: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      name: FormatValidation.checkString({ emptyCheck: true }),
    });

    this.securityId = securityId;
    this.name = name;
  }
}
