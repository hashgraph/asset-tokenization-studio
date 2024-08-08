import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetAllVotingRightsRequest extends ValidatedRequest<GetAllVotingRightsRequest> {
  securityId: string;

  constructor({ securityId }: { securityId: string }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
  }
}
