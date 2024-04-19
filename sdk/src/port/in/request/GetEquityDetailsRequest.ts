import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetEquityDetailsRequest extends ValidatedRequest<GetEquityDetailsRequest> {
  equityId: string;

  constructor({ equityId }: { equityId: string }) {
    super({
      equityId: Validation.checkHederaIdFormatOrEvmAddress(),
    });

    this.equityId = equityId;
  }
}
