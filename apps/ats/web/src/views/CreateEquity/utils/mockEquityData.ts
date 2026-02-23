// SPDX-License-Identifier: Apache-2.0

import { ICreateEquityFormValues } from "../ICreateEquityFormValues";
import { formatNumber } from "../../../utils/format";

export const getMockEquityFormData = (): Partial<ICreateEquityFormValues> => {
  const nominalValue = 10;
  const numberOfShares = 1000000;
  const totalAmount = nominalValue * numberOfShares;

  return {
    // Step 1: Create Equity
    name: "Demo Equity 2026",
    symbol: "DES2026",
    decimals: 6,
    isin: "US0378331005",
    isControllable: true,
    isBlocklist: true,
    isApproval: false,
    isClearing: false,
    internalKycActivated: true,

    // Step 2: Specific details
    currency: "USD",
    numberOfShares: numberOfShares.toString(),
    nominalValue: nominalValue,
    nominalValueDecimals: 2,
    totalAmount: formatNumber(totalAmount, {}, 18),
    isVotingRight: true,
    isInformationRight: true,
    isLiquidationRight: false,
    isSubscriptionRight: false,
    isConversionRight: false,
    isRedemptionRight: false,
    isPutRight: false,
    dividendType: 2,

    // Step 3: External Lists
    externalPausesList: [],
    externalControlList: [],
    externalKYCList: [],

    // Step 4: ERC3643
    complianceId: undefined,
    identityRegistryId: undefined,

    // Step 5: Regulation
    regulationType: 1,
    regulationSubType: 0,
    countriesListType: 1,
    countriesList: [],
  };
};
