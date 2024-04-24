import type { FieldValues } from "react-hook-form";
import { useController } from "react-hook-form";
import type { InputControllerProps } from "../InputController/InputController";
import React from "react";
import type {
  NumericFormatProps,
  NumberFormatValues,
  SourceInfo,
} from "react-number-format";
import { useNumericFormat, NumericFormat } from "react-number-format";
import { omit as _omit } from "lodash";
import { FieldController } from "../FieldController/FieldController";
import { Input } from "@Components/Forms/Input";

export interface InputNumberControllerProps<T extends FieldValues>
  extends Omit<InputControllerProps<T>, "type" | "onChange">,
    Omit<
      NumericFormatProps,
      | "label"
      | "width"
      | "value"
      | "size"
      | "id"
      | "height"
      | "defaultValue"
      | "color"
      | "onChange"
    > {
  maxValue?: number;
  minValue?: number;
  onChange?: NumericFormatProps["onValueChange"];
}

export const InputNumberController = <T extends FieldValues>({
  thousandSeparator = ".",
  decimalSeparator = ",",
  control,
  id,
  variant,
  showErrors = true,
  onChange,
  onBlur,
  label,
  showIsSuccess = false,
  defaultValue,
  rules = {},
  maxValue,
  minValue,
  ...props
}: InputNumberControllerProps<T>) => {
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
  ]);

  const checkIsAllowed = ({ floatValue }: NumberFormatValues) => {
    if (typeof floatValue !== "number") {
      return true;
    }

    if (typeof maxValue === "number" && floatValue > maxValue) {
      return false;
    }

    return true;
  };

  const { format } = useNumericFormat({
    thousandSeparator: thousandSeparator,
    decimalSeparator: decimalSeparator,
    suffix: props.suffix,
    prefix: props.prefix,
  });

  const handleBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    if (typeof minValue === "number" && value < minValue) {
      onChangeDefault(minValue);
      onChange?.(
        {
          floatValue: minValue,
          value: minValue.toString(),
          formattedValue: format(minValue.toString()),
        },
        {
          // @ts-ignore SourceType not exported
          source: "prop",
        }
      );
    }

    onBlur?.(e);
    onBlurDefault();
  };

  return (
    <FieldController
      fieldState={fieldState}
      errorMessageVariant={variant}
      showErrors={showErrors}
    >
      <Input
        as={NumericFormat}
        data-testid={id}
        decimalSeparator={decimalSeparator}
        thousandSeparator={thousandSeparator}
        name={id}
        isRequired={isRequired}
        isInvalid={!!fieldState.error}
        isSuccess={showIsSuccess && fieldState.isDirty && !fieldState.error}
        isAllowed={checkIsAllowed}
        onBlur={handleBlur}
        label={label}
        {...inputProps}
        value={value || ""}
        onValueChange={(values: NumberFormatValues, sourceInfo: SourceInfo) => {
          onChange?.(values, sourceInfo);
          onChangeDefault(values.floatValue ?? "");
        }}
      />
    </FieldController>
  );
};
