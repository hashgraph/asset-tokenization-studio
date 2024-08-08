import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';
import { SecurityDate } from '../../../domain/context/shared/SecurityDate.js';

export default class SetVotingRightsRequest extends ValidatedRequest<SetVotingRightsRequest> {
  securityId: string;
  recordTimestamp: string;
  data: string;

  constructor({
    securityId,
    recordTimestamp,
    data,
  }: {
    securityId: string;
    recordTimestamp: string;
    data: string;
  }) {
    super({
      recordTimestamp: (val) => {
        return SecurityDate.checkDateTimestamp(
          parseInt(val),
          Math.ceil(new Date().getTime() / 1000),
          undefined,
        );
      },
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      data: Validation.checkBytesFormat(),
    });

    this.securityId = securityId;
    this.recordTimestamp = recordTimestamp;
    this.data = data;
  }
}
