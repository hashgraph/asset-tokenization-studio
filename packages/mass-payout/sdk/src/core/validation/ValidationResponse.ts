// SPDX-License-Identifier: Apache-2.0

import BaseError from "../error/BaseError";
import safeStringify from "fast-safe-stringify";
export default class ValidationResponse {
  name: string;
  errors: BaseError[];

  constructor(name: string, errors: BaseError[]) {
    this.name = name;
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationResponse.prototype);
  }

  toString(): string {
    return safeStringify(this, undefined, 4);
  }
}
