// SPDX-License-Identifier: Apache-2.0

import { OptionalField } from "@core/decorator/OptionalDecorator";
import { Security } from "@domain/context/security/Security";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";
import { SecurityDate } from "@domain/context/shared/SecurityDate";
import { Factory } from "@domain/context/factory/Factories";
import {
  LoanBasicDataParams,
  LoanInterestDataParams,
  RiskDataParams,
  CollateralParams,
  LoanPerformanceStatusParams,
} from "./LoanRequestParams";
import { SecurityParams } from "../security/SecurityParams";

export default class CreateLoanRequest extends ValidatedRequest<CreateLoanRequest> {
  // Security
  name: string;
  symbol: string;
  isin: string;
  decimals: number;
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

  @OptionalField()
  diamondOwnerAccount?: string;
  @OptionalField()
  externalPausesIds?: string[];
  @OptionalField()
  externalControlListsIds?: string[];
  @OptionalField()
  externalKycListsIds?: string[];
  @OptionalField()
  complianceId?: string;
  @OptionalField()
  identityRegistryId?: string;

  // LoanBasicData (required)
  currency: string;
  nominalValue: string;
  nominalValueDecimals: number;
  startingDate: string;
  maturityDate: string;
  loanStructureType: number;
  repaymentType: number;
  interestType: number;
  originatorAccount: string;
  servicerAccount: string;
  @OptionalField()
  signingDate?: string;

  // LoanInterestData (optional)
  @OptionalField()
  baseReferenceRate?: number;
  @OptionalField()
  floorRate?: string;
  @OptionalField()
  capRate?: string;
  @OptionalField()
  rateMargin?: string;
  @OptionalField()
  dayCount?: number;
  @OptionalField()
  paymentFrequency?: number;
  @OptionalField()
  firstAccrualDate?: string;
  @OptionalField()
  prepaymentPenalty?: string;
  @OptionalField()
  commitmentFee?: string;
  @OptionalField()
  utilizationFee?: string;
  @OptionalField()
  utilizationFeeType?: number;
  @OptionalField()
  servicingFee?: string;

  // RiskData (optional)
  @OptionalField()
  internalRiskGrade?: string;
  @OptionalField()
  defaultProbability?: string;
  @OptionalField()
  lossGivenDefault?: string;

  // Collateral (optional)
  @OptionalField()
  totalCollateralValue?: string;
  @OptionalField()
  loanToValue?: string;

  // LoanPerformanceStatus (optional)
  @OptionalField()
  performanceStatus?: number;
  @OptionalField()
  daysPastDue?: string;

