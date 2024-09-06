import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetRolesForRequest extends ValidatedRequest<GetRolesForRequest> {
  securityId: string;
  targetId: string;
  start: number;
  end: number;

  constructor({
    securityId,
    targetId,
    start,
    end,
  }: {
    securityId: string;
    targetId: string;
    start: number;
    end: number;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
    this.targetId = targetId;
    this.start = start;
    this.end = end;
  }
}
