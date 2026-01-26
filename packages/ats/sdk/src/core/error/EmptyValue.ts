// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "./BaseError";

export class EmptyValue extends BaseError {
  constructor(val: unknown) {
    super(ErrorCode.EmptyValue, `Value ${val} cannot be empty`);
  }
}
