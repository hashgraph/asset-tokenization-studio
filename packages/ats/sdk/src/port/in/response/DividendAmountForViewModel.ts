// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface DividendAmountForViewModel extends QueryResponse {
  numerator: string;
  denominator: string;
  recordDateReached: boolean;
}
