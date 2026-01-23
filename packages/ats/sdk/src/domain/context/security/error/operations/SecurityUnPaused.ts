// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class SecurityUnPaused extends BaseError {
  constructor() {
    super(ErrorCode.SecurityUnPaused, `The security is currently unpaused`);
  }
}
