// SPDX-License-Identifier: Apache-2.0

import type { PopUpThemeConfiguration } from "io-bricks-ui";
import { popUpPartsList } from "io-bricks-ui";

export const PopUp: PopUpThemeConfiguration = {
  parts: popUpPartsList,
  baseStyle: {
    container: {
      w: "296px",
      bg: "neutral.50",
    },
    closeButton: {
      minW: "24px",
      minH: "24px",
    },
    body: {
      pt: "16px !important",
      textAlign: "center",
      textColor: "neutral.900",
    },
    title: {
      fontWeight: "bold",
    },
    footer: {
      pb: 6,
    },
  },
};
