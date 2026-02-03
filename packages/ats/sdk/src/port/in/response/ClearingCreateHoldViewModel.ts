// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface ClearingCreateHoldViewModel extends QueryResponse {
  id: number;
  amount: string;
  expirationDate: Date;
  data: string;
  operatorData: string;
  holdEscrowId: string;
  holdExpirationDate: Date;
  holdTo: string;
  holdData: string;
}
