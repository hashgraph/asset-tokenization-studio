import { tabsPartsList } from "@iob/io-bricks-ui/DataDisplay/Tabs";
import type { TabsThemeConfiguration } from "@iob/io-bricks-ui/DataDisplay/Tabs";

export const Tabs: TabsThemeConfiguration = {
  parts: tabsPartsList,
  baseStyle: {
    tabpanels: {
      h: "full",
      py: 7,
    },
    tabpanel: {
      h: "full",
      py: 0,
    },
  },
};
