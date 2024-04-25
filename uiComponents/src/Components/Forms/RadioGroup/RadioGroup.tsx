import type { RadioGroupProps as ChakraRadioGroupProps } from "@chakra-ui/radio";
import { RadioGroup as ChakraRadioGroup } from "@chakra-ui/radio";
import type { ComponentWithAs } from "@chakra-ui/system";
import { forwardRef } from "@chakra-ui/system";
import type { BaseSingleStyleConfiguration } from "@Theme/Components/BaseSingleStyleConfiguration";
import React from "react";

export interface RadioGroupThemeConfiguration
  extends BaseSingleStyleConfiguration {}

export interface RadioGroupProps extends ChakraRadioGroupProps {}

export const RadioGroup: ComponentWithAs<"div", RadioGroupProps> = forwardRef<
  RadioGroupProps,
  "div"
>(({ name, ...props }: RadioGroupProps, ref) => {
  return <ChakraRadioGroup ref={ref} name={name} {...props} />;
});
