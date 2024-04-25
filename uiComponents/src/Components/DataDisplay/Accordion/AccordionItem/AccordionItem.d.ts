import type { AccordionItemProps as ChakraAccordionItemProps } from "@chakra-ui/react";
import type { SystemStyleObject as ChakraSystemStyleObject, ComponentWithAs } from "@chakra-ui/system";
import React from "react";
import type { BaseMultiStyleConfiguration, PartsStyleInterpolation } from "@/Theme/Components/BaseMultiStyleConfiguration";
export interface AccordionItemProps extends Omit<ChakraAccordionItemProps, "children" | "title"> {
    children: React.ReactNode;
    title?: React.ReactNode;
    icon?: any;
    customTitle?: React.ReactNode;
}
declare const accordionItemPartsList: Array<string>;
type Parts = typeof accordionItemPartsList;
export interface AccordionItemThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle: (() => Partial<AccordionItemThemeStyle>) | PartsStyleInterpolation<Parts>;
}
type AccordionItemThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;
export declare const AccordionItem: ComponentWithAs<"div", AccordionItemProps>;
export {};
