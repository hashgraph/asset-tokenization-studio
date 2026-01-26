// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class RoleRequest extends ValidatedRequest<RoleRequest> {
  securityId: string;
  targetId: string;
  role: string;

  constructor({ targetId, securityId, role }: { targetId: string; securityId: string; role: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      role: FormatValidation.checkBytes32Format(),
    });
    this.securityId = securityId;
    this.targetId = targetId;
    this.role = role;
  }
}
