import { MIN_ID } from '../../../domain/context/security/CorporateAction.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetCouponForRequest extends ValidatedRequest<GetCouponForRequest> {
  securityId: string;
  targetId: string;
  couponId: number;

  constructor({
    targetId,
    securityId,
    couponId,
  }: {
    targetId: string;
    securityId: string;
    couponId: number;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
      couponId: Validation.checkNumber({
        max: undefined,
        min: MIN_ID,
      }),
    });
    this.securityId = securityId;
    this.targetId = targetId;
    this.couponId = couponId;
  }
}
