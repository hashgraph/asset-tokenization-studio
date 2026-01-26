// SPDX-License-Identifier: Apache-2.0

import { QueryError } from "../../../error/QueryError";
import BaseError from "@core/error/BaseError";

export class GetPaymentTokenQueryError extends QueryError {
  constructor(error: Error) {
    const msg = `An error occurred while querying the payment token: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
