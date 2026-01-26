// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class ExecuteConnectionError extends BaseError {
  constructor(val: unknown) {
    super(ErrorCode.ExecuteConnectionError, `An error ocurred when executing the connection: ${val}`);
  }
}
