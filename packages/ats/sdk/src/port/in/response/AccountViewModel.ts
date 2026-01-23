// SPDX-License-Identifier: Apache-2.0

import PublicKey from "@domain/context/account/PublicKey";
import { QueryResponse } from "@core/query/QueryResponse";

export default interface AccountViewModel extends QueryResponse {
  id?: string;
  accountEvmAddress?: string;
  publicKey?: PublicKey;
  alias?: string;
}
