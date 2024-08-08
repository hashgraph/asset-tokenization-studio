import type { checkboxAnatomy as ChakraCheckboxParts } from "@chakra-ui/anatomy";
import type { CheckboxProps as ChakraCheckboxProps } from "@chakra-ui/checkbox";
import { Checkbox as ChakraCheckbox } from "@chakra-ui/checkbox";
import { useFormControlContext as useChakraFormControlContext } from "@chakra-ui/form-control";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/system";
import React from "react";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import type {
  SystemStyleObject as ChakraSystemStyleObject,
  ComponentWithAs,
} from "@chakra-ui/system";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Check } from "@phosphor-icons/react";

export const checkboxPartsList: Array<
  (typeof ChakraCheckboxParts.keys)[number] | "iconCustom"
> = ["container", "icon", "label", "control", "iconCustom"];

type Parts = typeof checkboxPartsList;

export interface CheckboxThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {
  baseStyle: Partial<CheckboxThemeStyle>;
}

export interface CheckboxProps
  extends Omit<
    ChakraCheckboxProps,
    "colorScheme" | "iconSize" | "isIndeterminate"
  > {}

type CheckboxThemeStyle = Record<Parts[number], ChakraSystemStyleObject> & {
  iconCustom: React.FunctionComponent<{ isChecked?: boolean }>;
};

export const Checkbox: ComponentWithAs<"input", CheckboxProps> = forwardRef<
  CheckboxProps,
  "input"
>(({ name, isInvalid, ...props }: CheckboxProps, ref) => {
  const formControl = useChakraFormControlContext() || {};
  const { iconCustom: ThemeIcon = () => <PhosphorIcon as={Check} /> } =
    useChakraMultiStyleConfig("Checkbox", {
      ...props,
      isInvalid,
    }) as CheckboxThemeStyle;
  const iconCustom = <ThemeIcon isChecked={props.isChecked} />;

  return (
    <ChakraCheckbox
      ref={ref}
      isInvalid={isInvalid ?? formControl.isInvalid}
      icon={iconCustom}
      name={name}
      {...props}
    />
  );
});
