// SPDX-License-Identifier: Apache-2.0

import { QueryError } from "@query/error/QueryError";
import BaseError from "@core/error/BaseError";

export class PartitionsProtectedQueryError extends QueryError {
  constructor(error: Error) {
    const msg = `An error occurred while querying if partitions are protected: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
