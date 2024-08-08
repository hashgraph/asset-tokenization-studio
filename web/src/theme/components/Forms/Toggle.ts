import {
  ToggleThemeConfiguration,
  togglePartsList,
} from "@hashgraph/asset-tokenization-uicomponents/Forms";
import { BasePlatformTheme } from "@hashgraph/asset-tokenization-uicomponents/Theme";

export const Toggle: ToggleThemeConfiguration = {
  parts: togglePartsList,
  baseStyle: {
    label: {
      color: "neutral.700",
      ...BasePlatformTheme.textStyles.BodyRegularXS,
    },
  },
  sizes: {
    md: {
      thumb: {
        background: "white",
        _checked: {
          bg: "neutral.650",
        },
      },
      track: {
        background: "neutral.500",
        _focus: {
          boxShadow: "var(--chakra-colors-neutral-light-600) 0px 0px 1px 2px",
        },
        _hover: {
          background: "neutral.400",
        },
        _checked: {
          background: "primary.500",
          _hover: {
            background: "primary.400",
          },
          _focus: {
            boxShadow: "var(--chakra-colors-primary-800) 0px 0px 1px 2px",
          },
        },
        _disabled: {
          background: "grey.200",
          _checked: {
            background: "primary.50",
            _hover: {
              background: "primary.50",
            },
          },
        },
        _invalid: {
          outlineColor: "status.error.500",
          _focus: {
            boxShadow: "var(--chakra-colors-error-100) 0px 0px 1px 2px",
          },
        },
      },
    },
  },
  defaultProps: {
    size: "md",
  },
};
