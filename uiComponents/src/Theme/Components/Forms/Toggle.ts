import type { ToggleThemeConfiguration } from "@Components/Forms/Toggle";
import { togglePartsList } from "@Components/Forms/Toggle";
import { textStyles } from "@/Theme/textStyles";

// WARNING: This is the Toggle component from io-bricks-ui but it is the Switch component from chakra.
// Must be set to Switch in the `theme.components`.
export const ConfigToggle: ToggleThemeConfiguration = {
  parts: togglePartsList,
  baseStyle: {
    label: {
      ml: "6px",
      color: "neutral.700",
      // @ts-ignore
      ...textStyles.ElementsRegularXS,
    },
  },
  sizes: {
    md: {
      thumb: {
        background: "neutral",
        w: 4,
        h: 4,
        _checked: {
          transform: "translateX(14px)",
        },
      },
      track: {
        background: "neutral.300",
        borderRadius: "10px",
        p: "2px",
        w: "30px",
        h: "16px",
        _focus: {
          boxShadow: "var(--chakra-colors-neutral-200) 0px 0px 1px 2px",
        },
        _hover: {
          background: "neutral.500",
        },
        _checked: {
          background: "primary.500",
          _hover: {
            background: "primary.700",
          },
          _focus: {
            boxShadow: "var(--chakra-colors-primary-100) 0px 0px 1px 2px",
          },
        },
        _disabled: {
          opacity: 1,
          background: "neutral.200",
          _checked: {
            background: "primary.50",
            _hover: {
              background: "primary.50",
            },
          },
        },
        _invalid: {
          outline: "1px solid",
          outlineColor: "error",
          outlineOffset: "-1px",
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
