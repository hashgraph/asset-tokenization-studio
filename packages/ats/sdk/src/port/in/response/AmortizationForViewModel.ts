// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface AmortizationForViewModel extends QueryResponse {
  recordDate: Date;
  executionDate: Date;
  holdId: number;
  holdActive: boolean;
  tokenHeldAmount: string;
  decimalsHeld: number;
  abafAtHold: string;
  tokenBalance: string;
  decimalsBalance: number;
  recordDateReached: boolean;
  abafAtSnapshot: string;
  nominalValue: string;
  nominalValueDecimals: number;
}
