import { MIN_ID } from '../../../domain/context/security/CorporateAction.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetVotingRightsForRequest extends ValidatedRequest<GetVotingRightsForRequest> {
  securityId: string;
  targetId: string;
  votingId: number;

  constructor({
    targetId,
    securityId,
    votingId,
  }: {
    targetId: string;
    securityId: string;
    votingId: number;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
      votingId: Validation.checkNumber({
        max: undefined,
        min: MIN_ID,
      }),
    });
    this.securityId = securityId;
    this.targetId = targetId;
    this.votingId = votingId;
  }
}
