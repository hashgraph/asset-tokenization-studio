// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class GetExternalKycListsMembersRequest extends ValidatedRequest<GetExternalKycListsMembersRequest> {
  securityId: string;
  start: number;
  end: number;

  constructor({ securityId, start, end }: { securityId: string; start: number; end: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      start: FormatValidation.checkNumber({ min: 0 }),
      end: FormatValidation.checkNumber({ min: 0 }),
    });
    this.securityId = securityId;
    this.start = start;
    this.end = end;
  }
}
