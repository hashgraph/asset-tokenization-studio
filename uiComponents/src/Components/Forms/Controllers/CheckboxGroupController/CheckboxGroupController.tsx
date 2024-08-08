import React from "react";
import type { Control, FieldValues, UseControllerProps } from "react-hook-form";
import type { FieldControllerProps } from "../FieldController/FieldController";
import { FieldController } from "../FieldController/FieldController";
import { useController } from "react-hook-form";
import type { RadioProps } from "@Components/Forms/Radio";
import type {
  CheckboxGroupProps,
  FlexProps as ChakraFlexProps,
} from "@chakra-ui/react";
import { Flex as ChakraFlex, useCheckboxGroup } from "@chakra-ui/react";
import type { CheckboxProps } from "@Components/Forms/Checkbox";
import { Checkbox } from "@Components/Forms/Checkbox";

export interface CheckboxGroupControllerProps<T extends FieldValues>
  extends Omit<CheckboxGroupProps, "children" | "onChange">,
    ChakraFlexProps {
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
  checkboxProps?: CheckboxProps;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

export const CheckboxGroupController = <T extends FieldValues>({
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
  checkboxProps: checkboxComponentProps,
  ...props
}: CheckboxGroupControllerProps<T>) => {
  const {
    fieldState,
    field: { onChange: onChangeDefault, value },
  } = useController({
    name: id,
    control,
    rules,
    defaultValue: defaultValueProp,
  });

  const { getCheckboxProps } = useCheckboxGroup({
    onChange: onChangeDefault,
    value: value,
  });

  return (
    <FieldController
      fieldState={fieldState}
      errorMessageVariant={errorMessageVariant}
      showErrors={showErrors}
    >
      <ChakraFlex gap={4} {...props}>
        {options.map(({ value, label }) => {
          const checkboxProps = getCheckboxProps({ value });
          return (
            <Checkbox
              key={value}
              variant={variant}
              {...checkboxComponentProps}
              {...checkboxProps}
              onChange={(e) => {
                checkboxProps.onChange?.(e);
                onChange?.(e);
              }}
            >
              {label}
            </Checkbox>
          );
        })}
      </ChakraFlex>
    </FieldController>
  );
};
