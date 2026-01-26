// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class MissingVcHolder extends BaseError {
  constructor() {
    super(ErrorCode.EmptyValue, `VC holder field is missing`);
  }
}
