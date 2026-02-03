// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class NotGrantedRole extends BaseError {
  constructor(role: string) {
    super(
      ErrorCode.RoleNotAssigned,
      `The account trying to perform the operation doesn't have the needed role (${role})`,
    );
  }
}
