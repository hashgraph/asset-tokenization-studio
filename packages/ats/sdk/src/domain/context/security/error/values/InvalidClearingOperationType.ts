// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidClearingOperationType extends BaseError {
  constructor(value: string) {
    super(ErrorCode.InvalidClearingOperationType, `Invalid clearing operation type ${value}`);
  }
}

export class InvalidClearingOperationTypeNumber extends BaseError {
  constructor(id: number) {
    super(ErrorCode.InvalidClearingOperationTypeNumber, `Invalid clearing operation type id number ${id}`);
  }
}
