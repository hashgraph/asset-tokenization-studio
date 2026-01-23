// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class NotAllowedInMultiPartition extends BaseError {
  constructor() {
    super(ErrorCode.NotAllowedInMultiPartition, `Operation not allowed in multi partition mode`);
  }
}
