// SPDX-License-Identifier: Apache-2.0

import { MIN_ID } from "@domain/context/security/CorporateAction";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetVotingRightsRequest extends ValidatedRequest<GetVotingRightsRequest> {
  securityId: string;
  votingId: number;

  constructor({ securityId, votingId }: { securityId: string; votingId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      votingId: FormatValidation.checkNumber({
        max: undefined,
        min: MIN_ID,
      }),
    });
    this.securityId = securityId;
    this.votingId = votingId;
  }
}
