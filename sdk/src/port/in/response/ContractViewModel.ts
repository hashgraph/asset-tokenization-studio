import { QueryResponse } from '../../../core/query/QueryResponse.js';

export default interface ContractViewModel extends QueryResponse {
  id: string;
  evmAddress: string;
}
