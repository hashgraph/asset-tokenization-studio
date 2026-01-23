// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface BondDetailsViewModel extends QueryResponse {
  currency: string;
  nominalValue: string;
  nominalValueDecimals: number;
  startingDate: Date;
  maturityDate: Date;
}
