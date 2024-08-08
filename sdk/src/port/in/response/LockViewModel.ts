import { QueryResponse } from '../../../core/query/QueryResponse.js';

export default interface LockViewModel extends QueryResponse {
  id: number;
  amount: string;
  expirationDate: string;
}
