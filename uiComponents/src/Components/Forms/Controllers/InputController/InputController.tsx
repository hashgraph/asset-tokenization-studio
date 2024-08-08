import { Input } from "@Components/Forms/Input";
import type { InputProps } from "../../Input";
import { omit as _omit } from "lodash";
import { useController } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { FieldController } from "../FieldController/FieldController";
import type { InputBaseControllerProps } from "../types";
import React from "react";

export interface InputControllerProps<T extends FieldValues>
  extends InputBaseControllerProps<T>,
    Omit<InputProps, "id" | "defaultValue" | "onClear"> {
  isClearable?: boolean;
  onClear?: () => void;
}

export const InputController = <T extends FieldValues>(
  props: InputControllerProps<T>
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
    isClearable = false,
    onClear,
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
  const inputProps = _omit(props, [
    "control",
    "rules",
    "showErrors",
    "onChange",
    "onBlur",
    "isClearable",
    "onClear",
  ]);

  return (
    <FieldController
      fieldState={fieldState}
      errorMessageVariant={variant}
      showErrors={showErrors}
    >
      <Input
        data-testid={id}
        name={id}
        isRequired={isRequired}
        isInvalid={!!fieldState.error}
        isSuccess={showIsSuccess && fieldState.isDirty && !fieldState.error}
        isClearable={isClearable && !!value}
        onClear={(e) => {
          // @ts-ignore dont have React.ChangeEventHandler<HTMLInputElement>
          onChange?.(e);
          onChangeDefault(defaultValue);
          onClear && onClear();
        }}
        onChange={(e) => {
          onChange?.(e);
          onChangeDefault(e);
        }}
        onBlur={(e) => {
          onBlur?.(e);
          onBlurDefault();
        }}
        {...inputProps}
        value={value || ""}
      />
    </FieldController>
  );
};
