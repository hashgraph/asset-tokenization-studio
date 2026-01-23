// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class MissingRegulationType extends BaseError {
  constructor() {
    super(ErrorCode.EmptyValue, `Regulation type is missing`);
  }
}
