import { QueryResponse } from 'core/query/QueryResponse';

export default interface BondDetailsViewModel extends QueryResponse {
  currency: string;
  nominalValue: string;
  startingDate: Date;
  maturityDate: Date;
}
