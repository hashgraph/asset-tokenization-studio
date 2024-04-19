import { QueryResponse } from 'core/query/QueryResponse';

export default interface CouponDetailsViewModel extends QueryResponse {
  couponFrequency: number;
  couponRate: string;
  firstCouponDate: Date;
}
