// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidPartition extends BaseError {
  constructor() {
    super(ErrorCode.InvalidPartition, `Partition not valid`);
  }
}
