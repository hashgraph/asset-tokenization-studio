import type { ComponentMultiStyleConfig } from "@chakra-ui/react";
import { BasePlatformTheme } from "@hashgraph/uiComponents/Theme";

export const FormError: ComponentMultiStyleConfig = {
  parts: ["text"],
  baseStyle: {
    text: {
      ...BasePlatformTheme.textStyles.BodyRegularXS,
    },
  },
  variants: {
    outline: {
      text: {
        color: "status.error.500",
      },
    },
  },
  defaultProps: {
    variant: "outline",
  },
};
