// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

import { SecurityDate } from "@domain/context/shared/SecurityDate";

export default class UpdateMaturityDateRequest extends ValidatedRequest<UpdateMaturityDateRequest> {
  securityId: string;
  maturityDate: string;

  constructor({ securityId, maturityDate }: { securityId: string; maturityDate: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      maturityDate: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val));
      },
    });

    this.securityId = securityId;
    this.maturityDate = maturityDate;
  }
}
