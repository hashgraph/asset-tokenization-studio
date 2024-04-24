import { omit as _omit } from "lodash";
import type { Control, FieldValues, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";
import { FieldController } from "../FieldController/FieldController";
import React from "react";
import type { ToggleProps } from "@Components/Forms/Toggle";
import { Toggle } from "@Components/Forms/Toggle";

export interface ToggleControllerProps<T extends FieldValues>
  extends ToggleProps {
  control: Control<T>;
  id: UseControllerProps<T>["name"];
  defaultValue?: UseControllerProps<T>["defaultValue"];
  rules?: Record<string, unknown>;
  showErrors?: boolean;
}

export const ToggleController = <T extends FieldValues>(
  props: ToggleControllerProps<T>
) => {
  const {
    control,
    id,
    variant,
    showErrors = false,
    onChange,
    onBlur,
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
    defaultValue,
  });
  // @ts-ignore
  const toggleProps = _omit(props, [
    "control",
    "rules",
    "showErrors",
    "onChange",
    "onBlur",
  ]);

  return (
    <FieldController
      fieldState={fieldState}
      errorMessageVariant={variant}
      showErrors={showErrors}
    >
      <Toggle
        data-testid={id}
        name={id}
        isInvalid={!!fieldState.error}
        onChange={(e) => {
          onChange?.(e);
          onChangeDefault(e);
        }}
        onBlur={(e) => {
          onBlur?.(e);
          onBlurDefault();
        }}
        {...toggleProps}
        isChecked={value}
        value={value || ""}
      />
    </FieldController>
  );
};
