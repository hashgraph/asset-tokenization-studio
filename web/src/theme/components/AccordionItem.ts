import type { AccordionItemThemeConfiguration } from "@iob/io-bricks-ui/DataDisplay";

// It is not exported from IOBricks
const accordionItemPartsList: Array<string> = ["button", "item", "panel"];

export const AccordionItem: AccordionItemThemeConfiguration = {
  parts: accordionItemPartsList,
  baseStyle: {
    panel: {
      p: 0,
      gap: 5,
      padding: 8,
      flexDirection: "column",
      alignItems: "flex-start",
    },
  },
  variants: {
    admin: {
      panel: {
        bg: "adminUI.100",
      },
    },
    holder: {
      panel: {
        bg: "holderUI.100",
      },
    },
  },
};
