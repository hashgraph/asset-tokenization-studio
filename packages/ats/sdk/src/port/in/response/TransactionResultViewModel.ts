// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface TransactionResultViewModel extends QueryResponse {
  result?: string;
}
