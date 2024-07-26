import { BondDetailsData } from './BondDetailsData.js';
import { CouponDetailsData } from './CouponDetailsData.js';
import { SecurityData } from './SecurityData.js';
import { EquityDetailsData } from './EquityDetailsData.js';
import { AdditionalSecurityData } from './AdditionalSecurityData.js';

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
  public couponDetails: CouponDetailsData;

  constructor(
    security: SecurityData,
    bondDetails: BondDetailsData,
    couponDetails: CouponDetailsData,
  ) {
    this.security = security;
    this.bondDetails = bondDetails;
    this.couponDetails = couponDetails;
  }
}

export class FactoryRegulationData {
  public regulationType: number;
  public regulationSubType: number;
  public additionalSecurityData: AdditionalSecurityData;

  constructor(
    regulationType: number,
    regulationSubType: number,
    additionalSecurityData: AdditionalSecurityData,
  ) {
    this.regulationType = regulationType;
    this.regulationSubType = regulationSubType;
    this.additionalSecurityData = additionalSecurityData;
  }
}
