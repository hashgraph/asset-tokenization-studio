// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidKycStatus extends BaseError {
  constructor() {
    super(ErrorCode.InvalidKycStatus, "Invalid KYC status");
  }
}
