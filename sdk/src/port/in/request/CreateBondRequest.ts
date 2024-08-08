import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import { Security } from '../../../domain/context/security/Security.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';
import { SecurityDate } from '../../../domain/context/shared/SecurityDate.js';
import { Factory } from '../../../domain/context/factory/Factories.js';

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
  isControllable: boolean;
  isMultiPartition: boolean;

  @OptionalField()
  diamondOwnerAccount?: string;

  currency: string;
  numberOfUnits: string;
  nominalValue: string;
  startingDate: string;
  maturityDate: string;
  couponFrequency: string;
  couponRate: string;
  firstCouponDate: string;
  regulationType: number;
  regulationSubType: number;
  isCountryControlListWhiteList: boolean;
  countries: string;
  info: string;

  constructor({
    name,
    symbol,
    isin,
    decimals,
    isWhiteList,
    isControllable,
    isMultiPartition,
    diamondOwnerAccount,
    currency,
    numberOfUnits,
    nominalValue,
    startingDate,
    maturityDate,
    couponFrequency,
    couponRate,
    firstCouponDate,
    regulationType,
    regulationSubType,
    isCountryControlListWhiteList,
    countries,
    info,
  }: {
    name: string;
    symbol: string;
    isin: string;
    decimals: number | string;
    isWhiteList: boolean;
    isControllable: boolean;
    isMultiPartition: boolean;
    diamondOwnerAccount?: string;
    currency: string;
    numberOfUnits: string;
    nominalValue: string;
    startingDate: string;
    maturityDate: string;
    couponFrequency: string;
    couponRate: string;
    firstCouponDate: string;
    regulationType: number;
    regulationSubType: number;
    isCountryControlListWhiteList: boolean;
    countries: string;
    info: string;
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
      diamondOwnerAccount: Validation.checkHederaIdFormatOrEvmAddress(false),
      currency: Validation.checkBytes3Format(),
      numberOfUnits: Validation.checkNumber(),
      nominalValue: Validation.checkNumber(),
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
      couponFrequency: Validation.checkNumber(),
      couponRate: Validation.checkNumber(),
      firstCouponDate: (val) => {
        if (parseInt(val) != 0) {
          return SecurityDate.checkDateTimestamp(
            parseInt(val),
            parseInt(this.startingDate),
            parseInt(this.maturityDate),
          );
        }
      },
      regulationType: (val) => {
        return Factory.checkRegulationType(val);
      },
      regulationSubType: (val) => {
        return Factory.checkRegulationSubType(val, this.regulationType);
      },
    });
    this.name = name;
    this.symbol = symbol;
    this.isin = isin;
    this.decimals =
      typeof decimals === 'number' ? decimals : parseInt(decimals);
    this.isWhiteList = isWhiteList;
    this.isControllable = isControllable;
    this.isMultiPartition = isMultiPartition;
    this.diamondOwnerAccount = diamondOwnerAccount;
    this.currency = currency;
    this.numberOfUnits = numberOfUnits;
    this.nominalValue = nominalValue;
    this.startingDate = startingDate;
    this.maturityDate = maturityDate;
    this.couponFrequency = couponFrequency;
    this.couponRate = couponRate;
    this.firstCouponDate = firstCouponDate;
    this.regulationType = regulationType;
    this.regulationSubType = regulationSubType;
    this.isCountryControlListWhiteList = isCountryControlListWhiteList;
    this.countries = countries;
    this.info = info;
  }
}
