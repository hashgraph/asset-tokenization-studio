import { cssVar } from "@chakra-ui/react";
import { TooltipThemeConfiguration } from "@iob/io-bricks-ui/Overlay";

const $arrowBg = cssVar("popper-arrow-bg");

export const Tooltip: TooltipThemeConfiguration = {
  variants: {
    dark: {
      bg: "neutral.600",
      [$arrowBg.variable]: "neutral.600",
      color: "neutral.white",
      borderWidth: 0,
    },
  },
};
