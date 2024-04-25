import type { LinkThemeConfiguration } from "@Components/Interaction/Link";

const focusStyle = {
  bgColor: "transparent",
  _before: {
    content: `""`,
    position: "absolute",
    w: "-webkit-fill-available",
    h: "90%",
    borderWidth: "3px",
    borderColor: "primary.100",
    borderStyle: "solid",
    borderRadius: "5px",
    filter: "blur(0.5px)",
  },
};

export const ConfigLink: LinkThemeConfiguration = {
  baseStyle: {
    display: "block",
    w: "fit-content",
    textDecoration: "underline",
    position: "relative",
    textStyle: "BodyRegularSM",
    p: {
      px: 1,
    },
  },
  variants: {
    table: {
      color: "neutral.900",
      _focusVisible: focusStyle,
      _focus: {
        boxShadow: "none",
      },
    },
    highlighted: ({ isDisabled }) => ({
      color: "primary.500",
      _hover: {
        color: "primary.700",
      },
      _pressed: {
        color: "red",
      },
      _focus: {
        ...focusStyle,
        color: "primary.700",
      },
      _focusVisible: {
        boxShadow: "none",
      },
      ...(isDisabled && {
        color: "primary.100",
        cursor: "not-allowed",
        _hover: {},
        _focus: {},
      }),
    }),
  },
  defaultProps: {
    variant: "highlighted",
  },
};
