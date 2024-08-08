export interface ICreateBondFormValues {
  name: string;
  symbol: string;
  decimals: number;
  isin: string;
  isControllable: boolean;
  isBlocklist: boolean;
  isApproval: boolean;
  currency: string;
  numberOfUnits: string;
  nominalValue: number;
  totalAmount: string;
  startingDate: string;
  maturityDate: string;
  couponType: number;
  couponFrequency: string;
  couponRate: number;
  firstCouponDate: string;
  lastCouponDate: string;
  totalCoupons: number;
  regulationType: number;
  regulationSubType: number;
  countriesListType: number;
  countriesList: string[];
}
