import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetControlListCountRequest extends ValidatedRequest<GetControlListCountRequest> {
  securityId: string;

  constructor({ securityId }: { securityId: string }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
  }
}
