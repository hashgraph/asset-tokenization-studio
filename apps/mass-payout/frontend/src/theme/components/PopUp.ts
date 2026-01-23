// SPDX-License-Identifier: Apache-2.0

import type { PopUpThemeConfiguration } from "io-bricks-ui";
import { popUpPartsList } from "io-bricks-ui";

export const PopUp: PopUpThemeConfiguration = {
  parts: popUpPartsList,
  baseStyle: {
    container: {
      w: "310px",
      bg: "neutral.50",
    },
    closeButton: {
      minW: 6,
      minH: 6,
    },
    body: {
      textAlign: "center",
      textColor: "neutral.900",
      whiteSpace: "pre-line",
    },
    title: {
      textStyle: "ElementsMediumMD",
      mb: 3,
    },
    footer: {
      pb: 6,
    },
  },
  variants: {
    warning: {
      icon: {
        color: "status.warning.500",
      },
    },
    info: {
      icon: {
        color: "primary.500",
      },
    },
    error: {
      icon: {
        color: "status.error.500",
      },
    },
  },
};
