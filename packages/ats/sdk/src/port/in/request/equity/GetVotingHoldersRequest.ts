// SPDX-License-Identifier: Apache-2.0

import FormatValidation from "@port/in/request/FormatValidation";
import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class GetVotingHoldersRequest extends ValidatedRequest<GetVotingHoldersRequest> {
  securityId: string;
  voteId: number;
  start: number;
  end: number;

  constructor({ securityId, voteId, start, end }: { securityId: string; voteId: number; start: number; end: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      voteId: FormatValidation.checkNumber({ min: 0 }),
      start: FormatValidation.checkNumber({ min: 0 }),
      end: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.voteId = voteId;
    this.start = start;
    this.end = end;
  }
}
