// SPDX-License-Identifier: Apache-2.0

import type { AccordionThemeConfiguration } from "io-bricks-ui";

// It is not exported from IOBricks
const accordionPartsList: Array<string> = ["container", "divider", "title", "item"];

export const Accordion: AccordionThemeConfiguration = {
  parts: accordionPartsList,
  baseStyle: {
    container: {
      borderStyle: "unset",
      borderRadius: "4px",
    },
    divider: {
      visibility: "hidden",
    },
  },
  variants: {
    admin: {
      container: {
        bg: "adminUI.50",
      },
    },
    holder: {
      container: {
        bg: "holderUI.50",
      },
    },
  },
};
