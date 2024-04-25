import React from "react";
import type { StepperProps, StepProps } from "@Components/Indicators/Stepper";
export type WizardStep = StepProps & {
    content: React.ReactNode;
};
export type WizardSteps = [
    WizardStep,
    WizardStep?,
    WizardStep?,
    WizardStep?,
    WizardStep?,
    WizardStep?
];
export interface WizardProps {
    steps: WizardSteps;
    activeStep: StepperProps["index"];
    variant?: string;
    goToNext?(): void;
    goToPrevious?(): void;
    setActiveStep?: React.Dispatch<React.SetStateAction<number>>;
}
export declare const Wizard: ({ steps, variant, activeStep, setActiveStep, goToNext, goToPrevious, ...props }: WizardProps) => JSX.Element;
