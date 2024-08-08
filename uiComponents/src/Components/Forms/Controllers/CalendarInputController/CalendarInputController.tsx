import React from "react";
import type { CalendarInputProps } from "@Components/Forms/CalendarInput";
import { CalendarInput } from "@Components/Forms/CalendarInput";

import { omit as _omit } from "lodash";
import type { FieldValues } from "react-hook-form";
import { useController } from "react-hook-form";
import { FieldController } from "../FieldController/FieldController";
import type { InputBaseControllerProps } from "../types";

export interface CalendarInputControllerProps<T extends FieldValues>
  extends InputBaseControllerProps<T>,
    Omit<CalendarInputProps, "defaultValue" | "id"> {}

export const CalendarInputController = <T extends FieldValues>(
  props: CalendarInputControllerProps<T>
) => {
  const {
    control,
    id,
    variant,
    showErrors = true,
    onChange,
    onBlur,
    showIsSuccess = false,
    defaultValue,
    rules = {},
  } = props;
  const {
    fieldState,
    field: { onChange: onChangeDefault, onBlur: onBlurDefault, value },
  } = useController<T>({
    name: id,
    control,
    rules,
    defaultValue: defaultValue,
  });
  // @ts-ignore
  const isRequired = !!rules?.["required"] || !!rules?.validate?.["required"];

  return (
    <FieldController
      fieldState={fieldState}
      errorMessageVariant={variant}
      showErrors={showErrors}
    >
      <CalendarInput
        data-testid={id}
        name={id}
        isRequired={isRequired}
        isInvalid={!!fieldState.error}
        isSuccess={showIsSuccess && fieldState.isDirty && !fieldState.error}
        onChange={(e) => {
          onChange?.(e);
          onChangeDefault(e);
        }}
        onBlur={() => {
          onBlur?.();
          onBlurDefault();
        }}
        value={value}
        {..._omit(props, [
          "control",
          "rules",
          "showErrors",
          "onChange",
          "onBlur",
        ])}
      />
    </FieldController>
  );
};
