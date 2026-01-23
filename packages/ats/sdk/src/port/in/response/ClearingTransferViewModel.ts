// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface ClearingTransferViewModel extends QueryResponse {
  id: number;
  amount: string;
  expirationDate: Date;
  destination: string;
  data: string;
  operatorData: string;
}
