// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class GetRoleMembersRequest extends ValidatedRequest<GetRoleMembersRequest> {
  securityId: string;
  role: string;
  start: number;
  end: number;

  constructor({ securityId, role, start, end }: { securityId: string; role: string; start: number; end: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      role: FormatValidation.checkRole(),
    });
    this.securityId = securityId;
    this.role = role;
    this.start = start;
    this.end = end;
  }
}
