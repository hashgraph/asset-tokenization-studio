// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface VotingRightsViewModel extends QueryResponse {
  votingId: number;
  recordDate: Date;
  data: string;
  snapshotId?: number;
}
