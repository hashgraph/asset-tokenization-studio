import type { ChakraStyledOptions } from "@chakra-ui/system";
import { cssVar } from "@chakra-ui/styled-system";

const $arrowBg = cssVar("popper-arrow-bg");
const $arrowBorder = cssVar("popper-arrow-shadow-color");

export const ConfigTooltip: ChakraStyledOptions = {
  baseStyle: {
    px: 3,
    py: 2,
    apply: "BodyMediumSM",
    borderRadious: "8px",
    borderWidth: "1px",
    borderColor: "var(--chakra-colors-chakra-border-color)",
    [$arrowBorder.variable]: "var(--chakra-colors-chakra-border-color)",
  },
  variants: {
    dark: {
      bg: `var(--chakra-colors-black)`,
      [$arrowBg.variable]: "var(--chakra-colors-black)",
      color: `var(--chakra-colors-neutral)`,
    },
    light: {
      bg: `var(--chakra-colors-neutral)`,
      [$arrowBg.variable]: "var(--chakra-colors-neutral)",
      color: `var(--chakra-colors-black)`,
    },
  },
  defaultProps: {
    variant: "dark",
  },
};
