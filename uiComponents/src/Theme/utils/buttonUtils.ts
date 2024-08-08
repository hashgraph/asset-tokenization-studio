import { keyframes } from "@emotion/react";
import { textStyles } from "../textStyles";
import type {
  ButtonThemeConfiguration,
  ButtonVariantProps,
} from "@/Components/Interaction/Button";
export const fill = keyframes`
from { width: 0; }
to { width: 100%; }`;
export const fillAnimation = `${fill} infinite 4s linear`;
const spinnerClass = ".chakra-spinner";
export const buttonSizes: ButtonThemeConfiguration["sizes"] = {
  sm: {
    height: "unset",
    minH: 8,
    py: "6px",
    px: 4,
  },
  md: {
    height: "unset",
    // @ts-ignore (this doesn't work with apply property :( )
    ...textStyles.ElementsMediumSM,
    minH: 10,
    minW: 19,
    padding: "0 16px",
  },
  lg: {
    height: "unset",
    // @ts-ignore (this doesn't work with apply property :( )
    ...textStyles.ElementsMediumSM,
    minH: 12,
    minW: 19,
    padding: "0 16px",
  },
};

const getColorScheme = (status: ButtonVariantProps["status"]) => {
  if (status) {
    return status;
  }
  return "primary";
};

const getColorSchemeForTertiary = (status: ButtonVariantProps["status"]) => {
  if (status) {
    return status;
  }
  return "neutral";
};

const focusStyle = (status: ButtonVariantProps["status"]) => ({
  _before: {
    content: `""`,
    position: "absolute",
    w: "full",
    h: "full",
    borderWidth: 4,
    borderColor: `${getColorScheme(status)}.100`,
    borderStyle: "solid",
    borderRadius: 12,
    filter: "blur(0.5px)",
  },
});

export const buttonVariants: ButtonThemeConfiguration["variants"] = {
  primary: ({ status }) => {
    return {
      bg: getColorScheme(status),
      color: "neutral",
      svg: {
        color: "inherit",
      },
      _hover: {
        bg: `${getColorScheme(status)}.700`,
        _disabled: {
          cursor: "not-allowed",
          bg: `${getColorScheme(status)}.50`,
        },
      },
      _active: {
        bg: `${getColorScheme(status)}.800`,
      },
      _focus: {
        ...focusStyle(status),
      },
      _focusVisible: {
        boxShadow: "none",
        ...focusStyle(status),
      },
      _disabled: {
        bg: `${getColorScheme(status)}.50`,
        color: "neutral",
        _hover: {
          bg: `${getColorScheme(status)}.50`,
        },
      },
      _loading: {
        bg: `${getColorScheme(status)}.50`,
        color: "neutral",
        _hover: {
          bg: `${getColorScheme(status)}.50`,
        },
        [spinnerClass]: {
          color: "currentColor",
        },
      },
    };
  },
  secondary: ({ status }) => ({
    bg: "transparent",
    color: getColorScheme(status),
    borderColor: getColorScheme(status),
    borderWidth: "1px",
    svg: {
      color: "inherit",
    },
    _hover: {
      borderColor: `${getColorScheme(status)}.700`,
      color: `${getColorScheme(status)}.700`,
      bg: "transparent",
      _disabled: {
        cursor: "not-allowed",
        bg: "transparent",
        borderColor: `${getColorScheme(status)}.50`,
        color: `${getColorScheme(status)}.50`,
      },
    },
    _active: {
      borderColor: `${getColorScheme(status)}.800`,
      color: `${getColorScheme(status)}.800`,
    },
    _focus: {
      borderColor: `${getColorScheme(status)}.800`,
      color: `${getColorScheme(status)}.800`,
      ...focusStyle(status),
    },
    _focusVisible: {
      boxShadow: "none",
      ...focusStyle(status),
    },
    _disabled: {
      borderColor: `${getColorScheme(status)}.50`,
      color: `${getColorScheme(status)}.50`,
      bg: "transparent",
    },
    _loading: {
      borderColor: `${getColorScheme(status)}.50`,
      color: `${getColorScheme(status)}.50`,
      bg: "transparent",
      _hover: {
        bg: "transparent",
      },
      [spinnerClass]: {
        color: "currentColor",
      },
    },
  }),
  tertiary: ({ status }) => ({
    bg: "transparent",
    color: `${getColorSchemeForTertiary(status)}.800`,
    border: "none",
    svg: {
      color: "inherit",
    },
    _hover: {
      color: `${getColorSchemeForTertiary(status)}.800`,
      bg: "neutral.200",
      _disabled: {
        cursor: "not-allowed",
        bg: "transparent",
        color: `${getColorSchemeForTertiary(status)}.400`,
      },
    },
    _active: {
      color: `${getColorSchemeForTertiary(status)}.800`,
    },
    _focus: {
      ...focusStyle(status),
    },
    _focusVisible: {
      boxShadow: "none",
      ...focusStyle(status),
    },
    _disabled: {
      color: `${getColorSchemeForTertiary(status)}.400`,
      bg: "transparent",
    },
    _loading: {
      color: `${getColorSchemeForTertiary(status)}.400`,
      bg: "transparent",
      span: {
        lineHeight: 0,
      },
      _hover: {
        bg: "transparent",
      },
      [spinnerClass]: {
        color: "currentColor",
      },
    },
  }),
};
