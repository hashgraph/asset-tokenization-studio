/// <reference types="react" />
import type { StepProps as ChakraStepProps, StepStatusProps, StepTitleProps } from "@chakra-ui/stepper";
export interface StepProps extends Omit<ChakraStepProps, "content"> {
    title: string;
    description?: string;
    key?: number;
    complete?: StepStatusProps["complete"];
    incomplete?: StepStatusProps["incomplete"];
    active?: StepStatusProps["active"];
    variant?: string;
    titleComponent?: StepTitleProps["as"];
}
export declare const Step: ({ complete, incomplete, active, title, description, variant, titleComponent, ...props }: StepProps) => JSX.Element;
