// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class MissingRegulationSubType extends BaseError {
  constructor() {
    super(ErrorCode.EmptyValue, `Regulation sub type is missing`);
  }
}
