// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";
import ValidationResponse from "./ValidationResponse";

export class ValidationError extends BaseError {
  constructor(name: string, validations: ValidationResponse[]) {
    super(ErrorCode.ValidationChecks, `Validation for class ${name} was not successful: ${validations.toString()}`);
  }
}
