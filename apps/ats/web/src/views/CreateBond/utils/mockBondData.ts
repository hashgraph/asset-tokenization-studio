// SPDX-License-Identifier: Apache-2.0

import { ICreateBondFormValues } from "../ICreateBondFormValues";
import { addDays } from "date-fns";
import { formatNumber } from "../../../utils/format";

export const getMockBondFormData = (): Partial<ICreateBondFormValues> => {
  const today = new Date();
  // Starting date: tomorrow (at least 1 day from today as required by CalendarInputController)
  const startingDate = addDays(today, 1);
  // Maturity date: 7 days after starting date
  const maturityDate = addDays(startingDate, 7);

  const nominalValue = 1000;
  const numberOfUnits = 10000;
  const totalAmount = nominalValue * numberOfUnits;

  return {
    // Step 1: Details
    name: "Demo Bond 2026",
    symbol: "DCB2026",
    decimals: 6,
    isin: "US0378331005",
    isControllable: true,
    isBlocklist: true,
    isApproval: false,
    isClearing: false,
    internalKycActivated: true,

    // Step 2: Configuration
    currency: "USD",
    numberOfUnits: numberOfUnits.toString(),
    nominalValue: nominalValue,
    nominalValueDecimals: 2,
    totalAmount: formatNumber(totalAmount, {}, 18),
    startingDate: startingDate as any,
    maturityDate: maturityDate as any,

    // Step 3: Proceed Recipients
    proceedRecipientsIds: [],
    proceedRecipientsData: [],

    // Step 4: ERC3643
    complianceId: undefined,
    identityRegistryId: undefined,

    // Step 5: External Lists
    externalPausesList: [],
    externalControlList: [],
    externalKYCList: [],

    // Step 6: Regulation
    regulationType: 1,
    regulationSubType: 0,
    countriesListType: 1,
    countriesList: [],
  };
};
