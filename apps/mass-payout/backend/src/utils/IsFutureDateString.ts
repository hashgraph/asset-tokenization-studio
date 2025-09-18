import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator"

export function IsFutureDateString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isFutureDateString",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== "string") return false
          const date = new Date(value)
          if (isNaN(date.getTime())) return false
          return date > new Date()
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a future date`
        },
      },
    })
  }
}
