import {
  textareaPartsList,
  type TextareaThemeConfiguration,
} from "@Components/Forms/Textarea";

export const ConfigTextarea: TextareaThemeConfiguration = {
  parts: textareaPartsList,
  baseStyle: () => ({
    labelContainer: {
      width: "100%",
      position: "relative",
    },
    label: {
      apply: "textStyles.ElementsRegularSM",
      color: "neutral.700",
      zIndex: 1,
      mb: 2,
    },
    container: {
      fontWeight: "normal",
      apply: "textStyles.ElementsRegularSM",
      color: "neutral.800",
      _placeholder: {
        apply: "textStyles.ElementsRegularSM",
        color: "neutral.400",
      },
    },
    length: {
      position: "absolute",
      right: 3,
      apply: "textStyles.ElementsRegularXS",
      bottom: 2,
      color: "neutral.600",
    },
  }),
  variants: {
    outline: ({ isSuccess }) => ({
      container: {
        paddingX: 3,
        paddingY: 2,
        borderRadius: "simple",
        border: "1px",
        borderColor: isSuccess ? "success" : "neutral.300",
        _hover: {
          borderColor: "neutral.500",
        },
        _focus: {
          borderColor: isSuccess ? "success" : "primary",
          _hover: { borderColor: isSuccess ? "success" : "primary" },
        },
        _focusVisible: { boxShadow: "none" },
        _invalid: {
          borderColor: "error",
          boxShadow: "none",
          _focusVisible: {
            borderColor: "error",
          },
        },
        _disabled: {
          borderColor: "neutral.100",
          color: "neutral.300",
          bg: "neutral.50",
        },
      },
    }),
  },
  defaultProps: {
    variant: "outline",
  },
};
