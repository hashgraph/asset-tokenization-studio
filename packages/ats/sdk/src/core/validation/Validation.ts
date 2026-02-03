// SPDX-License-Identifier: Apache-2.0

import { ValidationError } from "./ValidationError";
import { BaseArgs } from "./BaseArgs";
import ValidatedArgs from "./ValidatedArgs";

export class Validation {
  public static handleValidation = <T extends BaseArgs>(name: string, args: ValidatedArgs<T>): void => {
    const validation = args.validate();
    if (validation.length > 0) throw new ValidationError(name, validation);
  };
}
