// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidVcHolder extends BaseError {
  constructor() {
    super(ErrorCode.InvalidVcHolder, `The VC holder does not match target account`);
  }
}
