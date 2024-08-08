import { stepperPartsList } from "@Components/Indicators/Stepper";
import type { StepperThemeConfiguration } from "@Components/Indicators/Stepper";
import { textStyles } from "../textStyles";

export const ConfigStepper: StepperThemeConfiguration = {
  parts: stepperPartsList,
  baseStyle: {
    number: {
      "--stepper-title-font-size": "20px",
    },
    description: {
      ...textStyles.ElementsRegularXS,
      color: "neutral.700",
      "&[data-status=complete]": {
        color: "neutral.600",
      },
    },
    indicator: {
      w: 12,
      h: 12,
      transition: "all .3s ease",
      "&[data-status=complete]": {
        bg: "primary.100",
      },
      "&[data-status=incomplete]": {
        borderColor: "primary.400",
        color: "primary.400",
        borderWidth: "1px",
      },
      "&[data-status=active]": {
        bg: "primary.400",
        color: "neutral",
        borderColor: "primary.400",
      },
    },
    stepContainer: {
      flexDirection: "column",
      gap: 4,
      alignItems: "center",
    },
    stepTextContainer: {
      gap: 1,
      maxW: "200px",
      alignSelf: "center",
    },
    separator: {
      "&[data-orientation=horizontal]": {
        mt: 6,
        h: "1px",
        bg: "primary.400",
      },
    },
    title: {
      // @ts-ignore
      ...textStyles.ElementsBoldLG,
      color: "neutral.900",
      mb: 1,
      "&[data-status=complete]": {
        color: "neutral.700",
      },
      "&[data-status=active]": {
        ...textStyles.ElementsBoldLG,
      },
    },
    stepper: {
      "&[data-orientation=horizontal]": {
        w: "full",
        alignItems: "flex-start",
        gap: 2,
      },
    },
    step: {
      "&[data-orientation=horizontal]": {
        alignItems: "flex-start",
        gap: 2,
      },
    },
  },
};
