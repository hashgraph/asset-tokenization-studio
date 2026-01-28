// SPDX-License-Identifier: Apache-2.0

import { BondDetailsData } from "./BondDetailsData";
import { SecurityData } from "./SecurityData";
import { EquityDetailsData } from "./EquityDetailsData";
import { AdditionalSecurityData } from "./AdditionalSecurityData";
import { BondFixedRateDetailsData } from "./BondFixedRateDetailsData";

export class FactoryEquityToken {
  public security: SecurityData;
  public equityDetails: EquityDetailsData;

  constructor(security: SecurityData, equityDetails: EquityDetailsData) {
    this.security = security;
    this.equityDetails = equityDetails;
  }
}

export class FactoryBondToken {
  public security: SecurityData;
  public bondDetails: BondDetailsData;
  public proceedRecipients: string[];
  public proceedRecipientsData: string[];

  constructor(
    security: SecurityData,
    bondDetails: BondDetailsData,
    proceedRecipients: string[],
    proceedRecipientsData: string[],
  ) {
    this.security = security;
    this.bondDetails = bondDetails;
    this.proceedRecipients = proceedRecipients;
    this.proceedRecipientsData = proceedRecipientsData;
  }
}

export class FactoryBondFixedRateToken {
  public security: SecurityData;
  public bondFixedRateDetails: BondFixedRateDetailsData;
  public proceedRecipients: string[];
  public proceedRecipientsData: string[];

  constructor(
    security: SecurityData,
    bondFixedRateDetails: BondFixedRateDetailsData,
    proceedRecipients: string[],
    proceedRecipientsData: string[],
  ) {
    this.security = security;
    this.bondFixedRateDetails = bondFixedRateDetails;
    this.proceedRecipients = proceedRecipients;
    this.proceedRecipientsData = proceedRecipientsData;
  }
}

export class FactoryRegulationData {
  public regulationType: number;
  public regulationSubType: number;
  public additionalSecurityData: AdditionalSecurityData;

  constructor(regulationType: number, regulationSubType: number, additionalSecurityData: AdditionalSecurityData) {
    this.regulationType = regulationType;
    this.regulationSubType = regulationSubType;
    this.additionalSecurityData = additionalSecurityData;
  }
}
