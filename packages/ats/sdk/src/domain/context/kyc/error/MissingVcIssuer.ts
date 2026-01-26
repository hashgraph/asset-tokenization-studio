// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class MissingVcIssuer extends BaseError {
  constructor() {
    super(ErrorCode.EmptyValue, `VC issuer field is missing`);
  }
}
