import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetAllDividendsRequest extends ValidatedRequest<GetAllDividendsRequest> {
  securityId: string;

  constructor({ securityId }: { securityId: string }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
  }
}
