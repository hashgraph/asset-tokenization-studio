import PublicKey from 'domain/context/account/PublicKey.js';
import { QueryResponse } from '../../../core/query/QueryResponse.js';

export default interface AccountViewModel extends QueryResponse {
  id?: string;
  accountEvmAddress?: string;
  publicKey?: PublicKey;
  alias?: string;
}
