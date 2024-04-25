/// <reference types="react" />
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import type { StepperProps as ChakraStepperProps } from "@chakra-ui/stepper";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
export declare const stepperPartsList: ("description" | "icon" | "indicator" | "number" | "separator" | "title" | "step" | "stepper" | "stepTextContainer" | "stepContainer")[];
type Parts = typeof stepperPartsList;
export interface StepperThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
}
export type StepperThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;
export interface StepperProps extends ChakraStepperProps {
}
export declare const Stepper: (props: StepperProps) => JSX.Element;
export {};
