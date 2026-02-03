// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class GetRoleMemberCountRequest extends ValidatedRequest<GetRoleMemberCountRequest> {
  securityId: string;
  role: string;

  constructor({ securityId, role }: { securityId: string; role: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      role: FormatValidation.checkBytes32Format(),
    });
    this.securityId = securityId;
    this.role = role;
  }
}
