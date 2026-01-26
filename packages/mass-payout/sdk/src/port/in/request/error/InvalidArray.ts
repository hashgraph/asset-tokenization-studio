// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidArray extends BaseError {
  constructor(value: string) {
    super(ErrorCode.InvalidArray, `Value ${value} is not valid`);
  }
}
