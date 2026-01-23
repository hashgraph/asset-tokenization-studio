// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class QueryError extends BaseError {
  constructor(msg: string, errorCode?: ErrorCode) {
    super(errorCode ?? ErrorCode.UncaughtQueryError, msg);
  }
}
