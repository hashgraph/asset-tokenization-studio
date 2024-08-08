import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import { Equity } from '../../../domain/context/equity/Equity.js';
import { Security } from '../../../domain/context/security/Security.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';
import { Factory } from '../../../domain/context/factory/Factories.js';

export default class CreateEquityRequest extends ValidatedRequest<CreateEquityRequest> {
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

  votingRight: boolean;
  informationRight: boolean;
  liquidationRight: boolean;
  subscriptionRight: boolean;
  convertionRight: boolean;
  redemptionRight: boolean;
  putRight: boolean;
  dividendRight: number;
  currency: string;
  numberOfShares: string;
  nominalValue: string;
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
    votingRight,
    informationRight,
    liquidationRight,
    subscriptionRight,
    convertionRight,
    redemptionRight,
    putRight,
    dividendRight,
    currency,
    numberOfShares,
    nominalValue,
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
    votingRight: boolean;
    informationRight: boolean;
    liquidationRight: boolean;
    subscriptionRight: boolean;
    convertionRight: boolean;
    redemptionRight: boolean;
    putRight: boolean;
    dividendRight: number;
    currency: string;
    numberOfShares: string;
    nominalValue: string;
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
      dividendRight: (val) => {
        return Equity.checkDividend(val);
      },
      currency: Validation.checkBytes3Format(),
      numberOfShares: Validation.checkNumber(),
      nominalValue: Validation.checkNumber(),
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
    this.votingRight = votingRight;
    this.informationRight = informationRight;
    this.liquidationRight = liquidationRight;
    this.subscriptionRight = subscriptionRight;
    this.convertionRight = convertionRight;
    this.redemptionRight = redemptionRight;
    this.putRight = putRight;
    this.dividendRight = dividendRight;
    this.currency = currency;
    this.numberOfShares = numberOfShares;
    this.nominalValue = nominalValue;
    this.regulationType = regulationType;
    this.regulationSubType = regulationSubType;
    this.isCountryControlListWhiteList = isCountryControlListWhiteList;
    this.countries = countries;
    this.info = info;
  }
}
