import type { CheckboxProps } from "@Components/Forms/Checkbox";
import { Checkbox } from "@Components/Forms/Checkbox";
import { omit as _omit } from "lodash";
import type { Control, FieldValues, UseControllerProps } from "react-hook-form";
import type { FieldControllerProps } from "../FieldController/FieldController";
import { FieldController } from "../FieldController/FieldController";
import { useController } from "react-hook-form";
import React from "react";

export interface CheckboxControllerProps<T extends FieldValues>
  extends Omit<CheckboxProps, "defaultValue" | "defaultChecked"> {
  control: Control<T>;
  id: UseControllerProps<T>["name"];
  rules?: Record<string, unknown>;
  showErrors?: boolean;
  defaultValue?: UseControllerProps<T>["defaultValue"];
  errorMessageVariant?: FieldControllerProps["errorMessageVariant"];
}

export const CheckboxController = <T extends FieldValues>(
  props: CheckboxControllerProps<T>
) => {
  const {
    control,
    id,
    variant,
    showErrors = true,
    onChange,
    onBlur,
    defaultValue,
    errorMessageVariant,
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

  const checkboxProps = _omit(props, [
    "control",
    "rules",
    "showErrors",
    "onChange",
    "onBlur",
    "defaultValue",
    "errorMessageVariant",
  ]);

  return (
    <FieldController
      fieldState={fieldState}
      errorMessageVariant={errorMessageVariant}
      showErrors={showErrors}
    >
      <Checkbox
        variant={variant}
        data-testid={id}
        isInvalid={!!fieldState?.error}
        defaultChecked={value || defaultValue}
        onChange={(e) => {
          onChange?.(e);
          onChangeDefault(e);
        }}
        onBlur={(e) => {
          onBlur?.(e);
          onBlurDefault();
        }}
        {...checkboxProps}
      />
    </FieldController>
  );
};
