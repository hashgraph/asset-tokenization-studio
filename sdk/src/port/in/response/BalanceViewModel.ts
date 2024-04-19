import { QueryResponse } from '../../../core/query/QueryResponse.js';

export default interface BalanceViewModel extends QueryResponse {
  value: string;
}
