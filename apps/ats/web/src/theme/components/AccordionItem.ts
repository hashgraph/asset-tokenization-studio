// SPDX-License-Identifier: Apache-2.0

import type { AccordionItemThemeConfiguration } from "io-bricks-ui";

// It is not exported from iobricks
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
