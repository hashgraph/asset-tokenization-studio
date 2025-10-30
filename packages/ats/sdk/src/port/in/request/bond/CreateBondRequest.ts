// SPDX-License-Identifier: Apache-2.0

import { OptionalField } from '@core/decorator/OptionalDecorator';
import { Security } from '@domain/context/security/Security';
import ValidatedRequest from '@core/validation/ValidatedArgs';
import FormatValidation from '../FormatValidation';

import { SecurityDate } from '@domain/context/shared/SecurityDate';
import { Factory } from '@domain/context/factory/Factories';
import { InvalidValue } from '../error/InvalidValue';

export default class CreateBondRequest extends ValidatedRequest<CreateBondRequest> {
  name: string;
  symbol: string;
  isin: string;
  private _decimals: number;
  public get decimals(): number {
    return this._decimals;
  }
  public set decimals(value: number | string) {
    this._decimals = typeof value === 'number' ? value : parseFloat(value);
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

  currency: string;
  numberOfUnits: string;
  nominalValue: string;
  startingDate: string;
  maturityDate: string;
  regulationType: number;
  regulationSubType: number;
  isCountryControlListWhiteList: boolean;
  countries: string;
  info: string;
  configId: string;
  configVersion: number;

  @OptionalField()
  proceedRecipientsIds?: string[];

  @OptionalField()
  proceedRecipientsData?: string[];

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
    currency,
    numberOfUnits,
    nominalValue,
    startingDate,
    maturityDate,
    regulationType,
    regulationSubType,
    isCountryControlListWhiteList,
    countries,
    info,
    configId,
    configVersion,
    complianceId,
    identityRegistryId,
    proceedRecipientsIds,
    proceedRecipientsData,
  }: {
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
    externalPausesIds?: string[];
    externalControlListsIds?: string[];
    externalKycListsIds?: string[];
    diamondOwnerAccount?: string;
    currency: string;
    numberOfUnits: string;
    nominalValue: string;
    startingDate: string;
    maturityDate: string;
    regulationType: number;
    regulationSubType: number;
    isCountryControlListWhiteList: boolean;
    countries: string;
    info: string;
    configId: string;
    configVersion: number;
    complianceId?: string;
    identityRegistryId?: string;
    proceedRecipientsIds?: string[];
    proceedRecipientsData?: string[];
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
      diamondOwnerAccount:
        FormatValidation.checkHederaIdFormatOrEvmAddress(false),
      currency: FormatValidation.checkBytes3Format(),
      numberOfUnits: FormatValidation.checkNumber(),
      nominalValue: FormatValidation.checkNumber(),
      startingDate: (val) => {
        return SecurityDate.checkDateTimestamp(
          parseInt(val),
          Math.ceil(new Date().getTime() / 1000),
          parseInt(this.maturityDate),
        );
      },
      maturityDate: (val) => {
        return SecurityDate.checkDateTimestamp(
          parseInt(val),
          parseInt(this.startingDate),
          undefined,
        );
      },
      regulationType: (val) => {
        return Factory.checkRegulationType(val);
      },
      regulationSubType: (val) => {
        return Factory.checkRegulationSubType(val, this.regulationType);
      },
      configId: FormatValidation.checkBytes32Format(),
      externalPausesIds: (val) => {
        return FormatValidation.checkHederaIdOrEvmAddressArray(
          val ?? [],
          'externalPausesIds',
          true,
        );
      },
      externalControlListsIds: (val) => {
        return FormatValidation.checkHederaIdOrEvmAddressArray(
          val ?? [],
          'externalControlListsIds',
          true,
        );
      },
      externalKycListsIds: (val) => {
        return FormatValidation.checkHederaIdOrEvmAddressArray(
          val ?? [],
          'externalKycListsIds',
          true,
        );
      },
      complianceId: FormatValidation.checkHederaIdFormatOrEvmAddress(true),
      identityRegistryId:
        FormatValidation.checkHederaIdFormatOrEvmAddress(true),
      proceedRecipientsIds: (val) => {
        return FormatValidation.checkHederaIdOrEvmAddressArray(
          val ?? [],
          'proceedRecipientsIds',
          true,
        );
      },

      proceedRecipientsData: (val) => {
        const validation = FormatValidation.checkBytesFormat();
        if (val?.length != this.proceedRecipientsIds?.length) {
          return [
            new InvalidValue(
              `The list of proceedRecipientsIds and proceedRecipientsData must have equal length.`,
            ),
          ];
        }
        for (const data of val ?? []) {
          if (data == '') continue;
          const result = validation(data);
          if (result) return result;
        }
      },
    });
    this.name = name;
    this.symbol = symbol;
    this.isin = isin;
    this.decimals =
      typeof decimals === 'number' ? decimals : parseInt(decimals);
    this.isWhiteList = isWhiteList;
    this.erc20VotesActivated = erc20VotesActivated;
    this.isControllable = isControllable;
    this.arePartitionsProtected = arePartitionsProtected;
    this.isMultiPartition = isMultiPartition;
    this.clearingActive = clearingActive;
    this.internalKycActivated = internalKycActivated;
    this.diamondOwnerAccount = diamondOwnerAccount;
    this.externalPausesIds = externalPausesIds;
    this.externalControlListsIds = externalControlListsIds;
    this.externalKycListsIds = externalKycListsIds;
    this.currency = currency;
    this.numberOfUnits = numberOfUnits;
    this.nominalValue = nominalValue;
    this.startingDate = startingDate;
    this.maturityDate = maturityDate;
    this.regulationType = regulationType;
    this.regulationSubType = regulationSubType;
    this.isCountryControlListWhiteList = isCountryControlListWhiteList;
    this.countries = countries;
    this.info = info;
    this.configId = configId;
    this.configVersion = configVersion;
    this.complianceId = complianceId;
    this.identityRegistryId = identityRegistryId;
    this.proceedRecipientsIds = proceedRecipientsIds;
    this.proceedRecipientsData = proceedRecipientsData;
  }
}
