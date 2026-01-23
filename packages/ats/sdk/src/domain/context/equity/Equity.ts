// SPDX-License-Identifier: Apache-2.0

import BaseError from "@core/error/BaseError";
import { Security, SecurityProps } from "../security/Security";
import { CastDividendType, DividendType } from "./DividendType";
import { InvalidDividendType } from "./error/InvalidDividendType";

export interface EquityProps extends SecurityProps {}

export class Equity extends Security implements EquityProps {
  public static checkDividend(value: number | DividendType): BaseError[] {
    const errorList: BaseError[] = [];

    const length = Object.keys(DividendType).length;

    if (typeof value !== "number") {
      value = CastDividendType.toNumber(value);
    }

    if (value >= length) errorList.push(new InvalidDividendType(value));

    return errorList;
  }
}
