// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface LockViewModel extends QueryResponse {
  id: number;
  amount: string;
  expirationDate: string;
}
