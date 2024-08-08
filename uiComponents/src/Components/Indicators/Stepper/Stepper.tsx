import React from "react";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import type { StepperProps as ChakraStepperProps } from "@chakra-ui/stepper";
import { Stepper as ChakraStepper } from "@chakra-ui/stepper";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";

export const stepperPartsList: (
  | "description"
  | "icon"
  | "indicator"
  | "number"
  | "separator"
  | "title"
  | "step"
  | "stepper"
  | "stepTextContainer"
  | "stepContainer"
)[] = [
  "description",
  "icon",
  "indicator",
  "number",
  "separator",
  "title",
  "step",
  "stepper",
  "stepTextContainer",
  "stepContainer",
];

type Parts = typeof stepperPartsList;

export interface StepperThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {}

export type StepperThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;

export interface StepperProps extends ChakraStepperProps {}

export const Stepper = (props: StepperProps) => {
  const styles = useChakraMultiStyleConfig("Stepper", {}) as StepperThemeStyle;
  return <ChakraStepper {...props} sx={styles.stepper} />;
};
