// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export default class NameLength extends BaseError {
  constructor(val: string, len: number) {
    super(ErrorCode.InvalidLength, `Name ${val} length is longer than ${len}`);
  }
}
