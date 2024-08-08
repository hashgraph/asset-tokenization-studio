import { MIN_ID } from '../../../domain/context/security/CorporateAction.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetVotingRightsRequest extends ValidatedRequest<GetVotingRightsRequest> {
  securityId: string;
  votingId: number;

  constructor({
    securityId,
    votingId,
  }: {
    securityId: string;
    votingId: number;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      votingId: Validation.checkNumber({
        max: undefined,
        min: MIN_ID,
      }),
    });
    this.securityId = securityId;
    this.votingId = votingId;
  }
}
