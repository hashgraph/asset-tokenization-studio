import { QueryResponse } from '../../../core/query/QueryResponse.js';

export default interface DividendsViewModel extends QueryResponse {
  dividendId: number;
  amountPerUnitOfSecurity: string;
  recordDate: Date;
  executionDate: Date;
  snapshotId?: number;
}
