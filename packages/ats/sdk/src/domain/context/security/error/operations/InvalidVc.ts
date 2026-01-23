// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidVc extends BaseError {
  constructor() {
    super(ErrorCode.InvalidVc, `The provided VC is not valid`);
  }
}
