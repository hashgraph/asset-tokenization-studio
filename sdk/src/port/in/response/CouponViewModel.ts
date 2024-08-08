import { QueryResponse } from '../../../core/query/QueryResponse.js';

export default interface CouponViewModel extends QueryResponse {
  couponId: number;
  recordDate: Date;
  executionDate: Date;
  rate: string;
  snapshotId?: number;
}
