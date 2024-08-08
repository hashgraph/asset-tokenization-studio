import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class ControlListRequest extends ValidatedRequest<ControlListRequest> {
  securityId: string;
  targetId: string;

  constructor({
    securityId,
    targetId,
  }: {
    securityId: string;
    targetId: string;
  }) {
    super({
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
    this.targetId = targetId;
  }
}
