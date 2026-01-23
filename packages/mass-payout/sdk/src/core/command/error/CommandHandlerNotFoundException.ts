// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class CommandHandlerNotFoundException extends BaseError {
  constructor(commandName: string) {
    super(ErrorCode.RuntimeError, `The command handler for the "${commandName}" command was not found!`);
  }
}
