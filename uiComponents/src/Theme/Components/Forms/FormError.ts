import { textStyles } from "@/Theme/textStyles";
import type { ComponentMultiStyleConfig } from "@chakra-ui/react";

export const ConfigFormError: ComponentMultiStyleConfig = {
  parts: ["text"],
  baseStyle: {
    text: {
      // @ts-ignore (this doesn't work with apply property :( )
      ...textStyles.ElementsRegularXS,
    },
  },
  variants: {
    outline: {
      text: {
        color: "error",
      },
    },
  },
  defaultProps: {
    variant: "outline",
  },
};
