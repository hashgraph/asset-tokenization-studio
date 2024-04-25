import type { tabsAnatomy as ChakraTabsAnatomy } from "@chakra-ui/anatomy";
import type { ComponentWithAs } from "@chakra-ui/system";
import type { TabListProps as ChakraTabListProps, TabPanelsProps as ChakraTabPanelsProps, TabProps as ChakraTabProps, TabsProps as ChakraTabsProps } from "@chakra-ui/tabs";
import type { ReactNode } from "react";
import type { BaseMultiStyleConfiguration } from "@Theme/Components/BaseMultiStyleConfiguration";
export declare const tabsPartsList: typeof ChakraTabsAnatomy.keys;
type Parts = typeof tabsPartsList;
export interface TabsThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
}
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
export declare const Tabs: ComponentWithAs<"div", TabsProps>;
export {};
