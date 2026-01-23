// SPDX-License-Identifier: Apache-2.0

import { Security, SecurityProps } from "../security/Security";
import BaseError from "@core/error/BaseError";
import { CastRateStatus, RateStatus } from "./RateStatus";
import { InvalidRateStatus } from "./error/InvalidRateStatus";

export interface BondProps extends SecurityProps {}

export class Bond extends Security implements BondProps {
  public static checkRateStatus(value: number | RateStatus): BaseError[] {
    const errorList: BaseError[] = [];

    const length = Object.keys(RateStatus).length;

    if (typeof value !== "number") {
      value = CastRateStatus.toNumber(value);
    }

    if (value >= length) errorList.push(new InvalidRateStatus(value));

    return errorList;
  }
}
