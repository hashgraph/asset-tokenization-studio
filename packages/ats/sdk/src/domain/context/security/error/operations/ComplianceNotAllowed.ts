// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class ComplianceNotAllowed extends BaseError {
  constructor() {
    super(ErrorCode.ComplianceNotAllowed, "Compliance rules not allowed");
  }
}
