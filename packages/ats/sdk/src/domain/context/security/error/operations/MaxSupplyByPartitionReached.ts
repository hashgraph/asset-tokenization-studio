// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class MaxSupplyByPartitionReached extends BaseError {
  constructor() {
    super(ErrorCode.MaxSupplyByPartitionReached, `Max supply by partition reached`);
  }
}
