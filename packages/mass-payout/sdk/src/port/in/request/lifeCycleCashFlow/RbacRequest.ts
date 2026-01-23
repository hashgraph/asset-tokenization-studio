// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class RbacRequest extends ValidatedRequest<RbacRequest> {
  role: string;
  members: string[];

  constructor({ role, members }: { role: string; members: string[] }) {
    super({
      role: FormatValidation.checkBytes32Format(),
      members: (vals) => FormatValidation.checkHederaIdOrEvmAddressArray(vals, "members", true),
    });

    this.role = role;
    this.members = members;
  }
}
