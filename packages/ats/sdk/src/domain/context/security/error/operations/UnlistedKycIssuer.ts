// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class UnlistedKycIssuer extends BaseError {
  constructor(issuerId: string) {
    super(ErrorCode.UnlistedKycIssuer, `The issuer ${issuerId} is not registered in the system`);
  }
}
