// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export default class NameEmpty extends BaseError {
  constructor() {
    super(ErrorCode.EmptyValue, `Name is empty`);
  }
}
