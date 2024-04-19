import type { AccordionThemeConfiguration } from "@iob/io-bricks-ui/DataDisplay";

// It is not exported from IOBricks
const accordionPartsList: Array<string> = [
  "container",
  "divider",
  "title",
  "item",
];

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
