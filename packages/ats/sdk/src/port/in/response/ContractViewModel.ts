// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface ContractViewModel extends QueryResponse {
  id: string;
  evmAddress: string;
}
