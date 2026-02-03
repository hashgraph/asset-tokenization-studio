// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import { ValidationSchema, ValidatedArgsKey } from "./ValidationSchema";
import ValidationResponse from "./ValidationResponse";
import { EmptyValue } from "../error/EmptyValue";
import Mapper from "./Mapper";
import { getOptionalFields } from "../decorator/OptionalDecorator";
import BaseError from "../error/BaseError";
import { RuntimeError } from "../error/RuntimeError";
import { BaseArgs } from "./BaseArgs";
import { Validation } from "./Validation";
export default class ValidatedArgs<T extends BaseArgs> extends Validation {
  private schema: ValidationSchema<T>;

  constructor(schema: ValidationSchema<T>) {
    super();
    this.schema = schema;
  }

  public validate(key?: ValidatedArgsKey<T>): ValidationResponse[] {
    const vals: ValidationResponse[] = [];
    if (!key) {
      const filteredEntries = this.filterSchemaFromProps();
      filteredEntries.forEach((key) => {
        this.pushValidations(key, vals);
      });
    } else {
      this.pushValidations(key, vals);
    }
    return vals;
  }

  protected getOptionalFields(): ValidatedArgsKey<T>[] {
    let keys: ValidatedArgsKey<T>[] = [];
    keys = Object.keys(getOptionalFields(this) ?? {}) as ValidatedArgsKey<T>[];
    return keys;
  }

  protected isOptional(key: ValidatedArgsKey<T>): boolean {
    return this.getOptionalFields().includes(key);
  }

  private getProperty(propertyName: keyof this): any {
    if (this[propertyName] === undefined) {
      const privateKeys = {
        dash: `_${String(propertyName)}` as keyof this,
        hash: `#${String(propertyName)}` as keyof this,
      };
      if (this[privateKeys.dash]) {
        return this[privateKeys.dash];
      } else {
        return this[privateKeys.hash];
      }
    }
    return this[propertyName];
  }

  private runValidation(propertyName: ValidatedArgsKey<T>, val: any): ValidationResponse | undefined {
    if (this?.schema[propertyName] && val !== undefined) {
      try {
        const err = this.schema[propertyName]?.(val);
        if (err && err.length > 0) {
          return new ValidationResponse(propertyName.toString(), err);
        }
      } catch (err) {
        return new ValidationResponse(propertyName.toString(), [err as BaseError]);
      }
    } else if (this?.schema[propertyName] && !this.isOptional(propertyName) && val === undefined) {
      return new ValidationResponse(propertyName.toString(), [new EmptyValue(propertyName)]);
    } else if (!this?.schema[propertyName] && !this.isOptional(propertyName)) {
      throw new RuntimeError(
        `Invalid validation schema for property '${propertyName.toString()}'. Did you forget to add the validation?`,
      );
    }
  }

  private filterSchemaFromProps(): ValidatedArgsKey<T>[] {
    const schemaEntries = Object.keys(this.schema) as ValidatedArgsKey<T>[];
    const entries = Mapper.renamePrivateProps(Object.keys(this)) as ValidatedArgsKey<T>[];
    const filteredEntries = schemaEntries.filter((value) => entries.includes(value));
    return filteredEntries;
  }

  private pushValidations(key: ValidatedArgsKey<T>, vals: ValidationResponse[]): void {
    try {
      const err = this.runValidation(key, this.getProperty(key as keyof this));
      /* eslint-disable-next-line @typescript-eslint/no-unused-expressions */
      err && vals.push(err);
    } catch (err) {
      vals.push(new ValidationResponse(key.toString(), [err as BaseError]));
    }
  }
}
