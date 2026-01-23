// SPDX-License-Identifier: Apache-2.0

import { QueryError } from "../../../error/QueryError";
import BaseError from "@core/error/BaseError";

export class GetPaymentTokenDecimalsQueryError extends QueryError {
  constructor(error: Error) {
    const msg = `An error occurred while querying the payment token decimals: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
