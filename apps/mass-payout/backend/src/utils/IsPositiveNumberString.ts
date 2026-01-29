// SPDX-License-Identifier: Apache-2.0

import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator"

export function IsPositiveNumberString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isPositiveNumberString",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line unused-imports/no-unused-vars
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== "string") return false
          const num = Number(value)
          return !isNaN(num) && num > 0 && isFinite(num)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a positive number string`
        },
      },
    })
  }
}
