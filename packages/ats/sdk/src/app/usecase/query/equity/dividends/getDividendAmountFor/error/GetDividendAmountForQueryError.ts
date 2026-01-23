// SPDX-License-Identifier: Apache-2.0

import { QueryError } from "@query/error/QueryError";
import BaseError from "@core/error/BaseError";

export class GetDividendAmountForQueryError extends QueryError {
  constructor(error: Error) {
    const msg = `An error occurred while querying account's dividend amount: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
