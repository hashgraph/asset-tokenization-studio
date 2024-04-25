import { tabsPartsList } from "@hashgraph/securitytoken-uicomponents/DataDisplay/Tabs";
import type { TabsThemeConfiguration } from "@hashgraph/securitytoken-uicomponents/DataDisplay/Tabs";

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
