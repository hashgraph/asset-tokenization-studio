// SPDX-License-Identifier: Apache-2.0

import { QueryError } from "@query/error/QueryError";
import BaseError from "@core/error/BaseError";

export class GetDividendsCountQueryError extends QueryError {
  constructor(error: Error) {
    const msg = `An error occurred while querying dividends count: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
