import { useMemo } from "react";
import type { tabsAnatomy as ChakraTabsAnatomy } from "@chakra-ui/anatomy";
import type { ComponentWithAs } from "@chakra-ui/system";
import { forwardRef } from "@chakra-ui/system";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/react";
import type {
  TabListProps as ChakraTabListProps,
  TabPanelsProps as ChakraTabPanelsProps,
  TabProps as ChakraTabProps,
  TabsProps as ChakraTabsProps,
} from "@chakra-ui/tabs";
import {
  Tab as ChakraTab,
  TabList as ChakraTabList,
  TabPanel as ChakraTabPanel,
  TabPanels as ChakraTabPanels,
  Tabs as ChakraTabs,
} from "@chakra-ui/tabs";
import type { ReactNode } from "react";
import { BaseMultiStyleConfiguration } from "../BaseMultiStyleConfiguration";

export const panelTabsPartsList: typeof ChakraTabsAnatomy.keys = [
  "root",
  "tab",
  "tablist",
  "tabpanel",
  "tabpanels",
  "indicator",
];

type Parts = typeof panelTabsPartsList;

export interface PanelTabsThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {}

export interface PanelTabProps extends Omit<ChakraTabProps, "children" | "content"> {
  header: string | ReactNode;
  content: string | ReactNode;
}
export interface PanelTabsProps extends Omit<ChakraTabsProps, "children"> {
  tabs: PanelTabProps[];
  listProps?: ChakraTabListProps;
  panelsProps?: ChakraTabPanelsProps;
  variant?: string;
}
export const PanelTabs: ComponentWithAs<"div", PanelTabsProps> = forwardRef<PanelTabsProps, "div">(
  ({ tabs, listProps, panelsProps, variant, isFitted: isFittedArg, ...props }: PanelTabsProps, ref) => {
    const isFitted = useMemo(() => {
      if (isFittedArg) return true;
    }, [isFittedArg]);

    const styles = useChakraMultiStyleConfig("PanelTabs", {
      variant,
      isFitted,
    });

    return (
      <ChakraTabs isFitted={isFitted} ref={ref} sx={styles.root} {...props}>
        <ChakraTabList sx={styles.tablist} {...listProps}>
          {tabs.map(({ content: _content, header, ...tab }, i) => (
            <ChakraTab key={`tab_title_${i}`} sx={styles.tab} {...tab}>
              {header}
            </ChakraTab>
          ))}
        </ChakraTabList>

        <ChakraTabPanels sx={styles.tabpanels} {...panelsProps}>
          {tabs.map(({ content }, i) => (
            <ChakraTabPanel sx={styles.tabpanel} key={`tab_content_${i}`}>
              {content}
            </ChakraTabPanel>
          ))}
        </ChakraTabPanels>
      </ChakraTabs>
    );
  },
);
