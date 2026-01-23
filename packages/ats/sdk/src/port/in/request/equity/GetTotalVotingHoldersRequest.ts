// SPDX-License-Identifier: Apache-2.0

import FormatValidation from "@port/in/request/FormatValidation";
import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class GetTotalVotingHoldersRequest extends ValidatedRequest<GetTotalVotingHoldersRequest> {
  securityId: string;
  voteId: number;

  constructor({ securityId, voteId }: { securityId: string; voteId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      voteId: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.voteId = voteId;
  }
}
