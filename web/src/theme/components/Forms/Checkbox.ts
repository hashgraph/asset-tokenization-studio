import {
  CheckboxThemeConfiguration,
  checkboxPartsList,
} from "@iob/io-bricks-ui/Forms";
import { BasePlatformTheme } from "@iob/io-bricks-ui/Theme";

export const Checkbox: CheckboxThemeConfiguration = {
  parts: checkboxPartsList,
  baseStyle: {
    control: {
      borderColor: "neutral.500",
      _hover: {
        borderColor: "neutral.200",
      },
      _focus: {
        bg: "neutral.600",
        boxShadow: "var(--chakra-colors-neutral-light-600) 0px 0px 1px 2px",
        borderColor: "neutral.200",
      },
      _checked: {
        bg: "primary.500",
        borderColor: "primary.500",
        _hover: {
          borderColor: "primary.700",
          bg: "primary.700",
        },
        _disabled: {
          bg: "neutral.100",
          borderColor: "neutral.100",
          color: "neutral.500",
        },
        _focus: {
          bg: "primary.500",
          boxShadow: "var(--chakra-colors-primary-800) 0px 0px 1px 2px",
          borderColor: "primary.500",
        },
      },
      _disabled: {
        bg: "neutral.200",
        borderColor: "neutral.100",
        color: "neutral.500",
      },
      _invalid: {
        borderColor: "status.error.500",
        _focus: {
          borderColor: "status.error.500",
          bg: "status.error.100",
          boxShadow: "var(--chakra-colors-status-error-100) 0px 0px 1px 2px",
        },
      },
    },
    label: {
      color: "neutral.white",
      _disabled: {
        color: "neutral.500",
      },
    },
  },
  sizes: {
    md: {
      label: {
        ...BasePlatformTheme.textStyles.ElementsRegularXS,
      },
    },
  },
  variants: {
    roles: {
      container: {
        layerStyle: "whiteContainer",
      },
      label: {
        color: "neutral.700",
        ...BasePlatformTheme.textStyles.ElementsRegularXS,
        _disabled: {
          color: "neutral.500",
        },
      },
    },
  },
  defaultProps: {
    size: "md",
    variant: "square",
  },
};
