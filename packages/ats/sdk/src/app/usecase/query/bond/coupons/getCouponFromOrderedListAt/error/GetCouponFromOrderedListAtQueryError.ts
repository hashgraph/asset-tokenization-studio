// SPDX-License-Identifier: Apache-2.0

import BaseError from "@core/error/BaseError";
import { QueryError } from "@query/error/QueryError";

export class GetCouponFromOrderedListAtQueryError extends QueryError {
  constructor(error: Error) {
    const msg = `An error occurred while querying coupon from ordered list at position: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
