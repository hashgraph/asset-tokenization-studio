import { QueryResponse } from '../../../core/query/QueryResponse.js';

export enum ControlListStatus {
  'MEMBER' = 'MEMBER',
  'NOT_MEMBER' = 'NOT_MEMBER',
}

export interface AccountSecurityRelation extends QueryResponse {
  balance: string;
  controlListStatus: ControlListStatus;
  securityId: string;
}
