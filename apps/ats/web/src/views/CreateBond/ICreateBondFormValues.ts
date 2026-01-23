// SPDX-License-Identifier: Apache-2.0

export interface ICreateBondFormValues {
  name: string;
  symbol: string;
  decimals: number;
  isin: string;
  isControllable: boolean;
  isBlocklist: boolean;
  isApproval: boolean;
  isClearing: boolean;
  currency: string;
  numberOfUnits: string;
  nominalValue: number;
  nominalValueDecimals: number;
  totalAmount: string;
  startingDate: string;
  maturityDate: string;
  regulationType: number;
  regulationSubType: number;
  countriesListType: number;
  countriesList: string[];
  externalPausesList?: string[];
  externalControlList: string[];
  externalKYCList?: string[];
  internalKycActivated: boolean;
  complianceId?: string;
  identityRegistryId?: string;
  proceedRecipientsIds?: string[];
  proceedRecipientsData?: string[];
}
