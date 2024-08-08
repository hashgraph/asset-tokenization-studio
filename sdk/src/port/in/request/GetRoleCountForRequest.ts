import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetRoleCountForRequest extends ValidatedRequest<GetRoleCountForRequest> {
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
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
    this.targetId = targetId;
  }
}
