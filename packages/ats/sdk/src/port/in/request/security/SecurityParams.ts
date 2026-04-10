// SPDX-License-Identifier: Apache-2.0

export interface SecurityParams {
  name: string;
  symbol: string;
  isin: string;
  decimals: number | string;
  isWhiteList: boolean;
  erc20VotesActivated: boolean;
  isControllable: boolean;
  arePartitionsProtected: boolean;
  isMultiPartition: boolean;
  clearingActive: boolean;
  internalKycActivated: boolean;
  numberOfUnits: string;
  regulationType: number;
  regulationSubType: number;
  isCountryControlListWhiteList: boolean;
  countries: string;
  info: string;
  configId: string;
  configVersion: number;
  diamondOwnerAccount?: string;
  externalPausesIds?: string[];
  externalControlListsIds?: string[];
  externalKycListsIds?: string[];
  complianceId?: string;
  identityRegistryId?: string;
}
