import BaseError from '../../../core/error/BaseError.js';
import { Security, SecurityProps } from '../security/Security.js';
import { DividendType } from './DividendType.js';
import { InvalidDividendType } from './error/InvalidDividendType.js';

export interface EquityProps extends SecurityProps {}

export class Equity extends Security implements EquityProps {
  public static checkDividend(value: number): BaseError[] {
    const errorList: BaseError[] = [];

    const length = Object.keys(DividendType).length;

    if (value >= length) errorList.push(new InvalidDividendType(value));

    return errorList;
  }
}
