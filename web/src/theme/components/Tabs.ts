import { tabsPartsList } from "@hashgraph/asset-tokenization-uicomponents/DataDisplay/Tabs";
import type { TabsThemeConfiguration } from "@hashgraph/asset-tokenization-uicomponents/DataDisplay/Tabs";

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
