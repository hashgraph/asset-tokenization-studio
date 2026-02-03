// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class PartitionsUnProtected extends BaseError {
  constructor() {
    super(ErrorCode.PartitionsUnprotected, `Partitions are not protected`);
  }
}
