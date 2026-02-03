// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface ClearingRedeemViewModel extends QueryResponse {
  id: number;
  amount: string;
  expirationDate: Date;
  data: string;
  operatorData: string;
}
