// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export default class SymbolLength extends BaseError {
  constructor(val: string, len: number) {
    super(ErrorCode.InvalidLength, `Symbol ${val} length is longer than ${len}`);
  }
}
