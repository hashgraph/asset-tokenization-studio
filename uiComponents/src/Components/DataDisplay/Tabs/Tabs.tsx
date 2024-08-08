import React, { useMemo } from "react";
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
  TabIndicator as ChakraTabIndicator,
} from "@chakra-ui/tabs";
import type { ReactNode } from "react";
import type { BaseMultiStyleConfiguration } from "@Theme/Components/BaseMultiStyleConfiguration";

export const tabsPartsList: typeof ChakraTabsAnatomy.keys = [
  "root",
  "tab",
  "tablist",
  "tabpanel",
  "tabpanels",
  "indicator",
];

type Parts = typeof tabsPartsList;

export interface TabsThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {}
export interface TabProps extends Omit<ChakraTabProps, "children"> {
  header: string | ReactNode;
  content: string | ReactNode;
}
export interface TabsProps extends Omit<ChakraTabsProps, "children"> {
  tabs: TabProps[];
  listProps?: ChakraTabListProps;
  panelsProps?: ChakraTabPanelsProps;
  variant?: string;
}
export const Tabs: ComponentWithAs<"div", TabsProps> = forwardRef<
  TabsProps,
  "div"
>(
  (
    {
      tabs,
      listProps,
      panelsProps,
      variant,
      isFitted: isFittedArg,
      ...props
    }: TabsProps,
    ref
  ) => {
    const isFitted = useMemo(() => {
      if (isFittedArg) return true;
      if (variant === "table") return true;
    }, [isFittedArg, variant]);
    const styles = useChakraMultiStyleConfig("Tabs", { variant, isFitted });
    return (
      <ChakraTabs ref={ref} sx={styles.root} {...props}>
        <ChakraTabList sx={styles.tablist} {...listProps}>
          {tabs.map(({ content, header, ...tab }, ix) => (
            <ChakraTab key={`tab_title_${ix}`} sx={styles.tab} {...tab}>
              {header}
            </ChakraTab>
          ))}
        </ChakraTabList>

        <ChakraTabIndicator sx={styles.indicator} />

        <ChakraTabPanels sx={styles.tabpanels} {...panelsProps}>
          {tabs.map(({ content }, ix) => (
            <ChakraTabPanel sx={styles.tabpanel} key={`tab_content_${ix}`}>
              {content}
            </ChakraTabPanel>
          ))}
        </ChakraTabPanels>
      </ChakraTabs>
    );
  }
);
