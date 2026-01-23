// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export default class SymbolEmpty extends BaseError {
  constructor() {
    super(ErrorCode.EmptyValue, `Symbol is empty`);
  }
}
