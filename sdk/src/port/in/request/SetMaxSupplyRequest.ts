import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class SetMaxSupplyRequest extends ValidatedRequest<SetMaxSupplyRequest> {
  securityId: string;
  maxSupply: string;

  constructor({
    securityId,
    maxSupply,
  }: {
    securityId: string;
    maxSupply: string;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      maxSupply: Validation.checkAmount(),
    });

    this.securityId = securityId;
    this.maxSupply = maxSupply;
  }
}
