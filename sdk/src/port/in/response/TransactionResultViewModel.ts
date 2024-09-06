import { QueryResponse } from '../../../core/query/QueryResponse.js';

export default interface TransactionResultViewModel extends QueryResponse {
  result?: string;
}
