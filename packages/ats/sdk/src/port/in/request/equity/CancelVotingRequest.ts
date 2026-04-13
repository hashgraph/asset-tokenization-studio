// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class CancelVotingRequest extends ValidatedRequest<CancelVotingRequest> {
  securityId: string;
  votingId: number;

  constructor({ securityId, votingId }: { securityId: string; votingId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.votingId = votingId;
  }
}
