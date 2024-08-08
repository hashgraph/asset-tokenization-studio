import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetLockRequest extends ValidatedRequest<GetLockRequest> {
  securityId: string;
  targetId: string;
  id: number;

  constructor({
    securityId,
    targetId,
    id,
  }: {
    securityId: string;
    targetId: string;
    id: number;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
    this.targetId = targetId;
    this.id = id;
  }
}
