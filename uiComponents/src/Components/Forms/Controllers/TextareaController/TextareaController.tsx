import { omit as _omit } from "lodash";
import type { Control, FieldValues, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";
import { FieldController } from "../FieldController/FieldController";
import React from "react";
import { Textarea } from "../../Textarea";
import type { TextareaProps } from "../../Textarea";

export interface TextareaControllerProps<T extends FieldValues>
  extends TextareaProps {
  control: Control<T>;
  id: UseControllerProps<T>["name"];
  defaultValue?: UseControllerProps<T>["defaultValue"];
  rules?: Record<string, unknown>;
  showErrors?: boolean;
  showIsSuccess?: boolean;
}

export const TextareaController = <T extends FieldValues>(
  props: TextareaControllerProps<T>
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
  const textareaProps = _omit(props, [
    "control",
    "rules",
    "showErrors",
    "onChange",
    "onBlur",
    "showIsSuccess",
  ]);

  return (
    <FieldController
      fieldState={fieldState}
      errorMessageVariant={variant}
      showErrors={showErrors}
    >
      <Textarea
        data-testid={id}
        name={id}
        isRequired={isRequired}
        isInvalid={!!fieldState.error}
        isSuccess={showIsSuccess && fieldState.isDirty && !fieldState.error}
        onChange={(e) => {
          onChange?.(e);
          onChangeDefault(e);
        }}
        onBlur={(e) => {
          onBlur?.(e);
          onBlurDefault();
        }}
        {...textareaProps}
        value={value || ""}
      />
    </FieldController>
  );
};
