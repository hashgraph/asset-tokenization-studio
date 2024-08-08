import { QueryResponse } from 'core/query/QueryResponse';

export default interface RegulationViewModel extends QueryResponse {
  type: string;
  subType: string;
  dealSize: string;
  accreditedInvestors: string;
  maxNonAccreditedInvestors: number;
  manualInvestorVerification: string;
  internationalInvestors: string;
  resaleHoldPeriod: string;
}
