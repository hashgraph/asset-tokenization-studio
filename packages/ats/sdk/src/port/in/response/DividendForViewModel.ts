// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface DividendForViewModel extends QueryResponse {
  tokenBalance: string;
  decimals: string;
  isDisabled: boolean;
}
