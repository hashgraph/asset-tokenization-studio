import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetControlListMembersRequest extends ValidatedRequest<GetControlListMembersRequest> {
  securityId: string;
  start: number;
  end: number;

  constructor({
    securityId,
    start,
    end,
  }: {
    securityId: string;
    start: number;
    end: number;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
    this.start = start;
    this.end = end;
  }
}
