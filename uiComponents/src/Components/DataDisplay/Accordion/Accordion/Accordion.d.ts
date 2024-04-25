import type { AccordionProps as ChakraAccordionProps } from "@chakra-ui/react";
import type { SystemStyleObject as ChakraSystemStyleObject, ComponentWithAs } from "@chakra-ui/system";
import React from "react";
import type { BaseMultiStyleConfiguration, PartsStyleInterpolation } from "@/Theme/Components/BaseMultiStyleConfiguration";
export interface AccordionProps extends Omit<ChakraAccordionProps, "children" | "title" | "description"> {
    children: React.ReactNode;
    description?: string;
    title: string;
}
declare const accordionPartsList: Array<string>;
type Parts = typeof accordionPartsList;
export interface AccordionThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle: (() => Partial<AccordionThemeStyle>) | PartsStyleInterpolation<Parts>;
}
export type AccordionThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;
export declare const Accordion: ComponentWithAs<"div", AccordionProps>;
export {};
