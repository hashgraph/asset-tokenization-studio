import type { PopUpThemeConfiguration } from "@hashgraph/uiComponents/Overlay/PopUp";
import { popUpPartsList } from "@hashgraph/uiComponents/Overlay/PopUp";

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
