// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidType extends BaseError {
  constructor(val: unknown) {
    super(ErrorCode.InvalidType, `Value ${val} is not valid. Please enter a numerical value.`);
  }
}
