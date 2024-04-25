import React, { useMemo } from "react";
import { Flex } from "@chakra-ui/react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import type { StepperProps, StepProps } from "@Components/Indicators/Stepper";
import {
  StepContextProvider,
  Stepper,
  Step,
} from "@Components/Indicators/Stepper";

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

export const Wizard = ({
  steps,
  variant,
  activeStep,
  setActiveStep,
  goToNext,
  goToPrevious,
  ...props
}: WizardProps) => {
  const styles = useChakraMultiStyleConfig("Stepper", { variant });

  const currentStep = useMemo(() => {
    return steps[activeStep];
  }, [activeStep, steps]);

  return (
    <Flex sx={styles.stepContainer}>
      <Stepper variant={variant} index={activeStep} sx={styles.stepper}>
        {steps.map((step, stepIndex) => {
          return step && <Step sx={styles.step} key={stepIndex} {...step!} />;
        })}
      </Stepper>
      <StepContextProvider
        value={{
          index: activeStep,
          count: steps.length,
          orientation: "horizontal",
          isLast: activeStep === steps.length - 1,
          isFirst: activeStep === 0,
          status: "active",
          setActiveStep,
          goToNext,
          goToPrevious,
        }}
      >
        {currentStep && currentStep.content}
      </StepContextProvider>
    </Flex>
  );
};