  constructor({
    security,
    nominalValue,
    nominalValueDecimals,
    loanBasicData,
    loanInterestData,
    riskData,
    collateral,
    loanPerformanceStatus,
  }: {
    security: SecurityParams;
    nominalValue: string;
    nominalValueDecimals: number;
    loanBasicData: LoanBasicDataParams;
    loanInterestData?: Partial<LoanInterestDataParams>;
    riskData?: Partial<RiskDataParams>;
    collateral?: Partial<CollateralParams>;
    loanPerformanceStatus?: Partial<LoanPerformanceStatusParams>;
  }) {
    super({
      name: (val) => Security.checkName(val),
      symbol: (val) => Security.checkSymbol(val),
      isin: (val) => Security.checkISIN(val),
      decimals: (val) => Security.checkInteger(val),
      currency: FormatValidation.checkBytes3Format(),
      numberOfUnits: FormatValidation.checkNumber(),
      nominalValue: FormatValidation.checkNumber(),
      startingDate: (val) => {
        return SecurityDate.checkDateTimestamp(
          parseInt(val),
          Math.ceil(new Date().getTime() / 1000),
          parseInt(loanBasicData.maturityDate),
        );
      },
      maturityDate: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), parseInt(loanBasicData.startingDate), undefined);
      },
      originatorAccount: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      servicerAccount: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      regulationType: (val) => Factory.checkRegulationType(val),
      regulationSubType: (val) => Factory.checkRegulationSubType(val, security.regulationType),
      configId: FormatValidation.checkBytes32Format(),
      diamondOwnerAccount: FormatValidation.checkHederaIdFormatOrEvmAddress(false),
      externalPausesIds: (val) => FormatValidation.checkHederaIdOrEvmAddressArray(val ?? [], "externalPausesIds", true),
      externalControlListsIds: (val) =>
        FormatValidation.checkHederaIdOrEvmAddressArray(val ?? [], "externalControlListsIds", true),
      externalKycListsIds: (val) =>
        FormatValidation.checkHederaIdOrEvmAddressArray(val ?? [], "externalKycListsIds", true),
      complianceId: FormatValidation.checkHederaIdFormatOrEvmAddress(true),
      identityRegistryId: FormatValidation.checkHederaIdFormatOrEvmAddress(true),
    });

    // Security
    this.name = security.name;
    this.symbol = security.symbol;
    this.isin = security.isin;
    this.decimals = typeof security.decimals === "number" ? security.decimals : parseInt(security.decimals);
    this.isWhiteList = security.isWhiteList;
    this.erc20VotesActivated = security.erc20VotesActivated;
    this.isControllable = security.isControllable;
    this.arePartitionsProtected = security.arePartitionsProtected;
    this.isMultiPartition = security.isMultiPartition;
    this.clearingActive = security.clearingActive;
    this.internalKycActivated = security.internalKycActivated;
    this.numberOfUnits = security.numberOfUnits;
    this.regulationType = security.regulationType;
    this.regulationSubType = security.regulationSubType;
    this.isCountryControlListWhiteList = security.isCountryControlListWhiteList;
    this.countries = security.countries;
    this.info = security.info;
    this.configId = security.configId;
    this.configVersion = security.configVersion;
    this.diamondOwnerAccount = security.diamondOwnerAccount;
    this.externalPausesIds = security.externalPausesIds;
    this.externalControlListsIds = security.externalControlListsIds;
    this.externalKycListsIds = security.externalKycListsIds;
    this.complianceId = security.complianceId;
    this.identityRegistryId = security.identityRegistryId;

    // NominalValue
    this.nominalValue = nominalValue;
    this.nominalValueDecimals = nominalValueDecimals;

    // LoanBasicData
    this.currency = loanBasicData.currency;
    this.startingDate = loanBasicData.startingDate;
    this.maturityDate = loanBasicData.maturityDate;
    this.loanStructureType = loanBasicData.loanStructureType;
    this.repaymentType = loanBasicData.repaymentType;
    this.interestType = loanBasicData.interestType;
    this.originatorAccount = loanBasicData.originatorAccount;
    this.servicerAccount = loanBasicData.servicerAccount;
    this.signingDate = loanBasicData.signingDate;

    // LoanInterestData
    this.baseReferenceRate = loanInterestData?.baseReferenceRate;
    this.floorRate = loanInterestData?.floorRate;
    this.capRate = loanInterestData?.capRate;
    this.rateMargin = loanInterestData?.rateMargin;
    this.dayCount = loanInterestData?.dayCount;
    this.paymentFrequency = loanInterestData?.paymentFrequency;
    this.firstAccrualDate = loanInterestData?.firstAccrualDate;
    this.prepaymentPenalty = loanInterestData?.prepaymentPenalty;
    this.commitmentFee = loanInterestData?.commitmentFee;
    this.utilizationFee = loanInterestData?.utilizationFee;
    this.utilizationFeeType = loanInterestData?.utilizationFeeType;
    this.servicingFee = loanInterestData?.servicingFee;

    // RiskData
    this.internalRiskGrade = riskData?.internalRiskGrade;
    this.defaultProbability = riskData?.defaultProbability;
    this.lossGivenDefault = riskData?.lossGivenDefault;

    // Collateral
    this.totalCollateralValue = collateral?.totalCollateralValue;
    this.loanToValue = collateral?.loanToValue;

    // LoanPerformanceStatus
    this.performanceStatus = loanPerformanceStatus?.performanceStatus;
    this.daysPastDue = loanPerformanceStatus?.daysPastDue;
  }
}
