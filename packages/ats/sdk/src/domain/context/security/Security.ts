// SPDX-License-Identifier: Apache-2.0

import BaseError from "@core/error/BaseError";
import CheckNums from "@core/checks/numbers/CheckNums";
import CheckStrings from "@core/checks/strings/CheckStrings";
import InvalidDecimalRange from "./error/values/InvalidDecimalRange";
import NameEmpty from "./error/values/NameEmpty";
import NameLength from "./error/values/NameLength";
import SymbolEmpty from "./error/values/SymbolEmpty";
import SymbolLength from "./error/values/SymbolLength";
import EvmAddress from "../contract/EvmAddress";
import BigDecimal from "../shared/BigDecimal";
import { HederaId } from "../shared/HederaId";
import { InvalidType } from "@port/in/request/error/InvalidType";
import InvalidAmount from "./error/values/InvalidAmount";
import { SecurityType } from "../factory/SecurityType";
import { Regulation } from "../factory/Regulation";
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from "../factory/RegulationType";
import ValidatedDomain from "@core/validation/ValidatedArgs";
import { Factory } from "../factory/Factories";
import { OptionalField } from "@core/decorator/OptionalDecorator";
import InvalidSupply from "./error/values/InvalidSupply";

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
  erc20VotesActivated: boolean;
  isControllable: boolean;
  arePartitionsProtected: boolean;
  clearingActive: boolean;
  internalKycActivated: boolean;
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

export class Security extends ValidatedDomain<Security> implements SecurityProps {
  name: string;
  symbol: string;
  isin: string;
  type?: SecurityType;
  decimals: number;
  isWhiteList: boolean;
  erc20VotesActivated: boolean;
  isControllable: boolean;
  isMultiPartition: boolean;
  arePartitionsProtected: boolean;
  clearingActive: boolean;
  internalKycActivated: boolean;
  isIssuable?: boolean;
  @OptionalField()
  totalSupply?: BigDecimal;
  @OptionalField()
  maxSupply?: BigDecimal;
  diamondAddress?: HederaId;
  evmDiamondAddress?: EvmAddress;
  paused?: boolean;
  @OptionalField()
  regulationType?: RegulationType;
  @OptionalField()
  regulationsubType?: RegulationSubType;
  regulation?: Regulation;
  isCountryControlListWhiteList: boolean;
  countries?: string;
  info?: string;

  constructor(params: SecurityProps) {
    super({
      regulationType: (val) => {
        return Factory.checkRegulationType(CastRegulationType.toNumber(val!));
      },
      regulationsubType: (val) => {
        return Factory.checkRegulationSubType(
          CastRegulationSubType.toNumber(val!),
          CastRegulationType.toNumber(this.regulationType!),
        );
      },
      totalSupply: (val) => {
        return Security.checkSupply(val!, this.maxSupply!);
      },
    });
    const {
      name,
      symbol,
      isin,
      type,
      decimals,
      isWhiteList,
      erc20VotesActivated,
      isControllable,
      arePartitionsProtected,
      clearingActive,
      internalKycActivated,
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
    this.name = name;
    this.symbol = symbol;
    this.isin = isin;
    this.type = type;
    this.decimals = decimals;
    this.isWhiteList = isWhiteList;
    this.erc20VotesActivated = erc20VotesActivated;
    this.isControllable = isControllable;
    this.arePartitionsProtected = arePartitionsProtected;
    this.clearingActive = clearingActive;
    this.internalKycActivated = internalKycActivated;
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

    ValidatedDomain.handleValidation(Security.name, this);
  }

  public static checkName(value: string): BaseError[] {
    const maxNameLength = ONE_HUNDRED;
    const errorList: BaseError[] = [];

    if (!CheckStrings.isNotEmpty(value)) errorList.push(new NameEmpty());
    if (!CheckStrings.isLengthUnder(value, maxNameLength)) errorList.push(new NameLength(value, maxNameLength));

    return errorList;
  }

  public static checkSymbol(value: string): BaseError[] {
    const maxSymbolLength = ONE_HUNDRED;
    const errorList: BaseError[] = [];

    if (!CheckStrings.isNotEmpty(value)) errorList.push(new SymbolEmpty());
    if (!CheckStrings.isLengthUnder(value, maxSymbolLength)) errorList.push(new SymbolLength(value, maxSymbolLength));

    return errorList;
  }

  public static checkISIN(value: string): BaseError[] {
    const maxIsinLength = TWELVE;
    const errorList: BaseError[] = [];

    if (!CheckStrings.isNotEmpty(value)) errorList.push(new NameEmpty());
    if (!CheckStrings.isLengthUnder(value, maxIsinLength)) errorList.push(new NameLength(value, maxIsinLength));

    return errorList;
  }

  public static checkDecimals(value: number): BaseError[] {
    const errorList: BaseError[] = [];
    const min = ZERO;
    const max = EIGHTEEN;

    if (CheckNums.hasMoreDecimals(value.toString(), 0)) {
      errorList.push(new InvalidType(value));
    }
    if (!CheckNums.isWithinRange(value, min, max)) errorList.push(new InvalidDecimalRange(value, min, max));

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
    const val = amount.toString().split(".");
    const decimals = val.length > 1 ? val[1]?.length : 0;
    return decimals <= this.decimals;
  }

  public static checkSupply(totalSupply: BigDecimal, maxSupply: BigDecimal): BaseError[] {
    const errorList: BaseError[] = [];
    if (totalSupply.isGreaterThan(maxSupply)) {
      errorList.push(new InvalidSupply(totalSupply.toString(), maxSupply.toString()));
    }
    return errorList;
  }
}
