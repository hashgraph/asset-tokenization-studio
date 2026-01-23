// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";
import { SecurityRole } from "../../SecurityRole";

export class PartitionsProtected extends BaseError {
  constructor(role?: SecurityRole | string) {
    super(
      ErrorCode.PartitionsProtected,
      role ? `Partitions are protected and account does not have the role (${role})` : `Partitions are protected`,
    );
  }
}
