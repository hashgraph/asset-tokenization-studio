import React from "react";
import type {
  StepProps as ChakraStepProps,
  StepStatusProps,
  StepTitleProps,
} from "@chakra-ui/stepper";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import { Box } from "@chakra-ui/react";
import {
  Step as ChakraStep,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
} from "@chakra-ui/stepper";
import type { StepperThemeStyle } from "./Stepper";
import { Text } from "@/Components/Foundations";

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

export const Step = ({
  complete,
  incomplete,
  active,
  title,
  description,
  variant,
  titleComponent,
  ...props
}: StepProps) => {
  const styles = useChakraMultiStyleConfig("Stepper", {
    variant,
  }) as StepperThemeStyle;

  return (
    <ChakraStep {...props}>
      <StepIndicator sx={styles.indicator}>
        <StepStatus
          complete={complete || <StepNumber />}
          incomplete={incomplete || <StepNumber />}
          active={active || <StepNumber />}
        />
      </StepIndicator>

      <Box sx={styles.stepTextContainer}>
        <StepTitle as={titleComponent} noOfLines={2}>
          {title}
        </StepTitle>
        {description && (
          <Text sx={styles.description} noOfLines={2}>
            {description}
          </Text>
        )}
      </Box>

      <StepSeparator />
    </ChakraStep>
  );
};
