import { QueryResponse } from '../../../core/query/QueryResponse.js';

export default interface VotingRightsViewModel extends QueryResponse {
  votingId: number;
  recordDate: Date;
  data: string;
  snapshotId?: number;
}
