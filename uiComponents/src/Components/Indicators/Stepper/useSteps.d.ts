/// <reference types="react" />
import type { UseStepsProps as ChakraUseStepsProps } from "@chakra-ui/stepper";
export declare const useSteps: (props?: ChakraUseStepsProps) => {
    activeStep: number;
    setActiveStep: import("react").Dispatch<import("react").SetStateAction<number>>;
    activeStepPercent: number;
    isActiveStep(step: number): boolean;
    isCompleteStep(step: number): boolean;
    isIncompleteStep(step: number): boolean;
    getStatus(step: number): import("@chakra-ui/stepper/dist/use-steps").StepStatus;
    goToNext(): void;
    goToPrevious(): void;
};
