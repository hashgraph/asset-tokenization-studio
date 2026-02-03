// SPDX-License-Identifier: Apache-2.0

import BaseError from "@core/error/BaseError";
import { QueryError } from "@query/error/QueryError";

export class GetTotalCouponHoldersQueryError extends QueryError {
  constructor(error: Error) {
    const msg = `An error occurred while querying total coupon holders: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
