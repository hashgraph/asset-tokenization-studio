// SPDX-License-Identifier: Apache-2.0

import { QueryError } from "@query/error/QueryError";
import BaseError from "@core/error/BaseError";

export class GetCouponsForQueryError extends QueryError {
  constructor(error: Error) {
    const msg = `An error occurred while querying coupons for: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
