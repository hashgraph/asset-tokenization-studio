import type { radioAnatomy as ChakraRadioParts } from "@chakra-ui/anatomy";
import { useFormControlContext as useChakraFormControlContext } from "@chakra-ui/form-control";
import type { RadioProps as ChakraRadioProps } from "@chakra-ui/radio";
import { Radio as ChakraRadio } from "@chakra-ui/radio";
import React from "react";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { ComponentWithAs } from "@chakra-ui/system";
import { forwardRef } from "@chakra-ui/system";

export const radioPartsList: typeof ChakraRadioParts.keys = [
  "container",
  "label",
  "control",
];

type Parts = typeof radioPartsList;

export interface RadioThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {}

export interface RadioProps extends Omit<ChakraRadioProps, "colorScheme"> {
  label?: string;
}

export const Radio: ComponentWithAs<"input", RadioProps> = forwardRef<
  RadioProps,
  "input"
>(
  (
    {
      name,
      isInvalid,
      label,
      children,
      size,
      variant,
      isDisabled,
      ...props
    }: RadioProps,
    ref
  ) => {
    const formControl = useChakraFormControlContext() || {};

    return (
      <ChakraRadio
        ref={ref}
        isInvalid={isInvalid ?? formControl.isInvalid}
        name={name}
        size={size}
        variant={variant}
        isDisabled={isDisabled}
        {...props}
      >
        {children}
      </ChakraRadio>
    );
  }
);
