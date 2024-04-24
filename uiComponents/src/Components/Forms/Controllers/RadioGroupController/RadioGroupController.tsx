import React from "react";
import type { Control, FieldValues, UseControllerProps } from "react-hook-form";
import type { FieldControllerProps } from "../FieldController/FieldController";
import { FieldController } from "../FieldController/FieldController";
import { useController } from "react-hook-form";
import type { RadioGroupProps } from "@Components/Forms/RadioGroup";
import { RadioGroup } from "@Components/Forms/RadioGroup";
import type { RadioProps } from "@Components/Forms/Radio";
import { Radio } from "@Components/Forms/Radio";
import { useRadioGroup } from "@chakra-ui/react";

export interface RadioGroupControllerProps<T extends FieldValues>
  extends Omit<RadioGroupProps, "children" | "onChange"> {
  control: Control<T>;
  id: UseControllerProps<T>["name"];
  rules?: Record<string, unknown>;
  showErrors?: boolean;
  options: Array<{ value: string; label: string }>;
  variant?: RadioProps["variant"];
  errorMessageVariant?: FieldControllerProps["errorMessageVariant"];
  radioProps?: Omit<RadioProps, "variant">;
  defaultValue?: UseControllerProps<T>["defaultValue"];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RadioGroupController = <T extends FieldValues>({
  errorMessageVariant,
  control,
  id,
  variant,
  showErrors = false,
  onChange,
  onBlur,
  defaultValue: defaultValueProp,
  rules = {},
  options,
  radioProps: radioComponentProps,
  ...props
}: RadioGroupControllerProps<T>) => {
  const {
    fieldState,
    field: { onChange: onChangeDefault, value },
  } = useController({
    name: id,
    control,
    rules,
    defaultValue: defaultValueProp,
  });

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: id,
    onChange: onChangeDefault,
    value: value,
  });

  return (
    <>
      <FieldController
        fieldState={fieldState}
        errorMessageVariant={errorMessageVariant}
        showErrors={showErrors}
      >
        <RadioGroup
          defaultValue={defaultValueProp}
          {...getRootProps}
          {...props}
        >
          {options.map((radio) => {
            const radioProps = getRadioProps({ value: radio.value });
            return (
              <Radio
                key={radio.value}
                variant={variant}
                {...radioComponentProps}
                {...radioProps}
                onChange={(e) => {
                  radioProps.onChange?.(e);
                  onChange?.(e);
                }}
              >
                {radio.label}
              </Radio>
            );
          })}
        </RadioGroup>
      </FieldController>
    </>
  );
};
