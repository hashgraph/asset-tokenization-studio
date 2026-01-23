// SPDX-License-Identifier: Apache-2.0

import { QueryError } from "../../../error/QueryError";
import BaseError from "@core/error/BaseError";

export class IsPausedQueryError extends QueryError {
  constructor(error: Error) {
    const msg = `An error occurred while querying if is paused: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
