// SPDX-License-Identifier: Apache-2.0

import { ButtonProps, ButtonThemeConfiguration } from "io-bricks-ui";

export const sizes: ButtonThemeConfiguration["sizes"] = {
  sm: {
    fontSize: "sm",
    h: "unset",
    minH: 8,
    minW: 19,
  },
  md: {
    fontSize: "sm",
    h: "unset",
    minH: 10,
    minW: 19,
  },
  lg: {
    fontSize: "sm",
    h: "unset",
    minH: 12,
    minW: 19,
  },
};

interface Color {
  enabled: string;
  hover: string;
  focused: string;
  disabled: string;
}

type ColorName = "primary" | "secondary" | "tertiary";

export const colors: Record<ColorName, Color> = {
  primary: {
    enabled: "primary.500",
    hover: "primary.400",
    focused: "primary.500",
    disabled: "primary.800",
  },

  secondary: {
    enabled: "primary.500",
    hover: "primary.400",
    focused: "primary.500",
    disabled: "primary.800",
  },

  tertiary: {
    enabled: "secondary.500",
    hover: "secondary.500",
    focused: "secondary.500",
    disabled: "neutral.600",
  },
};

const getColor = (props: ButtonProps, defaultColor: ColorName) => {
  if (props.status === "danger") {
    return {
      enabled: "status.error.500",
      hover: "status.error.400",
      focused: "status.error.200",
      disabled: "status.error.800",
    };
  }

  return colors[defaultColor];
};

export const variants = {
  primary: (props: ButtonProps) => {
    const getKey = (key: keyof Color) => {
      const color = getColor(props, "primary")[key];

      return {
        bg: color,
        borderColor: color,
        color: "neutral.white",
      };
    };

    return {
      ...getKey("enabled"),
      _hover: {
        ...getKey("hover"),
        _disabled: getKey("disabled"),
      },
      _focus: getKey("focused"),
      _disabled: getKey("disabled"),
      _loading: {
        ...getKey("enabled"),
        _hover: getKey("enabled"),
      },
    };
  },

  secondary: (props: ButtonProps) => {
    const getKey = (key: keyof Color) => {
      const color = getColor(props, "secondary")[key];

      return {
        color,
        borderColor: color,
      };
    };

    return {
      ...getKey("enabled"),
      _hover: getKey("hover"),
      _focus: getKey("focused"),
      _disabled: getKey("disabled"),
    };
  },

  tertiary: (props: ButtonProps) => {
    const getKey = (key: keyof Color) => {
      const bgColor = {
        enabled: "transparent",
        hover: "neutral.150",
        focused: "neutral.100",
        disabled: "transparent",
      }[key];

      const color = getColor(props, "tertiary")[key];

      return {
        color,
        bgColor,
        borderColor: bgColor,
      };
    };

    return {
      ...getKey("enabled"),
      _hover: getKey("hover"),
      _focus: getKey("focused"),
      _active: getKey("focused"),
      _disabled: getKey("disabled"),
    };
  },
};

export const Button: ButtonThemeConfiguration = {
  baseStyle: {
    py: 2,
    px: 4,
    fontWeight: "500",
    lineHeight: 1,
    border: "1px solid",
    borderRadius: "8px",
    display: "inline-flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    transition: "all 0.2s",
    color: "neutral.650",
    leftIcon: {
      color: "neutral.650",
    },
  },

  sizes,

  variants: {
    ...variants,
    table: {
      color: "neutral.700",
      textDecoration: "none",
      border: "none",
      _focus: {
        boxShadow: "unset",
        border: "none",
      },
    },
    ghost: {
      //@ts-ignore TODO: Review this
      border: 0,
      mr: -3,
      minW: 0,
    },
  },

  defaultProps: {
    size: "md",
    variant: "primary",
  },
};
