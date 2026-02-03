// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface HoldViewModel extends QueryResponse {
  id: number;
  amount: string;
  expirationDate: Date;
  tokenHolderAddress: string;
  escrowAddress: string;
  destinationAddress: string;
  data: string;
  operatorData: string;
}
