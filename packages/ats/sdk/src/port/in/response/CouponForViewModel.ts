// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";
import CouponAmountForViewModel from "./CouponAmountForViewModel";

export default interface CouponForViewModel extends QueryResponse {
  tokenBalance: string;
  nominalValue: string;
  decimals: string;
  recordDateReached: boolean;
  coupon: {
    recordDate: Date;
    executionDate: Date;
    rate: string;
    rateDecimals: number;
    startDate: Date;
    endDate: Date;
    fixingDate: Date;
    rateStatus: number;
  };
  couponAmount: CouponAmountForViewModel;
  isDisabled: boolean;
}
