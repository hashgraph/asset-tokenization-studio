import {
  textareaPartsList,
  TextareaThemeConfiguration,
} from "@hashgraph/uiComponents/Forms/Textarea";

export const Textarea: TextareaThemeConfiguration = {
  parts: textareaPartsList,
  baseStyle: () => ({
    labelContainer: {
      width: "100%",
      position: "relative",
    },
    label: {
      apply: "textStyles.BodyRegularSM",
      color: "neutral.200",
      mb: 2,
    },
    container: {
      bg: "neutral.white",
      apply: "textStyles.ElementsRegularSM",
      color: "neutral.800",
      _placeholder: {
        apply: "textStyles.ElementsRegularSM",
        color: "neutral.500",
      },
      "&:focus ~ p": {
        color: "neutral.200",
      },
    },
    length: {
      position: "absolute",
      right: 3,
      apply: "textStyles.BodyRegularXS",
      bottom: 2,
      color: "neutral.500",
      transition: "all .2s ease-in",
    },
  }),
  variants: {
    outline: ({ isSuccess }: { isSuccess: boolean }) => ({
      container: {
        px: 3,
        py: 2,
        borderRadius: "simple",
        border: "1px",
        borderColor: isSuccess ? "status.success.500" : "neutral.500",
        _hover: {
          borderColor: "neutral.200",
        },
        _focus: {
          borderColor: isSuccess ? "status.success.500" : "primary.500",
          _hover: {
            borderColor: isSuccess ? "status.success.500" : "primary.500",
          },
        },
        _active: {
          borderColor: isSuccess ? "status.success.500" : "primary.500",
          _hover: {
            borderColor: isSuccess ? "status.success.500" : "primary.500",
          },
        },
        _focusVisible: { boxShadow: "none" },
        _invalid: {
          borderColor: "status.error.500",
          _focus: {
            borderColor: "status.error.500",
            boxShadow: "none",
          },
          _active: {
            borderColor: "status.error.500",
            boxShadow: "none",
          },
        },
        _disabled: {
          borderColor: "neutral.100",
          bg: "neutral.200",
          color: "neutral.500",
          cursor: "not-allowed",
        },
      },
    }),
  },
  defaultProps: {
    variant: "outline",
  },
};
