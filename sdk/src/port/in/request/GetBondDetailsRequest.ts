import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetBondDetailsRequest extends ValidatedRequest<GetBondDetailsRequest> {
  bondId: string;

  constructor({ bondId }: { bondId: string }) {
    super({
      bondId: Validation.checkHederaIdFormatOrEvmAddress(),
    });

    this.bondId = bondId;
  }
}
