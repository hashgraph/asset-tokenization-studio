// SPDX-License-Identifier: Apache-2.0

import { OptionalField } from "@core/decorator/OptionalDecorator";
import { Equity } from "@domain/context/equity/Equity";
import { Security } from "@domain/context/security/Security";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

import { Factory } from "@domain/context/factory/Factories";

export default class CreateEquityRequest extends ValidatedRequest<CreateEquityRequest> {
  name: string;
  symbol: string;
  isin: string;
  private _decimals: number;
  public get decimals(): number {
    return this._decimals;
  }
  public set decimals(value: number | string) {
    this._decimals = typeof value === "number" ? value : parseFloat(value);
  }
  isWhiteList: boolean;
  erc20VotesActivated: boolean;
  isControllable: boolean;
  arePartitionsProtected: boolean;
  isMultiPartition: boolean;
  clearingActive: boolean;
  internalKycActivated: boolean;

  @OptionalField()
  externalPausesIds?: string[];

  @OptionalField()
  externalControlListsIds?: string[];

  @OptionalField()
  externalKycListsIds?: string[];

  @OptionalField()
  diamondOwnerAccount?: string;

  @OptionalField()
  complianceId?: string;

  @OptionalField()
  identityRegistryId?: string;

  votingRight: boolean;
  informationRight: boolean;
  liquidationRight: boolean;
  subscriptionRight: boolean;
  conversionRight: boolean;
  redemptionRight: boolean;
  putRight: boolean;
  dividendRight: number;
  currency: string;
  numberOfShares: string;
  nominalValue: string;
  nominalValueDecimals: number;

  regulationType: number;
  regulationSubType: number;
  isCountryControlListWhiteList: boolean;
  countries: string;
  info: string;
  configId: string;
  configVersion: number;

  constructor({
    name,
    symbol,
    isin,
    decimals,
    isWhiteList,
    erc20VotesActivated,
    isControllable,
    arePartitionsProtected,
    isMultiPartition,
    clearingActive,
    internalKycActivated,
    externalPausesIds,
    externalControlListsIds,
    externalKycListsIds,
    diamondOwnerAccount,
    votingRight,
    informationRight,
    liquidationRight,
    subscriptionRight,
    conversionRight,
    redemptionRight,
    putRight,
    dividendRight,
    currency,
    numberOfShares,
    nominalValue,
    nominalValueDecimals,
    regulationType,
    regulationSubType,
    isCountryControlListWhiteList,
    countries,
    info,
    configId,
    configVersion,
    complianceId,
    identityRegistryId,
  }: {
    name: string;
    symbol: string;
    isin: string;
    decimals: number | string;
    isWhiteList: boolean;
    erc20VotesActivated: boolean;
    isControllable: boolean;
    arePartitionsProtected: boolean;
    clearingActive: boolean;
    internalKycActivated: boolean;
    isMultiPartition: boolean;
    externalPausesIds?: string[];
    externalControlListsIds?: string[];
    externalKycListsIds?: string[];
    diamondOwnerAccount?: string;
    votingRight: boolean;
    informationRight: boolean;
    liquidationRight: boolean;
    subscriptionRight: boolean;
    conversionRight: boolean;
    redemptionRight: boolean;
    putRight: boolean;
    dividendRight: number;
    currency: string;
    numberOfShares: string;
    nominalValue: string;
    nominalValueDecimals: number;
    regulationType: number;
    regulationSubType: number;
    isCountryControlListWhiteList: boolean;
    countries: string;
    info: string;
    configId: string;
    configVersion: number;
    complianceId?: string;
    identityRegistryId?: string;
  }) {
    super({
      name: (val) => {
        return Security.checkName(val);
      },
      symbol: (val) => {
        return Security.checkSymbol(val);
      },
      isin: (val) => {
        return Security.checkISIN(val);
      },
      decimals: (val) => {
        return Security.checkInteger(val);
      },
      diamondOwnerAccount: FormatValidation.checkHederaIdFormatOrEvmAddress(false),
      dividendRight: (val) => {
        return Equity.checkDividend(val);
      },
      currency: FormatValidation.checkBytes3Format(),
      numberOfShares: FormatValidation.checkNumber(),
      nominalValue: FormatValidation.checkNumber(),
      regulationType: (val) => {
        return Factory.checkRegulationType(val);
      },
      regulationSubType: (val) => {
        return Factory.checkRegulationSubType(val, this.regulationType);
      },
      configId: FormatValidation.checkBytes32Format(),
      externalPausesIds: (val) => {
        return FormatValidation.checkHederaIdOrEvmAddressArray(val ?? [], "externalPausesIds", true);
      },
      externalControlListsIds: (val) => {
        return FormatValidation.checkHederaIdOrEvmAddressArray(val ?? [], "externalControlListsIds", true);
      },
      externalKycListsIds: (val) => {
        return FormatValidation.checkHederaIdOrEvmAddressArray(val ?? [], "externalKycListsIds", true);
      },
      complianceId: FormatValidation.checkHederaIdFormatOrEvmAddress(true),
      identityRegistryId: FormatValidation.checkHederaIdFormatOrEvmAddress(true),
    });
    this.name = name;
    this.symbol = symbol;
    this.isin = isin;
    this.decimals = typeof decimals === "number" ? decimals : parseInt(decimals);
    this.isWhiteList = isWhiteList;
    this.erc20VotesActivated = erc20VotesActivated;
    this.isControllable = isControllable;
    this.arePartitionsProtected = arePartitionsProtected;
    this.isMultiPartition = isMultiPartition;
    this.clearingActive = clearingActive;
    this.internalKycActivated = internalKycActivated;
    this.externalPausesIds = externalPausesIds;
    this.diamondOwnerAccount = diamondOwnerAccount;
    this.externalControlListsIds = externalControlListsIds;
    this.externalKycListsIds = externalKycListsIds;
    this.votingRight = votingRight;
    this.informationRight = informationRight;
    this.liquidationRight = liquidationRight;
    this.subscriptionRight = subscriptionRight;
    this.conversionRight = conversionRight;
    this.redemptionRight = redemptionRight;
    this.putRight = putRight;
    this.dividendRight = dividendRight;
    this.currency = currency;
    this.numberOfShares = numberOfShares;
    this.nominalValue = nominalValue;
    this.nominalValueDecimals = nominalValueDecimals;
    this.regulationType = regulationType;
    this.regulationSubType = regulationSubType;
    this.isCountryControlListWhiteList = isCountryControlListWhiteList;
    this.countries = countries;
    this.info = info;
    this.configId = configId;
    this.configVersion = configVersion;
    this.complianceId = complianceId;
    this.identityRegistryId = identityRegistryId;
  }
}
