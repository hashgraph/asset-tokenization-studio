import { QueryResponse } from 'core/query/QueryResponse';

export default interface EquityDetailsViewModel extends QueryResponse {
  votingRight: boolean;
  informationRight: boolean;
  liquidationRight: boolean;
  subscriptionRight: boolean;
  convertionRight: boolean;
  redemptionRight: boolean;
  putRight: boolean;
  dividendRight: number;
  currency: string;
  nominalValue: string;
}
