import {
  inputPartsList,
  type InputConfigProps,
  type InputThemeConfiguration,
} from "@hashgraph/uiComponents/Forms";

const baseStyle: InputThemeConfiguration["baseStyle"] = () => {
  return {
    input: {
      bg: "neutral.white",
      apply: "textStyles.ElementsRegularSM",
      color: "neutral.600",
      _autofill: {
        WebkitTextFillColor: "var(--chakra-colors-neutral-600)",
        caretColor: "var(--chakra-colors-neutral-light-200) !important",
        boxShadow: "0 0 0px 1000px var(--chakra-colors-neutral-dark-600) inset",
      },

      _placeholder: {
        apply: "textStyles.ElementsRegularSM",
        color: "neutral.500",
      },
    },
    label: {
      apply: "textStyles.BodyRegularSM",
      color: "neutral.500",
    },
    addonLeft: {
      height: "full",
    },
    addonRight: { color: "neutral.500" },
    labelContainer: {
      [`[id$="-placeholder"]`]: {
        color: "neutral.500",
      },
    },
  };
};

const outline = ({ isSuccess, isInvalid }: InputConfigProps) => {
  return {
    input: {
      borderColor: isSuccess ? "status.success.500" : "holderUI.300",
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
      ...(isInvalid && {
        // this has to be added as well for selects
        borderColor: "status.error.500",
        _focus: {
          borderColor: "status.error.500",
          boxShadow: "none",
        },
        _active: {
          borderColor: "status.error.500",
          boxShadow: "none",
        },
      }),
      _disabled: {
        borderColor: "neutral.100",
        bg: "neutral.200",
        color: "neutral.500",
        cursor: "not-allowed",
      },
    },
  };
};

export const Input: InputThemeConfiguration = {
  parts: inputPartsList,
  baseStyle,
  variants: {
    outline,
  },
  defaultProps: {
    variant: "outline",
  },
};
