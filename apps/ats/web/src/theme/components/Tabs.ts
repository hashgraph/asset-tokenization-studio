// SPDX-License-Identifier: Apache-2.0

import { tabsPartsList } from "io-bricks-ui";
import type { TabsThemeConfiguration } from "io-bricks-ui";

export const Tabs: TabsThemeConfiguration = {
  parts: tabsPartsList,
  baseStyle: {
    tab: {
      _focus: {
        boxShadow: 0,
      },
      _selected: {
        borderBottomWidth: "4px",
        borderColor: "none",
        _hover: {
          _before: {
            height: 0,
          },
        },
      },
      _hover: {
        borderWidth: 0,
      },
    },
    tabpanels: {
      h: "full",
      py: 6,
    },
    tabpanel: {
      h: "full",
      py: 0,
    },
    tablist: {
      borderBottom: "1px solid",
      "& button[aria-selected=true]": {
        borderColor: "none",
      },
    },
  },
  variants: {
    primary: {
      tablist: {
        w: "full",
        borderBottom: "1px solid",
        borderColor: "neutral.400",
      },
      tab: {
        _focus: {
          boxShadow: 0,
        },
      },
      tabpanels: {
        h: "full",
        w: "full",
        py: 6,
      },
      tabpanel: {
        h: "full",
        w: "full",
        py: 0,
      },
    },
    secondary: {
      tab: {
        pb: 1,
        _focus: {
          boxShadow: 0,
        },
        _selected: {
          borderBottomWidth: "4px",
          borderColor: "primary.500",
          mb: 0,
          _hover: {
            _before: {
              height: 0,
            },
          },
        },
        _hover: {
          borderWidth: 0,
        },
      },
      tablist: {
        position: "relative",
        bgColor: "neutral.50",
        borderBottom: "1px solid",
        borderColor: "neutral.400",
        "& button[aria-selected=true]": {
          borderColor: "none",
          mb: 0,
        },
      },
      tabpanels: {
        h: "full",
        py: 6,
        bgColor: "neutral.50",
      },
      tabpanel: {
        h: "full",
        py: 0,
      },
    },
  },
};
