// SPDX-License-Identifier: Apache-2.0

import { cssVar } from "@chakra-ui/react";
import { TooltipThemeConfiguration } from "io-bricks-ui";

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
