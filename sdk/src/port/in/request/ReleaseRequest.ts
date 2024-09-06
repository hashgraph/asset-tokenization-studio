import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class ReleaseRequest extends ValidatedRequest<ReleaseRequest> {
  securityId: string;
  targetId: string;
  lockId: number;

  constructor({
    targetId,
    lockId,
    securityId,
  }: {
    targetId: string;
    lockId: number;
    securityId: string;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.lockId = lockId;
  }
}
