// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidVcFormat extends BaseError {
  constructor() {
    super(ErrorCode.InvalidVcFormat, `Invalid SignedCredential format`);
  }
}
