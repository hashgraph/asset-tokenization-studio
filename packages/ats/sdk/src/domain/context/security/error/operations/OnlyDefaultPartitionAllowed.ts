// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class OnlyDefaultPartitionAllowed extends BaseError {
  constructor() {
    super(ErrorCode.OnlyDefaultPartitionAllowed, `Only default partition allowed in single mode`);
  }
}
