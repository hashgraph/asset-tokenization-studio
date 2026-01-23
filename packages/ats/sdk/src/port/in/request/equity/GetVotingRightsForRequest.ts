// SPDX-License-Identifier: Apache-2.0

import { MIN_ID } from "@domain/context/security/CorporateAction";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetVotingRightsForRequest extends ValidatedRequest<GetVotingRightsForRequest> {
  securityId: string;
  targetId: string;
  votingId: number;

  constructor({ targetId, securityId, votingId }: { targetId: string; securityId: string; votingId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      votingId: FormatValidation.checkNumber({
        max: undefined,
        min: MIN_ID,
      }),
    });
    this.securityId = securityId;
    this.targetId = targetId;
    this.votingId = votingId;
  }
}
