// SPDX-License-Identifier: Apache-2.0

import { Control, FieldPath, FieldValues, RegisterOptions } from "react-hook-form";
import { CalendarInputController } from "io-bricks-ui";
import { validateFutureDate } from "../NewDistribution.utils";

interface DateFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  placeholder: string;
  isRequired?: boolean;
  requiredMessage?: string;
  futureDateMessage?: string;
  rules?: RegisterOptions<T, FieldPath<T>>;
}

export const DateField = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  isRequired,
  requiredMessage,
  futureDateMessage,
  rules = {},
}: DateFieldProps<T>) => {
  const validationRules: RegisterOptions<T, FieldPath<T>> = {
    ...rules,
    ...(isRequired &&
      requiredMessage && {
        required: requiredMessage,
      }),
    ...(futureDateMessage && {
      validate: (value: Date | string | undefined) => validateFutureDate(value, futureDateMessage),
    }),
  };

  return (
    <CalendarInputController
      id={name}
      name={name}
      control={control}
      label={label}
      placeholder={placeholder}
      rules={validationRules}
      fromDate={new Date()}
    />
  );
};
