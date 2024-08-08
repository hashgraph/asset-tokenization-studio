import { MIN_ID } from '../../../domain/context/security/CorporateAction.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetCouponRequest extends ValidatedRequest<GetCouponRequest> {
  securityId: string;
  couponId: number;

  constructor({
    securityId,
    couponId,
  }: {
    securityId: string;
    couponId: number;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      couponId: Validation.checkNumber({
        max: undefined,
        min: MIN_ID,
      }),
    });
    this.securityId = securityId;
    this.couponId = couponId;
  }
}
