// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidQueryHandlerException extends BaseError {
  constructor() {
    super(ErrorCode.RuntimeError, `Invalid query handler exception (missing @QueryHandler() decorator?)`);
  }
}
