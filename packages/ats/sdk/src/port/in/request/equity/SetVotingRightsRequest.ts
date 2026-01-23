// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

import { SecurityDate } from "@domain/context/shared/SecurityDate";

export default class SetVotingRightsRequest extends ValidatedRequest<SetVotingRightsRequest> {
  securityId: string;
  recordTimestamp: string;
  data: string;

  constructor({ securityId, recordTimestamp, data }: { securityId: string; recordTimestamp: string; data: string }) {
    super({
      recordTimestamp: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), Math.ceil(new Date().getTime() / 1000), undefined);
      },
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      data: FormatValidation.checkBytesFormat(),
    });

    this.securityId = securityId;
    this.recordTimestamp = recordTimestamp;
    this.data = data;
  }
}
