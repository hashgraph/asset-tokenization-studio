import { tabsPartsList } from "@hashgraph/uiComponents/DataDisplay/Tabs";
import type { TabsThemeConfiguration } from "@hashgraph/uiComponents/DataDisplay/Tabs";

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
