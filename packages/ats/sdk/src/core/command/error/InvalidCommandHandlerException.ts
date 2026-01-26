// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidCommandHandlerException extends BaseError {
  constructor() {
    super(ErrorCode.RuntimeError, `Invalid command handler exception (missing @CommandHandler() decorator?)`);
  }
}
