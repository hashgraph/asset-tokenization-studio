export interface ICreateEquityFormValues {
  name: string;
  symbol: string;
  decimals: number;
  isin: string;
  isControllable: boolean;
  isBlocklist: boolean;
  isApproval: boolean;
  nominalValue: number;
  currency: string;
  numberOfShares: string;
  totalAmount: string;
  isVotingRight: boolean;
  isInformationRight: boolean;
  isLiquidationRight: boolean;
  isSubscriptionRight: boolean;
  isConversionRight: boolean;
  isRedemptionRight: boolean;
  isPutRight: boolean;
  dividendType: number;
  regulationType: number;
  regulationSubType: number;
  countriesListType: number;
  countriesList: string[];
}
