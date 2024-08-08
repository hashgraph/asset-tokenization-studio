import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class PauseRequest extends ValidatedRequest<PauseRequest> {
  securityId: string;

  constructor({ securityId }: { securityId: string }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
  }
}
