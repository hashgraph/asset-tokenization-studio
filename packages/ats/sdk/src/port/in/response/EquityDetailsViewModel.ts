// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface EquityDetailsViewModel extends QueryResponse {
  votingRight: boolean;
  informationRight: boolean;
  liquidationRight: boolean;
  subscriptionRight: boolean;
  conversionRight: boolean;
  redemptionRight: boolean;
  putRight: boolean;
  dividendRight: number;
  currency: string;
  nominalValue: string;
  nominalValueDecimals: number;
}
