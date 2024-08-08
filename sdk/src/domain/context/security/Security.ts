import BaseEntity from '../BaseEntity.js';
import BaseError from '../../../core/error/BaseError.js';
import CheckNums from '../../../core/checks/numbers/CheckNums.js';
import CheckStrings from '../../../core/checks/strings/CheckStrings.js';
import InvalidDecimalRange from './error/InvalidDecimalRange.js';
import NameEmpty from './error/NameEmpty.js';
import NameLength from './error/NameLength.js';
import SymbolEmpty from './error/SymbolEmpty.js';
import SymbolLength from './error/SymbolLength.js';
import EvmAddress from '../contract/EvmAddress.js';
import BigDecimal from '../shared/BigDecimal.js';
import { HederaId } from '../shared/HederaId.js';
import { InvalidType } from '../../../port/in/request/error/InvalidType.js';
import InvalidAmount from './error/InvalidAmount.js';
import { SecurityType } from '../factory/SecurityType.js';
import { Regulation } from '../factory/Regulation.js';
import {
  RegulationSubType,
  RegulationType,
} from '../factory/RegulationType.js';

const TWELVE = 12;
const TEN = 10;
const ONE_HUNDRED = 100;
const EIGHTEEN = 18;
const ZERO = 0;

export interface SecurityProps {
  name: string;
  symbol: string;
  isin: string;
  type?: SecurityType;
  decimals: number;
  isWhiteList: boolean;
  isControllable: boolean;
  isMultiPartition: boolean;
  isIssuable?: boolean;
  totalSupply?: BigDecimal;
  maxSupply?: BigDecimal;
  diamondAddress?: HederaId;
  evmDiamondAddress?: EvmAddress;
  paused?: boolean;
  regulationType?: RegulationType;
  regulationsubType?: RegulationSubType;
  regulation?: Regulation;
  isCountryControlListWhiteList: boolean;
  countries?: string;
  info?: string;
}

export class Security extends BaseEntity implements SecurityProps {
  name: string;
  symbol: string;
  isin: string;
  type?: SecurityType;
  decimals: number;
  isWhiteList: boolean;
  isControllable: boolean;
  isMultiPartition: boolean;
  isIssuable?: boolean;
  totalSupply?: BigDecimal;
  maxSupply?: BigDecimal;
  diamondAddress?: HederaId;
  evmDiamondAddress?: EvmAddress;
  paused?: boolean;
  regulationType?: RegulationType;
  regulationsubType?: RegulationSubType;
  regulation?: Regulation;
  isCountryControlListWhiteList: boolean;
  countries?: string;
  info?: string;

  constructor(params: SecurityProps) {
    const {
      name,
      symbol,
      isin,
      type,
      decimals,
      isWhiteList,
      isControllable,
      isMultiPartition,
      isIssuable,
      totalSupply,
      maxSupply,
      diamondAddress,
      evmDiamondAddress,
      paused,
      regulationType,
      regulationsubType,
      regulation,
      isCountryControlListWhiteList,
      countries,
      info,
    } = params;
    super();
    this.name = name;
    this.symbol = symbol;
    this.isin = isin;
    this.type = type;
    this.decimals = decimals;
    this.isWhiteList = isWhiteList;
    this.isControllable = isControllable;
    this.isMultiPartition = isMultiPartition;
    this.isIssuable = isIssuable ?? true;
    this.totalSupply = totalSupply ?? BigDecimal.ZERO;
    this.maxSupply = maxSupply ?? BigDecimal.ZERO;
    this.diamondAddress = diamondAddress;
    this.evmDiamondAddress = evmDiamondAddress;
    this.paused = paused ?? false;
    this.regulationType = regulationType;
    this.regulationsubType = regulationsubType;
    this.regulation = regulation;
    this.isCountryControlListWhiteList = isCountryControlListWhiteList;
    this.countries = countries;
    this.info = info;
  }

  public static checkName(value: string): BaseError[] {
    const maxNameLength = ONE_HUNDRED;
    const errorList: BaseError[] = [];

    if (!CheckStrings.isNotEmpty(value)) errorList.push(new NameEmpty());
    if (!CheckStrings.isLengthUnder(value, maxNameLength))
      errorList.push(new NameLength(value, maxNameLength));

    return errorList;
  }

  public static checkSymbol(value: string): BaseError[] {
    const maxSymbolLength = ONE_HUNDRED;
    const errorList: BaseError[] = [];

    if (!CheckStrings.isNotEmpty(value)) errorList.push(new SymbolEmpty());
    if (!CheckStrings.isLengthUnder(value, maxSymbolLength))
      errorList.push(new SymbolLength(value, maxSymbolLength));

    return errorList;
  }

  public static checkISIN(value: string): BaseError[] {
    const maxIsinLength = TWELVE;
    const errorList: BaseError[] = [];

    if (!CheckStrings.isNotEmpty(value)) errorList.push(new NameEmpty());
    if (!CheckStrings.isLengthUnder(value, maxIsinLength))
      errorList.push(new NameLength(value, maxIsinLength));

    return errorList;
  }

  public static checkDecimals(value: number): BaseError[] {
    const errorList: BaseError[] = [];
    const min = ZERO;
    const max = EIGHTEEN;

    if (CheckNums.hasMoreDecimals(value.toString(), 0)) {
      errorList.push(new InvalidType(value));
    }
    if (!CheckNums.isWithinRange(value, min, max))
      errorList.push(new InvalidDecimalRange(value, min, max));

    return errorList;
  }

  public static checkInteger(value: number): BaseError[] {
    const errorList: BaseError[] = [];

    if (!Number.isInteger(value)) {
      return [new InvalidType(value)];
    }

    return errorList;
  }

  public getDecimalOperator(): number {
    return TEN ** this.decimals;
  }

  public fromInteger(amount: number): number {
    const res = amount / this.getDecimalOperator();
    if (!this.isValidAmount(res)) {
      throw new InvalidAmount(res, this.decimals);
    }
    return res;
  }

  public isValidAmount(amount: number): boolean {
    const val = amount.toString().split('.');
    const decimals = val.length > 1 ? val[1]?.length : 0;
    return decimals <= this.decimals;
  }
}
